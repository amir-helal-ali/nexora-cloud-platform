'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Network, Server, Globe, Activity, Zap, Shield, ArrowRight,
  Radio, Database, Cloud, Cpu, GitBranch, Box, Layers,
  TrendingUp, AlertTriangle, CheckCircle2, Gauge, Lock,
} from 'lucide-react'

interface ServiceNode {
  id: string
  name: string
  type: 'gateway' | 'app' | 'database' | 'cache' | 'queue' | 'external' | 'cdn'
  x: number
  y: number
  status: 'healthy' | 'degraded' | 'down'
  rps: number
  latency: number
  icon: any
  color: string
  bg: string
}

interface ServiceEdge {
  from: string
  to: string
  label: string
  rps: number
  latency: number
  errorRate: number
  protocol: 'http' | 'https' | 'tcp' | 'ws' | 'grpc'
}

const NODES: ServiceNode[] = [
  { id: 'cdn', name: 'Cloudflare CDN', type: 'cdn', x: 50, y: 12, status: 'healthy', rps: 8420, latency: 12, icon: Cloud, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'gateway', name: 'API Gateway', type: 'gateway', x: 50, y: 32, status: 'healthy', rps: 6840, latency: 8, icon: Network, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'rust-api', name: 'rust-api-gateway', type: 'app', x: 22, y: 55, status: 'healthy', rps: 1240, latency: 18, icon: Box, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'php-store', name: 'php-laravel-store', type: 'app', x: 50, y: 55, status: 'degraded', rps: 856, latency: 84, icon: Box, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'nextjs-dash', name: 'nextjs-dashboard', type: 'app', x: 78, y: 55, status: 'healthy', rps: 712, latency: 34, icon: Box, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
  { id: 'rust-ws', name: 'rust-ws-hub', type: 'app', x: 35, y: 78, status: 'healthy', rps: 342, latency: 18, icon: Radio, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'nextjs-mkt', name: 'nextjs-marketing', type: 'app', x: 65, y: 78, status: 'healthy', rps: 2104, latency: 23, icon: Box, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
  { id: 'postgres', name: 'postgres-main', type: 'database', x: 12, y: 88, status: 'healthy', rps: 284, latency: 4, icon: Database, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
  { id: 'mysql', name: 'mysql-store', type: 'database', x: 38, y: 92, status: 'healthy', rps: 412, latency: 6, icon: Database, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'redis', name: 'redis-cache', type: 'cache', x: 62, y: 92, status: 'healthy', rps: 1240, latency: 1, icon: Database, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'mongo', name: 'mongo-events', type: 'database', x: 88, y: 88, status: 'healthy', rps: 89, latency: 8, icon: Database, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
  { id: 'stripe', name: 'Stripe API', type: 'external', x: 50, y: 8, status: 'healthy', rps: 18, latency: 142, icon: Globe, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
]

const EDGES: ServiceEdge[] = [
  { from: 'stripe', to: 'cdn', label: 'webhook', rps: 18, latency: 142, errorRate: 0.0, protocol: 'https' },
  { from: 'cdn', to: 'gateway', label: 'origin', rps: 6840, latency: 12, errorRate: 0.1, protocol: 'https' },
  { from: 'gateway', to: 'rust-api', label: '/api/v1/*', rps: 1240, latency: 8, errorRate: 0.0, protocol: 'http' },
  { from: 'gateway', to: 'php-store', label: '/store/*', rps: 856, latency: 12, errorRate: 0.4, protocol: 'http' },
  { from: 'gateway', to: 'nextjs-dash', label: '/dashboard/*', rps: 712, latency: 8, errorRate: 0.0, protocol: 'http' },
  { from: 'gateway', to: 'rust-ws', label: '/realtime/*', rps: 342, latency: 6, errorRate: 0.0, protocol: 'ws' },
  { from: 'gateway', to: 'nextjs-mkt', label: '/*', rps: 2104, latency: 10, errorRate: 0.0, protocol: 'http' },
  { from: 'rust-api', to: 'postgres', label: 'SQL', rps: 284, latency: 4, errorRate: 0.0, protocol: 'tcp' },
  { from: 'rust-api', to: 'redis', label: 'cache', rps: 824, latency: 1, errorRate: 0.0, protocol: 'tcp' },
  { from: 'php-store', to: 'mysql', label: 'SQL', rps: 412, latency: 6, errorRate: 0.1, protocol: 'tcp' },
  { from: 'php-store', to: 'redis', label: 'cache', rps: 156, latency: 1, errorRate: 0.0, protocol: 'tcp' },
  { from: 'php-store', to: 'stripe', label: 'payments', rps: 18, latency: 142, errorRate: 0.0, protocol: 'https' },
  { from: 'nextjs-dash', to: 'postgres', label: 'SQL', rps: 142, latency: 4, errorRate: 0.0, protocol: 'tcp' },
  { from: 'nextjs-dash', to: 'redis', label: 'cache', rps: 260, latency: 1, errorRate: 0.0, protocol: 'tcp' },
  { from: 'rust-ws', to: 'mongo', label: 'events', rps: 89, latency: 8, errorRate: 0.0, protocol: 'tcp' },
  { from: 'rust-ws', to: 'redis', label: 'pubsub', rps: 412, latency: 1, errorRate: 0.0, protocol: 'tcp' },
  { from: 'nextjs-mkt', to: 'postgres', label: 'SQL', rps: 84, latency: 4, errorRate: 0.0, protocol: 'tcp' },
]

const STATUS_META = {
  healthy: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  degraded: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  down: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
}

const PROTOCOL_COLORS: Record<string, string> = {
  http: 'stroke-sky-500',
  https: 'stroke-emerald-500',
  tcp: 'stroke-violet-500',
  ws: 'stroke-amber-500',
  grpc: 'stroke-rose-500',
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export function ServiceMeshView() {
  const { t } = useI18n()
  const [nodes, setNodes] = useState<ServiceNode[]>(NODES)
  const [edges, setEdges] = useState<ServiceEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>('gateway')
  const [mTLS, setMTLS] = useState(true)
  const [tracing, setTracing] = useState(true)
  const [circuitBreaker, setCircuitBreaker] = useState(true)
  const [loadBalancing, setLoadBalancing] = useState(true)

  // Fetch mesh topology from API
  useEffect(() => {
    fetch('/api/mesh')
      .then(r => r.json())
      .then(d => {
        if (d.nodes) setNodes(d.nodes)
        if (d.edges) setEdges(d.edges)
      })
      .catch(console.error)
  }, [])

  // Simulate live metric updates
  useEffect(() => {
    const t = setInterval(() => {
      setEdges(prev => prev.map(e => ({
        ...e,
        rps: Math.max(0, e.rps + (Math.random() - 0.5) * e.rps * 0.15),
        latency: Math.max(1, e.latency + (Math.random() - 0.5) * e.latency * 0.2),
      })))
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const totalRps = edges.reduce((s, e) => s + e.rps, 0)
  const avgLatency = edges.length > 0 ? edges.reduce((s, e) => s + e.latency, 0) / edges.length : 0
  const totalErrors = edges.reduce((s, e) => s + e.errorRate, 0)
  const healthyCount = nodes.filter(n => n.status === 'healthy').length

  const selectedNodeData = nodes.find(n => n.id === selectedNode)
  const incomingEdges = edges.filter(e => e.to === selectedNode)
  const outgoingEdges = edges.filter(e => e.from === selectedNode)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('mesh.services')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{nodes.length}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{healthyCount} healthy</div>
            </div>
            <Server className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('mesh.connections')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{edges.length}</div>
              <div className="text-[10px] text-muted-foreground">active edges</div>
            </div>
            <Network className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('mesh.totalRps')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalRps)}</div>
              <div className="text-[10px] text-muted-foreground">across mesh</div>
            </div>
            <Activity className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('mesh.avgLatency')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{avgLatency.toFixed(1)}ms</div>
              <div className="text-[10px] text-muted-foreground">{totalErrors.toFixed(1)}% errors</div>
            </div>
            <Gauge className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="topology">
        <TabsList>
          <TabsTrigger value="topology" className="text-xs">{t('mesh.topology')}</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs">{t('mesh.meshPolicies')}</TabsTrigger>
          <TabsTrigger value="tracing" className="text-xs">{t('mesh.distributedTracing')}</TabsTrigger>
        </TabsList>

        {/* Topology tab */}
        <TabsContent value="topology" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Network graph */}
            <Card className="overflow-hidden lg:col-span-3">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
                <div>
                  <h3 className="text-sm font-semibold">{t('mesh.serviceMeshTopology')}</h3>
                  <p className="text-xs text-muted-foreground">Live traffic flow between services</p>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  {Object.entries(PROTOCOL_COLORS).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className={cn('inline-block h-0.5 w-4 rounded', v.replace('stroke-', 'bg-'))} />
                      <span className="uppercase text-muted-foreground">{k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* SVG edges */}
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" className="text-muted-foreground/60" />
                    </marker>
                  </defs>
                  {edges.map((e, i) => {
                    const from = nodes.find(n => n.id === e.from)
                    const to = nodes.find(n => n.id === e.to)
                    if (!from || !to) return null
                    const isSelected = e.from === selectedNode || e.to === selectedNode
                    return (
                      <g key={i} className={cn('transition-opacity', !isSelected && selectedNode && 'opacity-30')}>
                        <line
                          x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                          className={cn(PROTOCOL_COLORS[e.protocol], isSelected ? 'opacity-100' : 'opacity-60')}
                          strokeWidth={isSelected ? 0.6 : 0.3}
                          strokeDasharray={e.protocol === 'ws' ? '1,1' : undefined}
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Mid-label */}
                        <text
                          x={(from.x + to.x) / 2}
                          y={(from.y + to.y) / 2 - 1}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[1.5px] font-mono"
                        >
                          {fmtNum(e.rps)}/s
                        </text>
                      </g>
                    )
                  })}
                </svg>
                {/* Nodes */}
                {nodes.map(n => {
                  const Icon = n.icon
                  const status = STATUS_META[n.status]
                  const isSelected = n.id === selectedNode
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode(n.id)}
                      className={cn(
                        'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg border bg-background/95 p-2 shadow-md backdrop-blur transition-all hover:scale-110 hover:shadow-lg',
                        isSelected ? 'z-10 scale-110 ring-2 ring-violet-500/50' : 'z-0',
                        n.status === 'degraded' ? 'border-amber-500/40' : n.status === 'down' ? 'border-rose-500/40' : 'border-border',
                      )}
                      style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    >
                      <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', n.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', n.color)} />
                      </div>
                      <div className="text-center">
                        <div className="max-w-[80px] truncate text-[10px] font-semibold">{n.name}</div>
                        <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
                          <span className={cn('h-1 w-1 rounded-full', status.dot, n.status !== 'healthy' && 'animate-pulse')} />
                          {fmtNum(n.rps)}/s · {n.latency}ms
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Selected node details */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold">{t('mesh.serviceDetails')}</h3>
              {selectedNodeData && (
                <>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', selectedNodeData.bg)}>
                      <selectedNodeData.icon className={cn('h-5 w-5', selectedNodeData.color)} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{selectedNodeData.name}</div>
                      <Badge variant="outline" className={cn('text-[10px] uppercase', STATUS_META[selectedNodeData.status].bg, STATUS_META[selectedNodeData.status].color)}>
                        <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', STATUS_META[selectedNodeData.status].dot)} />
                        {selectedNodeData.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border p-2">
                      <div className="text-muted-foreground">RPS</div>
                      <div className="font-bold tabular-nums">{fmtNum(selectedNodeData.rps)}</div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="text-muted-foreground">Latency</div>
                      <div className="font-bold tabular-nums">{selectedNodeData.latency}ms</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      Incoming ({incomingEdges.length})
                    </div>
                    <div className="space-y-1">
                      {incomingEdges.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">No incoming traffic</p>
                      ) : incomingEdges.map((e, i) => {
                        const from = nodes.find(n => n.id === e.from)
                        if (!from) return null
                        return (
                          <div key={i} className="flex items-center gap-1.5 text-[10px]">
                            <span className="truncate">{from.name}</span>
                            <ArrowRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                            <span className="ml-auto font-mono font-semibold">{fmtNum(e.rps)}/s</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      Outgoing ({outgoingEdges.length})
                    </div>
                    <div className="space-y-1">
                      {outgoingEdges.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">No outgoing traffic</p>
                      ) : outgoingEdges.map((e, i) => {
                        const to = nodes.find(n => n.id === e.to)
                        if (!to) return null
                        return (
                          <div key={i} className="flex items-center gap-1.5 text-[10px]">
                            <span className="truncate">{to.name}</span>
                            <ArrowRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                            <span className="ml-auto font-mono font-semibold">{fmtNum(e.rps)}/s</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Policies tab */}
        <TabsContent value="policies" className="space-y-3 mt-4">
          <Card className="overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:from-violet-950/30 dark:to-purple-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t('mesh.istioServiceMesh')}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Sidecar proxy pattern with mTLS, traffic management, and observability built-in.</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: 'Mutual TLS (mTLS)', desc: 'Encrypt all service-to-service communication with auto-rotating certs', enabled: mTLS, setter: setMTLS, icon: Lock, color: 'text-emerald-500' },
              { name: 'Distributed Tracing', desc: 'Jaeger + OpenTelemetry traces for every request across services', enabled: tracing, setter: setTracing, icon: Activity, color: 'text-sky-500' },
              { name: 'Circuit Breaker', desc: 'Auto-trip failing connections to prevent cascading failures', enabled: circuitBreaker, setter: setCircuitBreaker, icon: AlertTriangle, color: 'text-amber-500' },
              { name: 'Load Balancing', desc: 'Round-robin with least-requests and random algorithms', enabled: loadBalancing, setter: setLoadBalancing, icon: GitBranch, color: 'text-violet-500' },
            ].map((p, i) => {
              const Icon = p.icon
              return (
                <Card key={i} className="flex items-start gap-3 p-4">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted')}>
                    <Icon className={cn('h-4 w-4', p.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  <Switch checked={p.enabled} onCheckedChange={(v) => { p.setter(v); toast.success(`${p.name} ${v ? 'enabled' : 'disabled'}`) }} />
                </Card>
              )
            })}
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">{t('mesh.trafficPolicies')}</h3>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { name: 'Retry Policy', target: 'php-laravel-store', config: '3 retries, 2s backoff, on 5xx', status: 'active' },
                { name: 'Timeout Policy', target: 'all services', config: '10s request, 30s streaming', status: 'active' },
                { name: 'Rate Limit', target: 'rust-api-gateway', config: '1000 req/min per IP', status: 'active' },
                { name: 'Canary Deployment', target: 'nextjs-dashboard', config: '20% canary, 80% stable', status: 'active' },
                { name: 'Fault Injection', target: 'staging only', config: '500ms latency, 5% 500 errors', status: 'paused' },
                { name: 'Access Control', target: 'postgres-main', config: 'deny all except rust-api', status: 'active' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Target: <code className="font-mono">{p.target}</code> · {p.config}</div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] uppercase', p.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300')}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tracing tab */}
        <TabsContent value="tracing" className="space-y-3 mt-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{t('mesh.distributedTracing')}</h3>
                <p className="text-xs text-muted-foreground">OpenTelemetry traces · last 5 requests</p>
              </div>
              <Badge variant="outline" className="gap-1 text-[10px] border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <Activity className="h-2.5 w-2.5" /> Jaeger
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                { traceId: 'a4f9c2e8b71d3a8f', path: 'POST /api/v1/orders', duration: 142, spans: 8, status: 'success', start: 0, segments: [
                  { name: 'gateway', start: 0, end: 142, color: 'bg-violet-500' },
                  { name: 'auth', start: 2, end: 8, color: 'bg-emerald-500' },
                  { name: 'php-store', start: 10, end: 142, color: 'bg-indigo-500' },
                  { name: 'mysql', start: 24, end: 38, color: 'bg-blue-500' },
                  { name: 'redis', start: 40, end: 42, color: 'bg-rose-500' },
                  { name: 'stripe', start: 50, end: 142, color: 'bg-violet-500' },
                ]},
                { traceId: 'b71d3a8f9c2e4f15', path: 'GET /api/v1/products', duration: 23, spans: 5, status: 'success', start: 0, segments: [
                  { name: 'cdn', start: 0, end: 12, color: 'bg-orange-500' },
                  { name: 'gateway', start: 12, end: 23, color: 'bg-violet-500' },
                  { name: 'redis', start: 14, end: 15, color: 'bg-rose-500' },
                  { name: 'php-store', start: 15, end: 23, color: 'bg-indigo-500' },
                ]},
                { traceId: 'c2e8f15b71d3a8f9', path: 'GET /dashboard', duration: 34, spans: 6, status: 'success', start: 0, segments: [
                  { name: 'cdn', start: 0, end: 12, color: 'bg-orange-500' },
                  { name: 'gateway', start: 12, end: 34, color: 'bg-violet-500' },
                  { name: 'nextjs-dash', start: 14, end: 34, color: 'bg-slate-500' },
                  { name: 'postgres', start: 22, end: 26, color: 'bg-sky-500' },
                  { name: 'redis', start: 28, end: 29, color: 'bg-rose-500' },
                ]},
                { traceId: 'd93a1b7c2e8f15b7', path: 'WS /realtime/orders', duration: 18, spans: 4, status: 'success', start: 0, segments: [
                  { name: 'gateway', start: 0, end: 18, color: 'bg-violet-500' },
                  { name: 'rust-ws', start: 4, end: 18, color: 'bg-orange-500' },
                  { name: 'redis', start: 8, end: 9, color: 'bg-rose-500' },
                  { name: 'mongo', start: 10, end: 18, color: 'bg-green-500' },
                ]},
                { traceId: 'e5b7c8491e3a7b5c', path: 'POST /api/v1/auth/login', duration: 84, spans: 5, status: 'success', start: 0, segments: [
                  { name: 'gateway', start: 0, end: 84, color: 'bg-violet-500' },
                  { name: 'rust-api', start: 4, end: 84, color: 'bg-orange-500' },
                  { name: 'postgres', start: 14, end: 22, color: 'bg-sky-500' },
                  { name: 'redis', start: 28, end: 30, color: 'bg-rose-500' },
                  { name: 'jwt-sign', start: 32, end: 84, color: 'bg-amber-500' },
                ]},
              ].map((trace, i) => (
                <div key={i} className="rounded-lg border p-3 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="font-mono text-[10px] text-muted-foreground">{trace.traceId}</code>
                      <span className="truncate text-xs font-mono font-semibold">{trace.path}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">{trace.spans} spans</span>
                      <span className="font-semibold tabular-nums">{trace.duration}ms</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="relative mt-2 h-8 w-full overflow-hidden rounded bg-muted/40">
                    {trace.segments.map((s, j) => {
                      const left = (s.start / trace.duration) * 100
                      const width = ((s.end - s.start) / trace.duration) * 100
                      return (
                        <div
                          key={j}
                          className={cn('absolute top-1 h-6 rounded text-[9px] text-white flex items-center justify-center overflow-hidden', s.color)}
                          style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
                          title={`${s.name}: ${s.end - s.start}ms`}
                        >
                          {width > 8 && s.name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
