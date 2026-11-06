import { useInvestigation } from '../../store/investigationStore'
import { COLORS, findReverse, getCloseType } from '../../utils/closeType'
import type { CloseType } from '../../utils/closeType'
import type { InvestigationConnection } from '../../types/api'

const ROW_HEIGHT = 60

type Props = {
  connections: InvestigationConnection[]
}

export default function HostTimeline({ connections }: Props) {
  // Read from the store
  const hosts = useInvestigation((s) => s.hosts)
  const eventTime = useInvestigation((s) => s.eventTime)
  const windowSize = useInvestigation((s) => s.windowSize)
  const selectedId = useInvestigation((s) => s.selectedConnectionId)
  const selectConnection = useInvestigation((s) => s.selectConnection)
  const addHost = useInvestigation((s) => s.addHost)
  const removeHost = useInvestigation((s) => s.removeHost)

  // Count how often each off-timeline host shows up
  const counts: Record<string, number> = {}
  for (const conn of connections) {
    for (const host of [conn.sourceHost, conn.destHost]) {
      if (host && !hosts.includes(host)) {
        counts[host] = (counts[host] ?? 0) + 1
      }
    }
  }

  // Top 3 become suggested rows
  const suggested = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([host]) => host)

  const rows = [...hosts, ...suggested]

  // Time to left-to-right percent
  const windowStart = eventTime - windowSize
  function xPercent(seconds: number) {
    return ((seconds - windowStart) / (windowSize * 2)) * 100
  }

  // Host to the y position of its row's middle (null if no row)
  function rowY(host: string | null) {
    const index = host ? rows.indexOf(host) : -1
    if (index === -1) return null
    return index * ROW_HEIGHT + ROW_HEIGHT / 2
  }

  // Pick which flows to draw, once per conversation
  const lines: { conn: InvestigationConnection; closeType: CloseType; x: number }[] = []
  for (const conn of connections) {
    if (!conn.time) continue

    const reverse = findReverse(conn, connections)
    if (reverse && reverse.time && reverse.time < conn.time) continue

    lines.push({
      conn,
      closeType: getCloseType(conn, reverse),
      x: xPercent(Date.parse(conn.time) / 1000),
    })
  }

  const height = rows.length * ROW_HEIGHT

  return (
    <div>
      <div className="flex border border-line rounded bg-white overflow-hidden">
        {/* Host labels */}
        <div className="w-52 shrink-0 border-r border-line">
          {rows.map((host, i) => {
            const isPinned = i === 0
            const isSuggested = !hosts.includes(host)

            return (
              <div
                key={host}
                style={{ height: ROW_HEIGHT }}
                className={`px-3 flex items-center justify-between border-b border-line last:border-b-0 ${
                  isPinned ? 'bg-highlight' : isSuggested ? 'bg-panel' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-semibold ${isSuggested ? 'text-muted' : ''}`}>{host}</span>
                  <span className="text-xs text-muted">
                    {isPinned ? 'Starting host' : isSuggested ? 'Suggested' : 'Added'}
                  </span>
                </div>

                {isPinned && <span className="text-xs text-muted">Pinned</span>}

                {!isPinned && !isSuggested && (
                  <button
                    onClick={() => removeHost(host)}
                    aria-label={`Remove ${host}`}
                    className="bg-white border border-line rounded px-2 py-0.5 text-sm"
                  >
                    ✕
                  </button>
                )}

                {isSuggested && (
                  <button
                    onClick={() => addHost(host)}
                    className="bg-white border border-line rounded px-2 py-0.5 text-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Drawing area */}
        <svg className="flex-1 min-w-0" height={height}>
          {/* Row dividers */}
          {rows.slice(1).map((host, i) => (
            <line
              key={host}
              x1="0" x2="100%"
              y1={(i + 1) * ROW_HEIGHT} y2={(i + 1) * ROW_HEIGHT}
              stroke="var(--color-line)"
            />
          ))}

          {/* Event line at "0" */}
          <line
            x1={`${xPercent(eventTime)}%`} x2={`${xPercent(eventTime)}%`}
            y1={0} y2={height}
            stroke="var(--color-accent)" strokeWidth={2}
          />

          {/* Connections */}
          {lines.map(({ conn, closeType, x }) => {
            const y1 = rowY(conn.sourceHost)
            const y2 = rowY(conn.destHost)
            const color = COLORS[closeType]
            const selected = conn.id === selectedId

            return (
              <g key={conn.id} onClick={() => selectConnection(conn.id)} className="cursor-pointer">
                {y1 !== null && y2 !== null && (
                  <line
                    x1={`${x}%`} x2={`${x}%`}
                    y1={y1} y2={y2}
                    stroke={color}
                    strokeWidth={selected ? 4 : 2}
                    strokeDasharray={closeType === 'half-open' ? '4 3' : undefined}
                    opacity={closeType === 'other' ? 0.35 : 1}
                  />
                )}
                <circle
                  cx={`${x}%`} cy={y1 ?? y2 ?? 0}
                  r={selected ? 6 : 4}
                  fill={color}
                  opacity={closeType === 'other' ? 0.35 : 1}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Time axis */}
      <div className="ml-52 mt-1 flex justify-between text-xs text-muted">
        <span>−{windowSize}s</span>
        <span>0</span>
        <span>+{windowSize}s</span>
      </div>
    </div>
  )
}