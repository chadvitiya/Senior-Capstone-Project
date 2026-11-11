import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { AnomalyDetail } from '../types/api'
import NavBar from '../components/layout/NavBar'
import SeverityBadge from '../components/common/SeverityBadge'

const EXPECTED = 'A normal TCP connection opens with SYN → SYN-ACK → ACK and closes with FIN.'

// Show a UTC time the same way the dashboard table does
function formatTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'medium' })
}

export default function AnomalyDetailPage() {
  // 1. Read the anomaly ID from the URL (/anomaly/A-12)
  const { anomalyId } = useParams()
  const [anomaly, setAnomaly] = useState<AnomalyDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 2. Load the anomaly from the backend when the ID changes
  useEffect(() => {
    if (!anomalyId) return
    const controller = new AbortController()
    api.anomaly(anomalyId, controller.signal)
      .then((data) => setAnomaly(data))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load anomaly')
      })
    return () => controller.abort()
  }, [anomalyId])

  // 3. Loading and error states
  if (error) {
    return <div className="min-h-screen"><NavBar />
      <div role="alert" className="m-6 rounded border border-reset bg-panel p-4">
        <p className="font-semibold">Couldn't load {anomalyId}</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/" className="mt-3 inline-block text-sm underline">Back to dashboard</Link>
      </div>
    </div>
  }
  if (!anomaly) {
    return <div className="min-h-screen"><NavBar /><p role="status" className="m-6 text-muted">Loading anomaly…</p></div>
  }

  // 4. Values derived from the anomaly
  const recurrence = anomaly.count <= 1 ? 'First time' : anomaly.count < 5 ? 'Sometimes' : 'Recurring'
  const details: [string, string][] = [
    ['Started (UTC)', formatTime(anomaly.time)],
    ['Ended (UTC)', formatTime(anomaly.endTime)],
    ['Source', `${anomaly.sourceHost ?? '—'}${anomaly.sourcePort !== null ? `:${anomaly.sourcePort}` : ''}`],
    ['Destination', `${anomaly.destHost ?? '—'}${anomaly.destPort !== null ? `:${anomaly.destPort}` : ''}`],
    ['Events', anomaly.count.toLocaleString()],
    ['Host pairs', `${anomaly.pairs.length}${anomaly.pairsTruncated ? '+' : ''}`],
  ]
  const id = encodeURIComponent(anomaly.id)

  // 5. Layout
  return <div className="min-h-screen">
    <NavBar />
    <main className="px-6 py-5 flex flex-col gap-4 max-w-5xl">
      <Link to="/" className="text-sm text-muted hover:text-ink">← Back to dashboard</Link>

      {/* Header: ID, type, severity, score */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{anomaly.id} · {anomaly.type.replaceAll('_', ' ')}</h1>
        <SeverityBadge level={anomaly.severity} />
        <span className="text-sm text-muted">Confidence {anomaly.score.toFixed(1)} / 100</span>
      </div>

      <section className="border border-line rounded bg-panel p-4 flex flex-col gap-4">
        {/* Detail grid */}
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {details.map(([label, value]) => <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-medium break-words">{value}</dd>
          </div>)}
        </dl>

        {/* TCP flags seen (only when the backend sends some) */}
        {anomaly.tcpFlags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-xs text-muted self-center">TCP flags:</span>
            {anomaly.tcpFlags.map((flag) => <span key={flag} className="border border-line rounded px-2 py-0.5">{flag}</span>)}
          </div>
        )}

        {/* Expected vs. what happened, and how often */}
        <div className="text-sm flex flex-col gap-1">
          <p><strong>Expected:</strong> {EXPECTED}</p>
          <p><strong>Why it was flagged:</strong> {anomaly.reasons[0] ?? anomaly.type.replaceAll('_', ' ')}</p>
          {anomaly.otherCause && <p><strong>Other possible cause:</strong> {anomaly.otherCause}</p>}
          <p><strong>How often:</strong> {recurrence} ({anomaly.count.toLocaleString()} events)</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/investigation/${id}`} className="rounded bg-accent px-4 py-2 text-white hover:opacity-85">Investigate from here</Link>
        <Link to={`/investigation/${id}?ai=1`} className="rounded border border-line bg-panel px-4 py-2 hover:bg-highlight">Ask AI</Link>
      </div>
    </main>
  </div>
}