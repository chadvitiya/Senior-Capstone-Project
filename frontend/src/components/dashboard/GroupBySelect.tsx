export type SortOrder = 'time' | 'score' | 'type'
export default function GroupBySelect({ value, onChange }: { value: SortOrder; onChange: (value: SortOrder) => void }) {
  return <label className="text-sm text-muted">Sort by{' '}
    <select value={value} onChange={e => onChange(e.target.value as SortOrder)} className="rounded border border-line bg-page px-2 py-1 text-ink">
      <option value="time">Time (earliest)</option>
      <option value="score">Confidence score (highest)</option>
      <option value="type">Anomaly type</option>
    </select>
  </label>
}
