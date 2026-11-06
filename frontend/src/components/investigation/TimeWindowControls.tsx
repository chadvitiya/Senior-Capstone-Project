import { useInvestigation } from '../../store/investigationStore'

const WINDOW_SIZES = [15, 30, 60, 120, 300, 600] // seconds on each side

function label(seconds: number) {
  return seconds >= 60 ? `±${seconds / 60} min` : `±${seconds} sec`
}

export default function TimeWindowControls() {
  const windowSize = useInvestigation((s) => s.windowSize)
  const setWindowSize = useInvestigation((s) => s.setWindowSize)

  const index = WINDOW_SIZES.indexOf(windowSize)

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>Time window</span>
      <button
        onClick={() => setWindowSize(WINDOW_SIZES[index - 1])}
        disabled={index === 0}
        className="bg-white border border-line rounded px-3 py-1 disabled:opacity-40"
      >
        −
      </button>
      <span className="font-semibold w-20 text-center">{label(windowSize)}</span>
      <button
        onClick={() => setWindowSize(WINDOW_SIZES[index + 1])}
        disabled={index === WINDOW_SIZES.length - 1}
        className="bg-white border border-line rounded px-3 py-1 disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}