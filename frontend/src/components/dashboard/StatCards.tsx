import Sparkline from './Sparkline'

export default function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-panel border border-line rounded p-4">Total anomalies</div>
      <div className="bg-panel border border-line rounded p-4">High severity</div>
      <div className="bg-panel border border-line rounded p-4">Hosts flagged</div>
      <div className="bg-panel border border-line rounded p-4">
        Anomalies over time
        <Sparkline />
      </div>
    </div>
  )
}