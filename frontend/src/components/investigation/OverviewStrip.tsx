import type { AnomalyDetail, InvestigationConnection } from '../../types/api'
import { getCloseType, findReverse } from '../../utils/closeType'
type Props = { anomaly: AnomalyDetail; connections: InvestigationConnection[]; hostCount: number; loading: boolean; truncated: boolean }
export default function OverviewStrip({ anomaly, connections, hostCount, loading, truncated }: Props) {
  const uniqueHosts = new Set(connections.flatMap(c => [c.sourceHost, c.destHost]).filter(Boolean))
  const resets = connections.filter(c => getCloseType(c, findReverse(c, connections)) === 'reset').length
  const totalPackets = connections.reduce((n,c) => n + c.packets, 0)
  return <section className="border border-line bg-panel rounded p-3" aria-label="Investigation overview">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><strong>Investigation overview · {anomaly.id}</strong><span className="text-xs text-muted">{anomaly.type.replaceAll('_',' ')} · detector confidence {anomaly.score}/100</span></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">{[
      ['Selected hosts', hostCount], ['Visible connections', connections.length], ['Observed hosts', uniqueHosts.size], ['Flows with RST', resets],
    ].map(([name,value]) => <div key={name} className="bg-white rounded border border-line p-2"><div className="text-xs text-muted">{name}</div><div className="text-lg font-semibold">{loading ? '…' : value}</div></div>)}</div>
    <p className="text-xs text-muted mt-2">{totalPackets.toLocaleString()} packets in returned flows. {truncated ? 'Results reached the 500-flow API limit; statistics are incomplete.' : 'Counts cover returned flows in the selected time window.'} Classification is inferred from aggregate TCP flags, not packet-level handshake validation.</p>
  </section>
}
