'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { STATUS_META, fmtDate } from '@/lib/nexora'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Globe, Plus, Shield, ShieldCheck, ShieldAlert, ExternalLink, MoreVertical,
  Trash2, RefreshCw, Lock, Calendar, Server, ArrowUpRight, Check,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Domain {
  id: string
  domain: string
  type: string
  status: string
  sslStatus: string
  sslExpiry: string | null
  dnsVerified: boolean
  autoRenew: boolean
  nameservers: string | null
  targetApp?: { name: string; runtime: string } | null
  createdAt: string
}

export function DomainsView() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newDomain, setNewDomain] = useState({ domain: '', type: 'subdomain' })

  const fetchDomains = async () => {
    try {
      const r = await fetch('/api/domains')
      const d = await r.json()
      setDomains(d.domains)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDomains() }, [])

  const handleCreate = async () => {
    if (!newDomain.domain.trim()) {
      toast.error('Domain is required')
      return
    }
    const r = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDomain),
    })
    if (r.ok) {
      toast.success(`Adding ${newDomain.domain}`, {
        description: 'DNS verification will complete in a few seconds...',
      })
      setCreateOpen(false)
      setNewDomain({ domain: '', type: 'subdomain' })
      fetchDomains()
      setTimeout(fetchDomains, 3500)
    }
  }

  const handleDelete = async (d: Domain) => {
    await fetch(`/api/domains/${d.id}`, { method: 'DELETE' })
    toast.success(`Removed ${d.domain}`)
    fetchDomains()
  }

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/30" />)}</div>
  }

  const sslActive = domains.filter(d => d.sslStatus === 'active').length
  const sslExpiring = domains.filter(d => {
    if (!d.sslExpiry) return false
    const days = (new Date(d.sslExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return days < 30 && days > 0
  }).length

  return (
    <div className="space-y-5">
      {/* SSL summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SSL Active</div>
            <div className="text-xl font-bold tabular-nums">{sslActive} / {domains.length}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expiring Soon</div>
            <div className="text-xl font-bold tabular-nums">{sslExpiring}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <Globe className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Domains</div>
            <div className="text-xl font-bold tabular-nums">{domains.length}</div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Domains</h2>
          <p className="text-xs text-muted-foreground">All domains linked to your apps · auto-renew enabled</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4" /> Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Domain</DialogTitle>
              <DialogDescription>We'll automatically provision an SSL certificate via Let's Encrypt.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs font-medium">Domain Name</Label>
                <Input
                  value={newDomain.domain}
                  onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                  placeholder="app.example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Type</Label>
                <Select value={newDomain.type} onValueChange={(v) => setNewDomain({ ...newDomain, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="subdomain">Subdomain</SelectItem>
                    <SelectItem value="alias">Alias</SelectItem>
                    <SelectItem value="wildcard">Wildcard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                Add Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Domains table */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/60">
          {domains.map(d => {
            const status = STATUS_META[d.status] || STATUS_META.active
            const sslStatus = STATUS_META[d.sslStatus] || STATUS_META.none
            const daysLeft = d.sslExpiry ? Math.floor((new Date(d.sslExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
            return (
              <div key={d.id} className="flex flex-col gap-3 px-5 py-3 hover:bg-accent/30 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-500/10">
                    <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="truncate text-sm font-semibold">{d.domain}</code>
                      <Badge variant="outline" className="text-[10px] uppercase">{d.type}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {d.targetApp && (
                        <>
                          <span>→ {d.targetApp.name}</span>
                          <span>·</span>
                        </>
                      )}
                      {d.nameservers && (
                        <>
                          <span className="truncate">{d.nameservers}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>Added {fmtDate(d.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('gap-1.5 text-[10px]', status.bg, status.color)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className={cn('gap-1 text-[10px]', sslStatus.bg, sslStatus.color)}>
                    {d.sslStatus === 'active' ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
                    SSL {sslStatus.label}
                    {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft}d`}
                  </Badge>
                  {d.autoRenew && (
                    <Badge variant="outline" className="gap-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                      <RefreshCw className="h-2.5 w-2.5" /> Auto
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`https://${d.domain}`, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5" /> Open site
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Renewing SSL for ${d.domain}...`)}>
                        <Shield className="h-3.5 w-3.5" /> Renew SSL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(d)} className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
