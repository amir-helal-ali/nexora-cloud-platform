'use client'

import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { PushToaster } from './push-toaster'
import { useNexoraStore } from '@/lib/store'
import { useRealtime } from '@/hooks/use-realtime'
import { useLanguage } from '@/lib/language-store'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

import { OverviewView } from './views/overview-view'
import { AppsView } from './views/apps-view'
import { PipelinesView } from './views/pipelines-view'
import { AnalyticsView } from './views/analytics-view'
import { ScalingSimulatorView } from './views/scaling-simulator-view'
import { ApiGatewayView } from './views/api-gateway-view'
import { FeatureFlagsView } from './views/feature-flags-view'
import { ServiceMeshView } from './views/service-mesh-view'
import { DatabasesView } from './views/databases-view'
import { WebSocketsView } from './views/websockets-view'
import { NotificationsView } from './views/notifications-view'
import { BackupsView } from './views/backups-view'
import { SecretsView } from './views/secrets-view'
import { CdnView } from './views/cdn-view'
import { MonitoringView } from './views/monitoring-view'
import { AuditLogView } from './views/audit-log-view'
import { MarketplaceView } from './views/marketplace-view'
import { BillingView } from './views/billing-view'
import { DomainsView } from './views/domains-view'
import { DeploymentsView } from './views/deployments-view'
import { LogsView } from './views/logs-view'
import { TeamView } from './views/team-view'
import { SettingsView } from './views/settings-view'
import { CommandPalette } from './command-palette'

export function DashboardShell() {
  const { view, sidebarOpen } = useNexoraStore()
  const { connected } = useRealtime()
  const { isRTL } = useLanguage()
  const { t } = useI18n()
  const rtl = isRTL()

  // Close sidebar on view change for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      useNexoraStore.setState({ sidebarOpen: false })
    }
  }, [view])

  // Padding direction: in RTL use pe-72 (padding-inline-end), in LTR use pl-72
  const paddingClass = rtl
    ? (sidebarOpen ? 'lg:pe-72' : 'lg:pe-0')
    : (sidebarOpen ? 'lg:pl-72' : 'lg:pl-0')

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-violet-50/30 dark:from-emerald-950/10 dark:to-violet-950/10" />
        <div className="absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <Sidebar />

      {/* Main */}
      <div className={cn('flex min-h-screen flex-col transition-all duration-300', paddingClass)}>
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {view === 'overview' && <OverviewView />}
            {view === 'apps' && <AppsView />}
            {view === 'pipelines' && <PipelinesView />}
            {view === 'analytics' && <AnalyticsView />}
            {view === 'simulator' && <ScalingSimulatorView />}
            {view === 'gateway' && <ApiGatewayView />}
            {view === 'flags' && <FeatureFlagsView />}
            {view === 'mesh' && <ServiceMeshView />}
            {view === 'databases' && <DatabasesView />}
            {view === 'websockets' && <WebSocketsView />}
            {view === 'notifications' && <NotificationsView />}
            {view === 'backups' && <BackupsView />}
            {view === 'secrets' && <SecretsView />}
            {view === 'cdn' && <CdnView />}
            {view === 'monitoring' && <MonitoringView />}
            {view === 'audit' && <AuditLogView />}
            {view === 'marketplace' && <MarketplaceView />}
            {view === 'billing' && <BillingView />}
            {view === 'domains' && <DomainsView />}
            {view === 'deployments' && <DeploymentsView />}
            {view === 'logs' && <LogsView />}
            {view === 'team' && <TeamView />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/60 bg-card/30 px-6 py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span>{t('footer.copyright')}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
                {connected ? t('footer.realtimeConnected') : t('footer.reconnecting')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-foreground">{t('footer.documentation')}</a>
              <a href="#" className="hover:text-foreground">{t('footer.status')}</a>
              <a href="#" className="hover:text-foreground">{t('footer.support')}</a>
              <span>·</span>
              <span>v2.4.1</span>
            </div>
          </div>
        </footer>
      </div>

      <PushToaster />
      <CommandPalette />
    </div>
  )
}
