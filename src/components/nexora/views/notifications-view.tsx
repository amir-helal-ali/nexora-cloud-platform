'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { fmtDate } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Bell, BellRing, Send, Mail, Smartphone, Webhook, MessageSquare,
  Check, CheckCheck, Trash2, Plus, Filter, Inbox,
} from 'lucide-react'

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

const TYPE_COLORS: Record<string, string> = {
  info: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  error: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
}

const CHANNEL_META: Record<string, { label: string; icon: any; color: string }> = {
  push: { label: 'Web Push', icon: Smartphone, color: 'text-violet-500' },
  email: { label: 'Email', icon: Mail, color: 'text-sky-500' },
  in_app: { label: 'In-App', icon: Bell, color: 'text-emerald-500' },
  webhook: { label: 'Webhook', icon: Webhook, color: 'text-amber-500' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'text-rose-500' },
}

export function NotificationsView() {
  const { pushNotifications, sendPushTest } = useRealtime()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [composeOpen, setComposeOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [compose, setCompose] = useState({ title: '', message: '', type: 'info', channel: 'push' })

  const fetchNotifs = async () => {
    try {
      const r = await fetch('/api/notifications')
      const d = await r.json()
      setNotifications(d.notifications)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifs() }, [])

  // Refresh when new live push arrives
  useEffect(() => {
    if (pushNotifications.length > 0) {
      const t = setTimeout(fetchNotifs, 500)
      return () => clearTimeout(t)
    }
  }, [pushNotifications])

  const handleSend = async () => {
    if (!compose.title.trim() || !compose.message.trim()) {
      toast.error('Title and message are required')
      return
    }
    // Live + persist
    sendPushTest(compose.title, compose.message)
    await fetch('/api/push-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compose),
    })
    toast.success('Notification sent', {
      description: `Delivered via ${CHANNEL_META[compose.channel]?.label || compose.channel}`,
    })
    setComposeOpen(false)
    setCompose({ title: '', message: '', type: 'info', channel: 'push' })
    setTimeout(fetchNotifs, 500)
  }

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opened: 1 }),
    })
    fetchNotifs()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    toast.success('Notification deleted')
    fetchNotifs()
  }

  const filtered = notifications.filter(n => filter === 'all' || n.channel === filter)

  // Channel stats
  const channels = ['push', 'email', 'in_app', 'webhook']
  const channelStats = channels.map(ch => {
    const list = notifications.filter(n => n.channel === ch)
    const delivered = list.reduce((s, n) => s + n.delivered, 0)
    const opened = list.reduce((s, n) => s + n.opened, 0)
    return {
      ch,
      count: list.length,
      delivered,
      opened,
      openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(0) : '0',
    }
  })

  return (
    <div className="space-y-5">
      {/* Channel stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channelStats.map(s => {
          const meta = CHANNEL_META[s.ch] || CHANNEL_META.in_app
          const Icon = meta.icon
          return (
            <Card key={s.ch} className="p-4">
              <div className="flex items-center justify-between">
                <Icon className={cn('h-5 w-5', meta.color)} />
                <Badge variant="outline" className="text-[10px]">{s.count} sent</Badge>
              </div>
              <div className="mt-2 text-sm font-semibold">{meta.label}</div>
              <div className="mt-1 flex items-baseline gap-1.5 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.openRate}%</span>
                <span className="text-muted-foreground">open rate</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.openRate}%` }} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Compose card */}
      <Card className="flex flex-col items-start gap-3 border-violet-500/20 bg-gradient-to-br from-violet-50 to-purple-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:from-violet-950/30 dark:to-purple-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
            <Send className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Send Push Notification</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Broadcast to all devices, subscribers, or webhook endpoints</p>
          </div>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Plus className="h-4 w-4" /> Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Notification</DialogTitle>
              <DialogDescription>This notification will be delivered to all subscribed devices and shown live in the toast.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs font-medium">Title</Label>
                <Input
                  value={compose.title}
                  onChange={(e) => setCompose({ ...compose, title: e.target.value })}
                  placeholder="New Update Available"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Message</Label>
                <Input
                  value={compose.message}
                  onChange={(e) => setCompose({ ...compose, message: e.target.value })}
                  placeholder="A new version of your app is ready to deploy."
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={compose.type} onValueChange={(v) => setCompose({ ...compose, type: v })}>
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
                  <Select value={compose.channel} onValueChange={(v) => setCompose({ ...compose, channel: v })}>
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
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Preview</div>
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    'mt-0.5 h-2 w-2 rounded-full',
                    compose.type === 'success' ? 'bg-emerald-500' :
                    compose.type === 'warning' ? 'bg-amber-500' :
                    compose.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{compose.title || 'Notification title'}</p>
                    <p className="text-xs text-muted-foreground">{compose.message || 'Notification message body'}</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={handleSend} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Send className="h-4 w-4" /> Send Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all" className="text-xs">All ({notifications.length})</TabsTrigger>
          {channels.map(ch => {
            const meta = CHANNEL_META[ch]
            const Icon = meta.icon
            return (
              <TabsTrigger key={ch} value={ch} className="gap-1 text-xs">
                <Icon className="h-3 w-3" />
                {meta.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Notification list */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/60">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">Compose one above to see it appear here.</p>
            </div>
          ) : (
            filtered.map(n => {
              const channel = CHANNEL_META[n.channel] || CHANNEL_META.in_app
              const ChannelIcon = channel.icon
              const openRate = n.delivered > 0 ? ((n.opened / n.delivered) * 100).toFixed(0) : '0'
              return (
                <div key={n.id} className="group flex items-start gap-3 px-5 py-3 hover:bg-accent/30">
                  <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border', TYPE_COLORS[n.type] || TYPE_COLORS.info)}>
                    <ChannelIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{n.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(n.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px]">
                      <span className="text-muted-foreground">Channel: <span className="font-medium uppercase">{channel.label}</span></span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">Recipients: <span className="font-medium tabular-nums">{n.recipients}</span></span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">Delivered: <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">{n.delivered}</span></span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">Opened: <span className="font-medium tabular-nums">{n.opened}</span> ({openRate}%)</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMarkRead(n.id)}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
