import { create } from 'zustand'

type InvestigationState = {
  hosts: string[]
  eventTime: number
  windowSize: number
  selectedConnectionId: string | null

  start: (hosts: string[], eventTime: number) => void
  addHost: (id: string) => void
  removeHost: (id: string) => void
  undo: () => void
  setWindowSize: (seconds: number) => void
  selectConnection: (id: string | null) => void
}

export const useInvestigation = create<InvestigationState>()((set) => ({
  hosts: [],
  eventTime: 0,
  windowSize: 60,
  selectedConnectionId: null,

  start: (hosts, eventTime) =>
    set({ hosts, eventTime, windowSize: 60, selectedConnectionId: null }),

  addHost: (id) =>
    set((state) =>
        state.hosts.includes(id) || state.hosts.length >= 20 ? state : { hosts: [...state.hosts, id] }
    ),

  removeHost: (id) =>
    set((state) => ({ hosts: state.hosts.filter((h) => h !== id) })),

  undo: () =>
    set((state) => (state.hosts.length > 1 ? { hosts: state.hosts.slice(0, -1) } : state)),

  setWindowSize: (seconds) => set({ windowSize: seconds }),

  selectConnection: (id) => set({ selectedConnectionId: id }),
}))
