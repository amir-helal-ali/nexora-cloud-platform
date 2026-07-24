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
import { Logo } from './brand'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NavItem {
  key: ViewKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  group: 'platform' | 'resources' | 'observability' | 'admin' | 'integrations' | 'security'
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Live dashboard', group: 'platform' },
  { key: 'apps', label: 'Applications', icon: Boxes, description: 'Rust, PHP, Next.js', badge: '7', group: 'platform' },
  { key: 'pipelines', label: 'CI/CD Pipelines', icon: GitPullRequest, description: 'Build & deploy pipelines', badge: '4', group: 'platform' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Traffic & performance', group: 'platform' },
  { key: 'simulator', label: 'Scaling Simulator', icon: FlaskConical, description: 'Test auto-scaling', group: 'platform' },
  { key: 'gateway', label: 'API Gateway', icon: Network, description: 'Routes & rate limiting', badge: '10', group: 'platform' },
  { key: 'flags', label: 'Feature Flags', icon: Flag, description: 'A/B testing & rollout', badge: '6', group: 'platform' },
  { key: 'mesh', label: 'Service Mesh', icon: Network, description: 'Topology & tracing', group: 'platform' },
  { key: 'databases', label: 'Databases', icon: Database, description: 'SQL, NoSQL, Cache', badge: '6', group: 'resources' },
  { key: 'websockets', label: 'WebSocket Services', icon: Radio, description: 'Realtime endpoints', badge: '4', group: 'resources' },
  { key: 'notifications', label: 'Push Notifications', icon: BellRing, description: 'In-app, Email, Push', group: 'resources' },
  { key: 'backups', label: 'Backups', icon: Archive, description: 'Snapshots & restore', badge: '10', group: 'resources' },
  { key: 'secrets', label: 'Secrets Manager', icon: KeyRound, description: 'Encrypted env vars', badge: '12', group: 'resources' },
  { key: 'cdn', label: 'CDN & Edge', icon: Cloud, description: '12 PoPs · Anycast', group: 'resources' },
  { key: 'monitoring', label: 'Monitoring & Alerts', icon: Activity, description: 'Alerts & metrics', group: 'observability' },
  { key: 'deployments', label: 'Deployments', icon: GitCommitHorizontal, description: 'CI/CD history', group: 'observability' },
  { key: 'logs', label: 'Logs', icon: ScrollText, description: 'Live streaming logs', group: 'observability' },
  { key: 'audit', label: 'Audit Log', icon: ScrollText, description: 'Compliance & events', group: 'security' },
  { key: 'marketplace', label: 'Marketplace', icon: Store, description: 'Add-ons & integrations', badge: '28', group: 'integrations' },
  { key: 'billing', label: 'Billing', icon: Receipt, description: 'Invoices & usage', group: 'admin' },
  { key: 'domains', label: 'Domains & SSL', icon: Globe, description: 'DNS, certificates', badge: '8', group: 'admin' },
  { key: 'team', label: 'Team', icon: Users, description: 'Members & roles', badge: '7', group: 'admin' },
  { key: 'settings', label: 'Settings', icon: Settings, description: 'Account & plan', group: 'admin' },
]

const GROUPS: { key: NavItem['group']; label: string }[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'resources', label: 'Resources' },
  { key: 'observability', label: 'Observability' },
  { key: 'security', label: 'Security & Compliance' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'admin', label: 'Administration' },
]

export function Sidebar() {
  const { view, setView, sidebarOpen, toggleSidebar } = useNexoraStore()

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
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
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
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Plan card */}
        <div className="px-4 py-3">
          <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 ring-1 ring-emerald-500/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">ENTERPRISE PLAN</span>
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg font-bold">78%</span>
              <span className="text-xs text-muted-foreground">quota used</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/20 dark:bg-emerald-900/40">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {GROUPS.map(group => (
            <div key={group.key} className="mb-4">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
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
                      <span className="flex-1 text-left font-medium">{item.label}</span>
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
