'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRealtime } from '@/hooks/use-realtime'
import { useI18n } from '@/hooks/use-i18n'
import { DB_ENGINE_META, STATUS_META, REGION_LABELS, fmtBytes, fmtDate } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Database as DbIcon, Plus, MoreVertical, Copy, Trash2, Shield, HardDrive,
  Users, RefreshCw, Lock, Activity, ChevronRight, Server, AlertCircle,
} from 'lucide-react'

interface Database {
  id: string
  name: string
  engine: string
  version: string
  region: string
  status: string
  size: number
  usedMb: number
  connections: number
  maxConnections: number
  host: string
  port: number
  username: string
  password: string
  ssl: boolean
  backupEnabled: boolean
  lastBackup: string | null
  createdAt: string
}

const ENGINE_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL', version: '16', icon: '🐘', desc: 'Powerful open-source relational DB with JSON, GIS & full-text search.' },
  { value: 'mysql', label: 'MySQL', version: '8.0', icon: '🐬', desc: 'Industry-standard relational DB with InnoDB engine & replication.' },
  { value: 'mariadb', label: 'MariaDB', version: '11.4', icon: '🦭', desc: 'MySQL-compatible fork with enhanced performance & features.' },
  { value: 'mongodb', label: 'MongoDB', version: '7.0', icon: '🍃', desc: 'Document-oriented NoSQL with flexible schema & aggregation pipeline.' },
  { value: 'redis', label: 'Redis', version: '7.0', icon: '🟥', desc: 'In-memory key-value store with pub/sub, streams & data structures.' },
  { value: 'sqlite', label: 'SQLite', version: '3.45', icon: '📦', desc: 'Serverless, file-based SQL database — perfect for edge & analytics.' },
]

export function DatabasesView() {
  const { metrics } = useRealtime()
  const { t } = useI18n()
  const [databases, setDatabases] = useState<Database[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newDb, setNewDb] = useState({ name: '', engine: 'postgresql', region: 'fra1', size: 1 })

  const fetchDbs = async () => {
    try {
      const r = await fetch('/api/databases')
      const d = await r.json()
      setDatabases(d.databases)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDbs() }, [])

  const handleCreate = async () => {
    if (!newDb.name.trim()) {
      toast.error('Database name is required')
      return
    }
    const engine = ENGINE_OPTIONS.find(e => e.value === newDb.engine)!
    const r = await fetch('/api/databases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDb.name,
        engine: newDb.engine,
        version: engine.version,
        region: newDb.region,
        size: newDb.size,
        maxConnections: 100,
        username: 'admin',
        ssl: true,
        backupEnabled: true,
      }),
    })
    if (r.ok) {
      toast.success(`Creating ${engine.label} database`, {
        description: `${newDb.name} will be ready in a few seconds...`,
      })
      setCreateOpen(false)
      setNewDb({ name: '', engine: 'postgresql', region: 'fra1', size: 1 })
      setTimeout(fetchDbs, 1000)
      setTimeout(fetchDbs, 2500)
    }
  }

  const handleDelete = async (db: Database) => {
    await fetch(`/api/databases/${db.id}`, { method: 'DELETE' })
    toast.success(`Deleted ${db.name}`)
    fetchDbs()
  }

  const handleToggleStatus = async (db: Database) => {
    const newStatus = db.status === 'running' ? 'stopped' : 'running'
    await fetch(`/api/databases/${db.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    toast.success(`${db.name} ${newStatus === 'running' ? 'started' : 'stopped'}`)
    fetchDbs()
  }

  const copyConnString = (db: Database) => {
    const engine = ENGINE_OPTIONS.find(e => e.value === db.engine)!
    let conn = ''
    if (db.engine === 'postgresql') conn = `postgresql://${db.username}:••••@${db.host}:${db.port}/${db.name}?sslmode=require`
    else if (db.engine === 'mysql' || db.engine === 'mariadb') conn = `mysql://${db.username}:••••@${db.host}:${db.port}/${db.name}`
    else if (db.engine === 'mongodb') conn = `mongodb+srv://${db.username}:••••@${db.host}/${db.name}?retryWrites=true`
    else if (db.engine === 'redis') conn = `rediss://:${db.password}@${db.host}:${db.port}`
    else if (db.engine === 'sqlite') conn = `file:/data/${db.name}.sqlite`
    navigator.clipboard.writeText(conn)
    toast.success('Connection string copied', { description: `${engine.label} · ${db.host}` })
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/30" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t('databases.managedDatabases')}</h2>
          <p className="text-xs text-muted-foreground">{databases.length} {t('databases.running')}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4" />
              {t('databases.newDatabase')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('databases.createNewDatabase')}</DialogTitle>
              <DialogDescription>{t('databases.createDbDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs font-medium">{t('databases.databaseName')}</Label>
                <Input
                  value={newDb.name}
                  onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                  placeholder="my-production-db"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">{t('databases.engine')}</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ENGINE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewDb({ ...newDb, engine: opt.value })}
                      className={cn(
                        'flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all',
                        newDb.engine === opt.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                          : 'border-border hover:border-primary/40 hover:bg-accent/30',
                      )}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          <Badge variant="outline" className="text-[10px]">{opt.version}</Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Region</Label>
                  <Select value={newDb.region} onValueChange={(v) => setNewDb({ ...newDb, region: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(REGION_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('databases.size')}</Label>
                  <Select value={String(newDb.size)} onValueChange={(v) => setNewDb({ ...newDb, size: Number(v) })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 4, 8, 16, 32, 64, 128].map(s => (
                        <SelectItem key={s} value={String(s)}>{s} GB</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                <DbIcon className="h-4 w-4" />
                Create Database
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Database cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {databases.map(db => {
          const meta = DB_ENGINE_META[db.engine] || DB_ENGINE_META.postgresql
          const status = STATUS_META[db.status] || STATUS_META.stopped
          const liveDb = metrics?.databases.find(d => d.name === db.name)
          const conns = liveDb?.connections ?? db.connections
          const usedPct = (db.usedMb / (db.size * 1024)) * 100
          const connPct = (conns / db.maxConnections) * 100
          return (
            <Card
              key={db.id}
              className="group flex flex-col overflow-hidden border-border/60 transition-all hover:border-primary/40 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg', meta.bg)}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{db.name}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{meta.label}</span>
                      <span>·</span>
                      <span>v{db.version}</span>
                      <span>·</span>
                      <span>{REGION_LABELS[db.region]}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => copyConnString(db)}>
                      <Copy className="h-3.5 w-3.5" /> {t('databases.copyConnection')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(db)}>
                      {db.status === 'running' ? t('apps.stop') : t('apps.start')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info(t('databases.backupStarted'), { description: `${db.name} ${t('databases.backupQueued').replace('{name}', '')}` })}>
                      <Shield className="h-3.5 w-3.5" /> {t('databases.triggerBackup')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(db)}
                      className="text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn('gap-1.5 text-[10px]', status.bg, status.color)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot, db.status === 'running' && 'animate-pulse')} />
                    {status.label}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {db.ssl && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                        <Lock className="h-2.5 w-2.5" /> SSL
                      </Badge>
                    )}
                    {db.backupEnabled && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-sky-700 dark:text-sky-300">
                        <Shield className="h-2.5 w-2.5" /> Backup
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('databases.storage')}</span>
                    <span className="font-semibold tabular-nums">{fmtBytes(db.usedMb)} / {db.size} GB</span>
                  </div>
                  <Progress value={usedPct} className="h-1.5" />
                </div>

                {/* Connections */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('databases.connections')}</span>
                    <span className="font-semibold tabular-nums">{conns} / {db.maxConnections}</span>
                  </div>
                  <Progress value={connPct} className="h-1.5" />
                </div>

                {/* Host info */}
                <div className="grid grid-cols-1 gap-1 rounded-md border border-border/40 p-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('databases.host')}</span>
                    <code className="truncate font-mono text-[10px]">{db.host}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('databases.port')}</span>
                    <code className="font-mono">{db.port}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('databases.lastBackup')}</span>
                    <span>{fmtDate(db.lastBackup)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => copyConnString(db)}
                >
                  <Copy className="h-3 w-3" /> {t('databases.connectionString')}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
