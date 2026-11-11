import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import InvestigationPage from './pages/InvestigationPage'
import AnomalyDetailPage from './pages/AnomalyDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/anomaly/:anomalyId" element={<AnomalyDetailPage />} />
      <Route path="/investigation/:anomalyId?" element={<InvestigationPage />} />
    </Routes>
  )
}