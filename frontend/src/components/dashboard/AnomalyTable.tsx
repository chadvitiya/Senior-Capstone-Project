import { Link } from 'react-router-dom'
import type { Anomaly } from '../../types/api'
import SeverityBadge from '../common/SeverityBadge'

export default function AnomalyTable({ items }: { items: Anomaly[] }) {
  if (items.length === 0) return <div className="border border-line bg-panel rounded p-6 text-muted">No anomalies match the selected filters.</div>
  return <div className="overflow-x-auto border border-line rounded bg-panel">
    <table className="min-w-full text-sm text-left">
      <thead className="bg-header text-ink"><tr>
        {['ID', 'Detected (UTC)', 'Type', 'Severity', 'Confidence', 'Source', 'Destination', 'Events', ''].map(h => <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>)}
      </tr></thead>
      <tbody>{items.map(a => <tr key={a.id} className="border-t border-line hover:bg-highlight">
        <td className="px-3 py-3 font-semibold">{a.id}</td>
        <td className="px-3 py-3 whitespace-nowrap">{a.time ? new Date(a.time).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'medium' }) : '—'}</td>
        <td className="px-3 py-3">{a.type.replaceAll('_', ' ')}</td>
        <td className="px-3 py-3"><SeverityBadge level={a.severity} /></td>
        <td className="px-3 py-3">{a.score.toFixed(1)} / 100</td>
        <td className="px-3 py-3" title={a.sourceIp ?? ''}>{a.sourceHost ?? a.sourceIp ?? '—'}</td>
        <td className="px-3 py-3" title={a.destIp ?? ''}>{a.destHost ?? a.destIp ?? '—'}</td>
        <td className="px-3 py-3">{a.count.toLocaleString()}</td>
        <td className="px-3 py-3"><Link to={`/investigation/${encodeURIComponent(a.id)}`} className="inline-block rounded bg-accent px-3 py-1.5 text-white hover:opacity-85">Investigate</Link></td>
      </tr>)}</tbody>
    </table>
  </div>
}
