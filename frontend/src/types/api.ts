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

export interface AnomalyPair {
  initiator: string
  responder: string
  count: number
  close_type: string | null
  dst_port: number | null
  sourceHost: string | null
  destHost: string | null
}

export interface AnomalyDetail extends Anomaly {
  pairs: AnomalyPair[]
  pairsTruncated: boolean
}

export interface TcpFlagCounts {
  SYN: number
  SYNACK: number
  FIN: number
  RST: number
}

export interface InvestigationConnection {
  id: string
  sourceHost: string | null
  destHost: string | null
  time: string | null
  closeType: string | null
  sourcePort: number
  destPort: number
  packets: number
  bytes: number
  tcpFlags: TcpFlagCounts
}

export interface InvestigationResponse {
  overview: TimelinePoint[]
  connections: InvestigationConnection[]
  suggestedHosts: string[]
  limit: number
  connectionCloseTypesAvailable: boolean
}