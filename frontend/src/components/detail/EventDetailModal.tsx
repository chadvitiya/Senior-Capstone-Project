import type { InvestigationConnection } from '../../types/api'
import { findReverse, getCloseType } from '../../utils/closeType'
type Props = { connection: InvestigationConnection; connections: InvestigationConnection[]; onClose: () => void }
export default function EventDetailModal({ connection, connections, onClose }: Props) {
  const reverse = findReverse(connection, connections)
  const outcome = getCloseType(connection, reverse)
  const flagNames = ['SYN', 'SYNACK', 'FIN', 'RST'] as const
  const explanation = outcome === 'reset' ? 'At least one RST flag was observed.' : outcome === 'half-open' ? 'SYN was observed without SYN-ACK in the available flow records.' : outcome === 'completed' ? 'SYN, SYN-ACK and FIN flags were observed; this does not prove a complete handshake or graceful close.' : 'The available aggregated flags are insufficient to determine connection outcome.'
  return <section aria-label="Selected connection details" className="border border-line rounded bg-white p-4 mt-3">
    <div className="flex justify-between items-center"><h2 className="font-semibold">Connection details · {connection.id}</h2><button onClick={onClose} className="border border-line rounded px-3 py-1 text-sm" aria-label="Close connection details">Close</button></div>
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">{[
      ['Source', `${connection.sourceHost ?? 'Unknown'}:${connection.sourcePort}`], ['Destination', `${connection.destHost ?? 'Unknown'}:${connection.destPort}`],
      ['First observed', connection.time ?? 'Unknown'], ['Packets', connection.packets.toLocaleString()], ['Bytes', connection.bytes.toLocaleString()], ['Flag pattern', outcome],
    ].map(([label,value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}</dl>
    <div className="mt-3 flex flex-wrap gap-3 text-sm">{flagNames.map(flag => <span key={flag} className="border border-line rounded px-2 py-1">{flag}: {connection.tcpFlags[flag] ?? 0}</span>)}</div>
    <p className="text-sm mt-3">{explanation}</p>
    {reverse && <p className="text-xs text-muted mt-2">Matching reverse-direction flow: {reverse.id}. Flag interpretation considers both directions.</p>}
    <p className="text-xs text-muted mt-2">These are flow-level counts, not ordered packet events. A packet-by-packet handshake diagram cannot be verified from this API.</p>
  </section>
}
