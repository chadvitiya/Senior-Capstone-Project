import { Fragment } from 'react'
import { useInvestigation } from '../../store/investigationStore'

export default function StepTrail() {
  const hosts = useInvestigation((s) => s.hosts)

  return (
    <div className="flex flex-wrap items-center gap-2 border border-line rounded bg-panel px-3 py-2 text-sm">
      <span className="font-semibold">Steps:</span>
      {hosts.map((host, i) => (
        <Fragment key={host}>
          {i > 0 && <span className="text-muted">→</span>}
          <span className="rounded-full border border-ink bg-white px-3 py-0.5">
            {i === 0 ? `Start: ${host}` : `+ ${host}`}
          </span>
        </Fragment>
      ))}
    </div>
  )
}