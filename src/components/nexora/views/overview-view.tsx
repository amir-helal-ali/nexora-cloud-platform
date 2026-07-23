'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { StatCard } from '@/components/nexora/stat-card'
import { Sparkline } from '@/components/nexora/sparkline'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNexoraStore } from '@/lib/store'
import { RUNTIME_META, STATUS_META, REGION_LABELS, fmtNum, fmtBytes, fmtDate } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import {
  Boxes, Cpu, MemoryStick, Network, Database as DbIcon, Radio, Globe, Users,
  Activity, ArrowUpRight, Zap, Shield, GitCommit, Server, HardDrive, CheckCircle2,
  TrendingUp, Layers,
} from 'lucide-react'

interface Stats {
  summary: {
    totalApps: number
    runningApps: number
    stoppedApps: number
    buildingApps: number
    totalInstances: number
    totalMemoryMb: number
    totalCpuCores: number
    totalDatabases: number
    runningDatabases: number
    storageUsedMb: number
    storageTotalMb: number
    totalDomains: number
    sslActive: number
    sslExpiringSoon: number
    totalWebsockets: number
    totalWsConnections: number
    totalWsMsgPerSec: number
    teamMembers: number
    activeMembers: number
    pendingMembers: number
    unreadNotifications: number
    runtimeBreakdown: Record<string, number>
  }
  apps: any[]
  databases: any[]
  domains: any[]
  websockets: any[]
  team: any[]
  notifications: any[]
  activities: any[]
}

export function OverviewView() {
  const { metrics, appStatusEvents } = useRealtime()
  const { setView } = useNexoraStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const r = await fetch('/api/stats')
      const d = await r.json()
      setStats(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i} className="h-32 animate-pulse bg-muted/30" />
        ))}
      </div>
    )
  }

  const s = stats.summary
  const cpuHistory = metrics?.history.cpu ?? []
  const memHistory = metrics?.history.memory ?? []
  const rpsHistory = metrics?.history.rps ?? []
  const netHistory = metrics?.history.network ?? []

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </Badge>
              <span className="text-xs text-muted-foreground">Last updated {fmtDate(new Date())}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">Welcome back, Ahmed</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Your fleet is running smoothly across <span className="font-medium text-foreground">3 regions</span> with{' '}
              <span className="font-medium text-foreground">{s.totalInstances} active instances</span> handling{' '}
              <span className="font-medium text-foreground">{fmtNum(metrics?.totals.totalRps || s.totalWsMsgPerSec)} requests/sec</span> in real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('deployments')}>
              <GitCommit className="h-4 w-4" />
              View deployments
            </Button>
            <Button size="sm" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700" onClick={() => setView('apps')}>
              <Zap className="h-4 w-4" />
              Deploy new app
            </Button>
          </div>
        </div>
      </Card>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Running Apps"
          value={s.runningApps}
          unit={`/ ${s.totalApps}`}
          icon={Boxes}
          color="emerald"
          delta={2.4}
          spark={cpuHistory}
          sub={`${s.totalInstances} instances · ${s.totalCpuCores} vCPU`}
        />
        <StatCard
          label="Requests / sec"
          value={fmtNum(metrics?.totals.totalRps || 0)}
          icon={Activity}
          color="sky"
          delta={8.2}
          spark={rpsHistory}
          sub="Across all runtimes"
        />
        <StatCard
          label="WebSocket Connections"
          value={fmtNum(s.totalWsConnections + (metrics?.totals.totalConnections || 0))}
          icon={Radio}
          color="violet"
          delta={4.7}
          spark={netHistory}
          sub={`${s.totalWsMsgPerSec} msg/sec live`}
        />
        <StatCard
          label="Storage Used"
          value={fmtBytes(metrics?.totals.storageUsedMb || s.storageUsedMb)}
          unit={`/ ${fmtBytes(metrics?.totals.storageTotalMb || s.storageTotalMb)}`}
          icon={HardDrive}
          color="amber"
          delta={1.3}
          sub={`${s.totalDatabases} databases active`}
        />
      </div>

      {/* Live charts + fleet status */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* CPU/Memory chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Fleet Performance</h3>
              <p className="text-xs text-muted-foreground">CPU & memory utilization · last 60 ticks</p>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">CPU</span>
                <span className="font-semibold tabular-nums">{(cpuHistory[cpuHistory.length - 1] || 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-muted-foreground">Memory</span>
                <span className="font-semibold tabular-nums">{(memHistory[memHistory.length - 1] || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="mb-1 text-xs text-muted-foreground">CPU Average</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {(cpuHistory[cpuHistory.length - 1] || 0).toFixed(1)}<span className="text-base">%</span>
              </div>
              <Sparkline values={cpuHistory} color="#10b981" width={300} height={48} className="mt-2 w-full" />
            </div>
            <div className="rounded-md border border-sky-500/20 bg-sky-500/5 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Memory Average</div>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {(memHistory[memHistory.length - 1] || 0).toFixed(1)}<span className="text-base">%</span>
              </div>
              <Sparkline values={memHistory} color="#0ea5e9" width={300} height={48} className="mt-2 w-full" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3">
            <div>
              <div className="text-xs text-muted-foreground">Total vCPU</div>
              <div className="text-sm font-semibold">{s.totalCpuCores} cores</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Memory</div>
              <div className="text-sm font-semibold">{(s.totalMemoryMb / 1024).toFixed(1)} GB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Bandwidth</div>
              <div className="text-sm font-semibold">{fmtNum(netHistory[netHistory.length - 1] || 0)} KB/s</div>
            </div>
          </div>
        </Card>

        {/* Runtime breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Runtime Distribution</h3>
          <p className="text-xs text-muted-foreground">Apps by language</p>
          <div className="mt-4 space-y-3">
            {Object.entries(s.runtimeBreakdown).map(([rt, count]) => {
              const meta = RUNTIME_META[rt] || RUNTIME_META.node
              const pct = (count / s.totalApps) * 100
              const barColor = rt === 'rust' ? 'bg-orange-500' : rt === 'php' ? 'bg-indigo-500' : rt === 'nextjs' ? 'bg-neutral-500' : 'bg-green-500'
              return (
                <div key={rt}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="font-medium">{meta.label}</span>
                    </div>
                    <span className="text-muted-foreground">{count} apps</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Multi-Runtime Support</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(RUNTIME_META).map(([rt, meta]) => (
                <Badge key={rt} variant="outline" className={cn('gap-1 text-[10px]', meta.bg, meta.color)}>
                  <span>{meta.icon}</span>
                  {meta.label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Live apps grid */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Live Application Fleet</h3>
            <p className="text-xs text-muted-foreground">Real-time metrics from running services</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView('apps')}>
            View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(metrics?.apps || []).map(la => {
            const dbApp = stats.apps.find(a => a.slug === la.name)
            const meta = RUNTIME_META[la.runtime] || RUNTIME_META.node
            const status = STATUS_META[la.status] || STATUS_META.stopped
            return (
              <div
                key={la.id}
                className="group relative overflow-hidden rounded-lg border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-md text-base', meta.bg)}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{la.name}</div>
                      <div className="text-[10px] text-muted-foreground">{meta.label} · {REGION_LABELS[dbApp?.region || 'fra1']}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('gap-1 text-[10px]', status.bg, status.color)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot, la.status === 'running' && 'animate-pulse')} />
                    {status.label}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">CPU</div>
                    <div className="font-semibold tabular-nums">{la.cpu.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Memory</div>
                    <div className="font-semibold tabular-nums">{la.memory.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">RPS</div>
                    <div className="font-semibold tabular-nums">{fmtNum(la.rps)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{dbApp?.instances || 0} instances</span>
                  <span>{la.uptime.toFixed(2)}% uptime</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Bottom row: Activity + Quick stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Latest events across your fleet</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView('logs')}>
              View logs <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="h-[360px]">
            <div className="space-y-2.5">
              {stats.activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-accent/30">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {a.action.split('_')[0].slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{a.detail}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{fmtDate(a.createdAt)}</span>
                      <span>·</span>
                      <span>{a.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
              {appStatusEvents.slice(0, 3).map((e, i) => (
                <div key={`live-${i}`} className="flex items-start gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{e.message}</p>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">just now · live event</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Quick stats column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Domains & SSL</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('domains')}>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Total domains</span>
                </div>
                <span className="font-semibold tabular-nums">{s.totalDomains}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>SSL active</span>
                </div>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{s.sslActive}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span>Expiring soon</span>
                </div>
                <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{s.sslExpiringSoon}</span>
              </div>
            </div>
            <div className="mt-3 border-t pt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SSL coverage</span>
                <span className="font-semibold">{((s.sslActive / s.totalDomains) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(s.sslActive / s.totalDomains) * 100} className="h-1.5" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Team</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('team')}>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex -space-x-2">
              {stats.team.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white ring-2 ring-background"
                  title={`${m.name} (${m.role})`}
                >
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ))}
              {s.teamMembers > 6 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold ring-2 ring-background">
                  +{s.teamMembers - 6}
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-emerald-500/10 px-2 py-1.5">
                <div className="text-[10px] text-muted-foreground">Active</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{s.activeMembers}</div>
              </div>
              <div className="rounded-md bg-amber-500/10 px-2 py-1.5">
                <div className="text-[10px] text-muted-foreground">Pending</div>
                <div className="font-bold text-amber-600 dark:text-amber-400">{s.pendingMembers}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">WebSocket Services</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('websockets')}>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-violet-500" />
                  <span>Endpoints</span>
                </div>
                <span className="font-semibold tabular-nums">{s.totalWebsockets}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-sky-500" />
                  <span>Connections</span>
                </div>
                <span className="font-semibold tabular-nums">{fmtNum(s.totalWsConnections)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span>Msg / sec</span>
                </div>
                <span className="font-semibold tabular-nums">{s.totalWsMsgPerSec}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
