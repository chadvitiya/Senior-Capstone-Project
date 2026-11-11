import type { InvestigationConnection } from '../../types/api'
import { findReverse, getCloseType } from '../../utils/closeType'

type Props = {
  connection: InvestigationConnection
  connections: InvestigationConnection[]
  onClose: () => void
}

const FLAG_NAMES = ['SYN', 'SYNACK', 'FIN', 'RST'] as const

const EXPECTED = 'A normal TCP connection opens with SYN → SYN-ACK → ACK and closes with FIN.'

// One plain-language sentence for each close type
const HAPPENED = {
  reset: 'The connection was cut off with a reset (RST).',
  'half-open': 'A SYN was sent but no SYN-ACK came back, so the handshake never finished.',
  completed: 'SYN, SYN-ACK and FIN were all seen, which looks like a normal connection.',
  other: 'There are not enough TCP flags to tell how this went (it may not be TCP).',
}

export default function EventDetailModal({ connection, connections, onClose }: Props) {
  // Pair this flow with the other direction, then decide how it ended
  const reverse = findReverse(connection, connections)
  const outcome = getCloseType(connection, reverse)

  // How often: count flows from the same source to the same destination in this window
  const samePair = connections.filter(
    (c) => c.sourceHost === connection.sourceHost && c.destHost === connection.destHost
  ).length
  const recurrence = samePair <= 1 ? 'First time' : samePair < 5 ? 'Sometimes' : 'Recurring'

  // The detail grid: [label, value]
  const details: [string, string][] = [
    ['Source', `${connection.sourceHost ?? 'Unknown'}:${connection.sourcePort}`],
    ['Destination', `${connection.destHost ?? 'Unknown'}:${connection.destPort}`],
    ['First observed', connection.time ?? 'Unknown'],
    ['Packets', connection.packets.toLocaleString()],
    ['Bytes', connection.bytes.toLocaleString()],
    ['Flag pattern', outcome],
  ]

  return (
    <section aria-label="Selected connection details" className="border border-line rounded bg-white p-4 mt-3">
      {/* Header with close button */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Connection details · {connection.id}</h2>
        <button onClick={onClose} className="border border-line rounded px-3 py-1 text-sm" aria-label="Close connection details">
          Close
        </button>
      </div>

      {/* Detail grid */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>

      {/* TCP flag counts */}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {FLAG_NAMES.map((flag) => (
          <span key={flag} className="border border-line rounded px-2 py-1">
            {flag}: {connection.tcpFlags[flag] ?? 0}
          </span>
        ))}
      </div>

      {/* Expected vs. what happened, and how often */}
      <p className="text-sm mt-3"><strong>Expected:</strong> {EXPECTED}</p>
      <p className="text-sm"><strong>What happened:</strong> {HAPPENED[outcome]}</p>
      <p className="text-sm mt-1">
        <strong>How often:</strong> {recurrence} ({samePair} from this source to this destination in the window)
      </p>

      {/* Notes */}
      {reverse && (
        <p className="text-xs text-muted mt-2">
          Matching reverse-direction flow: {reverse.id}. Flag interpretation considers both directions.
        </p>
      )}
      <p className="text-xs text-muted mt-2">
        These are flow-level counts, not ordered packet events. A packet-by-packet handshake diagram cannot be verified from this API.
      </p>
    </section>
  )
}
