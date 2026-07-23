'use client'

import { create } from 'zustand'

export type ViewKey =
  | 'overview'
  | 'apps'
  | 'databases'
  | 'websockets'
  | 'notifications'
  | 'domains'
  | 'deployments'
  | 'pipelines'
  | 'logs'
  | 'monitoring'
  | 'backups'
  | 'analytics'
  | 'simulator'
  | 'team'
  | 'settings'

interface AppState {
  view: ViewKey
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  commandOpen: boolean
  selectedAppId: string | null
  setView: (v: ViewKey) => void
  setSidebarOpen: (o: boolean) => void
  toggleSidebar: () => void
  setTheme: (t: 'light' | 'dark') => void
  toggleTheme: () => void
  setCommandOpen: (o: boolean) => void
  setSelectedAppId: (id: string | null) => void
}

export const useNexoraStore = create<AppState>((set) => ({
  view: 'overview',
  sidebarOpen: true,
  theme: 'light',
  commandOpen: false,
  selectedAppId: null,
  setView: (view) => set({ view }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSelectedAppId: (selectedAppId) => set({ selectedAppId }),
}))
