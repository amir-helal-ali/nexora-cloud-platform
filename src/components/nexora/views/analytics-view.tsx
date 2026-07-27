'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkline } from '@/components/nexora/sparkline'
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { RUNTIME_META, fmtNum, fmtBytes } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Users, Globe, Zap, Clock, Activity,
  Cpu, MemoryStick, Network, Server, MapPin, Smartphone, Monitor,
  Globe2, Github, Chrome,
} from 'lucide-react'

// Helper: Bar chart
function BarChart({ data, height = 120 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn('w-full rounded-t transition-all hover:opacity-80', d.color || 'bg-emerald-500')}
              style={{ height: `${(d.value / max) * 100}%`, minHeight: '4px' }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="truncate text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// Helper: Donut chart
function DonutChart({ segments, size = 120 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const radius = size / 2 - 8
  const circumference = 2 * Math.PI * radius

  // Pre-compute offsets for each segment
  const computed = segments.reduce<{ items: { len: number; offset: number; color: string; label: string; value: number }[]; acc: number }>(
    (acc, s) => {
      const len = (s.value / total) * circumference
      acc.items.push({ len, offset: acc.acc, color: s.color, label: s.label, value: s.value })
      acc.acc += len
      return acc
    },
    { items: [], acc: 0 },
  )

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" />
        {computed.items.map((it, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={it.color}
            strokeWidth={8}
            strokeDasharray={`${it.len} ${circumference - it.len}`}
            strokeDashoffset={-it.offset}
            strokeLinecap="round"
          />
        ))}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="rotate-90 fill-foreground text-sm font-bold"
          style={{ transformOrigin: 'center' }}
        >
          {total}
        </text>
      </svg>
      <div className="flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </div>
            <span className="font-semibold tabular-nums">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsView() {
  const { metrics } = useRealtime()
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setAnalytics).catch(console.error)
  }, [])
  const { t } = useI18n()
  const cpuHist = metrics?.history.cpu ?? []
  const memHist = metrics?.history.memory ?? []
  const rpsHist = metrics?.history.rps ?? []
  const netHist = metrics?.history.network ?? []

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('analytics.requests24h')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">8.42M</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" /> +12.4% vs yesterday
              </div>
            </div>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('analytics.uniqueVisitors')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">142.8K</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" /> +8.2%
              </div>
            </div>
            <Users className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('analytics.avgResponseTime')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">84ms</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-2.5 w-2.5" /> -6.3% (faster)
              </div>
            </div>
            <Clock className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('analytics.bandwidth24h')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">1.24 TB</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-2.5 w-2.5" /> +18.7%
              </div>
            </div>
            <Network className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="traffic">
        <TabsList>
          <TabsTrigger value="traffic" className="text-xs">{t('analytics.traffic')}</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">{t('analytics.performance')}</TabsTrigger>
          <TabsTrigger value="geography" className="text-xs">{t('analytics.geography')}</TabsTrigger>
          <TabsTrigger value="devices" className="text-xs">{t('analytics.devices')}</TabsTrigger>
        </TabsList>

        {/* Traffic tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t('analytics.requestsPerHour')}</h3>
                  <p className="text-xs text-muted-foreground">Last 24 hours · all apps</p>
                </div>
                <Badge variant="outline" className="text-[10px]">8.42M total</Badge>
              </div>
              <BarChart
                data={Array.from({ length: 24 }, (_, i) => {
                  const base = 200 + Math.sin(i * 0.5) * 100 + Math.random() * 100
                  return {
                    label: `${i}:00`,
                    value: Math.round(base * (1 + i / 24)),
                    color: i === new Date().getHours() ? 'bg-emerald-500' : 'bg-emerald-500/60',
                  }
                })}
                height={140}
              />
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('analytics.trafficByRuntime')}</h3>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
              <div className="mt-4">
                <DonutChart
                  segments={[
                    { label: 'Next.js', value: 42, color: '#10b981' },
                    { label: 'Rust', value: 31, color: '#f97316' },
                    { label: 'PHP', value: 19, color: '#6366f1' },
                    { label: 'Node.js', value: 8, color: '#22c55e' },
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Top endpoints */}
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">{t('analytics.topEndpoints')}</h3>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { method: 'GET', path: '/api/products', requests: 1240000, avgMs: 23, status: '200' },
                { method: 'GET', path: '/api/health', requests: 980000, avgMs: 8, status: '200' },
                { method: 'POST', path: '/api/auth/login', requests: 542000, avgMs: 84, status: '200' },
                { method: 'GET', path: '/api/users/me', requests: 478000, avgMs: 34, status: '200' },
                { method: 'POST', path: '/api/orders', requests: 312000, avgMs: 142, status: '201' },
                { method: 'GET', path: '/api/orders/:id', requests: 287000, avgMs: 56, status: '200' },
                { method: 'PUT', path: '/api/orders/:id', requests: 142000, avgMs: 168, status: '200' },
                { method: 'GET', path: '/api/analytics/dashboard', requests: 89000, avgMs: 412, status: '200' },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent/30">
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-[10px] font-mono',
                      e.method === 'GET' && 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
                      e.method === 'POST' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                      e.method === 'PUT' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                    )}
                  >
                    {e.method}
                  </Badge>
                  <code className="flex-1 truncate text-xs font-mono">{e.path}</code>
                  <span className="shrink-0 text-xs font-semibold tabular-nums">{fmtNum(e.requests)}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{e.avgMs}ms</span>
                  <Badge variant="outline" className="shrink-0 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Performance tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('analytics.cpuUsageTrend')}</h3>
                <span className="text-xs text-muted-foreground">avg {(cpuHist[cpuHist.length - 1] || 0).toFixed(1)}%</span>
              </div>
              <Sparkline values={cpuHist} color="#10b981" width={500} height={100} className="w-full" />
              <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3 text-xs">
                <div><div className="text-muted-foreground">Min</div><div className="font-semibold">{Math.min(...cpuHist).toFixed(1)}%</div></div>
                <div><div className="text-muted-foreground">Avg</div><div className="font-semibold">{(cpuHist.reduce((a, b) => a + b, 0) / cpuHist.length).toFixed(1)}%</div></div>
                <div><div className="text-muted-foreground">Max</div><div className="font-semibold">{Math.max(...cpuHist).toFixed(1)}%</div></div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('analytics.memoryUsageTrend')}</h3>
                <span className="text-xs text-muted-foreground">avg {(memHist[memHist.length - 1] || 0).toFixed(1)}%</span>
              </div>
              <Sparkline values={memHist} color="#0ea5e9" width={500} height={100} className="w-full" />
              <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3 text-xs">
                <div><div className="text-muted-foreground">Min</div><div className="font-semibold">{Math.min(...memHist).toFixed(1)}%</div></div>
                <div><div className="text-muted-foreground">Avg</div><div className="font-semibold">{(memHist.reduce((a, b) => a + b, 0) / memHist.length).toFixed(1)}%</div></div>
                <div><div className="text-muted-foreground">Max</div><div className="font-semibold">{Math.max(...memHist).toFixed(1)}%</div></div>
              </div>
            </Card>
          </div>

          {/* Response time distribution */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('analytics.responseTimeDistribution')}</h3>
            <p className="text-xs text-muted-foreground">Last 24 hours · 8.42M requests</p>
            <div className="mt-4">
              <BarChart
                data={[
                  { label: '<50ms', value: 4200000, color: 'bg-emerald-500' },
                  { label: '50-100ms', value: 2400000, color: 'bg-emerald-400' },
                  { label: '100-200ms', value: 1200000, color: 'bg-amber-400' },
                  { label: '200-500ms', value: 480000, color: 'bg-amber-500' },
                  { label: '500ms-1s', value: 96000, color: 'bg-rose-400' },
                  { label: '>1s', value: 24000, color: 'bg-rose-500' },
                ]}
                height={140}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3 border-t pt-3 text-xs">
              <div><div className="text-muted-foreground">P50</div><div className="font-semibold">42ms</div></div>
              <div><div className="text-muted-foreground">P90</div><div className="font-semibold">156ms</div></div>
              <div><div className="text-muted-foreground">P95</div><div className="font-semibold">287ms</div></div>
              <div><div className="text-muted-foreground">P99</div><div className="font-semibold">812ms</div></div>
            </div>
          </Card>
        </TabsContent>

        {/* Geography tab */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('analytics.topCountries')}</h3>
              <p className="text-xs text-muted-foreground">By request volume · 24h</p>
              <div className="mt-4 space-y-2">
                {[
                  { country: '🇪🇬 Egypt', requests: 2840000, pct: 33.7 },
                  { country: '🇸🇦 Saudi Arabia', requests: 1620000, pct: 19.2 },
                  { country: '🇦🇪 UAE', requests: 1180000, pct: 14.0 },
                  { country: '🇩🇪 Germany', requests: 890000, pct: 10.6 },
                  { country: '🇺🇸 United States', requests: 740000, pct: 8.8 },
                  { country: '🇬🇧 United Kingdom', requests: 410000, pct: 4.9 },
                  { country: '🇫🇷 France', requests: 380000, pct: 4.5 },
                  { country: '🇶🇦 Qatar', requests: 230000, pct: 2.7 },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-xs font-medium">{c.country}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${c.pct * 2}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums">{fmtNum(c.requests)}</span>
                    <span className="w-12 shrink-0 text-right text-[10px] text-muted-foreground">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('analytics.regionsLatency')}</h3>
              <p className="text-xs text-muted-foreground">Average response time by Nexora region</p>
              <div className="mt-4 space-y-3">
                {[
                  { region: 'fra1', city: 'Frankfurt, DE', latency: 28, requests: 3120000, color: 'bg-emerald-500' },
                  { region: 'nyc1', city: 'New York, US', latency: 84, requests: 1840000, color: 'bg-sky-500' },
                  { region: 'sfo1', city: 'San Francisco, US', latency: 142, requests: 980000, color: 'bg-violet-500' },
                  { region: 'sin1', city: 'Singapore, SG', latency: 198, requests: 620000, color: 'bg-amber-500' },
                  { region: 'syd1', city: 'Sydney, AU', latency: 247, requests: 380000, color: 'bg-rose-500' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md border p-2.5">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', r.color)}>
                      <Server className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{r.city}</span>
                        <span className="text-xs font-semibold tabular-nums">{r.latency}ms</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{r.region}</span>
                        <span>{fmtNum(r.requests)} reqs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Devices tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Devices</h3>
              <p className="text-xs text-muted-foreground">By request volume</p>
              <div className="mt-4">
                <DonutChart
                  segments={[
                    { label: 'Mobile', value: 58, color: '#8b5cf6' },
                    { label: 'Desktop', value: 34, color: '#10b981' },
                    { label: 'Tablet', value: 8, color: '#f59e0b' },
                  ]}
                />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('analytics.browsers')}</h3>
              <p className="text-xs text-muted-foreground">By request volume</p>
              <div className="mt-4 space-y-2.5">
                {[
                  { name: 'Chrome', icon: Chrome, pct: 62, color: 'text-emerald-500' },
                  { name: 'Safari', icon: Globe, pct: 21, color: 'text-sky-500' },
                  { name: 'Firefox', icon: Globe2, pct: 9, color: 'text-amber-500' },
                  { name: 'Edge', icon: Globe, pct: 6, color: 'text-violet-500' },
                  { name: 'Other', icon: Monitor, pct: 2, color: 'text-slate-500' },
                ].map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', b.color)} />
                      <span className="flex-1 text-xs font-medium">{b.name}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold tabular-nums">{b.pct}%</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('analytics.operatingSystems')}</h3>
              <p className="text-xs text-muted-foreground">By request volume</p>
              <div className="mt-4 space-y-2.5">
                {[
                  { name: 'Windows', pct: 42 },
                  { name: 'Android', pct: 28 },
                  { name: 'iOS', pct: 18 },
                  { name: 'macOS', pct: 9 },
                  { name: 'Linux', pct: 3 },
                ].map((os, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-1 text-xs font-medium">{os.name}</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${os.pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold tabular-nums">{os.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top referrers */}
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">{t('analytics.topReferrers')}</h3>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { source: 'Direct', visits: 3840000, pct: 45.6 },
                { source: 'Google Search', visits: 2120000, pct: 25.2 },
                { source: 'Twitter / X', visits: 980000, pct: 11.6 },
                { source: 'GitHub', visits: 620000, pct: 7.4 },
                { source: 'LinkedIn', visits: 380000, pct: 4.5 },
                { source: 'Reddit', visits: 240000, pct: 2.9 },
                { source: 'Hacker News', visits: 180000, pct: 2.1 },
                { source: 'Product Hunt', visits: 60000, pct: 0.7 },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent/30">
                  <span className="flex-1 truncate text-sm font-medium">{r.source}</span>
                  <span className="text-xs font-semibold tabular-nums">{fmtNum(r.visits)}</span>
                  <span className="w-12 text-right text-[10px] text-muted-foreground">{r.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
