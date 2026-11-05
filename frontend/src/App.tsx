import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import InvestigationPage from './pages/InvestigationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/investigation/:anomalyId?" element={<InvestigationPage />} />
    </Routes>
  )
}