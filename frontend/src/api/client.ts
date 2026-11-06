import type { AnomaliesResponse, AnomalyDetail, DashboardData, InvestigationResponse } from '../types/api'

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api${path}`, { signal })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${detail.slice(0, 160) || response.statusText}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  dashboard: (signal?: AbortSignal) => get<DashboardData>('/dashboard', signal),
  anomalies: (limit = 50, offset = 0, signal?: AbortSignal) =>
    get<AnomaliesResponse>(`/anomalies?limit=${limit}&offset=${offset}`, signal),
  anomaly: (id: string, signal?: AbortSignal) =>
    get<AnomalyDetail>(`/anomalies/${encodeURIComponent(id)}`, signal),
  investigation: (hostIds: string[], windowStart: number, windowEnd: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({
      hostIds: hostIds.join(','),
      windowStart: String(windowStart),
      windowEnd: String(windowEnd),
      limit: '500',
    })
    return get<InvestigationResponse>(`/investigation?${params}`, signal)
  },
}
