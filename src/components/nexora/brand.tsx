'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Cloud, CloudOff, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { useMounted } from './theme-provider'

export function LiveStatusBadge() {
  const { connected } = useRealtime()
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${
        connected
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
      }`}
    >
      {connected ? <Activity className="h-3 w-3 animate-pulse" /> : <CloudOff className="h-3 w-3" />}
      {connected ? 'Live' : 'Reconnecting'}
    </Badge>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20">
        <Cloud className="h-5 w-5 text-white" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight">Nexora</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Cloud Platform</span>
      </div>
    </Link>
  )
}
