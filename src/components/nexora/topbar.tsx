'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, Search, Command, Plus, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle, LiveStatusBadge } from './brand'
import { LanguageToggle } from './language-toggle'
import { useNexoraStore } from '@/lib/store'
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { fmtDate } from '@/lib/nexora'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const NOTIF_COLORS: Record<string, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}

export function Topbar() {
  const { view, toggleSidebar, setView } = useNexoraStore()
  const { pushNotifications, dismissNotification } = useRealtime()
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Build VIEW_TITLES dynamically from i18n
  const VIEW_TITLES: Record<string, { titleKey: string; subtitleKey: string }> = {
    overview: { titleKey: 'nav.overview', subtitleKey: 'overview.welcomeMessage' },
    apps: { titleKey: 'apps.title', subtitleKey: 'apps.subtitle' },
    pipelines: { titleKey: 'nav.pipelines', subtitleKey: 'apps.subtitle' },
    analytics: { titleKey: 'nav.analytics', subtitleKey: 'nav.analyticsDesc' },
    simulator: { titleKey: 'nav.simulator', subtitleKey: 'nav.simulatorDesc' },
    gateway: { titleKey: 'nav.gateway', subtitleKey: 'nav.gatewayDesc' },
    flags: { titleKey: 'nav.flags', subtitleKey: 'nav.flagsDesc' },
    mesh: { titleKey: 'nav.mesh', subtitleKey: 'nav.meshDesc' },
    databases: { titleKey: 'databases.title', subtitleKey: 'databases.subtitle' },
    websockets: { titleKey: 'nav.websockets', subtitleKey: 'nav.websocketsDesc' },
    notifications: { titleKey: 'notifications.title', subtitleKey: 'notifications.subtitle' },
    backups: { titleKey: 'nav.backups', subtitleKey: 'nav.backupsDesc' },
    secrets: { titleKey: 'nav.secrets', subtitleKey: 'nav.secretsDesc' },
    cdn: { titleKey: 'nav.cdn', subtitleKey: 'nav.cdnDesc' },
    monitoring: { titleKey: 'nav.monitoring', subtitleKey: 'nav.monitoringDesc' },
    audit: { titleKey: 'nav.audit', subtitleKey: 'nav.auditDesc' },
    marketplace: { titleKey: 'nav.marketplace', subtitleKey: 'nav.marketplaceDesc' },
    billing: { titleKey: 'nav.billing', subtitleKey: 'nav.billingDesc' },
    domains: { titleKey: 'nav.domains', subtitleKey: 'nav.domainsDesc' },
    deployments: { titleKey: 'nav.deployments', subtitleKey: 'nav.deploymentsDesc' },
    logs: { titleKey: 'nav.logs', subtitleKey: 'nav.logsDesc' },
    team: { titleKey: 'nav.team', subtitleKey: 'nav.teamDesc' },
    settings: { titleKey: 'nav.settingsNav', subtitleKey: 'nav.settingsDesc' },
  }

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
        <h1 className="text-base font-bold leading-tight tracking-tight lg:text-lg">{t(meta.titleKey)}</h1>
        <p className="hidden truncate text-xs text-muted-foreground lg:block">{t(meta.subtitleKey)}</p>
      </div>

      {/* Search — opens command palette */}
      <button
        onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
        className="relative hidden w-72 items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex"
      >
        <Search className="me-2 h-3.5 w-3.5 rtl:ms-0 rtl:me-2" />
        <span className="flex-1 text-start">{t('topbar.searchPlaceholder')}</span>
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
            <span className="text-sm font-semibold">{t('topbar.liveNotifications')}</span>
            <Badge variant="outline" className="text-[10px]">
              <Activity className="me-1 h-3 w-3 animate-pulse" /> {t('topbar.realtime')}
            </Badge>
          </div>
          <ScrollArea className="h-96">
            {pushNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">{t('topbar.noNotifications')}<br />{t('topbar.noNotificationsDesc')}</p>
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
            {t('topbar.viewAll')} →
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LanguageToggle />

      <ThemeToggle />

      <Button
        size="sm"
        className="hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 sm:inline-flex"
        onClick={() => setView('apps')}
      >
        <Plus className="h-4 w-4" />
        {t('topbar.newApp')}
      </Button>
    </header>
  )
}
