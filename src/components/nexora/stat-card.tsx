'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: number // percentage change
  icon?: React.ComponentType<{ className?: string }>
  spark?: number[]
  color?: string
  sub?: string
}

const COLOR_MAP: Record<string, { text: string; bg: string; border: string; spark: string }> = {
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', spark: '#10b981' },
  sky: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', spark: '#0ea5e9' },
  violet: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', spark: '#8b5cf6' },
  amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', spark: '#f59e0b' },
  rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', spark: '#f43f5e' },
  teal: { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', spark: '#14b8a6' },
  orange: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', spark: '#f97316' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', spark: '#6366f1' },
}

export function StatCard({ label, value, unit, delta, icon: Icon, spark, color = 'emerald', sub }: StatCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.emerald
  const positive = (delta ?? 0) >= 0

  return (
    <Card className={cn('relative overflow-hidden border-border/60 p-5 transition-shadow hover:shadow-md')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.bg, c.text)}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        {delta !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold',
            positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
            <span className="font-normal text-muted-foreground">vs last hour</span>
          </div>
        )}
        {spark && spark.length > 0 && (
          <div className="ml-auto">
            <Sparkline values={spark} color={c.spark} width={100} height={32} />
          </div>
        )}
      </div>
    </Card>
  )
}
