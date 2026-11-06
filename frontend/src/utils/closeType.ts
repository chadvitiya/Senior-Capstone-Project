import type { InvestigationConnection } from '../types/api'

export type CloseType = 'completed' | 'reset' | 'half-open' | 'other'

export const COLORS: Record<CloseType, string> = {
  completed: 'var(--color-completed)',
  reset: 'var(--color-reset)',
  'half-open': 'var(--color-ink)',
  other: 'var(--color-muted)',
}

// Find the flow going the other direction of the same conversation
export function findReverse(conn: InvestigationConnection, all: InvestigationConnection[]) {
  return all.find((other) =>
    other.sourceHost === conn.destHost &&
    other.destHost === conn.sourceHost &&
    other.sourcePort === conn.destPort &&
    other.destPort === conn.sourcePort
  )
}

// Add up both directions' flags, then decide how it ended
export function getCloseType(conn: InvestigationConnection, reverse?: InvestigationConnection): CloseType {
  const syn = conn.tcpFlags.SYN + (reverse?.tcpFlags.SYN ?? 0)
  const synack = conn.tcpFlags.SYNACK + (reverse?.tcpFlags.SYNACK ?? 0)
  const fin = conn.tcpFlags.FIN + (reverse?.tcpFlags.FIN ?? 0)
  const rst = conn.tcpFlags.RST + (reverse?.tcpFlags.RST ?? 0)

  if (syn === 0 && synack === 0 && fin === 0 && rst === 0) return 'other'
  if (rst > 0) return 'reset'
  if (syn > 0 && synack === 0) return 'half-open'
  return 'completed'
}