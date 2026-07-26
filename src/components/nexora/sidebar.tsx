'use client'

import {
  LayoutDashboard,
  Boxes,
  Database,
  Radio,
  BellRing,
  Globe,
  GitCommitHorizontal,
  ScrollText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Zap,
  Shield,
  Activity,
  Archive,
  GitPullRequest,
  BarChart3,
  FlaskConical,
  Network,
  KeyRound,
  Store,
  Flag,
  Receipt,
} from 'lucide-react'
import { useNexoraStore, type ViewKey } from '@/lib/store'
import { useLanguage } from '@/lib/language-store'
import { useI18n } from '@/hooks/use-i18n'
import { Logo } from './brand'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NavItem {
  key: ViewKey
  labelKey: string
  descKey: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  group: 'platform' | 'resources' | 'observability' | 'admin' | 'integrations' | 'security'
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', labelKey: 'nav.overview', descKey: 'nav.overviewDesc', icon: LayoutDashboard, group: 'platform' },
  { key: 'apps', labelKey: 'nav.apps', descKey: 'nav.appsDesc', icon: Boxes, badge: '7', group: 'platform' },
  { key: 'pipelines', labelKey: 'nav.pipelines', descKey: 'nav.pipelinesDesc', icon: GitPullRequest, badge: '4', group: 'platform' },
  { key: 'analytics', labelKey: 'nav.analytics', descKey: 'nav.analyticsDesc', icon: BarChart3, group: 'platform' },
  { key: 'simulator', labelKey: 'nav.simulator', descKey: 'nav.simulatorDesc', icon: FlaskConical, group: 'platform' },
  { key: 'gateway', labelKey: 'nav.gateway', descKey: 'nav.gatewayDesc', icon: Network, badge: '10', group: 'platform' },
  { key: 'flags', labelKey: 'nav.flags', descKey: 'nav.flagsDesc', icon: Flag, badge: '6', group: 'platform' },
  { key: 'mesh', labelKey: 'nav.mesh', descKey: 'nav.meshDesc', icon: Network, group: 'platform' },
  { key: 'databases', labelKey: 'nav.databases', descKey: 'nav.databasesDesc', icon: Database, badge: '6', group: 'resources' },
  { key: 'websockets', labelKey: 'nav.websockets', descKey: 'nav.websocketsDesc', icon: Radio, badge: '4', group: 'resources' },
  { key: 'notifications', labelKey: 'nav.notifications', descKey: 'nav.notificationsDesc', icon: BellRing, group: 'resources' },
  { key: 'backups', labelKey: 'nav.backups', descKey: 'nav.backupsDesc', icon: Archive, badge: '10', group: 'resources' },
  { key: 'secrets', labelKey: 'nav.secrets', descKey: 'nav.secretsDesc', icon: KeyRound, badge: '12', group: 'resources' },
  { key: 'cdn', labelKey: 'nav.cdn', descKey: 'nav.cdnDesc', icon: Cloud, group: 'resources' },
  { key: 'monitoring', labelKey: 'nav.monitoring', descKey: 'nav.monitoringDesc', icon: Activity, group: 'observability' },
  { key: 'deployments', labelKey: 'nav.deployments', descKey: 'nav.deploymentsDesc', icon: GitCommitHorizontal, group: 'observability' },
  { key: 'logs', labelKey: 'nav.logs', descKey: 'nav.logsDesc', icon: ScrollText, group: 'observability' },
  { key: 'audit', labelKey: 'nav.audit', descKey: 'nav.auditDesc', icon: ScrollText, group: 'security' },
  { key: 'marketplace', labelKey: 'nav.marketplace', descKey: 'nav.marketplaceDesc', icon: Store, badge: '28', group: 'integrations' },
  { key: 'billing', labelKey: 'nav.billing', descKey: 'nav.billingDesc', icon: Receipt, group: 'admin' },
  { key: 'domains', labelKey: 'nav.domains', descKey: 'nav.domainsDesc', icon: Globe, badge: '8', group: 'admin' },
  { key: 'team', labelKey: 'nav.team', descKey: 'nav.teamDesc', icon: Users, badge: '7', group: 'admin' },
  { key: 'settings', labelKey: 'nav.settingsNav', descKey: 'nav.settingsDesc', icon: Settings, group: 'admin' },
]

const GROUPS: { key: NavItem['group']; labelKey: string }[] = [
  { key: 'platform', labelKey: 'nav.platform' },
  { key: 'resources', labelKey: 'nav.resources' },
  { key: 'observability', labelKey: 'nav.observability' },
  { key: 'security', labelKey: 'nav.security' },
  { key: 'integrations', labelKey: 'nav.integrations' },
  { key: 'admin', labelKey: 'nav.admin' },
]

export function Sidebar() {
  const { view, setView, sidebarOpen, toggleSidebar } = useNexoraStore()
  const { isRTL } = useLanguage()
  const { t } = useI18n()
  const rtl = isRTL()

  // Determine slide direction based on RTL/LTR
  const closedClass = rtl ? 'translate-x-full' : '-translate-x-full'
  // Sidebar position: right in RTL, left in LTR
  const sideClass = rtl ? 'right-0' : 'left-0'
  // Chevron direction: in RTL "close" should point right, in LTR point left
  const ChevronClose = rtl ? ChevronRight : ChevronLeft

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 z-40 flex w-72 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          sideClass,
          sidebarOpen ? 'translate-x-0' : closedClass,
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 lg:hidden"
          >
            <ChevronClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Plan card */}
        <div className="px-4 py-3">
          <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 ring-1 ring-emerald-500/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">ENTERPRISE</span>
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg font-bold">78%</span>
              <span className="text-xs text-muted-foreground">{rtl ? 'الحصة المستخدمة' : 'quota used'}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/20 dark:bg-emerald-900/40">
              <div className={cn(
                'h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500',
                rtl && 'bg-gradient-to-l'
              )} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {GROUPS.map(group => (
            <div key={group.key} className="mb-4">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(group.labelKey)}
              </div>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter(n => n.group === group.key).map(item => {
                  const active = view === item.key
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setView(item.key)
                        if (window.innerWidth < 1024) toggleSidebar()
                      }}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary-foreground')} />
                      <span className="flex-1 text-start font-medium">{t(item.labelKey)}</span>
                      {item.badge && (
                        <Badge
                          variant={active ? 'secondary' : 'outline'}
                          className={cn('h-5 px-1.5 text-[10px]', active && 'bg-primary-foreground/20 text-primary-foreground')}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
              AH
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold">Ahmed Hassan</div>
              <div className="truncate text-xs text-muted-foreground">owner@nexora.app</div>
            </div>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
        </div>
      </aside>
    </>
  )
}
