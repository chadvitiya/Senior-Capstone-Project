import { useParams } from 'react-router-dom'
import EmptyInvestigation from '../components/investigation/EmptyInvestigation'

export default function InvestigationPage() {
  const { anomalyId } = useParams()
  if (!anomalyId) return <EmptyInvestigation />

  return <div className="min-h-screen p-6">Investigating {anomalyId}</div>
}