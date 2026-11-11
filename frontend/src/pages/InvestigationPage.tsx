import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { AnomalyDetail, InvestigationResponse } from '../types/api'
import { useInvestigation } from '../store/investigationStore'
import EmptyInvestigation from '../components/investigation/EmptyInvestigation'
import InvestigationHeader from '../components/investigation/InvestigationHeader'
import OverviewStrip from '../components/investigation/OverviewStrip'
import TimeWindowControls from '../components/investigation/TimeWindowControls'
import TimelineLegend from '../components/investigation/TimelineLegend'
import HostTimeline from '../components/investigation/HostTimeline'
import StepTrail from '../components/investigation/StepTrail'
import AIDrawer from '../components/chat/AIDrawer'
import EventDetailModal from '../components/detail/EventDetailModal'

export default function InvestigationPage() {
  // URL and page state
  const { anomalyId } = useParams()
  const [searchParams] = useSearchParams()
  const [aiOpen, setAiOpen] = useState(searchParams.get('ai') === '1')
  const [anomaly, setAnomaly] = useState<AnomalyDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Shared store
  const start = useInvestigation((s) => s.start)
  const hosts = useInvestigation((s) => s.hosts)
  const eventTime = useInvestigation((s) => s.eventTime)
  const windowSize = useInvestigation((s) => s.windowSize)
  const selectedConnectionId = useInvestigation((s) => s.selectedConnectionId)
  const selectConnection = useInvestigation((s) => s.selectConnection)
  const [loadingConnections, setLoadingConnections] = useState(false)

  // Data from the server
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null)

  // Load the anomaly and start the investigation
  useEffect(() => {
    if (!anomalyId) return
    const controller = new AbortController()

    api.anomaly(anomalyId, controller.signal)
      .then((data) => {
        setAnomaly(data)

        const startHosts: string[] = []
        if (data.sourceHost) startHosts.push(data.sourceHost)
        if (data.destHost && data.destHost !== data.sourceHost) startHosts.push(data.destHost)

        const eventSeconds = data.time ? Date.parse(data.time) / 1000 : 0
        start(startHosts, eventSeconds)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load anomaly')
        }
      })

    return () => controller.abort()
  }, [anomalyId, start])

  // Load connections when hosts or the window change
  useEffect(() => {
    if (hosts.length === 0) return
    const controller = new AbortController()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingConnections(true)
    setError(null)
    api.investigation(hosts, eventTime - windowSize, eventTime + windowSize, controller.signal)
      .then((data) => { setInvestigation(data); selectConnection(null) })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load connections')
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingConnections(false) })

    return () => controller.abort()
  }, [hosts, eventTime, windowSize, selectConnection])

  // Early returns
  if (!anomalyId) return <EmptyInvestigation />

  if (error) {
    return (
      <div role="alert" className="m-6 rounded border border-reset bg-panel p-4">
        <p className="font-semibold">Couldn't load {anomalyId}</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!anomaly) {
    return <p role="status" className="m-6 text-muted">Loading investigation…</p>
  }

  if (hosts.length === 0) {
    return (
      <div className="m-6 rounded border border-line bg-panel p-4">
        <p className="font-semibold">No hosts to investigate for {anomaly.id}</p>
        <p className="text-sm mt-1 text-muted">
          The detector didn't record a source or destination host for this anomaly.
        </p>
      </div>
    )
  }

  // Render
  const title = `${anomaly.sourceHost ?? anomaly.id} · ${anomaly.type.replaceAll('_', ' ')}`
  const selectedConnection = investigation?.connections.find((c) => c.id === selectedConnectionId)

  return (
    <div className="min-h-screen flex flex-col">
      <InvestigationHeader
        title={title}
        aiOpen={aiOpen}
        onToggleAI={() => setAiOpen(!aiOpen)}
      />

      <div className="flex-1 flex gap-4 px-6 py-5">
        {/* Left: timeline column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <OverviewStrip anomaly={anomaly} connections={investigation?.connections ?? []} hostCount={hosts.length} loading={loadingConnections} truncated={Boolean(investigation && investigation.connections.length >= investigation.limit)} />
          <div className="flex justify-between items-center">
            <TimeWindowControls />
            <TimelineLegend />
          </div>
          {investigation && investigation.connections.length === investigation.limit && (
            <p className="text-xs text-reset">
              Showing the first {investigation.limit} connections. Narrow the time window to see the rest.
            </p>
          )}
          {loadingConnections && <p role="status" className="text-xs text-muted">Loading connections…</p>}
          {!loadingConnections && investigation?.connections.length === 0 && <p className="text-sm text-muted">No flows found in this time window. Try expanding the window or selecting another anomaly.</p>}
          <HostTimeline connections={investigation?.connections ?? []} />
          {selectedConnection && <EventDetailModal connection={selectedConnection} connections={investigation?.connections ?? []} onClose={() => selectConnection(null)} />}
          <StepTrail />
        </div>

        {/* Right: AI drawer, only when open */}
        {aiOpen && (
          <div className="w-96 shrink-0">
            <AIDrawer key={anomalyId} anomalyId={anomalyId} />
          </div>
        )}
      </div>
    </div>
  )
}