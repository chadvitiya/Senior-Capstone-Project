export default function FilterBar({ search, onSearchChange, type, types, onTypeChange }: {
  search: string
  onSearchChange: (value: string) => void
  type: string
  types: string[]
  onTypeChange: (value: string) => void
}) {
  return <div className="flex flex-wrap gap-3 items-end rounded border border-line bg-panel p-3">
    <label className="flex-1 min-w-56 text-sm font-medium">Search host, IP, anomaly ID
      <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="e.g. H-009773 or A-12" className="mt-1 block w-full rounded border border-line bg-page px-3 py-2" />
    </label>
    <label className="text-sm font-medium">Anomaly type
      <select value={type} onChange={e => onTypeChange(e.target.value)} className="mt-1 block w-full rounded border border-line bg-page px-3 py-2">
        <option value="">All types</option>
        {types.map(t => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
      </select>
    </label>
    <button type="button" onClick={() => { onSearchChange(''); onTypeChange('') }} className="rounded border border-line px-3 py-2 text-sm hover:bg-highlight">Clear filters</button>
  </div>
}
