export interface TimelinePoint { time: string; count: number }
export interface DashboardData {
  totalAnomalies: number
  highSeverityCount: number | null
  hostsFlagged: number
  anomaliesOverTime: TimelinePoint[]
  captureStart: string | null
  captureEnd: string | null
}
export interface Anomaly {
  id: string
  score: number
  severity: number | null
  time: string | null
  endTime: string | null
  sourceHost: string | null
  destHost: string | null
  sourceIp: string | null
  destIp: string | null
  sourcePort: number | null
  destPort: number | null
  type: string
  count: number
  packets: number | null
  bytes: number | null
  tcpFlags: string[]
  closeType: string | null
  reasons: string[]
  otherCause: string | null
}
export interface AnomaliesResponse {
  total: number
  limit: number
  offset: number
  items: Anomaly[]
}
