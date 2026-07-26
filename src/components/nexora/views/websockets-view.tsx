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
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { Sparkline } from '@/components/nexora/sparkline'
import { STATUS_META, fmtNum, fmtDate } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Radio, Plus, Network, Activity, Zap, Send, Globe, Bell, BellRing, Mail,
  MessageSquare, Webhook, Smartphone, Check, Copy, Users, TrendingUp, Cpu,
  Server, Hash, Database as DbIcon, ArrowUpRight,
} from 'lucide-react'

interface WebSocketService {
  id: string
  name: string
  endpoint: string
  protocol: string
  status: string
  connections: number
  maxConnections: number
  messagesPerSec: number
  bandwidthKbps: number
  channels: number
  persistence: boolean
  app?: { name: string; runtime: string } | null
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  channel: string
  status: string
  recipients: number
  delivered: number
  opened: number
  createdAt: string
}

export function WebSocketsView() {
  const { metrics, sendPushTest } = useRealtime()
  const { t } = useI18n()
  const [services, setServices] = useState<WebSocketService[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [pushOpen, setPushOpen] = useState(false)
  const [pushForm, setPushForm] = useState({ title: 'New Update Available', message: 'A new version of your app is ready to deploy.', type: 'info', channel: 'push' })

  const fetchAll = async () => {
    try {
      const [wsR, nR] = await Promise.all([
        fetch('/api/websocket-services'),
        fetch('/api/notifications'),
      ])
      const [wsD, nD] = await Promise.all([wsR.json(), nR.json()])
      setServices(wsD.websockets)
      setNotifications(nD.notifications)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Refresh notifications periodically to catch new push events
  useEffect(() => {
    const t = setInterval(fetchAll, 5000)
    return () => clearInterval(t)
  }, [])

  const handleSendPush = async () => {
    // Send through realtime socket (live demo)
    sendPushTest(pushForm.title, pushForm.message)
    // Also persist to database
    await fetch('/api/push-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushForm),
    })
    toast.success('Push notification sent', {
      description: `Delivered to ${pushForm.channel === 'push' ? 'all devices' : 'all recipients'}`,
    })
    setPushOpen(false)
    setTimeout(fetchAll, 500)
  }

  const totalConnections = services.reduce((s, w) => s + w.connections, 0)
  const totalMsgPerSec = services.reduce((s, w) => s + w.messagesPerSec, 0)
  const totalBandwidth = services.reduce((s, w) => s + w.bandwidthKbps, 0)
  const totalChannels = services.reduce((s, w) => s + w.channels, 0)

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2"><Card className="h-64 animate-pulse bg-muted/30" /><Card className="h-64 animate-pulse bg-muted/30" /></div>
  }

  return (
    <div className="space-y-5">
      <Tabs defaultValue="websockets" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="websockets" className="gap-1.5">
              <Radio className="h-3.5 w-3.5" /> {t('nav.websockets')}
            </TabsTrigger>
            <TabsTrigger value="push" className="gap-1.5">
              <BellRing className="h-3.5 w-3.5" /> {t('nav.notifications')}
            </TabsTrigger>
          </TabsList>
          {true && (
            <Dialog open={pushOpen} onOpenChange={setPushOpen}>
              <Button
                className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                onClick={() => {
                  const tab = document.querySelector('[role="tab"][data-state="active"]') as HTMLElement
                  if (tab?.getAttribute('value') === 'websockets') {
                    toast.info('WebSocket service creation', { description: 'Coming soon — for now, services auto-provision per app' })
                  } else {
                    setPushOpen(true)
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                Send Push
              </Button>
            </Dialog>
          )}
        </div>

        {/* WebSocket Services tab */}
        <TabsContent value="websockets" className="space-y-4">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Total Connections</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalConnections)}</div>
                </div>
                <Network className="h-5 w-5 text-violet-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Messages / sec</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalMsgPerSec)}</div>
                </div>
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Bandwidth</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtNum(totalBandwidth)} KB/s</div>
                </div>
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Active Channels</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{totalChannels}</div>
                </div>
                <Hash className="h-5 w-5 text-sky-500" />
              </div>
            </Card>
          </div>

          {/* Service cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {services.map(ws => {
              const status = STATUS_META[ws.status] || STATUS_META.running
              const liveApp = metrics?.apps.find(a => a.name === ws.app?.name)
              const connPct = (ws.connections / ws.maxConnections) * 100
              return (
                <Card key={ws.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <Radio className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{ws.name}</div>
                        <code className="text-[10px] text-muted-foreground">{ws.endpoint}</code>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('gap-1.5 text-[10px]', status.bg, status.color)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', status.dot, 'animate-pulse')} />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="rounded-md bg-muted/40 p-2.5">
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <Users className="h-2.5 w-2.5" /> Connections
                      </div>
                      <div className="mt-1 text-lg font-bold tabular-nums">{fmtNum(ws.connections)}</div>
                      <div className="text-[10px] text-muted-foreground">of {fmtNum(ws.maxConnections)} max</div>
                      <Progress value={connPct} className="mt-1 h-1" />
                    </div>
                    <div className="rounded-md bg-muted/40 p-2.5">
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <Activity className="h-2.5 w-2.5" /> Msg / sec
                      </div>
                      <div className="mt-1 text-lg font-bold tabular-nums">{ws.messagesPerSec}</div>
                      <div className="text-[10px] text-muted-foreground">{ws.bandwidthKbps} KB/s bandwidth</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Channels:</span>
                      <span className="font-semibold">{ws.channels}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DbIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Persist:</span>
                      <span className={cn('font-semibold', ws.persistence ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                        {ws.persistence ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">App:</span>
                      <span className="font-semibold truncate">{ws.app?.name || '—'}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Quick connect example */}
          <Card className="overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:from-violet-950/30 dark:to-purple-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Quick Connect Example</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Drop this snippet into any client (browser, mobile, Rust, PHP) to connect to your WebSocket hub.</p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-100">
{`import { io } from 'socket.io-client'

const socket = io('wss://realtime.nexora.app', {
  transports: ['websocket'],
  auth: { token: process.env.NEXORA_WS_TOKEN }
})

socket.on('connect', () => console.log('Connected:', socket.id))
socket.on('message', (data) => console.log('Received:', data))
socket.emit('subscribe', { channel: 'orders' })`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`import { io } from 'socket.io-client'\n\nconst socket = io('wss://realtime.nexora.app', {\n  transports: ['websocket'],\n  auth: { token: process.env.NEXORA_WS_TOKEN }\n})`)
                    toast.success('Snippet copied')
                  }}
                >
                  <Copy className="h-3 w-3" /> Copy snippet
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Push notifications tab */}
        <TabsContent value="push" className="space-y-4">
          {/* Channel overview */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { ch: 'push', label: 'Web Push', icon: Smartphone, color: 'violet' },
              { ch: 'email', label: 'Email', icon: Mail, color: 'sky' },
              { ch: 'in_app', label: 'In-App', icon: Bell, color: 'emerald' },
              { ch: 'webhook', label: 'Webhook', icon: Webhook, color: 'amber' },
            ].map(c => {
              const Icon = c.icon
              const count = notifications.filter(n => n.channel === c.ch).length
              const delivered = notifications.filter(n => n.channel === c.ch).reduce((s, n) => s + n.delivered, 0)
              const opened = notifications.filter(n => n.channel === c.ch).reduce((s, n) => s + n.opened, 0)
              const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(0) : 0
              return (
                <Card key={c.ch} className="p-4">
                  <div className="flex items-center justify-between">
                    <Icon className={cn('h-5 w-5', `text-${c.color}-500`)} />
                    <Badge variant="outline" className="text-[10px]">{count} sent</Badge>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{c.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5 text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{openRate}%</span>
                    <span className="text-muted-foreground">open rate</span>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Send push button */}
          <Card className="flex flex-col items-start gap-3 border-violet-500/20 bg-gradient-to-br from-violet-50 to-purple-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:from-violet-950/30 dark:to-purple-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                <Send className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Send a Test Push Notification</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Trigger a live push that will appear instantly on your device and in the toast at the bottom-right.</p>
              </div>
            </div>
            <Button onClick={() => setPushOpen(true)} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Send className="h-4 w-4" /> Compose Push
            </Button>
          </Card>

          {/* Notifications history */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold">Notification History</h3>
                <p className="text-xs text-muted-foreground">Recent pushes & alerts across all channels</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{notifications.length} total</Badge>
            </div>
            <div className="divide-y divide-border/60">
              {notifications.map(n => {
                const ChannelIcon = n.channel === 'push' ? Smartphone : n.channel === 'email' ? Mail : n.channel === 'webhook' ? Webhook : Bell
                const typeColors: Record<string, string> = {
                  info: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
                  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
                  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                  error: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
                }
                const openRate = n.delivered > 0 ? ((n.opened / n.delivered) * 100).toFixed(0) : '0'
                return (
                  <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-accent/30">
                    <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border', typeColors[n.type] || typeColors.info)}>
                      <ChannelIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{n.title}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px]">
                        <span className="text-muted-foreground">Channel: <span className="font-medium uppercase">{n.channel}</span></span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Recipients: <span className="font-medium tabular-nums">{n.recipients}</span></span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Delivered: <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">{n.delivered}</span></span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Opened: <span className="font-medium tabular-nums">{n.opened}</span> ({openRate}%)</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose push dialog */}
      <Dialog open={pushOpen} onOpenChange={setPushOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Push Notification</DialogTitle>
            <DialogDescription>Send a test push to all connected devices and the in-app toast system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Title</Label>
              <Input
                value={pushForm.title}
                onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Message</Label>
              <Input
                value={pushForm.message}
                onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Type</Label>
                <Select value={pushForm.type} onValueChange={(v) => setPushForm({ ...pushForm, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Channel</Label>
                <Select value={pushForm.channel} onValueChange={(v) => setPushForm({ ...pushForm, channel: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Web Push</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Preview</div>
              <div className="flex items-start gap-2.5">
                <div className={cn(
                  'mt-0.5 h-2 w-2 rounded-full',
                  pushForm.type === 'success' ? 'bg-emerald-500' :
                  pushForm.type === 'warning' ? 'bg-amber-500' :
                  pushForm.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{pushForm.title}</p>
                  <p className="text-xs text-muted-foreground">{pushForm.message}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPushOpen(false)}>Cancel</Button>
            <Button onClick={handleSendPush} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Send className="h-4 w-4" /> Send to {pushForm.channel === 'push' ? 'devices' : 'recipients'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
