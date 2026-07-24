'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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
import { useRealtime } from '@/hooks/use-realtime'
import { RUNTIME_META, STATUS_META, REGION_LABELS, fmtNum, fmtDate, fmtBytes } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Boxes, Plus, Search, MoreVertical, Play, Square, RotateCw, Rocket, Settings, Trash2,
  Cpu, MemoryStick, Network, GitBranch, Globe, Activity, ChevronRight, Filter, Zap, X,
} from 'lucide-react'

interface App {
  id: string
  name: string
  slug: string
  runtime: string
  framework: string | null
  region: string
  status: string
  branch: string
  repoUrl: string | null
  port: number
  instances: number
  memoryLimit: number
  cpuLimit: number
  autoScale: boolean
  minInstances: number
  maxInstances: number
  envCount: number
  lastDeploy: string | null
  createdAt: string
  deployments?: any[]
  websockets?: any[]
}

const RUNTIME_OPTIONS = [
  { value: 'rust', label: 'Rust', framework: 'actix-web', icon: '🦀', desc: 'Compile-safe, blazing-fast systems language with zero-cost abstractions.' },
  { value: 'php', label: 'PHP', framework: 'laravel', icon: '🐘', desc: 'Mature web language with Laravel, Symfony & native PHP-FPM support.' },
  { value: 'nextjs', label: 'Next.js', framework: 'next', icon: '▲', desc: 'Full-stack React framework with SSR, ISR, RSC and edge runtime.' },
  { value: 'node', label: 'Node.js', framework: 'express', icon: '⬢', desc: 'JavaScript runtime with Express, Fastify & WebSocket support.' },
  { value: 'static', label: 'Static', framework: null, icon: '📄', desc: 'Static file hosting with global CDN and edge caching.' },
]

export function AppsView() {
  const { metrics, deployApp, restartApp, toggleApp, appStatusEvents } = useRealtime()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<App | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', runtime: 'rust', region: 'fra1' })

  const fetchApps = async () => {
    try {
      const r = await fetch('/api/apps')
      const d = await r.json()
      setApps(d.apps)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  // Sync app status from live events
  useEffect(() => {
    if (appStatusEvents.length === 0) return
    fetchApps()
  }, [appStatusEvents])

  const filtered = apps.filter(a => {
    if (filter !== 'all' && a.runtime !== filter) return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleAction = async (app: App, action: 'deploy' | 'restart' | 'toggle' | 'delete') => {
    if (action === 'delete') {
      const r = await fetch(`/api/apps/${app.id}`, { method: 'DELETE' })
      if (r.ok) {
        toast.success(`Deleted ${app.name}`)
        fetchApps()
      }
      return
    }
    if (action === 'deploy') {
      deployApp(app.id)
      toast.success(`Deploy triggered for ${app.name}`, {
        description: 'Watch live status updates in real-time',
      })
      return
    }
    if (action === 'restart') {
      restartApp(app.id)
      toast.info(`Restarting ${app.name}...`)
      return
    }
    if (action === 'toggle') {
      const newStatus = app.status === 'running' ? 'stopped' : 'running'
      toggleApp(app.id)
      await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success(`${app.name} ${newStatus === 'running' ? 'started' : 'stopped'}`)
      fetchApps()
    }
  }

  const handleCreate = async () => {
    if (!newApp.name.trim()) {
      toast.error('App name is required')
      return
    }
    const runtime = RUNTIME_OPTIONS.find(r => r.value === newApp.runtime)!
    const r = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newApp.name,
        runtime: newApp.runtime,
        framework: runtime.framework,
        region: newApp.region,
        port: 3000,
        memoryLimit: 512,
        cpuLimit: 1,
      }),
    })
    if (r.ok) {
      const data = await r.json()
      toast.success(`Created ${newApp.name}`, {
        description: `${runtime.label} app is now building...`,
      })
      setCreateOpen(false)
      setNewApp({ name: '', runtime: 'rust', region: 'fra1' })
      fetchApps()
    } else {
      toast.error('Failed to create app')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/30" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-8"
            >
              All ({apps.length})
            </Button>
            {RUNTIME_OPTIONS.slice(0, 4).map(opt => {
              const count = apps.filter(a => a.runtime === opt.value).length
              if (count === 0) return null
              return (
                <Button
                  key={opt.value}
                  variant={filter === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(opt.value)}
                  className="h-8 gap-1.5"
                >
                  <span>{opt.icon}</span>
                  {opt.label} ({count})
                </Button>
              )
            })}
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deploy New Application</DialogTitle>
              <DialogDescription>Choose a runtime and we'll spin up an isolated container with auto-scaling, SSL, and global CDN.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs font-medium">Application Name</Label>
                <Input
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  placeholder="my-awesome-app"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Runtime</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RUNTIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewApp({ ...newApp, runtime: opt.value })}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                        newApp.runtime === opt.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                          : 'border-border hover:border-primary/40 hover:bg-accent/30',
                      )}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {newApp.runtime === opt.value && <Zap className="h-3 w-3 text-emerald-500" />}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Region</Label>
                <Select value={newApp.region} onValueChange={(v) => setNewApp({ ...newApp, region: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REGION_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                <Rocket className="h-4 w-4" />
                Deploy Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* App cards grid */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
          <Boxes className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No applications found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search or create a new app.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(app => {
            const meta = RUNTIME_META[app.runtime] || RUNTIME_META.node
            const status = STATUS_META[app.status] || STATUS_META.stopped
            const liveApp = metrics?.apps.find(a => a.name === app.slug)
            const cpu = liveApp?.cpu || 0
            const memory = liveApp?.memory || 0
            const rps = liveApp?.rps || 0
            return (
              <Card
                key={app.id}
                className="group flex flex-col overflow-hidden border-border/60 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg', meta.bg)}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{app.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{meta.label}</span>
                        {app.framework && (<>
                          <span>·</span>
                          <span>{app.framework}</span>
                        </>)}
                        <span>·</span>
                        <span>{REGION_LABELS[app.region]}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleAction(app, 'deploy')}>
                        <Rocket className="h-3.5 w-3.5" /> Deploy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(app, 'restart')}>
                        <RotateCw className="h-3.5 w-3.5" /> Restart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(app, 'toggle')}>
                        {app.status === 'running' ? (
                          <><Square className="h-3.5 w-3.5" /> Stop</>
                        ) : (
                          <><Play className="h-3.5 w-3.5" /> Start</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelected(app)}>
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAction(app, 'delete')}
                        className="text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn('gap-1.5 text-[10px]', status.bg, status.color)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', status.dot, app.status === 'running' && 'animate-pulse')} />
                      {status.label}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      {app.branch}
                    </div>
                  </div>

                  {/* Live metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-muted/40 p-2">
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <Cpu className="h-2.5 w-2.5" /> CPU
                      </div>
                      <div className="mt-0.5 text-sm font-semibold tabular-nums">{cpu.toFixed(1)}%</div>
                      <Progress value={cpu} className="mt-1 h-1" />
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <MemoryStick className="h-2.5 w-2.5" /> Mem
                      </div>
                      <div className="mt-0.5 text-sm font-semibold tabular-nums">{memory.toFixed(1)}%</div>
                      <Progress value={memory} className="mt-1 h-1" />
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <Activity className="h-2.5 w-2.5" /> RPS
                      </div>
                      <div className="mt-0.5 text-sm font-semibold tabular-nums">{fmtNum(rps)}</div>
                      <Progress value={Math.min(rps / 50, 100)} className="mt-1 h-1" />
                    </div>
                  </div>

                  {/* Resource info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1">
                      <span className="text-muted-foreground">Instances</span>
                      <span className="font-semibold tabular-nums">{app.instances}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1">
                      <span className="text-muted-foreground">vCPU / Mem</span>
                      <span className="font-semibold tabular-nums">{app.cpuLimit}c / {fmtBytes(app.memoryLimit)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1">
                      <span className="text-muted-foreground">Env vars</span>
                      <span className="font-semibold tabular-nums">{app.envCount}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1">
                      <span className="text-muted-foreground">Auto-scale</span>
                      <span className={cn('font-semibold', app.autoScale ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                        {app.autoScale ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5">
                  <span className="text-[10px] text-muted-foreground">
                    {app.lastDeploy ? `Deployed ${fmtDate(app.lastDeploy)}` : 'No deployments yet'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => handleAction(app, 'deploy')}
                    >
                      <Rocket className="h-3 w-3" /> Deploy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => setSelected(app)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* App detail dialog */}
      <AppDetailDialog app={selected} onClose={() => setSelected(null)} onRefresh={fetchApps} />
    </div>
  )
}

function AppDetailDialog({ app, onClose, onRefresh }: { app: App | null; onClose: () => void; onRefresh: () => void }) {
  const { metrics } = useRealtime()
  if (!app) return null
  const meta = RUNTIME_META[app.runtime] || RUNTIME_META.node
  const liveApp = metrics?.apps.find(a => a.name === app.slug)

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-lg', meta.bg)}>
              {meta.icon}
            </div>
            <div>
              <DialogTitle>{app.name}</DialogTitle>
              <DialogDescription>{meta.label} · {app.framework || 'native'} · {REGION_LABELS[app.region]}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">CPU</div>
                <div className="text-2xl font-bold tabular-nums">{(liveApp?.cpu || 0).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Memory</div>
                <div className="text-2xl font-bold tabular-nums">{(liveApp?.memory || 0).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Requests/sec</div>
                <div className="text-2xl font-bold tabular-nums">{fmtNum(liveApp?.rps || 0)}</div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Connection Info</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Internal endpoint</span>
                  <code className="text-xs">{app.slug}.internal.nexora.app:{app.port}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Public URL</span>
                  <code className="text-xs">https://{app.slug}.nexora.app</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repository</span>
                  <code className="text-xs">{app.repoUrl || '—'}</code>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployments" className="mt-4 space-y-2">
            {app.deployments && app.deployments.length > 0 ? app.deployments.map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 rounded-md border p-2.5">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  d.status === 'success' ? 'bg-emerald-500' : d.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <code className="text-xs font-semibold">{d.commitSha}</code>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(d.createdAt)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{d.commitMsg}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{d.duration}s</Badge>
              </div>
            )) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No deployments yet</p>
            )}
          </TabsContent>

          <TabsContent value="environment" className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Environment Variables</p>
              <Badge variant="outline">{app.envCount} variables</Badge>
            </div>
            <div className="space-y-1.5">
              {['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL', 'SMTP_HOST', 'PUSH_PRIVATE_KEY'].slice(0, app.envCount > 5 ? 5 : app.envCount).map(k => (
                <div key={k} className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs">
                  <code className="font-mono">{k}</code>
                  <code className="font-mono text-muted-foreground">••••••••••••</code>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <Plus className="h-3 w-3" /> Add Variable
            </Button>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Memory Limit (MB)</Label>
                <Input defaultValue={app.memoryLimit} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">CPU Limit (cores)</Label>
                <Input defaultValue={app.cpuLimit} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Min Instances</Label>
                <Input defaultValue={app.minInstances} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Max Instances</Label>
                <Input defaultValue={app.maxInstances} className="mt-1" />
              </div>
            </div>
            <Button className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              Save Changes
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
