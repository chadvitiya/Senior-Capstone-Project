const STYLES = ['', 'bg-stone-200 text-stone-700', 'bg-yellow-100 text-yellow-800',
  'bg-orange-100 text-orange-800', 'bg-red-100 text-red-700', 'bg-red-600 text-white']

export default function SeverityBadge({ level }: { level: number | null }) {
  if (level === null) return <span className="text-muted">—</span>
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${STYLES[level]}`}>Sev {level}</span>
}