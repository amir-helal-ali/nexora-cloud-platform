'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  KeyRound, Plus, MoreVertical, Eye, EyeOff, Copy, Trash2, Lock, Shield,
  ShieldCheck, Clock, RefreshCw, Server, AlertTriangle, CheckCircle2,
  Zap, Key, Fingerprint,
} from 'lucide-react'

interface Secret {
  id: string
  key: string
  value: string
  type: 'string' | 'json' | 'database_url' | 'api_key' | 'certificate' | 'oauth'
  scope: 'project' | 'app' | 'environment'
  scopeTarget: string
  environment: 'production' | 'staging' | 'development' | 'all'
  encrypted: boolean
  lastRotated: string
  rotationDays: number
  usedBy: string[]
  masked: boolean
}

const INITIAL_SECRETS: Secret[] = [
  { id: 's1', key: 'DATABASE_URL', value: 'postgresql://admin:••••••@db-postgres-main.internal:5432/prod', type: 'database_url', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-07-12', rotationDays: 90, usedBy: ['rust-api-gateway', 'php-laravel-store', 'nextjs-dashboard'], masked: true },
  { id: 's2', key: 'JWT_SECRET', value: 'j7s2k8••••••••••••••••••••••••••••••••', type: 'string', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'all', encrypted: true, lastRotated: '2026-06-28', rotationDays: 30, usedBy: ['rust-api-gateway', 'php-laravel-store', 'nextjs-marketing'], masked: true },
  { id: 's3', key: 'REDIS_URL', value: 'rediss://default:••••••@db-redis-cache.internal:6379', type: 'database_url', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-07-15', rotationDays: 90, usedBy: ['rust-api-gateway', 'nextjs-dashboard'], masked: true },
  { id: 's4', key: 'STRIPE_SECRET_KEY', value: 'sk_live_••••••••••••••••••••••••', type: 'api_key', scope: 'app', scopeTarget: 'php-laravel-store', environment: 'production', encrypted: true, lastRotated: '2026-08-01', rotationDays: 365, usedBy: ['php-laravel-store'], masked: true },
  { id: 's5', key: 'SMTP_PASSWORD', value: '••••••••••••', type: 'string', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-05-04', rotationDays: 180, usedBy: ['php-laravel-store', 'rust-api-gateway'], masked: true },
  { id: 's6', key: 'PUSH_PRIVATE_KEY', value: '-----BEGIN VAPID PRIVATE KEY-----\n••••••••••••••••••••••••••••••••••••••••••••••••', type: 'certificate', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'all', encrypted: true, lastRotated: '2026-04-22', rotationDays: 365, usedBy: ['rust-ws-hub', 'nextjs-marketing'], masked: true },
  { id: 's7', key: 'OAUTH_GOOGLE_CLIENT_SECRET', value: 'GOCSPX-••••••••••••••••', type: 'oauth', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'all', encrypted: true, lastRotated: '2026-06-10', rotationDays: 365, usedBy: ['rust-api-gateway', 'nextjs-marketing'], masked: true },
  { id: 's8', key: 'AWS_ACCESS_KEY_ID', value: 'AKIA••••••••••••', type: 'api_key', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-03-15', rotationDays: 90, usedBy: ['nextjs-dashboard', 'php-laravel-store'], masked: true },
  { id: 's9', key: 'AWS_SECRET_ACCESS_KEY', value: '••••••••••••••••••••••••••••••••••••', type: 'api_key', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-03-15', rotationDays: 90, usedBy: ['nextjs-dashboard', 'php-laravel-store'], masked: true },
  { id: 's10', key: 'SENTRY_DSN', value: 'https://••••••@sentry.nexora.app/1', type: 'string', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'all', encrypted: true, lastRotated: '2026-07-01', rotationDays: 365, usedBy: ['rust-api-gateway', 'php-laravel-store', 'nextjs-marketing', 'nextjs-dashboard', 'rust-ws-hub'], masked: true },
  { id: 's11', key: 'FEATURE_FLAGS_CONFIG', value: '{"flags":{"new_dashboard":true,"beta_features":false}}', type: 'json', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: false, lastRotated: '2026-07-20', rotationDays: 0, usedBy: ['nextjs-dashboard'], masked: false },
  { id: 's12', key: 'ENCRYPTION_KEY', value: '••••••••••••••••••••••••••••••••••••••••••••••••••••••', type: 'string', scope: 'project', scopeTarget: 'nexora-cloud', environment: 'production', encrypted: true, lastRotated: '2026-01-10', rotationDays: 365, usedBy: ['rust-api-gateway'], masked: true },
]

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  string: { label: 'String', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-900', icon: Key },
  json: { label: 'JSON', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', icon: KeyRound },
  database_url: { label: 'Database URL', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40', icon: Server },
  api_key: { label: 'API Key', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/40', icon: Key },
  certificate: { label: 'Certificate', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: ShieldCheck },
  oauth: { label: 'OAuth', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', icon: Fingerprint },
}

const ENV_COLORS: Record<string, string> = {
  production: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  staging: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  development: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  all: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
}

function fmtDate(s: string): string {
  const d = new Date(s)
  const now = Date.now()
  const diff = (now - d.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 1) return 'today'
  if (diff < 30) return `${Math.floor(diff)}d ago`
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`
  return `${Math.floor(diff / 365)}y ago`
}

export function SecretsView() {
  const [secrets, setSecrets] = useState<Secret[]>(INITIAL_SECRETS)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [newSecret, setNewSecret] = useState({
    key: '',
    value: '',
    type: 'string' as Secret['type'],
    environment: 'production' as Secret['environment'],
    rotationDays: 90,
  })

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = () => {
    if (!newSecret.key.trim() || !newSecret.value.trim()) {
      toast.error('Key and value are required')
      return
    }
    if (secrets.some(s => s.key === newSecret.key)) {
      toast.error('A secret with this key already exists')
      return
    }
    const secret: Secret = {
      id: `s${Date.now()}`,
      key: newSecret.key.toUpperCase(),
      value: newSecret.value,
      type: newSecret.type,
      scope: 'project',
      scopeTarget: 'nexora-cloud',
      environment: newSecret.environment,
      encrypted: true,
      lastRotated: new Date().toISOString().split('T')[0],
      rotationDays: newSecret.rotationDays,
      usedBy: [],
      masked: true,
    }
    setSecrets([secret, ...secrets])
    toast.success('Secret created', { description: `${secret.key} added and encrypted` })
    setCreateOpen(false)
    setNewSecret({ key: '', value: '', type: 'string', environment: 'production', rotationDays: 90 })
  }

  const handleRotate = (s: Secret) => {
    setSecrets(prev => prev.map(x => x.id === s.id ? { ...x, lastRotated: new Date().toISOString().split('T')[0] } : x))
    toast.success('Secret rotated', { description: `${s.key} — new value applied to ${s.usedBy.length} apps` })
  }

  const handleCopy = (s: Secret) => {
    navigator.clipboard.writeText(s.value)
    toast.success('Secret copied to clipboard', { description: `${s.key} — will clear in 30s` })
  }

  const handleDelete = (s: Secret) => {
    if (s.usedBy.length > 0) {
      toast.error('Cannot delete', { description: `Still used by ${s.usedBy.length} apps — remove references first` })
      return
    }
    setSecrets(secrets.filter(x => x.id !== s.id))
    toast.success('Secret deleted', { description: s.key })
  }

  const filtered = secrets.filter(s => {
    if (filter !== 'all' && s.environment !== filter && s.environment !== 'all') return false
    if (search && !s.key.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const encryptedCount = secrets.filter(s => s.encrypted).length
  const rotatingSoon = secrets.filter(s => {
    if (s.rotationDays === 0) return false
    const days = (Date.now() - new Date(s.lastRotated).getTime()) / (1000 * 60 * 60 * 24)
    return days > s.rotationDays - 14
  }).length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Total Secrets</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{secrets.length}</div>
            </div>
            <KeyRound className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Encrypted</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{encryptedCount}</div>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Need Rotation</div>
              <div className={cn('mt-1 text-2xl font-bold tabular-nums', rotatingSoon > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>{rotatingSoon}</div>
            </div>
            <RefreshCw className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Apps Using Secrets</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{new Set(secrets.flatMap(s => s.usedBy)).size}</div>
            </div>
            <Server className="h-5 w-5 text-sky-500" />
          </div>
        </Card>
      </div>

      {/* Encryption notice */}
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">End-to-end encryption enabled</span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">AES-256-GCM</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              All secrets are encrypted at rest with AES-256-GCM and in transit via TLS 1.3. Keys are rotated automatically via AWS KMS.
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> SOC 2 Type II
          </Badge>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search secrets..."
            className="h-9 max-w-xs font-mono text-sm"
          />
          <div className="flex gap-1.5 overflow-x-auto">
            {[
              { k: 'all', label: `All (${secrets.length})` },
              { k: 'production', label: `Production (${secrets.filter(s => s.environment === 'production' || s.environment === 'all').length})` },
              { k: 'staging', label: `Staging (${secrets.filter(s => s.environment === 'staging' || s.environment === 'all').length})` },
              { k: 'development', label: `Dev (${secrets.filter(s => s.environment === 'development' || s.environment === 'all').length})` },
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
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Plus className="h-4 w-4" /> Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Secret</DialogTitle>
              <DialogDescription>Secrets are encrypted immediately and never logged.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs font-medium">Key (UPPER_SNAKE_CASE)</Label>
                <Input
                  value={newSecret.key}
                  onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })}
                  placeholder="MY_API_KEY"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Value</Label>
                <Input
                  value={newSecret.value}
                  onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                  placeholder="sk_live_..."
                  type="password"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={newSecret.type} onValueChange={(v) => setNewSecret({ ...newSecret, type: v as Secret['type'] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="database_url">Database URL</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="oauth">OAuth Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Environment</Label>
                  <Select value={newSecret.environment} onValueChange={(v) => setNewSecret({ ...newSecret, environment: v as Secret['environment'] })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="all">All Environments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Auto-rotation (days, 0 = off)</Label>
                <Input
                  type="number"
                  value={newSecret.rotationDays}
                  onChange={(e) => setNewSecret({ ...newSecret, rotationDays: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Lock className="h-4 w-4" /> Encrypt & Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Secrets table */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/60">
          {filtered.map(s => {
            const type = TYPE_META[s.type]
            const TypeIcon = type.icon
            const isRevealed = revealed.has(s.id)
            const daysSinceRotation = Math.floor((Date.now() - new Date(s.lastRotated).getTime()) / (1000 * 60 * 60 * 24))
            const needsRotation = s.rotationDays > 0 && daysSinceRotation > s.rotationDays - 14
            return (
              <div key={s.id} className="flex flex-col gap-3 px-5 py-3 hover:bg-accent/30 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', type.bg)}>
                    <TypeIcon className={cn('h-3.5 w-3.5', type.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-xs font-bold">{s.key}</code>
                      <Badge variant="outline" className={cn('text-[10px]', type.bg, type.color)}>{type.label}</Badge>
                      <Badge variant="outline" className={cn('text-[10px] uppercase', ENV_COLORS[s.environment])}>{s.environment}</Badge>
                      {needsRotation && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="mr-1 h-2.5 w-2.5" /> rotate soon
                        </Badge>
                      )}
                      {s.encrypted && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <Lock className="mr-1 h-2.5 w-2.5" /> encrypted
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <code className="truncate font-mono">
                        {isRevealed ? s.value : (s.value.match(/.{1,4}/g)?.slice(0, 3).join('') + '••••••••')}
                      </code>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Used by {s.usedBy.length} app{s.usedBy.length !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>Rotated {fmtDate(s.lastRotated)}</span>
                      {s.rotationDays > 0 && (<>
                        <span>·</span>
                        <span>every {s.rotationDays}d</span>
                      </>)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(s.id)}>
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(s)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRotate(s)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRotate(s)}>
                        <RefreshCw className="h-3.5 w-3.5" /> Rotate now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Audit log', { description: `Viewing access history for ${s.key}` })}>
                        <Clock className="h-3.5 w-3.5" /> View audit log
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(s)} className="text-rose-600 dark:text-rose-400">
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
              <KeyRound className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">No secrets found</p>
              <p className="text-xs text-muted-foreground">Try a different filter or add a new secret.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
