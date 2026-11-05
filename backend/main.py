import json
import math
import sqlite3
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .database import DB_PATH, connection, host_map

app = FastAPI(title='443 Guardians Network Traffic API', version='0.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'], allow_credentials=False, allow_methods=['GET'], allow_headers=['*'])

def iso(ts):
    return datetime.fromtimestamp(float(ts), timezone.utc).isoformat().replace('+00:00', 'Z') if ts is not None else None

def require_db():
    if not DB_PATH.is_file():
        raise HTTPException(503, f'SQLite database not found at {DB_PATH}')

def obj(text, default=None):
    try:
        return json.loads(text) if text else default
    except (ValueError, TypeError):
        return default

def anomaly(row, ids, pair=None):
    pair = pair or {}
    initiator, responder = pair.get('initiator'), pair.get('responder') or row['responder']
    evidence = obj(row['evidence'], row['evidence'])
    return {
        'id': f"A-{row['region_id']}",
        'score': round(max(0, min(100, float(row['confidence'] or 0) * (100 if float(row['confidence'] or 0) <= 1 else 1))), 1),
        'severity': None,
        'time': iso(row['t_min']),
        'endTime': iso(row['t_max']),
        'sourceHost': ids.get(initiator), 'destHost': ids.get(responder),
        'sourceIp': initiator, 'destIp': responder,
        'sourcePort': None, 'destPort': pair.get('dst_port') or row['port'],
        'type': row['attack_type'] or row['category'] or 'unknown',
        'count': pair.get('count') or row['n_pairs'] or 0,
        'packets': None, 'bytes': None, 'tcpFlags': [],
        'closeType': pair.get('close_type'),
        'reasons': [s for s in [row['reason'], row['explain']] if s],
        'otherCause': None,
        'regionHostCount': row['n_ips'], 'regionPairCount': row['n_pairs'],
        'evidence': evidence,
    }

def top_pair(db, region_id):
    row = db.execute('SELECT initiator, responder, count, close_type, dst_port FROM detector_pairs WHERE region_id=? ORDER BY count DESC LIMIT 1', (region_id,)).fetchone()
    return dict(row) if row else None

@app.get('/api/health')
def health():
    require_db()
    try:
        with connection() as db:
            db.execute('SELECT 1 FROM flows LIMIT 1').fetchone()
            n = db.execute('SELECT COUNT(*) FROM ingested').fetchone()[0]
        return {'status': 'ok', 'database': str(DB_PATH), 'ingestedFiles': n}
    except sqlite3.Error as exc:
        raise HTTPException(503, f'Database unavailable: {exc}') from exc

@app.get('/api/dashboard')
def dashboard():
    require_db()
    with connection() as db:
        total = db.execute('SELECT COUNT(*) FROM detector_regions').fetchone()[0]
        hosts = db.execute('SELECT COUNT(*) FROM hosts WHERE detector_flag=1').fetchone()[0]
        bounds = db.execute('SELECT MIN(first_ts), MAX(last_ts) FROM flows').fetchone()
        times = db.execute('SELECT CAST(t_min / 60 AS INTEGER) * 60 AS bucket, COUNT(*) AS n FROM detector_regions WHERE t_min IS NOT NULL GROUP BY bucket ORDER BY bucket').fetchall()
        return {'totalAnomalies': total, 'highSeverityCount': None, 'hostsFlagged': hosts,
                'anomaliesOverTime': [{'time': iso(r['bucket']), 'count': r['n']} for r in times],
                'captureStart': iso(bounds[0]), 'captureEnd': iso(bounds[1])}

@app.get('/api/anomalies')
def anomalies(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    require_db()
    with connection() as db:
        ids = host_map(db)
        rows = db.execute('SELECT * FROM detector_regions ORDER BY t_min, region_id LIMIT ? OFFSET ?', (limit, offset)).fetchall()
        total = db.execute('SELECT COUNT(*) FROM detector_regions').fetchone()[0]
        return {'total': total, 'limit': limit, 'offset': offset,
                'items': [anomaly(r, ids, top_pair(db, r['region_id'])) for r in rows]}

@app.get('/api/anomalies/{anomaly_id}')
def anomaly_detail(anomaly_id: str):
    require_db()
    try:
        rid = int(anomaly_id.removeprefix('A-'))
    except ValueError:
        raise HTTPException(400, 'Invalid anomaly ID')
    with connection() as db:
        row = db.execute('SELECT * FROM detector_regions WHERE region_id=?', (rid,)).fetchone()
        if not row:
            raise HTTPException(404, 'Anomaly not found')
        ids = host_map(db)
        pairs = [dict(p) for p in db.execute('SELECT initiator, responder, count, close_type, dst_port FROM detector_pairs WHERE region_id=? ORDER BY count DESC LIMIT 200', (rid,))]
        result = anomaly(row, ids, pairs[0] if pairs else None)
        result['pairs'] = [{**p, 'sourceHost': ids.get(p['initiator']), 'destHost': ids.get(p['responder'])} for p in pairs]
        result['pairsTruncated'] = len(pairs) == 200
        return result

@app.get('/api/investigation')
def investigation(hostIds: str = Query(''), windowStart: float | None = None, windowEnd: float | None = None,
                  limit: int = Query(100, ge=1, le=500)):
    require_db()
    with connection() as db:
        ids = host_map(db)
        reverse = {v: k for k, v in ids.items()}
        requested = [s.strip() for s in hostIds.split(',') if s.strip()]
        if len(requested) > 20:
            raise HTTPException(400, 'Select at most 20 hosts')
        invalid = [s for s in requested if s not in reverse]
        if invalid:
            raise HTTPException(400, f'Unknown host IDs: {invalid}')
        if windowStart is not None and windowEnd is not None and windowStart > windowEnd:
            raise HTTPException(400, 'windowStart must not exceed windowEnd')
        filters = []
        params = []
        if requested:
            placeholders = ','.join('?' for _ in requested)
            filters.append(f'(src_ip IN ({placeholders}) OR dst_ip IN ({placeholders}))')
            params.extend([reverse[x] for x in requested] * 2)
        if windowStart is not None:
            filters.append('last_ts >= ?')
            params.append(windowStart)
        if windowEnd is not None:
            filters.append('first_ts <= ?')
            params.append(windowEnd)
        where = 'WHERE ' + ' AND '.join(filters) if filters else ''
        rows = db.execute(f'SELECT rowid, src_ip, dst_ip, src_port, dst_port, first_ts, last_ts, pkts, bytes, syn, synack, fin, rst FROM flows {where} ORDER BY first_ts LIMIT ?', (*params, limit)).fetchall()
        connections = [{'id': f"F-{r['rowid']}", 'sourceHost': ids.get(r['src_ip']), 'destHost': ids.get(r['dst_ip']),
                        'time': iso(r['first_ts']), 'closeType': None,
                        'sourcePort': r['src_port'], 'destPort': r['dst_port'],
                        'packets': r['pkts'], 'bytes': r['bytes'],
                        'tcpFlags': {k.upper(): r[k] for k in ('syn', 'synack', 'fin', 'rst')}} for r in rows]
        # A capture-wide overview from the pre-aggregated bucket table; bounded to minute bins.
        overview = db.execute('SELECT CAST(bucket / 60 AS INTEGER) * 60 AS minute, SUM(pkts_in) AS n FROM host_buckets GROUP BY minute ORDER BY minute').fetchall()
        return {'overview': [{'time': iso(r['minute']), 'count': r['n']} for r in overview],
                'connections': connections, 'suggestedHosts': [],
                'limit': limit, 'connectionCloseTypesAvailable': False}
