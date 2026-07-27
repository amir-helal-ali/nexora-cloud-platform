'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Shield, Search, Download, Lock, User, Server, Database, Globe,
  Key, Settings, Activity, AlertTriangle, CheckCircle2, XCircle,
  FileText, Eye, Edit, Trash2, LogIn, LogOut, Plus, Filter, ShieldCheck,
  Clock, Cpu, Cloud,
} from 'lucide-react'

interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorType: 'user' | 'system' | 'api_key' | 'webhook'
  action: string
  category: 'auth' | 'app' | 'database' | 'domain' | 'team' | 'secret' | 'billing' | 'security' | 'config'
  resource: string
  resourceId: string
  result: 'success' | 'failure' | 'denied'
  ip: string
  userAgent: string
  location: string
  details: string
  severity: 'info' | 'warning' | 'critical'
}

const INITIAL_EVENTS: AuditEvent[] = [
  { id: 'a1', timestamp: '2026-07-24T09:14:22Z', actor: 'owner@nexora.app', actorType: 'user', action: 'login', category: 'auth', resource: 'session', resourceId: 'sess_8f2a', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Signed in via password + 2FA (Authy)', severity: 'info' },
  { id: 'a2', timestamp: '2026-07-24T09:18:04Z', actor: 'owner@nexora.app', actorType: 'user', action: 'deploy', category: 'app', resource: 'app', resourceId: 'nextjs-marketing', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Triggered deploy a4f9c2e via GitHub webhook', severity: 'info' },
  { id: 'a3', timestamp: '2026-07-24T09:18:42Z', actor: 'system', actorType: 'system', action: 'auto_scale', category: 'app', resource: 'app', resourceId: 'rust-api-gateway', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Scaled from 2 to 4 instances (CPU 87%)', severity: 'info' },
  { id: 'a4', timestamp: '2026-07-24T08:42:15Z', actor: 'sarah@nexora.app', actorType: 'user', action: 'update_secret', category: 'secret', resource: 'secret', resourceId: 'JWT_SECRET', result: 'success', ip: '41.232.18.9', userAgent: 'Firefox 128 / Windows', location: 'Dubai, UAE', details: 'Rotated secret JWT_SECRET (used by 3 apps)', severity: 'warning' },
  { id: 'a5', timestamp: '2026-07-24T08:30:00Z', actor: 'system', actorType: 'system', action: 'backup_complete', category: 'database', resource: 'database', resourceId: 'postgres-main', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Automatic backup completed (612 MB, 42s)', severity: 'info' },
  { id: 'a6', timestamp: '2026-07-24T07:55:31Z', actor: 'unknown', actorType: 'user', action: 'login', category: 'auth', resource: 'session', resourceId: '—', result: 'denied', ip: '94.205.34.12', userAgent: 'curl/8.0', location: 'Unknown (Russia)', details: 'Failed login attempt for admin@nexora.app (rate limited)', severity: 'critical' },
  { id: 'a7', timestamp: '2026-07-24T07:42:08Z', actor: 'system', actorType: 'system', action: 'ssl_renew', category: 'domain', resource: 'domain', resourceId: 'api.nexora.app', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'SSL certificate renewed via Let\'s Encrypt (valid 90 days)', severity: 'info' },
  { id: 'a8', timestamp: '2026-07-24T07:15:00Z', actor: 'ci-bot', actorType: 'api_key', action: 'deploy', category: 'app', resource: 'app', resourceId: 'php-symfony-cms', result: 'failure', ip: '140.82.114.4', userAgent: 'GitHub Actions', location: 'United States', details: 'Build failed at composer install stage (exit 1)', severity: 'warning' },
  { id: 'a9', timestamp: '2026-07-24T06:48:19Z', actor: 'omar@nexora.app', actorType: 'user', action: 'create_app', category: 'app', resource: 'app', resourceId: 'rust-cli-tools', result: 'success', ip: '156.198.34.21', userAgent: 'Safari 17 / iPhone', location: 'Riyadh, Saudi Arabia', details: 'Created new Rust app with axum framework', severity: 'info' },
  { id: 'a10', timestamp: '2026-07-24T06:30:42Z', actor: 'system', actorType: 'system', action: 'ddos_mitigate', category: 'security', resource: 'gateway', resourceId: 'api-gateway', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Blocked 12,400 requests from 84 IPs (Layer 7 attack)', severity: 'critical' },
  { id: 'a11', timestamp: '2026-07-24T05:22:00Z', actor: 'system', actorType: 'system', action: 'backup_complete', category: 'database', resource: 'database', resourceId: 'mysql-store', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Automatic backup completed (1.34 GB, 78s)', severity: 'info' },
  { id: 'a12', timestamp: '2026-07-24T04:14:08Z', actor: 'owner@nexora.app', actorType: 'user', action: 'invite_member', category: 'team', resource: 'team', resourceId: 'youssef.mobile@nexora.app', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Invited youssef.mobile@nexora.app as Developer', severity: 'info' },
  { id: 'a13', timestamp: '2026-07-24T03:00:00Z', actor: 'system', actorType: 'system', action: 'backup_complete', category: 'database', resource: 'database', resourceId: 'mongo-events', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Automatic backup completed (412 MB, 28s)', severity: 'info' },
  { id: 'a14', timestamp: '2026-07-24T02:18:33Z', actor: 'unknown', actorType: 'user', action: 'api_key_use', category: 'auth', resource: 'api_key', resourceId: 'nx_live_sk_••••', result: 'denied', ip: '45.83.221.10', userAgent: 'python-requests/2.31', location: 'Unknown (China)', details: 'Revoked API key attempted use', severity: 'critical' },
  { id: 'a15', timestamp: '2026-07-24T01:42:00Z', actor: 'system', actorType: 'system', action: 'cert_expiry', category: 'domain', resource: 'domain', resourceId: 'nexora.io', result: 'failure', ip: 'system', userAgent: '—', location: 'fra1', details: 'SSL provisioning failed - DNS not propagated yet', severity: 'warning' },
  { id: 'a16', timestamp: '2026-07-23T22:45:14Z', actor: 'karim@nexora.app', actorType: 'user', action: 'create_database', category: 'database', resource: 'database', resourceId: 'mongo-events', result: 'success', ip: '156.198.34.21', userAgent: 'Chrome 127 / Linux', location: 'Cairo, Egypt', details: 'Created MongoDB 7.0 instance (2GB, fra1)', severity: 'info' },
  { id: 'a17', timestamp: '2026-07-23T22:08:00Z', actor: 'system', actorType: 'webhook', action: 'push_sent', category: 'app', resource: 'notification', resourceId: 'notif_8a2f', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Push notification delivered to 4 devices (95% open rate)', severity: 'info' },
  { id: 'a18', timestamp: '2026-07-23T20:14:22Z', actor: 'owner@nexora.app', actorType: 'user', action: 'update_plan', category: 'billing', resource: 'subscription', resourceId: 'sub_8f2a', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Upgraded from Pro to Enterprise plan', severity: 'info' },
  { id: 'a19', timestamp: '2026-07-23T18:30:08Z', actor: 'layla@nexora.app', actorType: 'user', action: 'update_flag', category: 'config', resource: 'feature_flag', resourceId: 'new_dashboard_v2', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Increased rollout from 20% to 35%', severity: 'info' },
  { id: 'a20', timestamp: '2026-07-23T15:42:00Z', actor: 'system', actorType: 'system', action: 'log_rotate', category: 'config', resource: 'logs', resourceId: 'all', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Rotated 1.2M log entries to cold storage (S3)', severity: 'info' },
]

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  auth: { label: 'Authentication', icon: LogIn, color: 'text-sky-500' },
  app: { label: 'Application', icon: Server, color: 'text-emerald-500' },
  database: { label: 'Database', icon: Database, color: 'text-violet-500' },
  domain: { label: 'Domain', icon: Globe, color: 'text-amber-500' },
  team: { label: 'Team', icon: User, color: 'text-rose-500' },
  secret: { label: 'Secret', icon: Key, color: 'text-orange-500' },
  billing: { label: 'Billing', icon: FileText, color: 'text-teal-500' },
  security: { label: 'Security', icon: Shield, color: 'text-rose-600' },
  config: { label: 'Config', icon: Settings, color: 'text-slate-500' },
}

const RESULT_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  success: { label: 'Success', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', icon: CheckCircle2 },
  failure: { label: 'Failed', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', icon: AlertTriangle },
  denied: { label: 'Denied', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', icon: XCircle },
}

const SEVERITY_COLORS: Record<string, string> = {
  info: 'border-l-sky-500',
  warning: 'border-l-amber-500',
  critical: 'border-l-rose-500',
}

function fmtDate(s: string): string {
  const d = new Date(s)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function AuditLogView() {
  const { t } = useI18n()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const r = await fetch('/api/audit')
      const d = await r.json()
      setEvents(d.logs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [actorFilter, setActorFilter] = useState('all')

  const filtered = events.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
    if (resultFilter !== 'all' && e.result !== resultFilter) return false
    if (actorFilter !== 'all' && e.actorType !== actorFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.resourceId.toLowerCase().includes(q) || e.details.toLowerCase().includes(q) || e.ip.includes(q)
    }
    return true
  })

  const totalEvents = events.length
  const deniedCount = events.filter(e => e.result === 'denied').length
  const failureCount = events.filter(e => e.result === 'failure').length
  const criticalCount = events.filter(e => e.severity === 'critical').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('audit.totalEvents')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{totalEvents}</div>
            </div>
            <Activity className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('audit.denied')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{deniedCount}</div>
            </div>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('audit.failed')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{failureCount}</div>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('audit.criticalEvents')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{criticalCount}</div>
            </div>
            <Shield className="h-5 w-5 text-rose-600" />
          </div>
        </Card>
      </div>

      {/* Compliance banner */}
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{t('audit.complianceStatus')}</span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">SOC 2 Type II</Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">ISO 27001</Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">GDPR</Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">HIPAA</Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">PCI DSS L1</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Audit logs retained for 7 years · immutable storage · cryptographically signed</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('Compliance report downloaded', { description: 'soc2-report-2026.pdf' })}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="timeline">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="timeline" className="text-xs">{t('audit.timeline')}</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">{t('audit.securityEvents')}</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">{t('audit.exportSiem')}</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => toast.success('Audit log exported', { description: 'audit-log.csv · 20 events' })}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        <TabsContent value="timeline" className="space-y-3 mt-4">
          {/* Filters */}
          <Card className="p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by actor, action, IP, resource..."
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-36 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="h-9 w-32 text-xs"><SelectValue placeholder="Result" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failed</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actorFilter} onValueChange={setActorFilter}>
                  <SelectTrigger className="h-9 w-32 text-xs"><SelectValue placeholder="Actor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actors</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/60">
              {filtered.map(e => {
                const cat = CATEGORY_META[e.category]
                const result = RESULT_META[e.result]
                const ResultIcon = result.icon
                const CatIcon = cat.icon
                return (
                  <div key={e.id} className={cn('flex items-start gap-3 border-l-2 px-4 py-3 hover:bg-accent/30', SEVERITY_COLORS[e.severity])}>
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1', result.bg, result.color)}>
                      <ResultIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CatIcon className={cn('h-3.5 w-3.5', cat.color)} />
                          <span className="text-sm font-semibold">{e.action.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className={cn('text-[10px] uppercase', result.bg, result.color)}>{result.label}</Badge>
                          {e.severity === 'critical' && (
                            <Badge variant="outline" className="text-[10px] border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              <Shield className="mr-1 h-2.5 w-2.5" /> critical
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(e.timestamp)}</span>
                      </div>
                      <p className="mt-0.5 text-xs">{e.details}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>by <span className="font-medium text-foreground">{e.actor}</span></span>
                        <span>·</span>
                        <span>{e.location}</span>
                        <span>·</span>
                        <code className="font-mono">{e.ip}</code>
                        <span>·</span>
                        <span>{e.userAgent}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No events match your filters</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-3 mt-4">
          {/* Security events only */}
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-rose-500/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-semibold">Security Events</h3>
                <Badge variant="outline" className="text-[10px] border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">
                  {events.filter(e => e.severity === 'critical' || e.result === 'denied').length} critical
                </Badge>
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {events.filter(e => e.severity === 'critical' || e.result === 'denied' || e.category === 'security').map(e => {
                const result = RESULT_META[e.result]
                const ResultIcon = result.icon
                return (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1', result.bg, result.color)}>
                      <ResultIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{e.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-muted-foreground">{fmtDate(e.timestamp)}</span>
                      </div>
                      <p className="mt-0.5 text-xs">{e.details}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <code className="font-mono">{e.ip}</code>
                        <span>·</span>
                        <span>{e.location}</span>
                        <span>·</span>
                        <span>{e.userAgent}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => toast.info('IP blocked', { description: e.ip })}>
                      Block IP
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Active threats */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('audit.activeThreatMitigations')}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { name: 'WAF Rules', count: 142, color: 'text-amber-500', icon: Shield },
                { name: 'Blocked IPs', count: 284, color: 'text-rose-500', icon: Lock },
                { name: 'DDoS Mitigations', count: 12, color: 'text-violet-500', icon: AlertTriangle },
              ].map((t, i) => {
                const Icon = t.icon
                return (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Icon className={cn('h-4 w-4', t.color)} />
                      <span className="text-2xl font-bold tabular-nums">{t.count}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.name}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-3 mt-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('audit.siemIntegrations')}</h3>
            <p className="text-xs text-muted-foreground">Stream audit events to your security information and event management system</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { name: 'Splunk', desc: 'HEC endpoint with token auth', status: 'connected', color: 'text-emerald-500' },
                { name: 'Datadog', desc: 'Logs API with API key auth', status: 'connected', color: 'text-emerald-500' },
                { name: 'Elasticsearch', desc: 'Elastic Cloud with API key', status: 'connected', color: 'text-emerald-500' },
                { name: 'Sumo Logic', desc: 'HTTP source with category', status: 'disconnected', color: 'text-slate-400' },
                { name: 'LogRhythm', desc: 'Syslog over TCP 514', status: 'disconnected', color: 'text-slate-400' },
                { name: 'IBM QRadar', desc: 'QRadar HTTP receiver', status: 'disconnected', color: 'text-slate-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-muted')}>
                    <Cloud className={cn('h-4 w-4', s.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px]', s.status === 'connected' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : '')}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('audit.logRetention')}</h3>
            <div className="mt-3 space-y-2">
              {[
                { period: 'Hot (searchable)', duration: '90 days', storage: '38 GB', color: 'text-rose-500' },
                { period: 'Warm (indexed)', duration: '1 year', storage: '124 GB', color: 'text-amber-500' },
                { period: 'Cold (archived)', duration: '7 years', storage: '842 GB', color: 'text-sky-500' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className={cn('h-4 w-4', r.color)} />
                    <span className="text-sm font-medium">{r.period}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">{r.duration}</span>
                    <span className="font-semibold tabular-nums">{r.storage}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Shield className="mr-1 inline h-3 w-3" />
              All log entries are <span className="font-semibold text-foreground">cryptographically signed</span> with SHA-256 and stored in <span className="font-semibold text-foreground">append-only WORM storage</span> to prevent tampering.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
