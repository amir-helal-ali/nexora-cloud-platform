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
  Flag, Plus, MoreVertical, Trash2, Users, TrendingUp, TrendingDown,
  FlaskConical, Target, Percent, Activity, Globe, Smartphone, Server,
  Beaker, CheckCircle2, XCircle, Clock, Zap,
} from 'lucide-react'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  type: 'boolean' | 'percentage' | 'variant'
  percentage: number
  variants: { name: string; weight: number; description?: string }[]
  environments: { production: boolean; staging: boolean; development: boolean }
  targeting: { attribute: string; operator: string; value: string }[]
  totalEvaluations: number
  trueEvaluations: number
  createdAt: string
  lastUpdated: string
  owner: string
  tags: string[]
}

interface ABTest {
  id: string
  name: string
  description: string
  flagId: string
  status: 'running' | 'completed' | 'paused' | 'draft'
  startDate: string
  endDate: string | null
  variants: { name: string; users: number; conversions: number; conversionRate: number }[]
  totalUsers: number
  winner: string | null
  confidence: number
  metric: string
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'f1', key: 'new_dashboard_v2', name: 'New Dashboard V2', description: 'Redesigned dashboard with improved layout and live metrics',
    enabled: true, type: 'percentage', percentage: 35, variants: [],
    environments: { production: true, staging: true, development: true },
    targeting: [{ attribute: 'country', operator: 'in', value: 'EG, SA, AE' }],
    totalEvaluations: 184200, trueEvaluations: 64470,
    createdAt: '2026-07-15', lastUpdated: '2026-07-22', owner: 'Layla Mansour',
    tags: ['frontend', 'ui', 'redesign'],
  },
  {
    id: 'f2', key: 'rust_runtime_beta', name: 'Rust Runtime Beta', description: 'Enable Rust runtime for new app deployments',
    enabled: true, type: 'boolean', percentage: 100, variants: [],
    environments: { production: true, staging: true, development: true },
    targeting: [],
    totalEvaluations: 48200, trueEvaluations: 48200,
    createdAt: '2026-06-01', lastUpdated: '2026-07-20', owner: 'Omar Farouk',
    tags: ['runtime', 'rust', 'beta'],
  },
  {
    id: 'f3', key: 'checkout_flow_v3', name: 'Checkout Flow V3', description: 'New 2-step checkout with Apple Pay and Google Pay',
    enabled: true, type: 'variant', percentage: 100,
    variants: [
      { name: 'control', weight: 50, description: 'Current 4-step checkout' },
      { name: 'variant_a', weight: 50, description: 'New 2-step with payment sheet' },
    ],
    environments: { production: true, staging: true, development: true },
    targeting: [{ attribute: 'device', operator: 'is', value: 'mobile' }],
    totalEvaluations: 92400, trueEvaluations: 92400,
    createdAt: '2026-07-10', lastUpdated: '2026-07-23', owner: 'Sarah Khalil',
    tags: ['commerce', 'checkout', 'mobile'],
  },
  {
    id: 'f4', key: 'graphql_api', name: 'GraphQL API', description: 'Expose GraphQL endpoint alongside REST API',
    enabled: false, type: 'boolean', percentage: 0, variants: [],
    environments: { production: false, staging: true, development: true },
    targeting: [],
    totalEvaluations: 12400, trueEvaluations: 0,
    createdAt: '2026-07-18', lastUpdated: '2026-07-21', owner: 'Ahmed Hassan',
    tags: ['api', 'graphql', 'beta'],
  },
  {
    id: 'f5', key: 'ai_search', name: 'AI-Powered Search', description: 'Semantic search with embeddings and reranking',
    enabled: true, type: 'percentage', percentage: 20, variants: [],
    environments: { production: true, staging: true, development: true },
    targeting: [{ attribute: 'plan', operator: 'is', value: 'enterprise' }],
    totalEvaluations: 68400, trueEvaluations: 13680,
    createdAt: '2026-07-05', lastUpdated: '2026-07-23', owner: 'Karim Saleh',
    tags: ['ai', 'search', 'ml'],
  },
  {
    id: 'f6', key: 'realtime_collaboration', name: 'Realtime Collaboration', description: 'Multi-user cursors and presence indicators in dashboard',
    enabled: false, type: 'boolean', percentage: 0, variants: [],
    environments: { production: false, staging: false, development: true },
    targeting: [{ attribute: 'user_id', operator: 'in', value: 'user_1, user_2, user_3' }],
    totalEvaluations: 8200, trueEvaluations: 0,
    createdAt: '2026-07-22', lastUpdated: '2026-07-23', owner: 'Youssef Adel',
    tags: ['realtime', 'collaboration', 'alpha'],
  },
]

const INITIAL_TESTS: ABTest[] = [
  {
    id: 't1', name: 'Checkout Flow A/B Test', description: 'Compare 4-step vs 2-step checkout',
    flagId: 'f3', status: 'running', startDate: '2026-07-10', endDate: null,
    variants: [
      { name: 'control', users: 12400, conversions: 3120, conversionRate: 25.2 },
      { name: 'variant_a', users: 12600, conversions: 3580, conversionRate: 28.4 },
    ],
    totalUsers: 25000, winner: null, confidence: 87.3, metric: 'Checkout completion',
  },
  {
    id: 't2', name: 'Dashboard Layout Test', description: 'Old layout vs new V2 layout',
    flagId: 'f1', status: 'running', startDate: '2026-07-15', endDate: null,
    variants: [
      { name: 'control', users: 18400, conversions: 8640, conversionRate: 47.0 },
      { name: 'variant_v2', users: 6400, conversions: 3260, conversionRate: 50.9 },
    ],
    totalUsers: 24800, winner: null, confidence: 72.5, metric: '7-day retention',
  },
  {
    id: 't3', name: 'AI Search vs Keyword Search', description: 'Compare conversion impact of semantic search',
    flagId: 'f5', status: 'completed', startDate: '2026-06-20', endDate: '2026-07-15',
    variants: [
      { name: 'control', users: 8200, conversions: 1640, conversionRate: 20.0 },
      { name: 'ai_search', users: 8400, conversions: 1932, conversionRate: 23.0 },
    ],
    totalUsers: 16600, winner: 'ai_search', confidence: 95.4, metric: 'Search-to-purchase',
  },
  {
    id: 't4', name: 'Push Notification Timing', description: 'Morning vs evening push delivery',
    flagId: 'f1', status: 'paused', startDate: '2026-07-01', endDate: null,
    variants: [
      { name: 'morning', users: 4200, conversions: 504, conversionRate: 12.0 },
      { name: 'evening', users: 4100, conversions: 697, conversionRate: 17.0 },
    ],
    totalUsers: 8300, winner: null, confidence: 64.2, metric: 'Push open rate',
  },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  running: { label: 'Running', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-900', dot: 'bg-sky-500' },
  paused: { label: 'Paused', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  draft: { label: 'Draft', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900 ring-slate-300 dark:ring-slate-700', dot: 'bg-slate-400' },
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export function FeatureFlagsView() {
  const { t } = useI18n()
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS)
  const [tests, setTests] = useState<ABTest[]>(INITIAL_TESTS)
  const [createOpen, setCreateOpen] = useState(false)
  const [newFlag, setNewFlag] = useState({
    key: '',
    name: '',
    description: '',
    type: 'boolean' as FeatureFlag['type'],
    percentage: 0,
  })

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled, lastUpdated: new Date().toISOString().split('T')[0] } : f))
    const f = flags.find(x => x.id === id)
    if (f) toast.success(`${f.name} ${f.enabled ? 'disabled' : 'enabled'}`, { description: `Change is live for all environments` })
  }

  const updatePercentage = (id: string, percentage: number) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, percentage, lastUpdated: new Date().toISOString().split('T')[0] } : f))
  }

  const handleCreate = () => {
    if (!newFlag.key.trim() || !newFlag.name.trim()) {
      toast.error('Key and name are required')
      return
    }
    const flag: FeatureFlag = {
      id: `f${Date.now()}`,
      key: newFlag.key.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: newFlag.name,
      description: newFlag.description,
      enabled: false,
      type: newFlag.type,
      percentage: newFlag.percentage,
      variants: newFlag.type === 'variant' ? [
        { name: 'control', weight: 50, description: 'Control variant' },
        { name: 'variant_a', weight: 50, description: 'Variant A' },
      ] : [],
      environments: { production: false, staging: false, development: true },
      targeting: [],
      totalEvaluations: 0,
      trueEvaluations: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      owner: 'Ahmed Hassan',
      tags: [],
    }
    setFlags([flag, ...flags])
    toast.success('Feature flag created', { description: flag.key })
    setCreateOpen(false)
    setNewFlag({ key: '', name: '', description: '', type: 'boolean', percentage: 0 })
  }

  const handleDelete = (id: string) => {
    const f = flags.find(x => x.id === id)
    setFlags(flags.filter(x => x.id !== id))
    toast.success('Flag deleted', { description: f?.name })
  }

  return (
    <div className="space-y-5">
      <Tabs defaultValue="flags">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="flags" className="gap-1.5 text-xs"><Flag className="h-3.5 w-3.5" /> Feature Flags ({flags.length})</TabsTrigger>
            <TabsTrigger value="tests" className="gap-1.5 text-xs"><FlaskConical className="h-3.5 w-3.5" /> A/B Tests ({tests.length})</TabsTrigger>
          </TabsList>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
                <Plus className="h-4 w-4" /> New Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('flags.createFlag')}</DialogTitle>
                <DialogDescription>Control feature rollout with percentage-based targeting.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('flags.flagKey')}</Label>
                    <Input value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })} placeholder="new_feature_v1" className="mt-1.5 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">{t('flags.flagName')}</Label>
                    <Input value={newFlag.name} onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })} placeholder="New Feature V1" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('flags.description')}</Label>
                  <Input value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} placeholder="Short description" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">{t('flags.type')}</Label>
                    <Select value={newFlag.type} onValueChange={(v) => setNewFlag({ ...newFlag, type: v as FeatureFlag['type'] })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">Boolean (on/off)</SelectItem>
                        <SelectItem value="percentage">Percentage rollout</SelectItem>
                        <SelectItem value="variant">A/B variant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newFlag.type === 'percentage' && (
                    <div>
                      <Label className="text-xs font-medium">Initial Percentage</Label>
                      <Input type="number" min={0} max={100} value={newFlag.percentage} onChange={(e) => setNewFlag({ ...newFlag, percentage: Number(e.target.value) })} className="mt-1.5" />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleCreate} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <Flag className="h-4 w-4" /> Create Flag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Flags tab */}
        <TabsContent value="flags" className="space-y-3 mt-4">
          {flags.map(f => (
            <Card key={f.id} className={cn('overflow-hidden transition-shadow hover:shadow-md', !f.enabled && 'opacity-70')}>
              <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    f.enabled ? 'bg-violet-500/10' : 'bg-muted',
                  )}>
                    <Flag className={cn('h-5 w-5', f.enabled ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-sm font-bold">{f.key}</code>
                      <Badge variant="outline" className="text-[10px] uppercase">{f.type}</Badge>
                      {f.environments.production && (
                        <Badge variant="outline" className="text-[10px] border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">prod</Badge>
                      )}
                      {f.environments.staging && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">staging</Badge>
                      )}
                      {f.environments.development && (
                        <Badge variant="outline" className="text-[10px] border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">dev</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{f.name} — {f.description}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Owner: {f.owner}</span>
                      <span>·</span>
                      <span>{fmtNum(f.totalEvaluations)} evaluations</span>
                      <span>·</span>
                      <span>Updated {f.lastUpdated}</span>
                      {f.targeting.length > 0 && (<><span>·</span><span className="text-violet-600 dark:text-violet-400">{f.targeting.length} targeting rules</span></>)}
                    </div>
                  </div>
                </div>

                {/* Type-specific controls */}
                <div className="flex shrink-0 items-center gap-3">
                  {f.type === 'percentage' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={f.percentage}
                        onChange={(e) => updatePercentage(f.id, Number(e.target.value))}
                        className="h-8 w-16 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  )}
                  {f.type === 'variant' && (
                    <Badge variant="outline" className="text-[10px]">
                      <Beaker className="mr-1 h-2.5 w-2.5" /> {f.variants.length} variants
                    </Badge>
                  )}
                  <Switch checked={f.enabled} onCheckedChange={() => toggleFlag(f.id)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info('Edit flag', { description: f.key })}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Targeting rules', { description: f.key })}>
                        <Target className="h-3.5 w-3.5" /> Targeting
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Audit log', { description: f.key })}>
                        <Clock className="h-3.5 w-3.5" /> Audit log
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* A/B Tests tab */}
        <TabsContent value="tests" className="space-y-3 mt-4">
          {tests.map(t => {
            const status = STATUS_META[t.status]
            const winnerVariant = t.variants.find(v => v.name === t.winner)
            return (
              <Card key={t.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{t.name}</h3>
                        <Badge variant="outline" className={cn('text-[10px] uppercase', status.bg, status.color)}>
                          <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', status.dot, t.status === 'running' && 'animate-pulse')} />
                          {status.label}
                        </Badge>
                        {t.winner && (
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Winner: {t.winner}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Metric: <span className="font-medium text-foreground">{t.metric}</span></span>
                        <span>·</span>
                        <span>{fmtNum(t.totalUsers)} users</span>
                        <span>·</span>
                        <span>Confidence: <span className={cn('font-medium', t.confidence > 95 ? 'text-emerald-600 dark:text-emerald-400' : t.confidence > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>{t.confidence}%</span></span>
                        <span>·</span>
                        <span>Started {t.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variants comparison */}
                  <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${t.variants.length}, 1fr)` }}>
                    {t.variants.map((v, i) => {
                      const maxRate = Math.max(...t.variants.map(x => x.conversionRate))
                      const isWinner = v.name === t.winner
                      const isLeading = !t.winner && v.conversionRate === maxRate && t.status === 'running'
                      return (
                        <div key={i} className={cn(
                          'rounded-lg border p-3',
                          isWinner && 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20',
                          isLeading && 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/20',
                        )}>
                          <div className="flex items-center justify-between">
                            <code className="font-mono text-xs font-semibold">{v.name}</code>
                            {(isWinner || isLeading) && (
                              <Badge variant="outline" className={cn('text-[9px]', isWinner ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300')}>
                                {isWinner ? 'Winner' : 'Leading'}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 text-2xl font-bold tabular-nums">{v.conversionRate}%</div>
                          <div className="text-[10px] text-muted-foreground">{v.conversions} / {fmtNum(v.users)} users</div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn('h-full rounded-full', isWinner ? 'bg-emerald-500' : isLeading ? 'bg-amber-500' : 'bg-slate-400')}
                              style={{ width: `${(v.conversionRate / maxRate) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
