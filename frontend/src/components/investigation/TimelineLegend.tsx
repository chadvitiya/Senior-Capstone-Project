import { COLORS } from '../../utils/closeType'
const ITEMS = [
  { label: 'Handshake + FIN observed', color: COLORS.completed, dashed: false },
  { label: 'RST observed', color: COLORS.reset, dashed: false },
  { label: 'SYN without SYN-ACK', color: COLORS['half-open'], dashed: true },
  { label: 'Insufficient flag evidence', color: COLORS.other, dashed: false },
]
export default function TimelineLegend() {
  return <div className="flex flex-wrap gap-3 text-xs">{ITEMS.map(item => <span key={item.label} className="flex items-center gap-1"><svg width="20" height="8"><line x1="0" x2="20" y1="4" y2="4" stroke={item.color} strokeWidth="2" strokeDasharray={item.dashed ? '4 3' : undefined}/></svg>{item.label}</span>)}</div>
}
