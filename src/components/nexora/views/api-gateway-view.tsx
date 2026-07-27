'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Network, Plus, MoreVertical, Trash2, Edit, Zap, Shield, Globe,
  ArrowRight, Filter, Activity, Lock, KeyRound, Gauge, Clock,
  CheckCircle2, XCircle, AlertCircle, Route, Server,
} from 'lucide-react'

interface GatewayRoute {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*'
  targetApp: string
  targetPath: string
  status: 'active' | 'paused' | 'error'
  auth: 'none' | 'api_key' | 'jwt' | 'oauth2'
  rateLimit: number // req/min
  currentRps: number
  totalRequests: number
  avgLatency: number
  errorRate: number
  cacheEnabled: boolean
  cacheTtl: number
  corsEnabled: boolean
  retryPolicy: number
  timeoutMs: number
}

const INITIAL_ROUTES: GatewayRoute[] = [
  { id: 'r1', path: '/api/v1/products', method: 'GET', targetApp: 'php-laravel-store', targetPath: '/products', status: 'active', auth: 'api_key', rateLimit: 1000, currentRps: 142, totalRequests: 1240000, avgLatency: 23, errorRate: 0.1, cacheEnabled: true, cacheTtl: 300, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { id: 'r2', path: '/api/v1/auth/login', method: 'POST', targetApp: 'rust-api-gateway', targetPath: '/auth/login', status: 'active', auth: 'none', rateLimit: 100, currentRps: 28, totalRequests: 542000, avgLatency: 84, errorRate: 0.3, cacheEnabled: false, cacheTtl: 0, corsEnabled: true, retryPolicy: 1, timeoutMs: 3000 },
  { id: 'r3', path: '/api/v1/users/me', method: 'GET', targetApp: 'rust-api-gateway', targetPath: '/users/me', status: 'active', auth: 'jwt', rateLimit: 500, currentRps: 67, totalRequests: 478000, avgLatency: 34, errorRate: 0.0, cacheEnabled: true, cacheTtl: 60, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { id: 'r4', path: '/api/v1/orders', method: 'POST', targetApp: 'php-laravel-store', targetPath: '/orders', status: 'active', auth: 'jwt', rateLimit: 200, currentRps: 18, totalRequests: 312000, avgLatency: 142, errorRate: 0.4, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 3, timeoutMs: 10000 },
  { id: 'r5', path: '/api/v1/analytics/*', method: 'GET', targetApp: 'nextjs-dashboard', targetPath: '/analytics/*', status: 'active', auth: 'oauth2', rateLimit: 100, currentRps: 12, totalRequests: 89000, avgLatency: 412, errorRate: 0.2, cacheEnabled: true, cacheTtl: 600, corsEnabled: true, retryPolicy: 1, timeoutMs: 15000 },
  { id: 'r6', path: '/api/v1/webhooks/stripe', method: 'POST', targetApp: 'rust-api-gateway', targetPath: '/webhooks/stripe', status: 'active', auth: 'api_key', rateLimit: 50, currentRps: 3, totalRequests: 24000, avgLatency: 92, errorRate: 0.0, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 5, timeoutMs: 8000 },
  { id: 'r7', path: '/api/v1/realtime/*', method: 'GET', targetApp: 'rust-ws-hub', targetPath: '/realtime/*', status: 'active', auth: 'jwt', rateLimit: 2000, currentRps: 284, totalRequests: 890000, avgLatency: 18, errorRate: 0.0, cacheEnabled: false, cacheTtl: 0, corsEnabled: true, retryPolicy: 0, timeoutMs: 60000 },
  { id: 'r8', path: '/api/v1/uploads', method: 'POST', targetApp: 'nextjs-marketing', targetPath: '/uploads', status: 'paused', auth: 'jwt', rateLimit: 20, currentRps: 0, totalRequests: 12000, avgLatency: 1240, errorRate: 2.1, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 1, timeoutMs: 30000 },
  { id: 'r9', path: '/api/v1/search', method: 'GET', targetApp: 'rust-api-gateway', targetPath: '/search', status: 'active', auth: 'api_key', rateLimit: 800, currentRps: 92, totalRequests: 620000, avgLatency: 56, errorRate: 0.1, cacheEnabled: true, cacheTtl: 120, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { id: 'r10', path: '/api/v1/cms/*', method: '*', targetApp: 'php-symfony-cms', targetPath: '/*', status: 'error', auth: 'oauth2', rateLimit: 300, currentRps: 0, totalRequests: 82000, avgLatency: 0, errorRate: 100, cacheEnabled: false, cacheTtl: 0, corsEnabled: true, retryPolicy: 3, timeoutMs: 8000 },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  POST: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  PUT: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  DELETE: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  PATCH: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  '*': 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
}

const AUTH_META: Record<string, { label: string; icon: any; color: string }> = {
  none: { label: 'None', icon: Globe, color: 'text-slate-500' },
  api_key: { label: 'API Key', icon: KeyRound, color: 'text-amber-500' },
  jwt: { label: 'JWT', icon: Lock, color: 'text-emerald-500' },
  oauth2: { label: 'OAuth 2.0', icon: Shield, color: 'text-violet-500' },
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Active', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  error: { label: 'Error', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export function ApiGatewayView() {
  const { t } = useI18n()
  const [routes, setRoutes] = useState<GatewayRoute[]>(INITIAL_ROUTES)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<GatewayRoute | null>(null)
  const [newRoute, setNewRoute] = useState({
    path: '/api/v1/',
    method: 'GET' as GatewayRoute['method'],
    targetApp: 'rust-api-gateway',
    targetPath: '/',
    auth: 'api_key' as GatewayRoute['auth'],
    rateLimit: 500,
    cacheEnabled: false,
    corsEnabled: true,
    timeoutMs: 5000,
  })

  // Simulate live metric updates
  useEffect(() => {
    const t = setInterval(() => {
      setRoutes(prev => prev.map(r => {
        if (r.status !== 'active') return r
        return {
          ...r,
          currentRps: Math.max(0, r.currentRps + (Math.random() - 0.5) * 20),
          totalRequests: r.totalRequests + Math.floor(r.currentRps * 2),
        }
      }))
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const handleCreate = () => {
    if (!newRoute.path.trim() || !newRoute.path.startsWith('/')) {
      toast.error('Path must start with /')
      return
    }
    const route: GatewayRoute = {
      id: `r${Date.now()}`,
      path: newRoute.path,
      method: newRoute.method,
      targetApp: newRoute.targetApp,
      targetPath: newRoute.targetPath,
      status: 'active',
      auth: newRoute.auth,
      rateLimit: newRoute.rateLimit,
      currentRps: 0,
      totalRequests: 0,
      avgLatency: 0,
      errorRate: 0,
      cacheEnabled: newRoute.cacheEnabled,
      cacheTtl: newRoute.cacheEnabled ? 300 : 0,
      corsEnabled: newRoute.corsEnabled,
      retryPolicy: 2,
      timeoutMs: newRoute.timeoutMs,
    }
    setRoutes([route, ...routes])
    toast.success('Route created', { description: `${newRoute.method} ${newRoute.path} → ${newRoute.targetApp}` })
    setCreateOpen(false)
    setNewRoute({ path: '/api/v1/', method: 'GET', targetApp: 'rust-api-gateway', targetPath: '/', auth: 'api_key', rateLimit: 500, cacheEnabled: false, corsEnabled: true, timeoutMs: 5000 })
  }

  const toggleRoute = (id: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
    const route = routes.find(r => r.id === id)
    if (route) toast.success(`${route.path} ${route.status === 'active' ? 'paused' : 'activated'}`)
  }

  const deleteRoute = (id: string) => {
    const route = routes.find(r => r.id === id)
    setRoutes(routes.filter(r => r.id !== id))
    toast.success('Route deleted', { description: route?.path })
  }

  const activeRoutes = routes.filter(r => r.status === 'active').length
  const totalRps = routes.reduce((s, r) => s + r.currentRps, 0)
  const totalRequests = routes.reduce((s, r) => s + r.totalRequests, 0)
  const avgErrorRate = routes.length > 0 ? routes.reduce((s, r) => s + r.errorRate, 0) / routes.length : 0

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('gateway.activeRoutes')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{activeRoutes}<span className="text-sm font-normal text-muted-foreground"> / {routes.length}</span></div>
            </div>
            <Route className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('gateway.requestsPerSec')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{totalRps.toFixed(0)}</div>
            </div>
            <Activity className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('gateway.totalRequests24h')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalRequests)}</div>
            </div>
            <Gauge className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('gateway.avgErrorRate')}</div>
              <div className={cn('mt-1 text-2xl font-bold tabular-nums', avgErrorRate > 1 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
                {avgErrorRate.toFixed(2)}%
              </div>
            </div>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="routes">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="routes" className="text-xs">Routes ({routes.length})</TabsTrigger>
            <TabsTrigger value="middleware" className="text-xs">{t('gateway.middleware')}</TabsTrigger>
            <TabsTrigger value="ratelimit" className="text-xs">{t('gateway.rateLimiting')}</TabsTrigger>
          </TabsList>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                <Plus className="h-4 w-4" /> New Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t('gateway.createRoute')}</DialogTitle>
                <DialogDescription>Define a new API endpoint with custom routing, auth, and rate limiting.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.method')}</Label>
                    <Select value={newRoute.method} onValueChange={(v) => setNewRoute({ ...newRoute, method: v as GatewayRoute['method'] })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', '*'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.publicPath')}</Label>
                    <Input value={newRoute.path} onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })} placeholder="/api/v1/products" className="mt-1.5 font-mono text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.targetApp')}</Label>
                    <Select value={newRoute.targetApp} onValueChange={(v) => setNewRoute({ ...newRoute, targetApp: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rust-api-gateway">rust-api-gateway</SelectItem>
                        <SelectItem value="php-laravel-store">php-laravel-store</SelectItem>
                        <SelectItem value="nextjs-marketing">nextjs-marketing</SelectItem>
                        <SelectItem value="nextjs-dashboard">nextjs-dashboard</SelectItem>
                        <SelectItem value="php-symfony-cms">php-symfony-cms</SelectItem>
                        <SelectItem value="rust-ws-hub">rust-ws-hub</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.targetPath')}</Label>
                    <Input value={newRoute.targetPath} onChange={(e) => setNewRoute({ ...newRoute, targetPath: e.target.value })} placeholder="/products" className="mt-1.5 font-mono text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.authentication')}</Label>
                    <Select value={newRoute.auth} onValueChange={(v) => setNewRoute({ ...newRoute, auth: v as GatewayRoute['auth'] })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Public)</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="jwt">JWT Token</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.rateLimit')}</Label>
                    <Input type="number" value={newRoute.rateLimit} onChange={(e) => setNewRoute({ ...newRoute, rateLimit: Number(e.target.value) })} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('gateway.timeoutMs')}</Label>
                    <Input type="number" value={newRoute.timeoutMs} onChange={(e) => setNewRoute({ ...newRoute, timeoutMs: Number(e.target.value) })} className="mt-1.5" />
                  </div>
                  <div className="flex items-end gap-4 pb-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={newRoute.cacheEnabled} onCheckedChange={(c) => setNewRoute({ ...newRoute, cacheEnabled: c })} />
                      <Label className="text-xs">Cache</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={newRoute.corsEnabled} onCheckedChange={(c) => setNewRoute({ ...newRoute, corsEnabled: c })} />
                      <Label className="text-xs">CORS</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleCreate} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Network className="h-4 w-4" /> Create Route
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="routes" className="space-y-2 mt-4">
          {routes.map(r => {
            const status = STATUS_META[r.status]
            const auth = AUTH_META[r.auth]
            const AuthIcon = auth.icon
            return (
              <Card key={r.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <Badge variant="outline" className={cn('shrink-0 font-mono text-[10px]', METHOD_COLORS[r.method])}>
                      {r.method}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="truncate font-mono text-sm font-semibold">{r.path}</code>
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <code className="truncate font-mono text-xs text-muted-foreground">{r.targetApp}{r.targetPath}</code>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><AuthIcon className={cn('h-2.5 w-2.5', auth.color)} /> {auth.label}</span>
                        <span>·</span>
                        <span>{r.rateLimit} req/min</span>
                        <span>·</span>
                        <span>{r.timeoutMs}ms timeout</span>
                        <span>·</span>
                        <span>{r.retryPolicy} retries</span>
                        {r.cacheEnabled && (<><span>·</span><span className="text-emerald-600 dark:text-emerald-400">cache {r.cacheTtl}s</span></>)}
                        {r.corsEnabled && (<><span>·</span><span className="text-sky-600 dark:text-sky-400">CORS</span></>)}
                      </div>
                    </div>
                  </div>

                  {/* Live metrics */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-[9px] uppercase text-muted-foreground">RPS</div>
                      <div className="text-sm font-bold tabular-nums">{r.currentRps.toFixed(0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] uppercase text-muted-foreground">Latency</div>
                      <div className="text-sm font-bold tabular-nums">{r.avgLatency}ms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] uppercase text-muted-foreground">Errors</div>
                      <div className={cn('text-sm font-bold tabular-nums', r.errorRate > 1 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
                        {r.errorRate.toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px]', status.bg, status.color)}>
                      <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', status.dot, r.status === 'active' && 'animate-pulse')} />
                      {status.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelected(r)}><Edit className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleRoute(r.id)}>{r.status === 'active' ? 'Pause' : 'Activate'}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Test request sent', { description: `${r.method} ${r.path}` })}>
                          <Zap className="h-3.5 w-3.5" /> Send Test
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteRoute(r.id)} className="text-rose-600 dark:text-rose-400">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="middleware" className="space-y-3 mt-4">
          {[
            { name: 'Authentication', desc: 'Validates API keys, JWT tokens, and OAuth 2.0 flows', enabled: true, requests: '8.4M', icon: Lock },
            { name: 'Rate Limiter', desc: 'Token bucket algorithm with sliding window per route', enabled: true, requests: '8.4M', icon: Gauge },
            { name: 'CORS Handler', desc: 'Configurable cross-origin resource sharing policies', enabled: true, requests: '5.2M', icon: Globe },
            { name: 'Request Logger', desc: 'Structured JSON logs with request IDs and tracing', enabled: true, requests: '8.4M', icon: Activity },
            { name: 'Compression', desc: 'Gzip and Brotli compression for responses >1KB', enabled: true, requests: '7.1M', icon: Filter },
            { name: 'IP Allowlist', desc: 'Block or allow specific IP ranges per route', enabled: false, requests: '0', icon: Shield },
            { name: 'Bot Detection', desc: 'ML-based bot detection with CAPTCHA challenge', enabled: true, requests: '8.4M', icon: Shield },
            { name: 'WAF (Web Application Firewall)', desc: 'OWASP Top 10 protection with custom rules', enabled: true, requests: '8.4M', icon: Shield },
          ].map((m, i) => {
            const Icon = m.icon
            return (
              <Card key={i} className="flex items-center gap-3 p-4">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', m.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-muted-foreground">Processed</div>
                  <div className="font-semibold tabular-nums">{m.requests}</div>
                </div>
                <Switch defaultChecked={m.enabled} />
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="ratelimit" className="space-y-3 mt-4">
          <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                <Gauge className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Rate Limiting Strategy</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Token bucket with sliding window — distributed across all gateway nodes via Redis.</p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-semibold">Rate Limited Endpoints</h3>
            </div>
            <div className="divide-y divide-border/60">
              {routes.filter(r => r.rateLimit > 0).sort((a, b) => b.currentRps - a.currentRps).slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <Badge variant="outline" className={cn('shrink-0 font-mono text-[10px]', METHOD_COLORS[r.method])}>{r.method}</Badge>
                  <code className="flex-1 truncate font-mono text-xs">{r.path}</code>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="tabular-nums font-semibold text-amber-600 dark:text-amber-400">{r.currentRps.toFixed(0)}</span>
                    <span className="text-muted-foreground">/ {r.rateLimit}/min</span>
                  </div>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        (r.currentRps / r.rateLimit * 60) > 0.8 ? 'bg-rose-500' : (r.currentRps / r.rateLimit * 60) > 0.5 ? 'bg-amber-500' : 'bg-emerald-500',
                      )}
                      style={{ width: `${Math.min(100, (r.currentRps / r.rateLimit * 60) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Rate Limit Headers</h3>
            <p className="text-xs text-muted-foreground">Standard headers returned to clients on every rate-limited request</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] text-slate-100">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1721816400
Retry-After: 12  (only when 429 returned)`}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className={cn('font-mono', METHOD_COLORS[selected?.method || 'GET'])}>{selected?.method}</Badge>
              <code className="font-mono text-sm">{selected?.path}</code>
            </DialogTitle>
            <DialogDescription>Route configuration & live metrics</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Requests/sec</div>
                  <div className="text-xl font-bold tabular-nums">{selected.currentRps.toFixed(0)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                  <div className="text-xl font-bold tabular-nums">{selected.avgLatency}ms</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                  <div className={cn('text-xl font-bold tabular-nums', selected.errorRate > 1 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
                    {selected.errorRate.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Target App</div>
                  <div className="mt-0.5 font-mono font-semibold">{selected.targetApp}</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Target Path</div>
                  <div className="mt-0.5 font-mono font-semibold">{selected.targetPath}</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Authentication</div>
                  <div className="mt-0.5 font-semibold uppercase">{AUTH_META[selected.auth].label}</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Rate Limit</div>
                  <div className="mt-0.5 font-semibold tabular-nums">{selected.rateLimit} req/min</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Cache</div>
                  <div className="mt-0.5 font-semibold">{selected.cacheEnabled ? `${selected.cacheTtl}s TTL` : 'Disabled'}</div>
                </div>
                <div className="rounded-md border p-2.5">
                  <div className="text-muted-foreground">Total Requests</div>
                  <div className="mt-0.5 font-semibold tabular-nums">{fmtNum(selected.totalRequests)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Edit className="h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
