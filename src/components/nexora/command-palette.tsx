'use client'

import { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useNexoraStore, type ViewKey } from '@/lib/store'
import {
  LayoutDashboard, Boxes, Database, Radio, BellRing, Globe,
  GitCommitHorizontal, ScrollText, Users, Settings, Rocket,
  Plus, Search, Zap, Activity, Cloud, Server, Shield, BarChart3, FlaskConical,
  Network, KeyRound, Store, Flag,
} from 'lucide-react'

interface CommandItem {
  label: string
  hint?: string
  icon: any
  action: () => void
  shortcut?: string
  group: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const { setView } = useNexoraStore()

  // Cmd+K / Ctrl+K to toggle, also listen for custom event from Topbar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    const openHandler = () => setOpen(true)
    window.addEventListener('keydown', handler)
    document.addEventListener('open-command-palette', openHandler as EventListener)
    return () => {
      window.removeEventListener('keydown', handler)
      document.removeEventListener('open-command-palette', openHandler as EventListener)
    }
  }, [])

  const go = (v: ViewKey) => {
    setView(v)
    setOpen(false)
  }

  const items: CommandItem[] = [
    { label: 'Overview', hint: 'Live dashboard', icon: LayoutDashboard, action: () => go('overview'), group: 'Navigation' },
    { label: 'Applications', hint: 'Rust, PHP, Next.js apps', icon: Boxes, action: () => go('apps'), group: 'Navigation' },
    { label: 'CI/CD Pipelines', hint: 'Build & deploy pipelines', icon: GitCommitHorizontal, action: () => go('pipelines'), group: 'Navigation' },
    { label: 'Analytics', hint: 'Traffic & performance insights', icon: BarChart3, action: () => go('analytics'), group: 'Navigation' },
    { label: 'Scaling Simulator', hint: 'Test auto-scaling rules', icon: FlaskConical, action: () => go('simulator'), group: 'Navigation' },
    { label: 'API Gateway', hint: 'Routes & rate limiting', icon: Network, action: () => go('gateway'), group: 'Navigation' },
    { label: 'Feature Flags', hint: 'A/B testing & rollout', icon: Flag, action: () => go('flags'), group: 'Navigation' },
    { label: 'Databases', hint: 'Managed SQL & NoSQL', icon: Database, action: () => go('databases'), group: 'Navigation' },
    { label: 'WebSocket Services', hint: 'Realtime endpoints', icon: Radio, action: () => go('websockets'), group: 'Navigation' },
    { label: 'Push Notifications', hint: 'Send & manage pushes', icon: BellRing, action: () => go('notifications'), group: 'Navigation' },
    { label: 'Backups', hint: 'Snapshots & restore', icon: Cloud, action: () => go('backups'), group: 'Navigation' },
    { label: 'Secrets Manager', hint: 'Encrypted env vars', icon: KeyRound, action: () => go('secrets'), group: 'Navigation' },
    { label: 'Monitoring & Alerts', hint: 'Alert rules & metrics', icon: Activity, action: () => go('monitoring'), group: 'Navigation' },
    { label: 'Marketplace', hint: '28+ integrations', icon: Store, action: () => go('marketplace'), group: 'Navigation' },
    { label: 'Domains & SSL', hint: 'DNS, certificates', icon: Globe, action: () => go('domains'), group: 'Navigation' },
    { label: 'Deployments', hint: 'CI/CD history', icon: GitCommitHorizontal, action: () => go('deployments'), group: 'Navigation' },
    { label: 'Logs', hint: 'Live log streaming', icon: ScrollText, action: () => go('logs'), group: 'Navigation' },
    { label: 'Team', hint: 'Members & roles', icon: Users, action: () => go('team'), group: 'Navigation' },
    { label: 'Settings', hint: 'Account & billing', icon: Settings, action: () => go('settings'), group: 'Navigation' },

    { label: 'Deploy New Application', hint: 'Spin up a Rust / PHP / Next.js app', icon: Rocket, action: () => go('apps'), shortcut: 'N', group: 'Actions' },
    { label: 'Create Database', hint: 'Provision a new managed DB', icon: Database, action: () => go('databases'), group: 'Actions' },
    { label: 'Send Push Notification', hint: 'Broadcast to all devices', icon: Zap, action: () => go('notifications'), group: 'Actions' },
    { label: 'Create Backup', hint: 'Take a snapshot', icon: Cloud, action: () => go('backups'), group: 'Actions' },
    { label: 'Create Alert Rule', hint: 'Add a new alert', icon: Activity, action: () => go('monitoring'), group: 'Actions' },
    { label: 'Add API Route', hint: 'Configure gateway routing', icon: Network, action: () => go('gateway'), group: 'Actions' },
    { label: 'Create Feature Flag', hint: 'Rollout new feature', icon: Flag, action: () => go('flags'), group: 'Actions' },
    { label: 'Add Secret', hint: 'Store encrypted value', icon: KeyRound, action: () => go('secrets'), group: 'Actions' },
    { label: 'Add Domain', hint: 'Connect a new domain with SSL', icon: Globe, action: () => go('domains'), group: 'Actions' },
    { label: 'Invite Team Member', hint: 'Send an invitation email', icon: Users, action: () => go('team'), group: 'Actions' },
    { label: 'Generate API Key', hint: 'For CLI / CI usage', icon: Shield, action: () => go('settings'), group: 'Actions' },
    { label: 'Run Scaling Scenario', hint: 'Simulate traffic spike', icon: FlaskConical, action: () => go('simulator'), group: 'Actions' },
    { label: 'Browse Marketplace', hint: 'Install integrations', icon: Store, action: () => go('marketplace'), group: 'Actions' },

    { label: 'Quick Stats', hint: 'View fleet metrics', icon: Activity, action: () => go('overview'), group: 'Resources' },
    { label: 'Running Services', hint: 'Check what is live', icon: Server, action: () => go('apps'), group: 'Resources' },
    { label: 'Platform Status', hint: 'All systems operational', icon: Cloud, action: () => go('overview'), group: 'Resources' },
  ]

  const groups = Array.from(new Set(items.map(i => i.group)))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map(g => (
          <CommandGroup key={g} heading={g}>
            {items.filter(i => i.group === g).map((item, idx) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={`${g}-${idx}`}
                  onSelect={() => item.action()}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="text-xs text-muted-foreground">{item.hint}</span>}
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => { window.open('#', '_blank'); setOpen(false) }}>
            <Search className="h-4 w-4" />
            <span>Documentation</span>
          </CommandItem>
          <CommandItem onSelect={() => { go('settings'); }}>
            <Settings className="h-4 w-4" />
            <span>Support & Contact</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
