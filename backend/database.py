from pathlib import Path
import os
import sqlite3
from contextlib import contextmanager

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.getenv('NETWORK_DB_PATH', str(ROOT / 'data' / 'network.db'))).resolve()

@contextmanager
def connection():
    if not DB_PATH.is_file():
        raise FileNotFoundError(f'Database not found: {DB_PATH}')
    db = sqlite3.connect(f'file:{DB_PATH.as_posix()}?mode=ro', uri=True, timeout=30)
    db.row_factory = sqlite3.Row
    try:
        yield db
    finally:
        db.close()

def host_map(db):
    ips = [r[0] for r in db.execute('SELECT ip FROM hosts ORDER BY ip')]
    return {ip: f'H-{i:06d}' for i, ip in enumerate(ips, 1)}
