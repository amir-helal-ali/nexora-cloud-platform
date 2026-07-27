'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DB_ENGINE_META, fmtBytes, fmtDate } from '@/lib/nexora'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  HardDrive, Plus, MoreVertical, RotateCw, Download, Trash2, Shield, Clock,
  Database as DbIcon, Archive, Play, CheckCircle2, AlertCircle, Calendar,
  FileArchive, Cloud, Server,
} from 'lucide-react'

interface Backup {
  id: string
  name: string
  resourceType: 'database' | 'app' | 'volume'
  resourceName: string
  engine?: string
  sizeMb: number
  status: 'completed' | 'in_progress' | 'failed' | 'queued'
  type: 'automatic' | 'manual' | 'snapshot'
  createdAt: string
  durationSec: number
  retentionDays: number
  expiresAt: string
  region: string
}

const INITIAL_BACKUPS: Backup[] = [
  { id: 'bk_1', name: 'postgres-main-daily-2026-07-23', resourceType: 'database', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 612, status: 'completed', type: 'automatic', createdAt: '2026-07-23T03:00:00Z', durationSec: 42, retentionDays: 30, expiresAt: '2026-08-22T03:00:00Z', region: 'fra1' },
  { id: 'bk_2', name: 'mysql-store-snapshot-2026-07-22', resourceType: 'database', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 1340, status: 'completed', type: 'snapshot', createdAt: '2026-07-22T14:23:00Z', durationSec: 78, retentionDays: 90, expiresAt: '2026-10-20T14:23:00Z', region: 'fra1' },
  { id: 'bk_3', name: 'mongo-events-daily-2026-07-23', resourceType: 'database', resourceName: 'mongo-events', engine: 'mongodb', sizeMb: 412, status: 'completed', type: 'automatic', createdAt: '2026-07-23T03:00:00Z', durationSec: 28, retentionDays: 30, expiresAt: '2026-08-22T03:00:00Z', region: 'fra1' },
  { id: 'bk_4', name: 'redis-cache-manual-2026-07-23', resourceType: 'database', resourceName: 'redis-cache', engine: 'redis', sizeMb: 89, status: 'completed', type: 'manual', createdAt: '2026-07-23T11:45:00Z', durationSec: 8, retentionDays: 14, expiresAt: '2026-08-06T11:45:00Z', region: 'fra1' },
  { id: 'bk_5', name: 'postgres-main-daily-2026-07-22', resourceType: 'database', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 598, status: 'completed', type: 'automatic', createdAt: '2026-07-22T03:00:00Z', durationSec: 39, retentionDays: 30, expiresAt: '2026-08-21T03:00:00Z', region: 'fra1' },
  { id: 'bk_6', name: 'mysql-store-daily-2026-07-23', resourceType: 'database', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 1352, status: 'in_progress', type: 'automatic', createdAt: '2026-07-23T15:00:00Z', durationSec: 0, retentionDays: 30, expiresAt: '2026-08-22T15:00:00Z', region: 'fra1' },
  { id: 'bk_7', name: 'sqlite-analytics-snapshot', resourceType: 'database', resourceName: 'sqlite-analytics', engine: 'sqlite', sizeMb: 248, status: 'completed', type: 'snapshot', createdAt: '2026-07-21T18:30:00Z', durationSec: 12, retentionDays: 365, expiresAt: '2027-07-21T18:30:00Z', region: 'fra1' },
  { id: 'bk_8', name: 'postgres-main-daily-2026-07-21', resourceType: 'database', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 587, status: 'completed', type: 'automatic', createdAt: '2026-07-21T03:00:00Z', durationSec: 36, retentionDays: 30, expiresAt: '2026-08-20T03:00:00Z', region: 'fra1' },
  { id: 'bk_9', name: 'mongo-events-daily-2026-07-22', resourceType: 'database', resourceName: 'mongo-events', engine: 'mongodb', sizeMb: 408, status: 'failed', type: 'automatic', createdAt: '2026-07-22T03:00:00Z', durationSec: 5, retentionDays: 30, expiresAt: '2026-08-21T03:00:00Z', region: 'fra1' },
  { id: 'bk_10', name: 'mysql-store-daily-2026-07-21', resourceType: 'database', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 1328, status: 'completed', type: 'automatic', createdAt: '2026-07-21T03:00:00Z', durationSec: 71, retentionDays: 30, expiresAt: '2026-08-20T03:00:00Z', region: 'fra1' },
]

const STATUS_META = {
  completed: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900', icon: Clock },
  failed: { label: 'Failed', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900', icon: AlertCircle },
  queued: { label: 'Queued', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900 ring-slate-300 dark:ring-slate-700', icon: Clock },
}

const TYPE_META = {
  automatic: { label: 'Automatic', icon: Clock, color: 'text-sky-600 dark:text-sky-400' },
  manual: { label: 'Manual', icon: HardDrive, color: 'text-violet-600 dark:text-violet-400' },
  snapshot: { label: 'Snapshot', icon: Camera, color: 'text-amber-600 dark:text-amber-400' },
}

import { Camera } from 'lucide-react'

export function BackupsView() {
  const { t } = useI18n()
  const [backups, setBackups] = useState<Backup[]>(INITIAL_BACKUPS)
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [newBackup, setNewBackup] = useState({ resource: 'postgres-main', type: 'manual' })

  const handleCreate = () => {
    const backup: Backup = {
      id: `bk_${Date.now()}`,
      name: `${newBackup.resource}-${newBackup.type}-${Date.now()}`,
      resourceType: 'database',
      resourceName: newBackup.resource,
      engine: 'postgresql',
      sizeMb: 0,
      status: 'queued',
      type: newBackup.type as Backup['type'],
      createdAt: new Date().toISOString(),
      durationSec: 0,
      retentionDays: newBackup.type === 'snapshot' ? 90 : 14,
      expiresAt: new Date(Date.now() + (newBackup.type === 'snapshot' ? 90 : 14) * 86400000).toISOString(),
      region: 'fra1',
    }
    setBackups([backup, ...backups])
    toast.success('Backup queued', { description: `${newBackup.resource} backup is starting...` })
    setCreateOpen(false)
    // Simulate completion
    setTimeout(() => {
      setBackups(prev => prev.map(b => b.id === backup.id ? { ...b, status: 'completed', sizeMb: 500 + Math.floor(Math.random() * 800), durationSec: 30 + Math.floor(Math.random() * 60) } : b))
      toast.success('Backup completed', { description: backup.name })
    }, 4000)
  }

  const handleRestore = (backup: Backup) => {
    toast.info('Restore initiated', { description: `Restoring ${backup.resourceName} from ${backup.name}...` })
    setTimeout(() => {
      toast.success('Restore complete', { description: `${backup.resourceName} is back online` })
    }, 3000)
  }

  const handleDelete = (id: string) => {
    setBackups(backups.filter(b => b.id !== id))
    toast.success('Backup deleted')
  }

  const handleDownload = (backup: Backup) => {
    toast.success('Download started', { description: `${backup.name} (${fmtBytes(backup.sizeMb)})` })
  }

  const filtered = backups.filter(b => filter === 'all' || b.type === filter || b.status === filter)
  const totalSize = backups.reduce((s, b) => s + b.sizeMb, 0)
  const storageQuotaMb = 50000 // 50 GB
  const usedPct = (totalSize / storageQuotaMb) * 100

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('backups.totalBackups')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{backups.length}</div>
            </div>
            <Archive className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('backups.storageUsed')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtBytes(totalSize)}</div>
            </div>
            <HardDrive className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('backups.successRate')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {((backups.filter(b => b.status === 'completed').length / backups.length) * 100).toFixed(0)}%
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('backups.autoBackups')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{backups.filter(b => b.type === 'automatic').length}</div>
            </div>
            <Clock className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
      </div>

      {/* Storage usage */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:from-violet-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{t('backups.backupStorage')}</h3>
              <p className="text-xs text-muted-foreground">{fmtBytes(totalSize)} of {fmtBytes(storageQuotaMb)} used</p>
            </div>
            <Badge variant="outline" className="gap-1 text-[10px] border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">
              <Cloud className="h-2.5 w-2.5" /> Multi-region
            </Badge>
          </div>
          <Progress value={usedPct} className="mt-3 h-2" />
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Daily: {backups.filter(b => b.type === 'automatic').length} backups</span>
            <span>Snapshots: {backups.filter(b => b.type === 'snapshot').length}</span>
            <span>Manual: {backups.filter(b => b.type === 'manual').length}</span>
            <span>Retention: 30-365 days</span>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { k: 'all', label: `All (${backups.length})` },
            { k: 'automatic', label: `Automatic (${backups.filter(b => b.type === 'automatic').length})` },
            { k: 'manual', label: `Manual (${backups.filter(b => b.type === 'manual').length})` },
            { k: 'snapshot', label: `Snapshots (${backups.filter(b => b.type === 'snapshot').length})` },
            { k: 'completed', label: `Completed (${backups.filter(b => b.status === 'completed').length})` },
            { k: 'failed', label: `Failed (${backups.filter(b => b.status === 'failed').length})` },
          ].map(t => (
            <Button
              key={t.k}
              variant={filter === t.k ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(t.k)}
              className="h-8 shrink-0"
            >
              {t.label}
            </Button>
          ))}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Plus className="h-4 w-4" /> New Backup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('backups.createBackup')}</DialogTitle>
              <DialogDescription>Take a manual backup or snapshot of any database.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs font-medium">{t('backups.resource')}</Label>
                <Select value={newBackup.resource} onValueChange={(v) => setNewBackup({ ...newBackup, resource: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres-main">postgres-main (PostgreSQL)</SelectItem>
                    <SelectItem value="mysql-store">mysql-store (MySQL)</SelectItem>
                    <SelectItem value="mongo-events">mongo-events (MongoDB)</SelectItem>
                    <SelectItem value="redis-cache">redis-cache (Redis)</SelectItem>
                    <SelectItem value="sqlite-analytics">sqlite-analytics (SQLite)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">{t('backups.backupType')}</Label>
                <Select value={newBackup.type} onValueChange={(v) => setNewBackup({ ...newBackup, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Backup (14 days retention)</SelectItem>
                    <SelectItem value="snapshot">Snapshot (90 days retention)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Archive className="h-4 w-4" /> Create Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Backups table */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/60">
          {filtered.map(b => {
            const status = STATUS_META[b.status]
            const StatusIcon = status.icon
            const type = TYPE_META[b.type]
            const TypeIcon = type.icon
            const dbMeta = b.engine ? DB_ENGINE_META[b.engine] : null
            const daysToExpiry = Math.floor((new Date(b.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <div key={b.id} className="flex flex-col gap-3 px-5 py-3 hover:bg-accent/30 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', status.bg)}>
                    <StatusIcon className={cn('h-4 w-4', status.color, b.status === 'in_progress' && 'animate-pulse')} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="truncate text-xs font-mono font-semibold">{b.name}</code>
                      <Badge variant="outline" className={cn('gap-1 text-[10px]', type.color)}>
                        <TypeIcon className="h-2.5 w-2.5" /> {type.label}
                      </Badge>
                      {dbMeta && (
                        <Badge variant="outline" className={cn('gap-1 text-[10px]', dbMeta.bg, dbMeta.color)}>
                          {dbMeta.icon} {dbMeta.label}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{b.resourceName}</span>
                      <span>·</span>
                      <span>{fmtBytes(b.sizeMb)}</span>
                      {b.durationSec > 0 && (<>
                        <span>·</span>
                        <span>{b.durationSec}s</span>
                      </>)}
                      <span>·</span>
                      <span>{fmtDate(b.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px]', status.bg, status.color)}>
                    {status.label}
                  </Badge>
                  {b.status === 'completed' && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      <Calendar className="mr-1 h-2.5 w-2.5" /> expires in {daysToExpiry}d
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRestore(b)} disabled={b.status !== 'completed'}>
                        <RotateCw className="h-3.5 w-3.5" /> Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(b)} disabled={b.status !== 'completed'}>
                        <Download className="h-3.5 w-3.5" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(b.id)} className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Archive className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">No backups found</p>
              <p className="text-xs text-muted-foreground">Try a different filter or create a new backup.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
