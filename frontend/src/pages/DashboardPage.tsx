import NavBar from '../components/layout/NavBar'
import FilterBar from '../components/dashboard/FilterBar'
import StatCards from '../components/dashboard/StatCards'
import GroupBySelect from '../components/dashboard/GroupBySelect'
import AnomalyTable from '../components/dashboard/AnomalyTable'
import Pagination from '../components/dashboard/Pagination'

export default function DashboardPage() {
  return (
    <div>
      <NavBar />
      <main className="px-6 py-5 flex flex-col gap-4">
        <FilterBar />
        <StatCards />

        <div className="flex justify-between items-center">
          <h2 className="font-bold">Anomalies (sorted by severity)</h2>
          <GroupBySelect />
        </div>

        <AnomalyTable />

        <div className="flex justify-end">
          <Pagination />
        </div>
      </main>
    </div>
  )
}