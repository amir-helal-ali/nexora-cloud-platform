'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, Search, Command, Plus, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle, LiveStatusBadge } from './brand'
import { useNexoraStore } from '@/lib/store'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { fmtDate } from '@/lib/nexora'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const NOTIF_COLORS: Record<string, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Real-time fleet monitoring across all regions' },
  apps: { title: 'Applications', subtitle: 'Multi-runtime deployments: Rust, PHP, Next.js, Node' },
  pipelines: { title: 'CI/CD Pipelines', subtitle: 'Build, test, and deploy from Git with full visibility' },
  analytics: { title: 'Analytics', subtitle: 'Traffic, performance, geography & device insights' },
  simulator: { title: 'Scaling Simulator', subtitle: 'Test how your fleet responds to traffic changes' },
  databases: { title: 'Databases', subtitle: 'Managed SQL, NoSQL, and in-memory stores' },
  websockets: { title: 'WebSocket Services', subtitle: 'Persistent realtime endpoints & channels' },
  notifications: { title: 'Push Notifications', subtitle: 'In-app, email, webhook & Web Push delivery' },
  backups: { title: 'Backups & Snapshots', subtitle: 'Automatic and manual backups with point-in-time restore' },
  monitoring: { title: 'Monitoring & Alerts', subtitle: 'Real-time alerting on custom metric thresholds' },
  domains: { title: 'Domains & SSL', subtitle: 'DNS management & automatic certificate renewal' },
  deployments: { title: 'Deployments', subtitle: 'CI/CD pipeline history & rollback' },
  logs: { title: 'Logs', subtitle: 'Live streaming logs across all services' },
  team: { title: 'Team', subtitle: 'Members, roles & access control' },
  settings: { title: 'Settings', subtitle: 'Account, billing & platform configuration' },
}

export function Topbar() {
  const { view, toggleSidebar, setView } = useNexoraStore()
  const { pushNotifications, dismissNotification } = useRealtime()
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Cmd+K to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('open-command-palette'))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const meta = VIEW_TITLES[view] || VIEW_TITLES.overview
  const unread = pushNotifications.length

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 flex-col gap-0 lg:min-w-0">
        <h1 className="text-base font-bold leading-tight tracking-tight lg:text-lg">{meta.title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground lg:block">{meta.subtitle}</p>
      </div>

      {/* Search — opens command palette */}
      <button
        onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
        className="relative hidden w-72 items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex"
      >
        <Search className="mr-2 h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="pointer-events-none flex select-none items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" /> K
        </kbd>
      </button>

      <LiveStatusBadge />

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">Live Notifications</span>
            <Badge variant="outline" className="text-[10px]">
              <Activity className="mr-1 h-3 w-3 animate-pulse" /> Realtime
            </Badge>
          </div>
          <ScrollArea className="h-96">
            {pushNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No live notifications yet.<br />Push events will appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pushNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="group flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50"
                  >
                    <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', NOTIF_COLORS[n.type]?.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">{n.title}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(new Date(n.ts))}</span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    </div>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer justify-center text-xs font-medium"
            onClick={() => setView('notifications')}
          >
            View all notifications →
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle />

      <Button
        size="sm"
        className="hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 sm:inline-flex"
        onClick={() => setView('apps')}
      >
        <Plus className="h-4 w-4" />
        New App
      </Button>
    </header>
  )
}
