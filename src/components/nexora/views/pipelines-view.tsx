'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  GitBranch, GitCommit, GitPullRequest, CheckCircle2, XCircle, Clock,
  Play, Pause, SkipForward, RotateCw, Zap, Rocket, Hammer, Package,
  Server, Shield, Globe, ArrowRight, ArrowDown, Loader2, Box,
} from 'lucide-react'

interface PipelineStage {
  id: string
  name: string
  icon: any
  status: 'success' | 'failed' | 'running' | 'pending' | 'skipped'
  duration: number // seconds
  startedAt: string | null
  logs?: string[]
}

interface Pipeline {
  id: string
  branch: string
  commitSha: string
  commitMsg: string
  author: string
  triggeredAt: string
  status: 'success' | 'failed' | 'running' | 'pending'
  stages: PipelineStage[]
  app: string
}

const PIPELINES: Pipeline[] = [
  {
    id: 'p1',
    branch: 'main',
    commitSha: 'a4f9c2e',
    commitMsg: 'feat: add streaming response support for SSE endpoints',
    author: 'ahmed@nexora.app',
    triggeredAt: '2026-07-23T15:42:00Z',
    status: 'success',
    app: 'rust-api-gateway',
    stages: [
      { id: 's1', name: 'Checkout', icon: GitBranch, status: 'success', duration: 4, startedAt: '2026-07-23T15:42:00Z' },
      { id: 's2', name: 'Install Dependencies', icon: Package, status: 'success', duration: 18, startedAt: '2026-07-23T15:42:04Z' },
      { id: 's3', name: 'Lint & Type Check', icon: Shield, status: 'success', duration: 12, startedAt: '2026-07-23T15:42:22Z' },
      { id: 's4', name: 'Build', icon: Hammer, status: 'success', duration: 84, startedAt: '2026-07-23T15:42:34Z' },
      { id: 's5', name: 'Test Suite', icon: CheckCircle2, status: 'success', duration: 156, startedAt: '2026-07-23T15:43:58Z' },
      { id: 's6', name: 'Security Scan', icon: Shield, status: 'success', duration: 28, startedAt: '2026-07-23T15:46:34Z' },
      { id: 's7', name: 'Docker Build', icon: Box, status: 'success', duration: 92, startedAt: '2026-07-23T15:47:02Z' },
      { id: 's8', name: 'Deploy Staging', icon: Server, status: 'success', duration: 42, startedAt: '2026-07-23T15:48:34Z' },
      { id: 's9', name: 'E2E Tests', icon: CheckCircle2, status: 'success', duration: 68, startedAt: '2026-07-23T15:49:16Z' },
      { id: 's10', name: 'Deploy Production', icon: Rocket, status: 'success', duration: 38, startedAt: '2026-07-23T15:50:24Z' },
    ],
  },
  {
    id: 'p2',
    branch: 'feature/redis-cache',
    commitSha: 'c2e8f15',
    commitMsg: 'perf: cache user sessions in redis with TTL fallback',
    author: 'sarah@nexora.app',
    triggeredAt: '2026-07-23T13:15:00Z',
    status: 'running',
    app: 'php-laravel-store',
    stages: [
      { id: 's1', name: 'Checkout', icon: GitBranch, status: 'success', duration: 3, startedAt: '2026-07-23T13:15:00Z' },
      { id: 's2', name: 'Composer Install', icon: Package, status: 'success', duration: 24, startedAt: '2026-07-23T13:15:03Z' },
      { id: 's3', name: 'PHP CS Fixer', icon: Shield, status: 'success', duration: 8, startedAt: '2026-07-23T13:15:27Z' },
      { id: 's4', name: 'Build Assets', icon: Hammer, status: 'success', duration: 45, startedAt: '2026-07-23T13:15:35Z' },
      { id: 's5', name: 'PHPUnit', icon: CheckCircle2, status: 'running', duration: 0, startedAt: '2026-07-23T13:16:20Z' },
      { id: 's6', name: 'Security Scan', icon: Shield, status: 'pending', duration: 0, startedAt: null },
      { id: 's7', name: 'Docker Build', icon: Box, status: 'pending', duration: 0, startedAt: null },
      { id: 's8', name: 'Deploy Staging', icon: Server, status: 'pending', duration: 0, startedAt: null },
      { id: 's9', name: 'E2E Tests', icon: CheckCircle2, status: 'pending', duration: 0, startedAt: null },
      { id: 's10', name: 'Deploy Production', icon: Rocket, status: 'pending', duration: 0, startedAt: null },
    ],
  },
  {
    id: 'p3',
    branch: 'main',
    commitSha: 'b71d3a8',
    commitMsg: 'fix: handle null pointer in auth middleware',
    author: 'omar@nexora.app',
    triggeredAt: '2026-07-23T09:30:00Z',
    status: 'failed',
    app: 'rust-ws-hub',
    stages: [
      { id: 's1', name: 'Checkout', icon: GitBranch, status: 'success', duration: 4, startedAt: '2026-07-23T09:30:00Z' },
      { id: 's2', name: 'Install Dependencies', icon: Package, status: 'success', duration: 22, startedAt: '2026-07-23T09:30:04Z' },
      { id: 's3', name: 'Lint & Type Check', icon: Shield, status: 'success', duration: 9, startedAt: '2026-07-23T09:30:26Z' },
      { id: 's4', name: 'Build', icon: Hammer, status: 'success', duration: 76, startedAt: '2026-07-23T09:30:35Z' },
      { id: 's5', name: 'Test Suite', icon: CheckCircle2, status: 'failed', duration: 42, startedAt: '2026-07-23T09:31:51Z', logs: [
        'test auth::middleware::tests::test_null_token ... FAILED',
        'panicked at src/auth/middleware.rs:142:18',
        'called `Option::unwrap()` on a `None` value',
        'note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace',
      ]},
      { id: 's6', name: 'Security Scan', icon: Shield, status: 'skipped', duration: 0, startedAt: null },
      { id: 's7', name: 'Docker Build', icon: Box, status: 'skipped', duration: 0, startedAt: null },
      { id: 's8', name: 'Deploy Staging', icon: Server, status: 'skipped', duration: 0, startedAt: null },
      { id: 's9', name: 'E2E Tests', icon: CheckCircle2, status: 'skipped', duration: 0, startedAt: null },
      { id: 's10', name: 'Deploy Production', icon: Rocket, status: 'skipped', duration: 0, startedAt: null },
    ],
  },
  {
    id: 'p4',
    branch: 'develop',
    commitSha: 'd93a1b7',
    commitMsg: 'chore: upgrade dependencies and bump version',
    author: 'layla@nexora.app',
    triggeredAt: '2026-07-22T20:12:00Z',
    status: 'success',
    app: 'nextjs-marketing',
    stages: [
      { id: 's1', name: 'Checkout', icon: GitBranch, status: 'success', duration: 3, startedAt: '2026-07-22T20:12:00Z' },
      { id: 's2', name: 'Install Dependencies', icon: Package, status: 'success', duration: 32, startedAt: '2026-07-22T20:12:03Z' },
      { id: 's3', name: 'Lint', icon: Shield, status: 'success', duration: 6, startedAt: '2026-07-22T20:12:35Z' },
      { id: 's4', name: 'Next.js Build', icon: Hammer, status: 'success', duration: 124, startedAt: '2026-07-22T20:12:41Z' },
      { id: 's5', name: 'Jest Tests', icon: CheckCircle2, status: 'success', duration: 38, startedAt: '2026-07-22T20:14:45Z' },
      { id: 's6', name: 'Deploy Production', icon: Rocket, status: 'success', duration: 28, startedAt: '2026-07-22T20:15:23Z' },
    ],
  },
]

const STATUS_META = {
  success: { label: 'Success', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500', icon: XCircle },
  running: { label: 'Running', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500', icon: Loader2 },
  pending: { label: 'Pending', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900 ring-slate-300 dark:ring-slate-700', dot: 'bg-slate-400', icon: Clock },
  skipped: { label: 'Skipped', color: 'text-slate-500 dark:text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/50 ring-slate-200 dark:ring-slate-800', dot: 'bg-slate-300', icon: SkipForward },
}

function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

export function PipelinesView() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(PIPELINES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Derive selected from pipelines so it stays in sync without an effect
  const selected = selectedId ? pipelines.find(p => p.id === selectedId) || null : null

  // Simulate the running pipeline progressing
  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(() => {
      setPipelines(prev => prev.map(p => {
        if (p.status !== 'running') return p
        const runningStage = p.stages.find(s => s.status === 'running')
        if (!runningStage) return p
        // Mark current as success, advance to next
        const newStages = p.stages.map(s => {
          if (s.id === runningStage.id) {
            return { ...s, status: 'success' as const, duration: runningStage.duration || 20 + Math.floor(Math.random() * 60) }
          }
          if (s.id === String(Number(runningStage.id.slice(1)) + 1) && s.status === 'pending') {
            return { ...s, status: 'running' as const, startedAt: new Date().toISOString() }
          }
          return s
        })
        const allDone = newStages.every(s => s.status === 'success' || s.status === 'skipped' || s.status === 'failed')
        return { ...p, stages: newStages, status: allDone ? 'success' as const : 'running' as const }
      }))
    }, 4000)
    return () => clearInterval(t)
  }, [autoRefresh])

  const handleRetry = (p: Pipeline) => {
    setPipelines(prev => prev.map(x => x.id === p.id ? {
      ...x,
      status: 'running',
      stages: x.stages.map((s, i) => ({ ...s, status: i === 0 ? 'running' as const : 'pending' as const, duration: 0, startedAt: i === 0 ? new Date().toISOString() : null })),
    } : x))
    toast.success('Pipeline restarted', { description: `${p.commitSha} — retrying all stages` })
  }

  const handleCancel = (p: Pipeline) => {
    setPipelines(prev => prev.map(x => x.id === p.id ? {
      ...x,
      status: 'failed',
      stages: x.stages.map(s => s.status === 'running' || s.status === 'pending' ? { ...s, status: 'skipped' as const } : s),
    } : x))
    toast.info('Pipeline cancelled', { description: `${p.commitSha} was cancelled` })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-5 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold">CI/CD Pipelines</h3>
              <Badge variant="outline" className="text-[10px]">GitHub Integration</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {pipelines.length} pipelines · {pipelines.filter(p => p.status === 'running').length} running · {pipelines.filter(p => p.status === 'success').length} succeeded · {pipelines.filter(p => p.status === 'failed').length} failed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(autoRefresh && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300')}
            >
              {autoRefresh ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
            </Button>
            <Button size="sm" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white" onClick={() => toast.info('Triggering pipeline', { description: 'New build started from main' })}>
              <Zap className="h-4 w-4" /> Trigger Build
            </Button>
          </div>
        </div>
      </Card>

      {/* Pipelines list */}
      <div className="space-y-3">
        {pipelines.map(p => {
          const status = STATUS_META[p.status]
          const StatusIcon = status.icon
          const totalDuration = p.stages.reduce((s, st) => s + st.duration, 0)
          const successCount = p.stages.filter(s => s.status === 'success').length
          return (
            <Card key={p.id} className={cn('overflow-hidden transition-shadow hover:shadow-md', selectedId === p.id && 'ring-2 ring-emerald-500/40')}>
              {/* Header */}
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1', status.bg, status.color)}>
                  <StatusIcon className={cn('h-5 w-5', p.status === 'running' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono text-xs font-bold">{p.commitSha}</code>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <GitBranch className="h-2.5 w-2.5" /> {p.branch}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{p.app}</Badge>
                    <Badge variant="outline" className={cn('text-[10px] uppercase', status.bg, status.color)}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm">{p.commitMsg}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>by {p.author}</span>
                    <span>·</span>
                    <span>{successCount}/{p.stages.length} stages</span>
                    {totalDuration > 0 && (<>
                      <span>·</span>
                      <span>{fmtDuration(totalDuration)}</span>
                    </>)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}>
                    {selectedId === p.id ? 'Hide' : 'View'}
                  </Button>
                  {p.status === 'failed' && (
                    <Button variant="outline" size="sm" onClick={() => handleRetry(p)}>
                      <RotateCw className="h-3.5 w-3.5" /> Retry
                    </Button>
                  )}
                  {p.status === 'running' && (
                    <Button variant="outline" size="sm" onClick={() => handleCancel(p)}>
                      <Pause className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Stages visualization */}
              {selectedId === p.id && (
                <div className="border-t border-border/60 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Stages</h4>
                    <span className="text-[10px] text-muted-foreground">{p.stages.length} stages</span>
                  </div>
                  {/* Horizontal stage flow */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {p.stages.map((stage, i) => {
                      const sStatus = STATUS_META[stage.status]
                      const SIcon = sStatus.icon
                      return (
                        <div key={stage.id} className="flex items-center gap-1 shrink-0">
                          <div
                            className={cn(
                              'flex min-w-[120px] flex-col items-center gap-1 rounded-md border p-2 transition-all',
                              stage.status === 'running' && 'ring-2 ring-amber-500/40',
                              sStatus.bg,
                            )}
                          >
                            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', sStatus.bg, sStatus.color)}>
                              <SIcon className={cn('h-3.5 w-3.5', stage.status === 'running' && 'animate-spin')} />
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] font-semibold">{stage.name}</div>
                              <div className={cn('text-[9px]', sStatus.color)}>
                                {stage.status === 'success' && fmtDuration(stage.duration)}
                                {stage.status === 'failed' && 'Failed'}
                                {stage.status === 'running' && 'Running...'}
                                {stage.status === 'pending' && 'Pending'}
                                {stage.status === 'skipped' && 'Skipped'}
                              </div>
                            </div>
                          </div>
                          {i < p.stages.length - 1 && (
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Failed stage logs */}
                  {p.stages.find(s => s.status === 'failed' && s.logs) && (
                    <div className="mt-4">
                      <div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Failure Logs</div>
                      <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] leading-relaxed text-rose-300">
{p.stages.find(s => s.status === 'failed' && s.logs)?.logs?.join('\n')}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
