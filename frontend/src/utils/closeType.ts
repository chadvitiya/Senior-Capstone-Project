import type { InvestigationConnection } from '../types/api'
export type CloseType = 'completed' | 'reset' | 'half-open' | 'other'
export const COLORS: Record<CloseType, string> = { completed: 'var(--color-completed)', reset: 'var(--color-reset)', 'half-open': 'var(--color-ink)', other: 'var(--color-muted)' }
export function findReverse(conn: InvestigationConnection, all: InvestigationConnection[]) {
  return all.find(other => other.id !== conn.id && other.sourceHost === conn.destHost && other.destHost === conn.sourceHost && other.sourcePort === conn.destPort && other.destPort === conn.sourcePort)
}
// These are inferred flag patterns, not verified TCP connection outcomes.
export function getCloseType(conn: InvestigationConnection, reverse?: InvestigationConnection): CloseType {
  const flags = [conn, reverse].filter((c): c is InvestigationConnection => Boolean(c))
  const count = (key: keyof InvestigationConnection['tcpFlags']) => flags.reduce((sum, c) => sum + (c.tcpFlags[key] ?? 0), 0)
  if (count('RST') > 0) return 'reset'
  if (count('SYN') > 0 && count('SYNACK') === 0) return 'half-open'
  if (count('SYN') > 0 && count('SYNACK') > 0 && count('FIN') > 0) return 'completed'
  return 'other'
}
