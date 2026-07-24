/**
 * Nexora Cloud — shared utilities, icons, and helpers
 */

// ─────────────────────────────────────────────────────────────────────────────
// Runtime + status metadata
// ─────────────────────────────────────────────────────────────────────────────

export const RUNTIME_META: Record<string, { label: string; color: string; bg: string; ring: string; icon: string }> = {
  rust: {
    label: 'Rust',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    ring: 'ring-orange-200 dark:ring-orange-900',
    icon: '🦀',
  },
  php: {
    label: 'PHP',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    ring: 'ring-indigo-200 dark:ring-indigo-900',
    icon: '🐘',
  },
  nextjs: {
    label: 'Next.js',
    color: 'text-neutral-700 dark:text-neutral-200',
    bg: 'bg-neutral-100 dark:bg-neutral-900',
    ring: 'ring-neutral-300 dark:ring-neutral-700',
    icon: '▲',
  },
  node: {
    label: 'Node.js',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-950/40',
    ring: 'ring-green-200 dark:ring-green-900',
    icon: '⬢',
  },
  static: {
    label: 'Static',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-900',
    ring: 'ring-slate-300 dark:ring-slate-700',
    icon: '📄',
  },
}

export const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  running: { label: 'Running', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  building: { label: 'Building', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  deploying: { label: 'Deploying', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-900', dot: 'bg-sky-500' },
  stopped: { label: 'Stopped', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/50 ring-slate-300 dark:ring-slate-700', dot: 'bg-slate-400' },
  crashed: { label: 'Crashed', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
  creating: { label: 'Creating', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/40 ring-violet-200 dark:ring-violet-900', dot: 'bg-violet-500' },
  backup: { label: 'Backing up', color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/40 ring-cyan-200 dark:ring-cyan-900', dot: 'bg-cyan-500' },
  active: { label: 'Active', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  pending: { label: 'Pending', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', dot: 'bg-amber-500' },
  verifying: { label: 'Verifying', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-900', dot: 'bg-sky-500' },
  failed: { label: 'Failed', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
  success: { label: 'Success', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/50 ring-slate-300 dark:ring-slate-700', dot: 'bg-slate-400' },
  queued: { label: 'Queued', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/50 ring-slate-300 dark:ring-slate-700', dot: 'bg-slate-400' },
  none: { label: 'None', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
  expired: { label: 'Expired', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', dot: 'bg-rose-500' },
}

export const DB_ENGINE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  postgresql: { label: 'PostgreSQL', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40', icon: '🐘' },
  mysql: { label: 'MySQL', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/40', icon: '🐬' },
  mariadb: { label: 'MariaDB', color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/40', icon: '🦭' },
  mongodb: { label: 'MongoDB', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-950/40', icon: '🍃' },
  redis: { label: 'Redis', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', icon: '🟥' },
  sqlite: { label: 'SQLite', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-900', icon: '📦' },
}

export const REGION_LABELS: Record<string, string> = {
  fra1: 'Frankfurt, DE',
  nyc1: 'New York, US',
  sfo1: 'San Francisco, US',
  sin1: 'Singapore, SG',
  syd1: 'Sydney, AU',
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

export function fmtBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${mb.toFixed(0)} MB`
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export function fmtDate(d: string | Date | null): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  const now = Date.now()
  const diff = (now - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

// Sparkline path generator for tiny inline charts
export function sparkline(values: number[], w = 100, h = 28, pad = 2): string {
  if (values.length === 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = (w - pad * 2) / Math.max(1, values.length - 1)
  return values
    .map((v, i) => {
      const x = pad + i * step
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}
