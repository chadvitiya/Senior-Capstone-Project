import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EmptyInvestigation from '../components/investigation/EmptyInvestigation'
import InvestigationHeader from '../components/investigation/InvestigationHeader'
import OverviewStrip from '../components/investigation/OverviewStrip'
import TimeWindowControls from '../components/investigation/TimeWindowControls'
import TimelineLegend from '../components/investigation/TimelineLegend'
import HostTimeline from '../components/investigation/HostTimeline'
import StepTrail from '../components/investigation/StepTrail'
import AIDrawer from '../components/chat/AIDrawer'

export default function InvestigationPage() {
  const { anomalyId } = useParams()
  const [aiOpen, setAiOpen] = useState(false)

  if (!anomalyId) return <EmptyInvestigation />

  return (
    <div className="min-h-screen flex flex-col">
      <InvestigationHeader
        title={`Investigation: ${anomalyId}`}
        aiOpen={aiOpen}
        onToggleAI={() => setAiOpen(!aiOpen)}
      />

      <div className="flex-1 flex gap-4 px-6 py-5">
        {/* Left: timeline column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <OverviewStrip />
          <div className="flex justify-between items-center">
            <TimeWindowControls />
            <TimelineLegend />
          </div>
          <HostTimeline />
          <StepTrail />
        </div>

        {/* Right: AI drawer, only when open */}
        {aiOpen && (
          <div className="w-96 shrink-0">
            <AIDrawer />
          </div>
        )}
      </div>
    </div>
  )
}