'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkline } from '@/components/nexora/sparkline'
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Cloud, Globe, Zap, Activity, TrendingUp, HardDrive, Server,
  Shield, Gauge, MapPin, ArrowUpRight, ArrowDownRight, Database as CacheIcon,
  RefreshCw, Trash2, Plus, Image, FileCode, FileText, Film, Box,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface EdgeLocation {
  id: string
  city: string
  country: string
  flag: string
  region: 'NA' | 'EU' | 'ASIA' | 'OCE' | 'ME' | 'SA' | 'AF'
  requests: number
  cacheHitRate: number
  latency: number
  bandwidthMbps: number
  status: 'online' | 'degraded' | 'offline'
}

interface CacheRule {
  id: string
  pattern: string
  type: 'cache' | 'bypass' | 'redirect'
  ttl: number
  status: 'active' | 'paused'
  hits: number
  size: number
}

const EDGE_LOCATIONS: EdgeLocation[] = [
  { id: 'l1', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', region: 'EU', requests: 2840000, cacheHitRate: 94.2, latency: 12, bandwidthMbps: 142, status: 'online' },
  { id: 'l2', city: 'London', country: 'UK', flag: '🇬🇧', region: 'EU', requests: 1620000, cacheHitRate: 91.8, latency: 18, bandwidthMbps: 89, status: 'online' },
  { id: 'l3', city: 'New York', country: 'USA', flag: '🇺🇸', region: 'NA', requests: 1840000, cacheHitRate: 89.4, latency: 24, bandwidthMbps: 124, status: 'online' },
  { id: 'l4', city: 'San Francisco', country: 'USA', flag: '🇺🇸', region: 'NA', requests: 980000, cacheHitRate: 87.1, latency: 42, bandwidthMbps: 68, status: 'online' },
  { id: 'l5', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', region: 'ASIA', requests: 620000, cacheHitRate: 92.5, latency: 28, bandwidthMbps: 45, status: 'online' },
  { id: 'l6', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', region: 'ASIA', requests: 480000, cacheHitRate: 90.3, latency: 32, bandwidthMbps: 38, status: 'online' },
  { id: 'l7', city: 'Mumbai', country: 'India', flag: '🇮🇳', region: 'ASIA', requests: 380000, cacheHitRate: 85.7, latency: 48, bandwidthMbps: 28, status: 'online' },
  { id: 'l8', city: 'Dubai', country: 'UAE', flag: '🇦🇪', region: 'ME', requests: 420000, cacheHitRate: 88.2, latency: 38, bandwidthMbps: 32, status: 'online' },
  { id: 'l9', city: 'Cairo', country: 'Egypt', flag: '🇪🇬', region: 'AF', requests: 280000, cacheHitRate: 86.4, latency: 28, bandwidthMbps: 22, status: 'online' },
  { id: 'l10', city: 'Cape Town', country: 'South Africa', flag: '🇿🇦', region: 'AF', requests: 89000, cacheHitRate: 82.1, latency: 68, bandwidthMbps: 8, status: 'degraded' },
  { id: 'l11', city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', region: 'SA', requests: 240000, cacheHitRate: 84.6, latency: 58, bandwidthMbps: 18, status: 'online' },
  { id: 'l12', city: 'Sydney', country: 'Australia', flag: '🇦🇺', region: 'OCE', requests: 180000, cacheHitRate: 88.9, latency: 52, bandwidthMbps: 14, status: 'online' },
]

const CACHE_RULES: CacheRule[] = [
  { id: 'c1', pattern: '/_next/static/*', type: 'cache', ttl: 31536000, status: 'active', hits: 8420000, size: 124 },
  { id: 'c2', pattern: '/assets/*', type: 'cache', ttl: 86400, status: 'active', hits: 3120000, size: 89 },
  { id: 'c3', pattern: '/images/*', type: 'cache', ttl: 604800, status: 'active', hits: 1840000, size: 248 },
  { id: 'c4', pattern: '/api/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c5', pattern: '/webhooks/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c6', pattern: '/*.mp4', type: 'cache', ttl: 2592000, status: 'active', hits: 480000, size: 1840 },
  { id: 'c7', pattern: '/docs/*', type: 'cache', ttl: 3600, status: 'active', hits: 920000, size: 38 },
  { id: 'c8', pattern: '/cdn-cgi/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c9', pattern: '/old-blog/*', type: 'redirect', ttl: 0, status: 'active', hits: 12000, size: 0 },
  { id: 'c10', pattern: '/uploads/*', type: 'cache', ttl: 1209600, status: 'paused', hits: 84000, size: 92 },
]

const REGION_META: Record<string, { label: string; color: string }> = {
  NA: { label: 'North America', color: 'text-sky-500' },
  EU: { label: 'Europe', color: 'text-emerald-500' },
  ASIA: { label: 'Asia Pacific', color: 'text-violet-500' },
  OCE: { label: 'Oceania', color: 'text-amber-500' },
  ME: { label: 'Middle East', color: 'text-rose-500' },
  SA: { label: 'South America', color: 'text-teal-500' },
  AF: { label: 'Africa', color: 'text-orange-500' },
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  cache: { label: 'Cache', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', icon: CacheIcon },
  bypass: { label: 'Bypass', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', icon: Zap },
  redirect: { label: 'Redirect', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/40 ring-violet-200 dark:ring-violet-900', icon: ArrowUpRight },
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

function fmtBytes(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`
  return `${gb.toFixed(0)} GB`
}

function fmtTtl(secs: number): string {
  if (secs === 0) return '—'
  if (secs >= 86400) return `${Math.floor(secs / 86400)}d`
  if (secs >= 3600) return `${Math.floor(secs / 3600)}h`
  if (secs >= 60) return `${Math.floor(secs / 60)}m`
  return `${secs}s`
}

export function CdnView() {
  const { metrics } = useRealtime()
  const { t } = useI18n()
  const [rules, setRules] = useState<CacheRule[]>([])
  const [edgeLocations, setEdgeLocations] = useState<EdgeLocation[]>([])

  const fetchCdn = async () => {
    try {
      const r = await fetch('/api/cdn')
      const d = await r.json()
      setRules(d.cacheRules || [])
      setEdgeLocations(d.edgeLocations || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchCdn() }, [])
  const [purgeOpen, setPurgeOpen] = useState(false)
  const [purgeUrl, setPurgeUrl] = useState('')

  const totalRequests = EDGE_LOCATIONS.reduce((s, l) => s + l.requests, 0)
  const avgHitRate = EDGE_LOCATIONS.reduce((s, l) => s + l.cacheHitRate, 0) / EDGE_LOCATIONS.length
  const totalBandwidth = EDGE_LOCATIONS.reduce((s, l) => s + l.bandwidthMbps, 0)
  const totalCacheSize = rules.reduce((s, r) => s + r.size, 0)
  const onlineLocations = EDGE_LOCATIONS.filter(l => l.status === 'online').length

  const handlePurge = async () => {
    if (!purgeUrl.trim()) {
      toast.error('URL is required')
      return
    }
    await fetch('/api/cdn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'purge', url: purgeUrl }),
    })
    toast.success('Cache purged', { description: `Purged ${purgeUrl} from all edge locations` })
    setPurgeOpen(false)
    setPurgeUrl('')
  }

  const handlePurgeAll = async () => {
    await fetch('/api/cdn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'purge', url: 'ALL' }),
    })
    toast.warning('Purging entire cache')
    setTimeout(() => toast.success('All cache purged'), 2000)
  }

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
    toast.success('Cache rule deleted')
  }

  const rpsHistory = metrics?.history.rps ?? Array.from({ length: 60 }, () => 5000 + Math.random() * 3000)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('cdn.edgeLocations')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{onlineLocations}<span className="text-sm font-normal text-muted-foreground"> / {EDGE_LOCATIONS.length}</span></div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">All online</div>
            </div>
            <Globe className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('cdn.requests24h')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalRequests)}</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" /> +14.2%
              </div>
            </div>
            <Activity className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('cdn.cacheHitRate')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{avgHitRate.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">across all edges</div>
            </div>
            <CacheIcon className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('cdn.bandwidth')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalBandwidth)} Mbps</div>
              <div className="text-[10px] text-muted-foreground">{fmtBytes(totalCacheSize)} cached</div>
            </div>
            <HardDrive className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="edges">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edges" className="text-xs">{t('cdn.edgeNetwork')}</TabsTrigger>
            <TabsTrigger value="rules" className="text-xs">Cache Rules ({rules.length})</TabsTrigger>
            <TabsTrigger value="purge" className="text-xs">{t('cdn.purge')}</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPurgeOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Purge URL
            </Button>
            <Button variant="outline" size="sm" className="text-rose-600 dark:text-rose-400" onClick={handlePurgeAll}>
              <RefreshCw className="h-3.5 w-3.5" /> Purge All
            </Button>
          </div>
        </div>

        {/* Edges tab */}
        <TabsContent value="edges" className="space-y-4 mt-4">
          {/* World map visualization */}
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t('cdn.edgeNetwork')}</h3>
                  <p className="text-xs text-muted-foreground">{EDGE_LOCATIONS.length} PoPs · 7 continents · Anycast routing</p>
                </div>
                <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Anycast live
                </Badge>
              </div>
            </div>
            <div className="relative aspect-[2/1] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
              {/* Simplified world map */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                {/* Continents as simplified shapes */}
                <g className="fill-slate-200 dark:fill-slate-800">
                  {/* North America */}
                  <path d="M 20 25 L 50 22 L 55 35 L 48 50 L 35 52 L 25 45 Z" />
                  {/* South America */}
                  <path d="M 48 55 L 58 55 L 60 75 L 52 85 L 48 70 Z" />
                  {/* Europe */}
                  <path d="M 88 22 L 105 22 L 108 35 L 95 38 L 88 32 Z" />
                  {/* Africa */}
                  <path d="M 92 40 L 108 40 L 110 60 L 100 80 L 92 60 Z" />
                  {/* Asia */}
                  <path d="M 108 18 L 165 20 L 170 40 L 150 50 L 130 45 L 115 35 Z" />
                  {/* Oceania */}
                  <path d="M 165 65 L 180 65 L 182 78 L 170 80 Z" />
                </g>
                {/* Edge location markers */}
                {EDGE_LOCATIONS.map((loc, i) => {
                  // Approximate world map coordinates (x: 0-200, y: 0-100)
                  const coords: Record<string, { x: number; y: number }> = {
                    'Frankfurt': { x: 100, y: 28 },
                    'London': { x: 94, y: 25 },
                    'New York': { x: 65, y: 30 },
                    'San Francisco': { x: 30, y: 32 },
                    'Singapore': { x: 145, y: 52 },
                    'Tokyo': { x: 165, y: 35 },
                    'Mumbai': { x: 130, y: 45 },
                    'Dubai': { x: 120, y: 40 },
                    'Cairo': { x: 108, y: 35 },
                    'Cape Town': { x: 105, y: 75 },
                    'São Paulo': { x: 60, y: 65 },
                    'Sydney': { x: 175, y: 72 },
                  }
                  const c = coords[loc.city]
                  if (!c) return null
                  const size = 1 + (loc.requests / 2840000) * 2
                  return (
                    <g key={i}>
                      <circle cx={c.x} cy={c.y} r={size * 2} className={cn(
                        'fill-emerald-500/20',
                        loc.status === 'degraded' && 'fill-amber-500/20',
                        loc.status === 'offline' && 'fill-rose-500/20',
                      )}>
                        <animate attributeName="r" values={`${size * 2};${size * 4};${size * 2}`} dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={c.x} cy={c.y} r={size}
                        className={cn(
                          'fill-emerald-500',
                          loc.status === 'degraded' && 'fill-amber-500',
                          loc.status === 'offline' && 'fill-rose-500',
                        )}
                      />
                      <text x={c.x} y={c.y - size - 1} textAnchor="middle" className="fill-foreground text-[2px] font-semibold">
                        {loc.city}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </Card>

          {/* Edge locations grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {EDGE_LOCATIONS.map(loc => (
              <Card key={loc.id} className="p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{loc.flag}</span>
                    <div>
                      <div className="text-sm font-semibold">{loc.city}</div>
                      <div className="text-[10px] text-muted-foreground">{loc.country} · {REGION_META[loc.region].label}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px]',
                    loc.status === 'online' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                    loc.status === 'degraded' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                    'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  )}>
                    <span className={cn('mr-1 h-1.5 w-1.5 rounded-full',
                      loc.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                      loc.status === 'degraded' ? 'bg-amber-500 animate-pulse' :
                      'bg-rose-500'
                    )} />
                    {loc.status}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Requests</div>
                    <div className="font-bold tabular-nums">{fmtNum(loc.requests)}</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Hit Rate</div>
                    <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{loc.cacheHitRate}%</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Latency</div>
                    <div className="font-bold tabular-nums">{loc.latency}ms</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Bandwidth</div>
                    <div className="font-bold tabular-nums">{loc.bandwidthMbps} Mbps</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cache rules tab */}
        <TabsContent value="rules" className="space-y-3 mt-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t('cdn.cacheRules')}</h3>
                  <p className="text-xs text-muted-foreground">Define what to cache, bypass, or redirect at the edge</p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" /> Add Rule
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {rules.map(r => {
                const type = TYPE_META[r.type]
                const TypeIcon = type.icon
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1', type.bg, type.color)}>
                      <TypeIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono text-xs font-semibold">{r.pattern}</code>
                        <Badge variant="outline" className={cn('text-[10px] uppercase', type.bg, type.color)}>{type.label}</Badge>
                        {r.ttl > 0 && <Badge variant="outline" className="text-[10px]">TTL: {fmtTtl(r.ttl)}</Badge>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{fmtNum(r.hits)} hits</span>
                        {r.size > 0 && (<><span>·</span><span>{fmtBytes(r.size)} cached</span></>)}
                      </div>
                    </div>
                    <Switch checked={r.status === 'active'} onCheckedChange={() => toggleRule(r.id)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 dark:text-rose-400" onClick={() => deleteRule(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('cdn.cachePerformance')}</h3>
            <p className="text-xs text-muted-foreground">Hit rate over the last 60 seconds</p>
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Live Hit Rate</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgHitRate.toFixed(1)}%</span>
              </div>
              <Sparkline values={rpsHistory} color="#10b981" width={600} height={60} className="mt-2 w-full" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Cache Hits</div>
                <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtNum(totalRequests * avgHitRate / 100)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cache Misses</div>
                <div className="font-bold tabular-nums text-amber-600 dark:text-amber-400">{fmtNum(totalRequests * (1 - avgHitRate / 100))}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Origin Saves</div>
                <div className="font-bold tabular-nums">{((totalRequests * avgHitRate / 100) / totalRequests * 100).toFixed(1)}%</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Purge tab */}
        <TabsContent value="purge" className="space-y-4 mt-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Purge by URL</h3>
            <p className="text-xs text-muted-foreground">Invalidate a specific URL across all edge locations</p>
            <div className="mt-4 flex gap-2">
              <Input
                value={purgeUrl}
                onChange={(e) => setPurgeUrl(e.target.value)}
                placeholder="https://nexora.app/blog/post-123"
                className="font-mono text-sm"
              />
              <Button onClick={handlePurge} className="bg-gradient-to-br from-rose-500 to-orange-600 text-white">
                <Trash2 className="h-4 w-4" /> Purge
              </Button>
            </div>
            <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Zap className="mr-1 inline h-3 w-3" />
              Purge propagates to all {EDGE_LOCATIONS.length} edge locations within 5 seconds.
            </div>
          </Card>

          <Card className="overflow-hidden border-rose-500/20">
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-5 dark:from-rose-950/30 dark:to-orange-950/30">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
                  <RefreshCw className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Purge Everything</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Invalidates all cached objects across all edges. Use with caution.</p>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="rounded-md bg-background/60 px-2 py-1 font-mono">{fmtBytes(totalCacheSize)}</span>
                    <span className="text-muted-foreground">will be purged</span>
                  </div>
                  <Button className="mt-3 bg-gradient-to-br from-rose-500 to-orange-600 text-white" onClick={handlePurgeAll}>
                    <RefreshCw className="h-3.5 w-3.5" /> Purge Entire Cache
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent purges */}
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">{t('cdn.recentPurges')}</h3>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { url: 'https://nexora.app/blog/*', timestamp: '2 hours ago', by: 'sarah@nexora.app', scope: 'pattern' },
                { url: 'https://nexora.app/dashboard', timestamp: '5 hours ago', by: 'system', scope: 'single' },
                { url: 'https://cdn.nexora.app/assets/*', timestamp: '1 day ago', by: 'omar@nexora.app', scope: 'pattern' },
                { url: 'ALL CACHE', timestamp: '3 days ago', by: 'owner@nexora.app', scope: 'full' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <Trash2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <code className="flex-1 truncate font-mono text-xs">{p.url}</code>
                  <Badge variant="outline" className="text-[10px] uppercase">{p.scope}</Badge>
                  <span className="text-[10px] text-muted-foreground">{p.timestamp}</span>
                  <span className="text-[10px] text-muted-foreground">by {p.by}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purge dialog */}
      {/* Already inline */}
    </div>
  )
}
