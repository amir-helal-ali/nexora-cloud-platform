'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { fmtDate } from '@/lib/nexora'
import {
  ScrollText, Search, Download, Pause, Play, Filter, Terminal,
} from 'lucide-react'
import { toast } from 'sonner'

interface LogEntry {
  id: string
  ts: string
  level: string
  source: string
  message: string
  appId: string
}

interface Deployment {
  id: string
  commitSha: string
  commitMsg: string
  branch: string
  status: string
  stage: string
  duration: number
  triggeredBy: string
  createdAt: string
  app: { name: string; runtime: string }
}

const LEVEL_COLORS: Record<string, string> = {
  info: 'text-sky-600 dark:text-sky-400',
  warn: 'text-amber-600 dark:text-amber-400',
  error: 'text-rose-600 dark:text-rose-400',
  debug: 'text-muted-foreground',
}

const LEVEL_BG: Record<string, string> = {
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  warn: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  error: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  debug: 'bg-muted text-muted-foreground',
}

export function LogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchAll = async () => {
    try {
      const [lR, dR] = await Promise.all([
        fetch('/api/logs?limit=200'),
        fetch('/api/deployments'),
      ])
      const [lD, dD] = await Promise.all([lR.json(), dR.json()])
      setLogs(lD.logs)
      setDeployments(dD.deployments)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Simulate live log streaming
  useEffect(() => {
    if (paused) return
    const samples = [
      { level: 'info', source: 'app', message: 'GET /api/health 200 — 14ms' },
      { level: 'info', source: 'app', message: 'POST /api/auth/login 200 — 89ms' },
      { level: 'info', source: 'runtime', message: 'Worker pool size: 4 active' },
      { level: 'warn', source: 'app', message: 'Slow query: SELECT * FROM orders (1.2s)' },
      { level: 'info', source: 'system', message: 'Health check passed' },
      { level: 'error', source: 'app', message: 'Connection pool exhausted, retrying...' },
      { level: 'info', source: 'build', message: 'Build artifacts cached (2.4 MB)' },
      { level: 'debug', source: 'runtime', message: 'GC pause: 0.4ms' },
    ]
    const t = setInterval(() => {
      const s = samples[Math.floor(Math.random() * samples.length)]
      const newLog: LogEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        ts: new Date().toISOString(),
        level: s.level,
        source: s.source,
        message: s.message,
        appId: 'app_1',
      }
      setLogs(prev => [newLog, ...prev].slice(0, 200))
    }, 2500)
    return () => clearInterval(t)
  }, [paused])

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.level !== filter) return false
    if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="h-9 pl-9 font-mono text-xs"
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
              <TabsTrigger value="warn" className="text-xs">Warn</TabsTrigger>
              <TabsTrigger value="error" className="text-xs">Error</TabsTrigger>
              <TabsTrigger value="debug" className="text-xs">Debug</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaused(!paused)}
            className={cn(paused && 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300')}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Logs exported', { description: 'logs-export.txt downloaded' })}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Log stream */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold">Live Log Stream</span>
              {!paused && (
                <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> streaming
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{filtered.length} entries</span>
          </div>
          <div className="max-h-[600px] overflow-y-auto bg-slate-950 font-mono text-[11px] leading-relaxed">
            {filtered.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-slate-500">No logs match your filter</div>
            ) : (
              filtered.map((log, i) => (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-2 border-b border-slate-900 px-3 py-1.5 hover:bg-slate-900',
                    i === 0 && !paused && 'bg-emerald-950/30',
                  )}
                >
                  <span className="shrink-0 text-slate-500">
                    {new Date(log.ts).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <span className={cn(
                    'shrink-0 rounded px-1 text-[9px] font-bold uppercase',
                    LEVEL_BG[log.level] || LEVEL_BG.info,
                  )}>
                    {log.level}
                  </span>
                  <span className="shrink-0 text-slate-500">[{log.source}]</span>
                  <span className={cn(
                    'flex-1 break-all',
                    log.level === 'error' ? 'text-rose-300' :
                    log.level === 'warn' ? 'text-amber-300' :
                    log.level === 'debug' ? 'text-slate-500' :
                    'text-slate-200'
                  )}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent deployments */}
        <Card className="overflow-hidden">
          <div className="border-b border-border/60 bg-muted/30 px-4 py-2">
            <span className="text-xs font-semibold">Recent Deployments</span>
          </div>
          <div className="max-h-[600px] divide-y divide-border/40 overflow-y-auto">
            {deployments.map(d => {
              const statusColors: Record<string, string> = {
                success: 'bg-emerald-500',
                failed: 'bg-rose-500',
                building: 'bg-amber-500 animate-pulse',
                queued: 'bg-slate-400',
                cancelled: 'bg-slate-400',
              }
              return (
                <div key={d.id} className="px-4 py-2.5 hover:bg-accent/30">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', statusColors[d.status] || 'bg-slate-400')} />
                    <code className="font-mono text-xs font-semibold">{d.commitSha}</code>
                    <Badge variant="outline" className="ml-auto text-[9px] uppercase">{d.status}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{d.commitMsg}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{d.app.name}</span>
                    <span>{fmtDate(d.createdAt)} · {d.duration}s</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
