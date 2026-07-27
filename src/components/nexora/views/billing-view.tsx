'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CreditCard, Download, Crown, Zap, TrendingUp, TrendingDown, Receipt,
  Plus, MoreVertical, Check, Calendar, DollarSign, ArrowUpRight,
  AlertCircle, FileText, RefreshCw, Settings, Server, Database, Shield,
} from 'lucide-react'

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  plan: string
  period: string
  pdf: string
}

interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex' | 'paypal' | 'bank'
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  name: string
}

interface UsageItem {
  resource: string
  icon: any
  used: number
  quota: number
  unit: string
  overage: number
  cost: number
}

const INVOICES: Invoice[] = [
  { id: 'i1', number: 'INV-2026-07-001', date: '2026-07-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'Jul 2026', pdf: '#' },
  { id: 'i2', number: 'INV-2026-06-001', date: '2026-06-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'Jun 2026', pdf: '#' },
  { id: 'i3', number: 'INV-2026-05-001', date: '2026-05-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'May 2026', pdf: '#' },
  { id: 'i4', number: 'INV-2026-04-001', date: '2026-04-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Apr 2026', pdf: '#' },
  { id: 'i5', number: 'INV-2026-03-001', date: '2026-03-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Mar 2026', pdf: '#' },
  { id: 'i6', number: 'INV-2026-02-001', date: '2026-02-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Feb 2026', pdf: '#' },
  { id: 'i7', number: 'INV-2026-01-001', date: '2026-01-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Jan 2026', pdf: '#' },
  { id: 'i8', number: 'INV-2025-12-001', date: '2025-12-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Dec 2025', pdf: '#' },
  { id: 'i9', number: 'INV-2025-11-001', date: '2025-11-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Nov 2025', pdf: '#' },
  { id: 'i10', number: 'INV-2025-10-001', date: '2025-10-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Oct 2025', pdf: '#' },
  { id: 'i11', number: 'INV-2025-09-001', date: '2025-09-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Sep 2025', pdf: '#' },
  { id: 'i12', number: 'INV-2025-08-001', date: '2025-08-01', amount: 0.00, status: 'paid', plan: 'Free', period: 'Aug 2025', pdf: '#' },
]

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true, name: 'Visa ending in 4242' },
  { id: 'pm2', type: 'mastercard', last4: '8888', expMonth: 8, expYear: 2026, isDefault: false, name: 'Mastercard ending in 8888' },
  { id: 'pm3', type: 'amex', last4: '0005', expMonth: 3, expYear: 2028, isDefault: false, name: 'Amex ending in 0005' },
]

const USAGE: UsageItem[] = [
  { resource: 'Applications', icon: Server, used: 7, quota: 50, unit: 'apps', overage: 0, cost: 0 },
  { resource: 'Database Storage', icon: Database, used: 4.1, quota: 100, unit: 'GB', overage: 0, cost: 0 },
  { resource: 'Bandwidth', icon: Zap, used: 1.24, quota: 10, unit: 'TB', overage: 0, cost: 0 },
  { resource: 'Build Minutes', icon: RefreshCw, used: 4820, quota: 50000, unit: 'min', overage: 0, cost: 0 },
  { resource: 'WebSocket Connections', icon: Zap, used: 2572, quota: 50000, unit: 'conn', overage: 0, cost: 0 },
  { resource: 'Push Notifications', icon: Zap, used: 84200, quota: 500000, unit: 'sent', overage: 0, cost: 0 },
  { resource: 'Backup Storage', icon: Database, used: 4.2, quota: 50, unit: 'GB', overage: 0, cost: 0 },
  { resource: 'Edge Requests', icon: Zap, used: 9.84, quota: 100, unit: 'M req', overage: 0, cost: 0 },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Paid', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900' },
  pending: { label: 'Pending', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-900' },
  failed: { label: 'Failed', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900' },
  refunded: { label: 'Refunded', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/40 ring-sky-200 dark:ring-sky-900' },
}

const CARD_ICONS: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  paypal: '🅿️',
  bank: '🏦',
}

const PLANS = [
  { name: 'Free', price: 0, color: 'text-slate-500', features: ['1 app', '100MB storage', 'Community support'] },
  { name: 'Starter', price: 29, color: 'text-emerald-500', features: ['5 apps', '5GB storage', 'Email support', 'Custom domains'] },
  { name: 'Pro', price: 99, color: 'text-sky-500', features: ['20 apps', '50GB storage', 'Priority support', 'Auto-scaling', 'Team members'] },
  { name: 'Enterprise', price: 499, color: 'text-violet-500', features: ['Unlimited apps', '1TB storage', '24/7 support', 'Multi-region', '99.99% SLA'], current: true },
]

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BillingView() {
  const { t } = useI18n()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchBilling = async () => {
    try {
      const r = await fetch('/api/billing')
      const d = await r.json()
      setInvoices(d.invoices || [])
      setPaymentMethods(d.paymentMethods || [])
      setUsage(d.usage || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBilling() }, [])
  const [addCardOpen, setAddCardOpen] = useState(false)

  const currentPlan = PLANS.find(p => p.current) || PLANS[3]
  const totalSpent = invoices.reduce((s, i) => s + i.amount, 0)
  const ytdSpent = invoices.filter(i => i.date.startsWith('2026')).reduce((s, i) => s + i.amount, 0)
  const nextBilling = '2026-08-01'
  const daysUntilBilling = Math.ceil((new Date(nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const setDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(p => ({ ...p, isDefault: p.id === id })))
    toast.success('Default payment method updated')
  }

  const removeCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id))
    toast.success('Payment method removed')
  }

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('billing.currentPlan')}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <Crown className={cn('h-5 w-5', currentPlan.color)} />
                <span className="text-2xl font-bold">{currentPlan.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{fmtMoney(currentPlan.price)}/month</div>
            </div>
            <Crown className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('billing.nextBilling')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{daysUntilBilling}d</div>
              <div className="text-[10px] text-muted-foreground">{fmtDate(nextBilling)}</div>
            </div>
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('billing.ytdSpend')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtMoney(ytdSpent)}</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" /> +420% YoY
              </div>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t('billing.lifetimeSpend')}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{fmtMoney(totalSpent)}</div>
              <div className="text-[10px] text-muted-foreground">{invoices.length} invoices</div>
            </div>
            <Receipt className="h-5 w-5 text-violet-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="text-xs">{t('billing.overview')}</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs">{t('billing.usage')}</TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs">{t('billing.paymentMethods')}</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Current plan card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-violet-500" />
                    <h3 className="text-xl font-bold">{currentPlan.name} Plan</h3>
                    <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">Current</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fmtMoney(currentPlan.price)}/month · renews on {fmtDate(nextBilling)} · {daysUntilBilling} days remaining
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {currentPlan.features.map(f => (
                      <Badge key={f} variant="outline" className="gap-1 text-[10px]">
                        <Check className="h-2.5 w-2.5 text-emerald-500" /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Plan change', { description: 'Contact sales for enterprise changes' })}>
                    <Settings className="h-3.5 w-3.5" /> Modify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Cancel plan', { description: 'Your plan will remain active until end of billing period' })}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* All plans comparison */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('billing.availablePlans')}</h3>
            <p className="text-xs text-muted-foreground">Compare features across tiers</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map(plan => (
                <Card key={plan.name} className={cn('overflow-hidden', plan.current && 'border-violet-500/40 bg-violet-50/30 dark:bg-violet-950/20')}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{plan.name}</span>
                      {plan.current && <Badge className="text-[10px] bg-violet-500">Current</Badge>}
                    </div>
                    <div className="mt-2 text-2xl font-bold">{fmtMoney(plan.price)}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                    <ul className="mt-3 space-y-1.5 text-[11px]">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {!plan.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => toast.info(`Switching to ${plan.name}`, { description: 'Proration will be calculated automatically' })}
                      >
                        Switch to {plan.name}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Usage tab */}
        <TabsContent value="usage" className="space-y-4 mt-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t('billing.currentPeriodUsage')}</h3>
                  <p className="text-xs text-muted-foreground">Resets on {fmtDate(nextBilling)} · {daysUntilBilling} days left</p>
                </div>
                <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-2.5 w-2.5" /> Within quota
                </Badge>
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {USAGE.map((u, i) => {
                const Icon = u.icon
                const pct = (u.used / u.quota) * 100
                const overQuota = pct > 80
                return (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', overQuota ? 'bg-amber-500/10' : 'bg-emerald-500/10')}>
                        <Icon className={cn('h-4 w-4', overQuota ? 'text-amber-500' : 'text-emerald-500')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium">{u.resource}</span>
                          <span className="text-xs">
                            <span className="font-bold tabular-nums">{u.used}</span>
                            <span className="text-muted-foreground"> / {u.quota} {u.unit}</span>
                          </span>
                        </div>
                        <Progress
                          value={pct}
                          className={cn('mt-1.5 h-1.5', overQuota && '[&>div]:bg-amber-500')}
                        />
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{pct.toFixed(1)}% used</span>
                          {u.overage > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">Overage: {u.overage} {u.unit} (+{fmtMoney(u.cost)})</span>
                          ) : (
                            <span>{(u.quota - u.used).toFixed(1)} {u.unit} remaining</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Overage costs */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Overage Pricing</h3>
            <p className="text-xs text-muted-foreground">Charged automatically when you exceed quota</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { resource: 'Extra Bandwidth', cost: '$0.02/GB' },
                { resource: 'Extra Storage', cost: '$0.10/GB-month' },
                { resource: 'Extra Build Minutes', cost: '$0.005/min' },
                { resource: 'Extra Edge Requests', cost: '$0.0001/req' },
                { resource: 'Extra Push Notifications', cost: '$0.0001/notification' },
                { resource: 'Extra WebSocket Hours', cost: '$0.001/hour' },
              ].map((o, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2.5 text-xs">
                  <span>{o.resource}</span>
                  <span className="font-semibold tabular-nums">{o.cost}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Invoices tab */}
        <TabsContent value="invoices" className="space-y-3 mt-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('billing.invoiceHistory')}</h3>
                <Button variant="outline" size="sm" onClick={() => toast.success('All invoices downloaded', { description: 'invoices-2025-2026.zip' })}>
                  <Download className="h-3.5 w-3.5" /> Download All
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {invoices.map(inv => {
                const status = STATUS_META[inv.status]
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1', status.bg, status.color)}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono text-xs font-semibold">{inv.number}</code>
                        <Badge variant="outline" className={cn('text-[10px] uppercase', status.bg, status.color)}>{status.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{inv.plan}</Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{fmtDate(inv.date)}</span>
                        <span>·</span>
                        <span>{inv.period}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{fmtMoney(inv.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Invoice downloaded', { description: `${inv.number}.pdf` })}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Payment methods tab */}
        <TabsContent value="payment" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Payment Methods</h3>
              <p className="text-xs text-muted-foreground">{paymentMethods.length} cards on file</p>
            </div>
            <Button size="sm" className="bg-gradient-to-br from-violet-500 to-purple-600 text-white" onClick={() => setAddCardOpen(true)}>
              <Plus className="h-4 w-4" /> Add Card
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {paymentMethods.map(pm => (
              <Card key={pm.id} className={cn('overflow-hidden transition-shadow hover:shadow-md', pm.isDefault && 'ring-1 ring-violet-500/40')}>
                <div className="flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                  <div>
                    <div className="text-xs text-slate-400">{pm.type.toUpperCase()}</div>
                    <div className="mt-2 font-mono text-lg tracking-widest">•••• •••• •••• {pm.last4}</div>
                    <div className="mt-1 text-xs text-slate-400">Expires {String(pm.expMonth).padStart(2, '0')}/{String(pm.expYear).slice(-2)}</div>
                  </div>
                  <CreditCard className="h-8 w-8 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-3">
                  {pm.isDefault ? (
                    <Badge variant="outline" className="gap-1 text-[10px] border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                      <Check className="h-2.5 w-2.5" /> Default
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDefault(pm.id)}>
                      Set as default
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info('Edit card', { description: pm.name })}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => removeCard(pm.id)} className="text-rose-600 dark:text-rose-400">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{t('billing.paymentSecurity')}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  All payments are processed via Stripe with PCI DSS Level 1 compliance. We never store your card details on our servers.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">PCI DSS L1</Badge>
                  <Badge variant="outline" className="text-[10px]">3D Secure</Badge>
                  <Badge variant="outline" className="text-[10px]">Stripe Radar</Badge>
                  <Badge variant="outline" className="text-[10px]">Apple Pay</Badge>
                  <Badge variant="outline" className="text-[10px]">Google Pay</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add card dialog (simulated) */}
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Powered by Stripe · PCI DSS Level 1</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
              <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
              Stripe Elements will load here in production
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCardOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { toast.success('Card added', { description: 'New Visa ending in 1234' }); setAddCardOpen(false) }} className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
