import { COLORS } from '../../utils/closeType'

const ITEMS = [
  { label: 'Completed', color: COLORS.completed, dashed: false, faint: false },
  { label: 'Reset', color: COLORS.reset, dashed: false, faint: false },
  { label: 'Half-open', color: COLORS['half-open'], dashed: true, faint: false },
  { label: 'Other (non-TCP)', color: COLORS.other, dashed: false, faint: true },
]

export default function TimelineLegend() {
  return (
    <div className="flex gap-4 text-xs">
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <svg width="24" height="8">
            <line
              x1="0" x2="24" y1="4" y2="4"
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={item.dashed ? '4 3' : undefined}
              opacity={item.faint ? 0.35 : 1}
            />
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  )
}