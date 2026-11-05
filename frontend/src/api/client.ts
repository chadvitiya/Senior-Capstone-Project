import type { AnomaliesResponse, DashboardData } from '../types/api'

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
}
