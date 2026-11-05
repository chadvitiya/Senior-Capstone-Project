import { Link } from 'react-router-dom'

export default function EmptyInvestigation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-muted">No investigation open.</p>
      <Link to="/" className="text-accent underline">
        Pick an anomaly from the Dashboard to start
      </Link>
    </div>
  )
}