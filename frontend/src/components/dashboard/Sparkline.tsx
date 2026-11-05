import type { TimelinePoint } from '../../types/api'

export default function Sparkline({ points }: { points: TimelinePoint[] }) {
  if (points.length === 0) return <p className="text-sm text-muted">No timeline data</p>
  const max = Math.max(1, ...points.map(p => p.count))
  const width = 240
  const height = 70
  const coordinates = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : i * width / (points.length - 1)
    const y = height - 6 - p.count / max * (height - 12)
    return `${x},${y}`
  }).join(' ')
  return <div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Anomaly counts over time" className="w-full h-20 text-accent">
      <polyline points={coordinates} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.length === 1 && <circle cx={width / 2} cy={height - 6 - points[0].count / max * (height - 12)} r="4" fill="currentColor" />}
    </svg>
    <p className="text-xs text-muted">{points.length} time buckets · {points.reduce((n, p) => n + p.count, 0)} detections</p>
  </div>
}
