'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fmtDate } from '@/lib/nexora'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Users, Plus, MoreVertical, Mail, Crown, Shield, Code, Eye, Trash2,
  Clock, Check, X, UserPlus, Settings,
} from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  name: string
  role: string
  status: string
  lastActive: string | null
  createdAt: string
}

const ROLE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10' },
  admin: { label: 'Admin', icon: Shield, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-500/10' },
  developer: { label: 'Developer', icon: Code, color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-500/10' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
}

export function TeamView() {
  const { t } = useI18n()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState({ email: '', name: '', role: 'developer' })

  const fetchMembers = async () => {
    try {
      const r = await fetch('/api/team')
      const d = await r.json()
      setMembers(d.team)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const handleInvite = async () => {
    if (!invite.email.trim()) {
      toast.error('Email is required')
      return
    }
    const r = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invite),
    })
    if (r.ok) {
      toast.success(`Invitation sent to ${invite.email}`, {
        description: `Role: ${ROLE_META[invite.role]?.label || invite.role}`,
      })
      setInviteOpen(false)
      setInvite({ email: '', name: '', role: 'developer' })
      fetchMembers()
    }
  }

  const handleUpdateRole = async (m: TeamMember, role: string) => {
    await fetch(`/api/team/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    toast.success(`${m.name} is now ${ROLE_META[role]?.label || role}`)
    fetchMembers()
  }

  const handleRemove = async (m: TeamMember) => {
    await fetch(`/api/team/${m.id}`, { method: 'DELETE' })
    toast.success(`Removed ${m.name} from team`)
    fetchMembers()
  }

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i => <Card key={i} className="h-24 animate-pulse bg-muted/30" />)}</div>
  }

  const active = members.filter(m => m.status === 'active').length
  const pending = members.filter(m => m.status === 'pending').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('overview.team')}</div>
            <div className="text-xl font-bold tabular-nums">{members.length}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <Check className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('overview.active')}</div>
            <div className="text-xl font-bold tabular-nums">{active}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('overview.pending')}</div>
            <div className="text-xl font-bold tabular-nums">{pending}</div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t('nav.team')}</h2>
          <p className="text-xs text-muted-foreground">Manage access & permissions across your organization</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <UserPlus className="h-4 w-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>They'll receive an email invitation to join your organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">{t('settings.fullName')}</Label>
                  <Input
                    value={invite.name}
                    onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">{t('settings.email')}</Label>
                  <Input
                    value={invite.email}
                    onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    placeholder="john@company.com"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">{t('notifications.type')}</Label>
                <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — full access</SelectItem>
                    <SelectItem value="developer">Developer — deploy & manage</SelectItem>
                    <SelectItem value="viewer">Viewer — read-only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleInvite} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Mail className="h-4 w-4" /> Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members list */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/60">
          {members.map(m => {
            const role = ROLE_META[m.role] || ROLE_META.developer
            const RoleIcon = role.icon
            const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={cn('text-xs font-bold', role.bg, role.color)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{m.name}</span>
                    {m.status === 'pending' && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        <Clock className="h-2.5 w-2.5" /> Pending
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
                <div className="hidden sm:block text-[11px] text-muted-foreground">
                  {m.lastActive ? `Last active ${fmtDate(m.lastActive)}` : 'Never signed in'}
                </div>
                <Badge variant="outline" className={cn('gap-1 text-[10px]', role.bg, role.color)}>
                  <RoleIcon className="h-2.5 w-2.5" />
                  {role.label}
                </Badge>
                {m.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleUpdateRole(m, 'admin')}>
                        <Shield className="h-3.5 w-3.5" /> Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(m, 'developer')}>
                        <Code className="h-3.5 w-3.5" /> Make Developer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(m, 'viewer')}>
                        <Eye className="h-3.5 w-3.5" /> Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRemove(m)} className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Role permissions matrix */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold">{t('nav.team')}</h3>
        <p className="text-xs text-muted-foreground">What each role can do in your organization</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground">{t('overview.team')}</th>
                <th className="px-3 text-center font-medium">Owner</th>
                <th className="px-3 text-center font-medium">Admin</th>
                <th className="px-3 text-center font-medium">Developer</th>
                <th className="px-3 text-center font-medium">Viewer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: 'View dashboard & metrics', roles: [true, true, true, true] },
                { perm: 'Deploy applications', roles: [true, true, true, false] },
                { perm: 'Create & delete databases', roles: [true, true, false, false] },
                { perm: 'Manage domains & SSL', roles: [true, true, false, false] },
                { perm: 'Invite team members', roles: [true, true, false, false] },
                { perm: 'Manage billing & plan', roles: [true, false, false, false] },
                { perm: 'Delete organization', roles: [true, false, false, false] },
              ].map(row => (
                <tr key={row.perm} className="border-b border-border/40 last:border-0">
                  <td className="py-2 pr-4 text-foreground">{row.perm}</td>
                  {row.roles.map((v, i) => (
                    <td key={i} className="px-3 py-2 text-center">
                      {v ? (
                        <Check className="mx-auto h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
