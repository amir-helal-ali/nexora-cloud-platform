'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRealtime } from '@/hooks/use-realtime'
import { Sparkline } from '@/components/nexora/sparkline'
import { RUNTIME_META, fmtNum, fmtDate } from '@/lib/nexora'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Activity, AlertTriangle, Bell, Plus, MoreVertical, Settings2, Zap, Gauge,
  TrendingUp, TrendingDown, Cpu, MemoryStick, Network, Clock, CheckCircle2,
  XCircle, Shield, Flame, ArrowDown, ArrowUp, Pause, Play, Trash2, Mail,
} from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  metric: 'cpu' | 'memory' | 'rps' | 'error_rate' | 'response_time' | 'connections'
  operator: '>' | '<' | '>=' | '<='
  threshold: number
  duration: number // minutes
  enabled: boolean
  triggered: number // count
  lastTriggered: string | null
  severity: 'info' | 'warning' | 'critical'
  channels: string[]
}

interface AlertEvent {
  id: string
  ruleName: string
  metric: string
  value: number
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  status: 'firing' | 'resolved'
  triggeredAt: string
  resolvedAt: string | null
  app: string
}

const METRIC_META = {
  cpu: { label: 'CPU Usage', unit: '%', icon: Cpu, color: 'emerald' },
  memory: { label: 'Memory Usage', unit: '%', icon: MemoryStick, color: 'sky' },
  rps: { label: 'Requests/sec', unit: ' rps', icon: Activity, color: 'violet' },
  error_rate: { label: 'Error Rate', unit: '%', icon: XCircle, color: 'rose' },
  response_time: { label: 'Response Time', unit: 'ms', icon: Clock, color: 'amber' },
  connections: { label: 'DB Connections', unit: '', icon: Network, color: 'teal' },
}

const SEVERITY_META = {
  info: { label: 'Info', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-900', dot: 'bg-sky-500' },
  warning: { label: 'Warning', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  critical: { label: 'Critical', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
}

const INITIAL_RULES: AlertRule[] = [
  { id: 'rule_1', name: 'High CPU Usage', metric: 'cpu', operator: '>', threshold: 80, duration: 5, enabled: true, triggered: 3, lastTriggered: '2026-07-23T15:30:00Z', severity: 'warning', channels: ['push', 'email'] },
  { id: 'rule_2', name: 'Memory Pressure', metric: 'memory', operator: '>', threshold: 90, duration: 3, enabled: true, triggered: 1, lastTriggered: '2026-07-22T08:14:00Z', severity: 'critical', channels: ['push', 'sms'] },
  { id: 'rule_3', name: 'Error Rate Spike', metric: 'error_rate', operator: '>', threshold: 5, duration: 2, enabled: true, triggered: 0, lastTriggered: null, severity: 'critical', channels: ['push', 'email', 'webhook'] },
  { id: 'rule_4', name: 'Slow Response Time', metric: 'response_time', operator: '>', threshold: 500, duration: 5, enabled: true, triggered: 2, lastTriggered: '2026-07-23T11:22:00Z', severity: 'warning', channels: ['in_app'] },
  { id: 'rule_5', name: 'Low Traffic', metric: 'rps', operator: '<', threshold: 50, duration: 10, enabled: false, triggered: 0, lastTriggered: null, severity: 'info', channels: ['in_app'] },
  { id: 'rule_6', name: 'DB Connection Pool', metric: 'connections', operator: '>', threshold: 80, duration: 3, enabled: true, triggered: 4, lastTriggered: '2026-07-23T19:45:00Z', severity: 'warning', channels: ['email'] },
]

const INITIAL_EVENTS: AlertEvent[] = [
  { id: 'ev_1', ruleName: 'High CPU Usage', metric: 'cpu', value: 87, threshold: 80, severity: 'warning', status: 'firing', triggeredAt: '2026-07-23T15:30:00Z', resolvedAt: null, app: 'php-laravel-store' },
  { id: 'ev_2', ruleName: 'Memory Pressure', metric: 'memory', value: 92, threshold: 90, severity: 'critical', status: 'resolved', triggeredAt: '2026-07-22T08:14:00Z', resolvedAt: '2026-07-22T08:42:00Z', app: 'nextjs-dashboard' },
  { id: 'ev_3', ruleName: 'Slow Response Time', metric: 'response_time', value: 612, threshold: 500, severity: 'warning', status: 'resolved', triggeredAt: '2026-07-23T11:22:00Z', resolvedAt: '2026-07-23T11:38:00Z', app: 'php-laravel-store' },
  { id: 'ev_4', ruleName: 'DB Connection Pool', metric: 'connections', value: 84, threshold: 80, severity: 'warning', status: 'firing', triggeredAt: '2026-07-23T19:45:00Z', resolvedAt: null, app: 'postgres-main' },
  { id: 'ev_5', ruleName: 'High CPU Usage', metric: 'cpu', value: 83, threshold: 80, severity: 'warning', status: 'resolved', triggeredAt: '2026-07-23T14:12:00Z', resolvedAt: '2026-07-23T14:25:00Z', app: 'rust-api-gateway' },
  { id: 'ev_6', ruleName: 'Error Rate Spike', metric: 'error_rate', value: 7.2, threshold: 5, severity: 'critical', status: 'resolved', triggeredAt: '2026-07-21T22:08:00Z', resolvedAt: '2026-07-21T22:15:00Z', app: 'nextjs-marketing' },
]

export function MonitoringView() {
  const { metrics } = useRealtime()
  const { t } = useI18n()
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_RULES)
  const [events, setEvents] = useState<AlertEvent[]>(INITIAL_EVENTS)
  const [createOpen, setCreateOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    metric: 'cpu' as AlertRule['metric'],
    operator: '>' as AlertRule['operator'],
    threshold: 80,
    duration: 5,
    severity: 'warning' as AlertRule['severity'],
    channels: ['push'] as string[],
  })

  const handleCreate = () => {
    if (!newRule.name.trim()) {
      toast.error('Rule name is required')
      return
    }
    const rule: AlertRule = {
      id: `rule_${Date.now()}`,
      name: newRule.name,
      metric: newRule.metric,
      operator: newRule.operator,
      threshold: newRule.threshold,
      duration: newRule.duration,
      enabled: true,
      triggered: 0,
      lastTriggered: null,
      severity: newRule.severity,
      channels: newRule.channels,
    }
    setRules([rule, ...rules])
    toast.success('Alert rule created', { description: `${rule.name} is now active` })
    setCreateOpen(false)
    setNewRule({ name: '', metric: 'cpu', operator: '>', threshold: 80, duration: 5, severity: 'warning', channels: ['push'] })
  }

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
    toast.success('Alert rule deleted')
  }

  const resolveEvent = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: 'resolved', resolvedAt: new Date().toISOString() } : e))
    toast.success('Alert resolved')
  }

  const firingCount = events.filter(e => e.status === 'firing').length
  const criticalCount = events.filter(e => e.severity === 'critical' && e.status === 'firing').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('monitoring.activeRules')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{rules.filter(r => r.enabled).length}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('monitoring.firingAlerts')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{firingCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('monitoring.critical')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{criticalCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
              <Flame className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('monitoring.resolved24h')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{events.filter(e => e.status === 'resolved').length}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Live metrics */}
      {metrics && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{t('monitoring.liveFleetMetrics')}</h3>
              <p className="text-xs text-muted-foreground">{t('monitoring.liveFleetMetricsDesc')}</p>
            </div>
            <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> streaming
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { key: 'cpu', label: 'Avg CPU', getValue: () => metrics.apps.filter(a => a.status === 'running').reduce((s, a) => s + a.cpu, 0) / Math.max(1, metrics.apps.filter(a => a.status === 'running').length), color: '#10b981', unit: '%' },
              { key: 'memory', label: 'Avg Memory', getValue: () => metrics.apps.filter(a => a.status === 'running').reduce((s, a) => s + a.memory, 0) / Math.max(1, metrics.apps.filter(a => a.status === 'running').length), color: '#0ea5e9', unit: '%' },
              { key: 'rps', label: 'Total RPS', getValue: () => metrics.apps.reduce((s, a) => s + a.rps, 0), color: '#8b5cf6', unit: '' },
            ] as const).map(m => {
              const val = m.getValue()
              const hist = metrics.history[m.key as keyof typeof metrics.history] || []
              return (
                <div key={m.key} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className="text-lg font-bold tabular-nums">{val.toFixed(1)}{m.unit}</span>
                  </div>
                  <Sparkline values={hist} color={m.color} width={280} height={40} className="mt-2 w-full" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t('monitoring.alertRules')}</h2>
          <p className="text-xs text-muted-foreground">{rules.length} rules configured · {rules.filter(r => r.enabled).length} active</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4" /> New Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('monitoring.createAlertRule')}</DialogTitle>
              <DialogDescription>Get notified when a metric crosses your threshold for a sustained period.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs font-medium">{t('monitoring.ruleName')}</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Production CPU spike"
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">{t('monitoring.metric')}</Label>
                  <Select value={newRule.metric} onValueChange={(v) => setNewRule({ ...newRule, metric: v as AlertRule['metric'] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(METRIC_META).map(([k, m]) => (
                        <SelectItem key={k} value={k}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('monitoring.operator')}</Label>
                  <Select value={newRule.operator} onValueChange={(v) => setNewRule({ ...newRule, operator: v as AlertRule['operator'] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">Greater than (&gt;)</SelectItem>
                      <SelectItem value="<">Less than (&lt;)</SelectItem>
                      <SelectItem value=">=">Greater or equal (&gt;=)</SelectItem>
                      <SelectItem value="<=">Less or equal (&lt;=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">{t('monitoring.threshold')}</Label>
                  <Input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('monitoring.duration')}</Label>
                  <Input
                    type="number"
                    value={newRule.duration}
                    onChange={(e) => setNewRule({ ...newRule, duration: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('monitoring.severity')}</Label>
                  <Select value={newRule.severity} onValueChange={(v) => setNewRule({ ...newRule, severity: v as AlertRule['severity'] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert rules */}
      <div className="grid gap-3">
        {rules.map(rule => {
          const meta = METRIC_META[rule.metric]
          const sev = SEVERITY_META[rule.severity]
          const Icon = meta.icon
          return (
            <Card key={rule.id} className={cn('overflow-hidden transition-shadow hover:shadow-md', !rule.enabled && 'opacity-60')}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', `bg-${meta.color}-500/10`)}>
                  <Icon className={cn('h-5 w-5', `text-${meta.color}-600 dark:text-${meta.color}-400`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{rule.name}</span>
                    <Badge variant="outline" className={cn('text-[10px] uppercase', sev.bg, sev.color)}>
                      <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', sev.dot)} />
                      {sev.label}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Trigger when <span className="font-mono font-semibold text-foreground">{meta.label}</span> is{' '}
                    <span className="font-mono font-semibold text-foreground">{rule.operator} {rule.threshold}{meta.unit}</span> for{' '}
                    <span className="font-mono font-semibold text-foreground">{rule.duration} min</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Triggered {rule.triggered} times</span>
                    <span>·</span>
                    <span>Last: {rule.lastTriggered ? fmtDate(rule.lastTriggered) : 'never'}</span>
                    <span>·</span>
                    <span>Channels: {rule.channels.join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info('Edit rule', { description: rule.name })}>
                        <Settings2 className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Test rule', { description: 'Sending test alert...' })}>
                        <Zap className="h-3.5 w-3.5" /> Send Test
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteRule(rule.id)} className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Alert events timeline */}
      <Card className="overflow-hidden">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{t('monitoring.alertEvents')}</h3>
              <p className="text-xs text-muted-foreground">Recent triggered alerts across all apps</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{events.length} events</Badge>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {events.map(ev => {
            const sev = SEVERITY_META[ev.severity]
            const meta = METRIC_META[ev.metric as keyof typeof METRIC_META]
            return (
              <div key={ev.id} className="flex items-start gap-3 px-5 py-3 hover:bg-accent/30">
                <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-md ring-1', sev.bg, sev.color)}>
                  {ev.status === 'firing' ? <Flame className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{ev.ruleName}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(ev.triggeredAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ev.app} · {meta.label} reached{' '}
                    <span className="font-mono font-semibold text-foreground">{ev.value}{meta.unit}</span>{' '}
                    (threshold: {ev.threshold}{meta.unit})
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-[10px] uppercase', sev.bg, sev.color)}>
                      {ev.severity}
                    </Badge>
                    {ev.status === 'firing' ? (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> firing
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> resolved
                      </Badge>
                    )}
                    {ev.status === 'firing' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 gap-1 px-2 text-[10px]"
                        onClick={() => resolveEvent(ev.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
