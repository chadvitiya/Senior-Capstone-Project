import { Link } from 'react-router-dom'
import { useInvestigation } from '../../store/investigationStore'

type Props = {
  title: string
  aiOpen: boolean
  onToggleAI: () => void
}

export default function InvestigationHeader({ title, aiOpen, onToggleAI }: Props) {

  const undo = useInvestigation((s) => s.undo)
  const canUndo = useInvestigation((s) => s.hosts.length > 1)

  return (
    <header className="h-14 bg-header px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-accent">← Dashboard</Link>
        <h1 className="font-bold">{title}</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="bg-white border border-line rounded px-3 py-1.5 text-sm disabled:opacity-40">
          Undo
        </button>
        <button
          onClick={onToggleAI}
          className={
            aiOpen
              ? 'bg-white border border-line rounded px-3 py-1.5 text-sm'
              : 'bg-accent text-white rounded px-3 py-1.5 text-sm font-medium'
          }
        >
          {aiOpen ? 'Close AI' : 'Ask AI'}
        </button>
      </div>
    </header>
  )
}