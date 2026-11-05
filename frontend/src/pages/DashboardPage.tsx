import { useEffect, useMemo, useState } from 'react'
import NavBar from '../components/layout/NavBar'
import FilterBar from '../components/dashboard/FilterBar'
import StatCards from '../components/dashboard/StatCards'
import GroupBySelect from '../components/dashboard/GroupBySelect'
import type { SortOrder } from '../components/dashboard/GroupBySelect'
import AnomalyTable from '../components/dashboard/AnomalyTable'
import Pagination from '../components/dashboard/Pagination'
import { api } from '../api/client'
import type { Anomaly, DashboardData } from '../types/api'

const PAGE_SIZE = 10
// The backend currently supports pagination but not server-side search or sort.
// Fetch all detector regions in batches so filters/sorting operate across the whole result set.
async function loadAllAnomalies(signal: AbortSignal): Promise<Anomaly[]> {
  const first = await api.anomalies(200, 0, signal)
  const items = [...first.items]
  for (let offset = items.length; offset < first.total; offset += 200) {
    const next = await api.anomalies(200, offset, signal)
    items.push(...next.items)
  }
  return items
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState<SortOrder>('time')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([api.dashboard(controller.signal), loadAllAnomalies(controller.signal)])
      .then(([stats, items]) => { setDashboard(stats); setAnomalies(items); setError(null) })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load dashboard')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

  const types = useMemo(() => [...new Set(anomalies.map(a => a.type))].sort(), [anomalies])
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = anomalies.filter(a => (!type || a.type === type) && (!term ||
      [a.id, a.type, a.sourceHost, a.destHost, a.sourceIp, a.destIp].some(value => value?.toLowerCase().includes(term))))
    return result.sort((a, b) => sort === 'score' ? b.score - a.score : sort === 'type' ? a.type.localeCompare(b.type) : (a.time ?? '').localeCompare(b.time ?? ''))
  }, [anomalies, search, type, sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  function updateSearch(value: string) { setSearch(value); setPage(1) }
  function updateType(value: string) { setType(value); setPage(1) }
  function updateSort(value: SortOrder) { setSort(value); setPage(1) }

  return <div className="min-h-screen">
    <NavBar />
    <main className="px-6 py-5 flex flex-col gap-4">
      <div><h1 className="text-2xl font-bold">Network Traffic Dashboard</h1><p className="text-sm text-muted">Detector findings from the processed dataset</p></div>
      {loading && <p role="status" className="rounded border border-line bg-panel p-4">Loading dashboard data…</p>}
      {error && <div role="alert" className="rounded border border-reset bg-panel p-4">
        <p className="font-semibold">Unable to reach the API</p><p className="text-sm mt-1 break-words">{error}</p>
        <button type="button" className="mt-3 rounded bg-accent text-white px-3 py-1.5" onClick={() => { setLoading(true); setError(null); setReload(n => n + 1) }}>Retry</button>
      </div>}
      {!loading && !error && dashboard && <>
        <StatCards data={dashboard} />
        <FilterBar search={search} onSearchChange={updateSearch} type={type} types={types} onTypeChange={updateType} />
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="font-bold">Detected anomalies <span className="font-normal text-muted">({filtered.length} of {anomalies.length})</span></h2>
          <GroupBySelect value={sort} onChange={updateSort} />
        </div>
        <AnomalyTable items={visible} />
        <div className="flex justify-end"><Pagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
        <p className="text-xs text-muted">Confidence score reflects detector confidence, not a severity classification. Filtering and sorting apply to all loaded detector regions.</p>
      </>}
    </main>
  </div>
}
