'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { RUNTIME_META, fmtDate, fmtDuration } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  GitCommitHorizontal, GitBranch, GitCommit, CheckCircle2, XCircle,
  Clock, ArrowUpRight, Rocket, RotateCw, Filter, Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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

const STATUS_COLORS: Record<string, { color: string; bg: string; icon: any }> = {
  success: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', icon: CheckCircle2 },
  failed: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', icon: XCircle },
  building: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', icon: Clock },
  queued: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900 ring-slate-300 dark:ring-slate-700', icon: Clock },
  cancelled: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900 ring-slate-300 dark:ring-slate-700', icon: XCircle },
}

const STAGES = ['queued', 'cloning', 'installing', 'building', 'deploying', 'live']

export function DeploymentsView() {
  const { appStatusEvents } = useRealtime()
  const { t } = useI18n()}
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchDeployments = async () => {
    try {
      const r = await fetch('/api/deployments')
      const d = await r.json()
      setDeployments(d.deployments)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDeployments() }, [appStatusEvents])

  const filtered = deployments.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false
    if (search && !d.commitMsg.toLowerCase().includes(search.toLowerCase()) && !d.app.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Group by day
  const grouped: Record<string, Deployment[]> = {}
  filtered.forEach(d => {
    const day = new Date(d.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(d)
  })

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
              placeholder={t('deployments.searchPlaceholder')}
              className="h-9 pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">All ({deployments.length})</TabsTrigger>
              <TabsTrigger value="success" className="text-xs">{t('deployments.success')}</TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">{t('deployments.failed')}</TabsTrigger>
              <TabsTrigger value="building" className="text-xs">{t('deployments.building')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info('Auto-deploy enabled', { description: 'New commits will auto-deploy' })}>
          <Rocket className="h-3.5 w-3.5" /> Trigger Deploy
        </Button>
      </div>

      {/* Deployments grouped by day */}
      {Object.entries(grouped).map(([day, deps]) => (
        <div key={day} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</span>
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{deps.length} deploy{deps.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {deps.map(d => {
              const status = STATUS_COLORS[d.status] || STATUS_COLORS.queued
              const StatusIcon = status.icon
              const meta = RUNTIME_META[d.app.runtime] || RUNTIME_META.node
              const currentStageIdx = STAGES.indexOf(d.stage === 'live' ? 'live' : d.stage)
              return (
                <Card key={d.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    {/* Status icon */}
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1', status.bg, status.color)}>
                      <StatusIcon className={cn('h-4 w-4', d.status === 'building' && 'animate-pulse')} />
                    </div>

                    {/* Commit info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono text-xs font-bold">{d.commitSha}</code>
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <GitBranch className="h-2.5 w-2.5" /> {d.branch}
                        </Badge>
                        <Badge variant="outline" className={cn('gap-1 text-[10px]', meta.bg, meta.color)}>
                          <span>{meta.icon}</span> {d.app.name}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px] uppercase', status.bg, status.color)}>
                          {d.status}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-foreground">{d.commitMsg}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>by {d.triggeredBy}</span>
                        <span>·</span>
                        <span>{fmtDate(d.createdAt)}</span>
                        {d.duration > 0 && (
                          <>
                            <span>·</span>
                            <span>built in {fmtDuration(d.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stage progress (for building/queued) */}
                    {(d.status === 'building' || d.status === 'queued') && (
                      <div className="flex items-center gap-1">
                        {STAGES.map((s, i) => (
                          <div
                            key={s}
                            className={cn(
                              'h-1.5 w-8 rounded-full',
                              i <= currentStageIdx ? 'bg-emerald-500' : 'bg-muted',
                              i === currentStageIdx && 'animate-pulse',
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => toast.info(`Viewing logs for ${d.commitSha}`)}
                      >
                        Logs <ArrowUpRight className="h-3 w-3" />
                      </Button>
                      {d.status === 'success' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => toast.info(`Rollback to ${d.commitSha}`, { description: 'Initiating rollback...' })}
                        >
                          <RotateCw className="h-3 w-3" /> Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && !loading && (
        <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
          <GitCommitHorizontal className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No deployments found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filter or trigger a new deploy.</p>
        </Card>
      )}
    </div>
  )
}
