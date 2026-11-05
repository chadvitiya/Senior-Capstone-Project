import type { DashboardData } from '../../types/api'
import Sparkline from './Sparkline'

export default function StatCards({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Total anomalies" value={data.totalAnomalies.toLocaleString()} />
      <Stat label="High severity" value={data.highSeverityCount === null ? 'Not classified' : data.highSeverityCount.toLocaleString()} />
      <Stat label="Hosts flagged" value={data.hostsFlagged.toLocaleString()} />
      <div className="bg-panel border border-line rounded p-4">
        <div className="text-sm text-muted mb-2">Anomalies over time</div>
        <Sparkline points={data.anomaliesOverTime} />
      </div>
    </div>
  )
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-panel border border-line rounded p-4">
    <div className="text-sm text-muted">{label}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
  </div>
}
