'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import {
  User, CreditCard, Bell, Shield, Globe, Key, Zap, Check, Crown,
} from 'lucide-react'

export function SettingsView() {
  const { t } = useI18n()
  const [profile, setProfile] = useState({ name: 'Ahmed Hassan', email: 'owner@nexora.app' })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.user) setProfile({ name: d.user.name, email: d.user.email })
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    const r = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (r.ok) toast.success(t('settings.saved'))
  }

  return (
    <div className="space-y-5">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account" className="gap-1.5"><User className="h-3.5 w-3.5" /> {t('settings.account')}</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {t('settings.billing')}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> {t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> {t('settings.security')}</TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5"><Key className="h-3.5 w-3.5" /> {t('settings.apiKeys')}</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('settings.profile')}</h3>
            <p className="text-xs text-muted-foreground">{t('settings.profileDesc')}</p>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">{t('settings.fullName')}</Label>
                <Input defaultValue={profile.name} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">{t('settings.email')}</Label>
                <Input defaultValue={profile.email} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">{t('settings.timezone')}</Label>
                <Select defaultValue="africa">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa">Africa/Cairo (GMT+2)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">America/New_York (EST)</SelectItem>
                    <SelectItem value="pst">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="cet">Europe/Berlin (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t('settings.defaultRegion')}</Label>
                <Select defaultValue="fra1">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fra1">Frankfurt, DE</SelectItem>
                    <SelectItem value="nyc1">New York, US</SelectItem>
                    <SelectItem value="sfo1">San Francisco, US</SelectItem>
                    <SelectItem value="sin1">Singapore, SG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white" onClick={handleSave}>
              {t('settings.saveChanges')}
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t('settings.organization')}</h3>
            <p className="text-xs text-muted-foreground">Manage your organization settings</p>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">{t('settings.organizationName')}</Label>
                <Input defaultValue="Nexora Cloud" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs">{t('settings.slug')}</Label>
                <Input defaultValue="nexora-cloud" className="mt-1.5" />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold">Enterprise Plan</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Your subscription renews on August 24, 2026</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$499<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <Button variant="outline" size="sm" className="mt-1" onClick={() => toast.info('Plan change unavailable', { description: 'Contact sales for enterprise changes' })}>
                    Change Plan
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
              {[
                { label: 'Apps', value: '7 / 50' },
                { label: 'Databases', value: '6 / 25' },
                { label: 'Bandwidth', value: '1.2 TB / 10 TB' },
                { label: 'Build minutes', value: '4,820 / 50,000' },
              ].map(q => (
                <div key={q.label} className="p-4">
                  <div className="text-xs text-muted-foreground">{q.label}</div>
                  <div className="mt-1 text-sm font-semibold tabular-nums">{q.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Available Plans</h3>
            <p className="text-xs text-muted-foreground">Compare features across tiers</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Free', price: '$0', features: ['1 app', '100MB storage', 'Community support'], current: false },
                { name: 'Starter', price: '$29', features: ['5 apps', '5GB storage', 'Email support', 'Custom domains'], current: false },
                { name: 'Pro', price: '$99', features: ['20 apps', '50GB storage', 'Priority support', 'Auto-scaling', 'Team members'], current: false },
                { name: 'Enterprise', price: '$499', features: ['Unlimited apps', '1TB storage', '24/7 support', 'Multi-region', 'SLA 99.99%'], current: true },
              ].map(plan => (
                <Card key={plan.name} className={plan.current ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20' : ''}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{plan.name}</span>
                      {plan.current && <Badge className="text-[10px] bg-emerald-500">Current</Badge>}
                    </div>
                    <div className="mt-2 text-xl font-bold">{plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                    <ul className="mt-3 space-y-1.5 text-[11px]">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Notification Preferences</h3>
            <p className="text-xs text-muted-foreground">Choose what triggers a push notification</p>
            <Separator className="my-4" />
            <div className="space-y-4">
              {[
                { label: 'Deployment events', desc: 'Get notified when a deploy starts, succeeds, or fails', on: true },
                { label: 'Auto-scale events', desc: 'When your app scales up or down due to traffic', on: true },
                { label: 'SSL & domain expiry', desc: 'Alerts 30 days before SSL certificates expire', on: true },
                { label: 'Database backups', desc: 'Confirmation when automatic backups complete', on: false },
                { label: 'High resource usage', desc: 'CPU or memory above 80% for 5+ minutes', on: true },
                { label: 'Team activity', desc: 'New member joins, role changes, logins', on: false },
                { label: 'Security alerts', desc: 'Suspicious logins, DDoS mitigation, API key usage', on: true },
                { label: 'Product updates', desc: 'New features, changelog, platform news', on: false },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Delivery Channels</h3>
            <p className="text-xs text-muted-foreground">How you receive notifications</p>
            <Separator className="my-4" />
            <div className="space-y-4">
              {[
                { label: 'Web Push', desc: 'Browser push notifications on your devices', on: true, icon: Bell },
                { label: 'Email', desc: 'owner@nexora.app', on: true, icon: Bell },
                { label: 'SMS', desc: '+20 ••• ••• ••92', on: false, icon: Bell },
                { label: 'Webhook', desc: 'https://hooks.nexora.app/notify', on: true, icon: Bell },
                { label: 'Slack', desc: '#alerts channel', on: true, icon: Bell },
              ].map(ch => (
                <div key={ch.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <ch.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{ch.label}</div>
                      <div className="text-xs text-muted-foreground">{ch.desc}</div>
                    </div>
                  </div>
                  <Switch defaultChecked={ch.on} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Two-Factor Authentication</h3>
            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Authenticator App</div>
                <div className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or 1Password</div>
              </div>
              <Badge className="bg-emerald-500">Enabled</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Backup Codes</div>
                <div className="text-xs text-muted-foreground">5 of 10 codes remaining</div>
              </div>
              <Button variant="outline" size="sm">Regenerate</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">Devices currently signed in to your account</p>
            <Separator className="my-4" />
            <div className="space-y-3">
              {[
                { device: 'MacBook Pro · Chrome', location: 'Cairo, Egypt', ip: '197.45.12.88', current: true, last: 'Active now' },
                { device: 'iPhone 15 Pro · Safari', location: 'Cairo, Egypt', ip: '197.45.12.91', current: false, last: '2 hours ago' },
                { device: 'Windows · Firefox', location: 'Dubai, UAE', ip: '94.205.34.12', current: false, last: '3 days ago' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.device}</span>
                      {s.current && <Badge className="text-[10px] bg-emerald-500">Current</Badge>}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.location} · {s.ip} · {s.last}</div>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400" onClick={() => toast.success('Session revoked')}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">API Keys</h3>
                <p className="text-xs text-muted-foreground">Use these to deploy from CLI and CI/CD</p>
              </div>
              <Button className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white" onClick={() => toast.success('API key generated', { description: 'nx_live_sk_••••••••••••••••' })}>
                <Key className="h-4 w-4" /> Generate Key
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {[
                { name: 'Production Deploy Key', key: 'nx_live_sk_a4f9c2e8b71d3', created: 'Jul 12, 2026', last: '2 hours ago' },
                { name: 'CI/CD GitHub Actions', key: 'nx_live_sk_f8c2d9102f4c8', created: 'Jun 28, 2026', last: '12 minutes ago' },
                { name: 'Local Development', key: 'nx_test_sk_91e3a7b5c2e8f', created: 'May 4, 2026', last: '3 days ago' },
              ].map(k => (
                <div key={k.key} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{k.name}</div>
                    <code className="text-[11px] text-muted-foreground">{k.key}••••</code>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">Created {k.created} · Last used {k.last}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400" onClick={() => toast.success('Key revoked')}>
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">CLI Quick Start</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Install the Nexora CLI and deploy from your terminal</p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] text-slate-100">
{`# Install
curl -fsSL https://nexora.app/install.sh | bash

# Login
nexora login --token nx_live_sk_••••

# Deploy
cd my-app/
nexora deploy --runtime rust --region fra1`}
                </pre>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
