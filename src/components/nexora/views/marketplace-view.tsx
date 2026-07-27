'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, Plus, Check, Star, Zap, Github, Slack, Mail, Cloud,
  Database, Server, Shield, BarChart3, GitBranch, MessageSquare,
  Bell, Code, FileCode, Webhook, Lock, Globe, Cpu, Activity,
  ShoppingCart, Truck, CreditCard, Calendar, Phone, Image, Box,
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: 'databases' | 'observability' | 'communication' | 'security' | 'devops' | 'storage' | 'ai' | 'commerce'
  icon: any
  iconColor: string
  iconBg: string
  installed: boolean
  featured: boolean
  rating: number
  installs: string
  author: string
  tags: string[]
  plans: string[]
}

const INTEGRATIONS: Integration[] = [
  // Databases
  { id: 'i1', name: 'PlanetScale', description: 'Serverless MySQL platform with branching, infinite scale, and zero-downtime schema changes.', category: 'databases', icon: Database, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', installed: false, featured: true, rating: 4.8, installs: '12K', author: 'PlanetScale Inc.', tags: ['mysql', 'vitess', 'serverless'], plans: ['pro', 'enterprise'] },
  { id: 'i2', name: 'Neon', description: 'Serverless Postgres with branching, instant restore, and scale-to-zero. Fully open-source compatible.', category: 'databases', icon: Database, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', installed: true, featured: true, rating: 4.9, installs: '8.4K', author: 'Neon Database', tags: ['postgres', 'serverless', 'branching'], plans: ['pro', 'enterprise'] },
  { id: 'i3', name: 'Upstash', description: 'Serverless Redis and Kafka with per-request pricing. REST API for edge runtimes.', category: 'databases', icon: Database, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', installed: false, featured: false, rating: 4.7, installs: '15K', author: 'Upstash', tags: ['redis', 'kafka', 'edge'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i4', name: 'MongoDB Atlas', description: 'Multi-cloud database with global clusters, automatic scaling, and built-in best practices.', category: 'databases', icon: Database, iconColor: 'text-green-600', iconBg: 'bg-green-500/10', installed: true, featured: false, rating: 4.6, installs: '24K', author: 'MongoDB Inc.', tags: ['mongodb', 'nosql', 'atlas'], plans: ['pro', 'enterprise'] },
  { id: 'i5', name: 'Supabase', description: 'Open-source Firebase alternative with Postgres, auth, realtime, and storage.', category: 'databases', icon: Database, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', installed: false, featured: true, rating: 4.8, installs: '18K', author: 'Supabase', tags: ['postgres', 'auth', 'realtime'], plans: ['starter', 'pro', 'enterprise'] },

  // Observability
  { id: 'i6', name: 'Sentry', description: 'Application monitoring and error tracking with stack traces, release tracking, and source maps.', category: 'observability', icon: Activity, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', installed: true, featured: true, rating: 4.9, installs: '42K', author: 'Sentry.io', tags: ['errors', 'performance', 'releases'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i7', name: 'Datadog', description: 'Cloud monitoring as a service with infrastructure, APM, logs, and synthetic monitoring.', category: 'observability', icon: BarChart3, iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10', installed: false, featured: false, rating: 4.5, installs: '28K', author: 'Datadog', tags: ['apm', 'logs', 'metrics'], plans: ['pro', 'enterprise'] },
  { id: 'i8', name: 'Grafana Cloud', description: 'Composable observability platform with metrics, logs, traces, and profiles.', category: 'observability', icon: BarChart3, iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10', installed: false, featured: false, rating: 4.7, installs: '19K', author: 'Grafana Labs', tags: ['grafana', 'prometheus', 'loki'], plans: ['pro', 'enterprise'] },
  { id: 'i9', name: 'LogRocket', description: 'Session replay for web apps with console logs, network requests, and Redux state.', category: 'observability', icon: Activity, iconColor: 'text-sky-500', iconBg: 'bg-sky-500/10', installed: false, featured: false, rating: 4.6, installs: '7.2K', author: 'LogRocket', tags: ['replay', 'debugging', 'frontend'], plans: ['starter', 'pro'] },

  // Communication
  { id: 'i10', name: 'Slack', description: 'Send alerts, deployment notifications, and incident updates directly to Slack channels.', category: 'communication', icon: MessageSquare, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', installed: true, featured: true, rating: 4.8, installs: '52K', author: 'Slack', tags: ['alerts', 'notifications', 'chat'], plans: ['free', 'starter', 'pro', 'enterprise'] },
  { id: 'i11', name: 'Twilio', description: 'Send SMS, voice, and WhatsApp notifications. Verify users with phone OTP.', category: 'communication', icon: Phone, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', installed: false, featured: false, rating: 4.5, installs: '14K', author: 'Twilio', tags: ['sms', 'voice', 'otp'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i12', name: 'SendGrid', description: 'Email delivery service with templates, A/B testing, and detailed analytics.', category: 'communication', icon: Mail, iconColor: 'text-sky-500', iconBg: 'bg-sky-500/10', installed: true, featured: false, rating: 4.4, installs: '31K', author: 'Twilio SendGrid', tags: ['email', 'transactional', 'marketing'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i13', name: 'Pusher', description: 'Hosted WebSocket API with presence, channels, and client libraries for every language.', category: 'communication', icon: Webhook, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', installed: false, featured: false, rating: 4.6, installs: '11K', author: 'Pusher', tags: ['websocket', 'realtime', 'pubsub'], plans: ['starter', 'pro'] },

  // Security
  { id: 'i14', name: 'Cloudflare WAF', description: 'Web Application Firewall with OWASP rules, bot management, and DDoS protection.', category: 'security', icon: Shield, iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10', installed: true, featured: true, rating: 4.7, installs: '38K', author: 'Cloudflare', tags: ['waf', 'ddos', 'bot'], plans: ['pro', 'enterprise'] },
  { id: 'i15', name: 'Auth0', description: 'Identity platform with SSO, MFA, passwordless, and social login. SOC 2 compliant.', category: 'security', icon: Lock, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', installed: false, featured: true, rating: 4.8, installs: '26K', author: 'Okta', tags: ['auth', 'sso', 'mfa'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i16', name: 'Vault', description: 'Secrets management, encryption as a service, and identity-based access for any environment.', category: 'security', icon: Lock, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', installed: true, featured: false, rating: 4.6, installs: '9.1K', author: 'HashiCorp', tags: ['secrets', 'encryption', 'identity'], plans: ['pro', 'enterprise'] },

  // DevOps
  { id: 'i17', name: 'GitHub Actions', description: 'CI/CD with 10,000+ pre-built actions. Run on Linux, macOS, Windows, ARM, and GPU.', category: 'devops', icon: Github, iconColor: 'text-slate-700 dark:text-slate-300', iconBg: 'bg-slate-100 dark:bg-slate-900', installed: true, featured: true, rating: 4.9, installs: '78K', author: 'GitHub', tags: ['ci', 'cd', 'github'], plans: ['free', 'starter', 'pro', 'enterprise'] },
  { id: 'i18', name: 'GitLab CI', description: 'Built-in CI/CD with auto DevOps, review apps, and security scanning.', category: 'devops', icon: GitBranch, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', installed: false, featured: false, rating: 4.6, installs: '22K', author: 'GitLab', tags: ['ci', 'cd', 'gitlab'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i19', name: 'Docker Hub', description: 'Container registry with private repos, automated builds, and vulnerability scanning.', category: 'devops', icon: Box, iconColor: 'text-sky-500', iconBg: 'bg-sky-500/10', installed: true, featured: false, rating: 4.5, installs: '45K', author: 'Docker Inc.', tags: ['containers', 'registry', 'images'], plans: ['free', 'pro', 'enterprise'] },

  // Storage
  { id: 'i20', name: 'AWS S3', description: 'Object storage with 99.999999999% durability. Lifecycle rules, versioning, and encryption.', category: 'storage', icon: Cloud, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10', installed: true, featured: true, rating: 4.8, installs: '62K', author: 'Amazon Web Services', tags: ['s3', 'object', 'storage'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i21', name: 'Cloudflare R2', description: 'Object storage with zero egress fees. S3-compatible API for seamless migration.', category: 'storage', icon: Cloud, iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10', installed: false, featured: true, rating: 4.7, installs: '14K', author: 'Cloudflare', tags: ['r2', 'storage', 's3'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i22', name: 'UploadThing', description: 'File uploads for full-stack apps. Built-in auth, validation, and CDN delivery.', category: 'storage', icon: Image, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', installed: false, featured: false, rating: 4.5, installs: '3.8K', author: 'Ping Labs', tags: ['uploads', 'files', 'cdn'], plans: ['starter', 'pro'] },

  // AI
  { id: 'i23', name: 'OpenAI', description: 'GPT-4, DALL-E, and Whisper APIs. Build AI features with chat, vision, and transcription.', category: 'ai', icon: Cpu, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', installed: true, featured: true, rating: 4.8, installs: '48K', author: 'OpenAI', tags: ['gpt', 'ai', 'llm'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i24', name: 'Anthropic Claude', description: 'Claude 3 family with 200K context. Safe, accurate, and helpful AI assistant.', category: 'ai', icon: Cpu, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10', installed: false, featured: true, rating: 4.9, installs: '24K', author: 'Anthropic', tags: ['claude', 'ai', 'llm'], plans: ['starter', 'pro', 'enterprise'] },
  { id: 'i25', name: 'Pinecone', description: 'Vector database for AI applications. Hybrid search, metadata filtering, and similarity.', category: 'ai', icon: Database, iconColor: 'text-teal-500', iconBg: 'bg-teal-500/10', installed: false, featured: false, rating: 4.6, installs: '8.5K', author: 'Pinecone', tags: ['vectors', 'embeddings', 'rag'], plans: ['starter', 'pro', 'enterprise'] },

  // Commerce
  { id: 'i26', name: 'Stripe', description: 'Payments, subscriptions, billing, and marketplace payouts. PCI Level 1 certified.', category: 'commerce', icon: CreditCard, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', installed: true, featured: true, rating: 4.9, installs: '58K', author: 'Stripe', tags: ['payments', 'billing', 'subscriptions'], plans: ['free', 'pro', 'enterprise'] },
  { id: 'i27', name: 'Shopify', description: 'E-commerce platform with storefront API, webhooks, and 6000+ apps.', category: 'commerce', icon: ShoppingCart, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', installed: false, featured: false, rating: 4.5, installs: '12K', author: 'Shopify', tags: ['ecommerce', 'storefront', 'shopify'], plans: ['pro', 'enterprise'] },
  { id: 'i28', name: 'Algolia', description: 'Search and discovery with typo-tolerance, facets, and personalization. Sub-50ms globally.', category: 'commerce', icon: Search, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', installed: false, featured: false, rating: 4.7, installs: '16K', author: 'Algolia', tags: ['search', 'discovery', 'instant'], plans: ['starter', 'pro', 'enterprise'] },
]

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Box },
  { key: 'databases', label: 'Databases', icon: Database },
  { key: 'observability', label: 'Observability', icon: Activity },
  { key: 'communication', label: 'Communication', icon: MessageSquare },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'devops', label: 'DevOps', icon: GitBranch },
  { key: 'storage', label: 'Storage', icon: Cloud },
  { key: 'ai', label: 'AI & ML', icon: Cpu },
  { key: 'commerce', label: 'Commerce', icon: CreditCard },
]

export function MarketplaceView() {
  const { t } = useI18n()
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showOnlyInstalled, setShowOnlyInstalled] = useState(false)
  const [selected, setSelected] = useState<Integration | null>(null)
  const [installing, setInstalling] = useState(false)

  const filtered = integrations.filter(i => {
    if (filter !== 'all' && i.category !== filter) return false
    if (showOnlyInstalled && !i.installed) return false
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.tags.some(t => t.includes(search.toLowerCase()))) return false
    return true
  })

  const handleInstall = (i: Integration) => {
    setInstalling(true)
    setTimeout(() => {
      setIntegrations(prev => prev.map(x => x.id === i.id ? { ...x, installed: true } : x))
      setSelected(null)
      setInstalling(false)
      toast.success(`${i.name} installed`, { description: 'Configure it in Settings → Integrations' })
    }, 2000)
  }

  const handleUninstall = (i: Integration) => {
    setIntegrations(prev => prev.map(x => x.id === i.id ? { ...x, installed: false } : x))
    toast.success(`${i.name} uninstalled`)
  }

  const installedCount = integrations.filter(i => i.installed).length

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30">
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{t('marketplace.title')}</h2>
                <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  {integrations.length} integrations
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">One-click integrations with the tools you already use. {installedCount} currently installed.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('marketplace.searchIntegrations')}
            className="h-9 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyInstalled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOnlyInstalled(!showOnlyInstalled)}
            className="h-8"
          >
            <Check className="h-3.5 w-3.5" />
            {showOnlyInstalled ? 'Installed' : 'Show installed'}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map(c => {
          const Icon = c.icon
          const count = c.key === 'all' ? integrations.length : integrations.filter(i => i.category === c.key).length
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                filter === c.key
                  ? 'border-violet-500 bg-violet-500 text-white shadow-sm'
                  : 'border-border bg-background hover:bg-accent',
              )}
            >
              <Icon className="h-3 w-3" />
              {c.label}
              <span className={cn('text-[10px]', filter === c.key ? 'text-violet-100' : 'text-muted-foreground')}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(i => {
          const Icon = i.icon
          return (
            <Card
              key={i.id}
              className="group flex flex-col overflow-hidden border-border/60 transition-all hover:border-violet-500/40 hover:shadow-lg cursor-pointer"
              onClick={() => setSelected(i)}
            >
              <div className="flex items-start gap-3 p-4">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', i.iconBg)}>
                  <Icon className={cn('h-5 w-5', i.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold">{i.name}</span>
                    {i.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{i.rating}</span>
                    <span>·</span>
                    <span>{i.installs} installs</span>
                  </div>
                </div>
                {i.installed && (
                  <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" /> Installed
                  </Badge>
                )}
              </div>
              <div className="flex-1 px-4 pb-3">
                <p className="line-clamp-2 text-xs text-muted-foreground">{i.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {i.tags.slice(0, 2).map(t => (
                    <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{i.author}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', selected.iconBg)}>
                    <selected.icon className={cn('h-6 w-6', selected.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle>{selected.name}</DialogTitle>
                      {selected.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                    </div>
                    <DialogDescription>by {selected.author}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm">{selected.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 border-t pt-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Rating</div>
                    <div className="mt-0.5 flex items-center gap-1 font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {selected.rating}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Installs</div>
                    <div className="mt-0.5 font-semibold">{selected.installs}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Plans</div>
                    <div className="mt-0.5 font-semibold">{selected.plans.join(', ')}</div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {selected.installed ? (
                  <>
                    <Button variant="outline" onClick={() => toast.info('Opening configuration', { description: selected.name })}>
                      Configure
                    </Button>
                    <Button variant="outline" className="text-rose-600 dark:text-rose-400" onClick={() => { handleUninstall(selected); setSelected(null) }}>
                      Uninstall
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setSelected(null)}>{t('common.cancel')}</Button>
                    <Button
                      onClick={() => handleInstall(selected)}
                      disabled={installing}
                      className="bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                    >
                      {installing ? (
                        <>
                          <div className="mr-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Install
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
