import { useInvestigation } from '../../store/investigationStore'
import type { InvestigationConnection } from '../../types/api'

const ROW_HEIGHT = 60

type Props = {
  connections: InvestigationConnection[]
}

export default function HostTimeline({ connections }: Props) {
  // Read what the user chose from the store
  const hosts = useInvestigation((s) => s.hosts)
  const eventTime = useInvestigation((s) => s.eventTime)
  const windowSize = useInvestigation((s) => s.windowSize)

  // Turn a time (seconds) into a left-to-right percent
  const windowStart = eventTime - windowSize
  function xPercent(seconds: number) {
    return ((seconds - windowStart) / (windowSize * 2)) * 100
  }

  // Turn a host into the y position of its row's middle
  function rowY(host: string) {
    return hosts.indexOf(host) * ROW_HEIGHT + ROW_HEIGHT / 2
  }

  const height = hosts.length * ROW_HEIGHT

  return (
    <div>
      <div className="flex border border-line rounded bg-white overflow-hidden">
        {/* Host labels */}
        <div className="w-52 shrink-0 border-r border-line">
          {hosts.map((host, i) => (
            <div
              key={host}
              style={{ height: ROW_HEIGHT }}
              className={`px-3 flex flex-col justify-center border-b border-line last:border-b-0 ${i === 0 ? 'bg-highlight' : ''}`}
            >
              <span className="font-semibold">{host}</span>
              <span className="text-xs text-muted">{i === 0 ? 'Starting host' : 'Added'}</span>
            </div>
          ))}
        </div>

        {/* Drawing area */}
        <svg className="flex-1 min-w-0" height={height}>
          {/* Row dividers */}
          {hosts.slice(1).map((host, i) => (
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

          {/* Connections go here in 4b */}
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