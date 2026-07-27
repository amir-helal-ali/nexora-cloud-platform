import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const [
      apps,
      databases,
      domains,
      websockets,
      team,
      notifications,
      activities,
      secrets,
      featureFlags,
      backups,
      gatewayRoutes,
      auditLogs,
    ] = await Promise.all([
      db.app.findMany({ where: { userId }, include: { deployments: { take: 1, orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'asc' } }),
      db.database.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.domain.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.webSocketService.findMany({ include: { app: true } }),
      db.teamMember.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.notification.findMany({ where: { userId }, take: 20, orderBy: { createdAt: 'desc' } }),
      db.activity.findMany({ where: { userId }, take: 20, orderBy: { createdAt: 'desc' } }),
      db.secret.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.featureFlag.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.backup.findMany({ where: { userId }, take: 20, orderBy: { createdAt: 'desc' } }),
      db.gatewayRoute.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      db.auditLog.findMany({ where: { userId }, take: 20, orderBy: { timestamp: 'desc' } }),
    ])

    const runningApps = apps.filter(a => a.status === 'running').length
    const totalInstances = apps.reduce((s, a) => s + a.instances, 0)
    const totalMemory = apps.reduce((s, a) => s + a.memoryLimit * a.instances, 0)
    const totalCpu = apps.reduce((s, a) => s + a.cpuLimit * a.instances, 0)
    const storageUsed = databases.reduce((s, d) => s + d.usedMb, 0)
    const storageTotal = databases.reduce((s, d) => s + d.size * 1024, 0)
    const totalConnections = websockets.reduce((s, w) => s + w.connections, 0)
    const totalMsgPerSec = websockets.reduce((s, w) => s + w.messagesPerSec, 0)
    const sslActive = domains.filter(d => d.sslStatus === 'active').length
    const sslExpiringSoon = domains.filter(d => {
      if (!d.sslExpiry) return false
      const days = (d.sslExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return days < 30 && days > 0
    }).length

    const runtimeBreakdown = apps.reduce((acc, app) => {
      acc[app.runtime] = (acc[app.runtime] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      apps, databases, domains, websockets, team, notifications, activities,
      secrets, featureFlags, backups, gatewayRoutes, auditLogs,
      summary: {
        totalApps: apps.length,
        runningApps,
        stoppedApps: apps.filter(a => a.status === 'stopped').length,
        buildingApps: apps.filter(a => a.status === 'building').length,
        totalInstances,
        totalMemoryMb: totalMemory,
        totalCpuCores: totalCpu,
        totalDatabases: databases.length,
        runningDatabases: databases.filter(d => d.status === 'running').length,
        storageUsedMb: storageUsed,
        storageTotalMb: storageTotal,
        totalDomains: domains.length,
        sslActive,
        sslExpiringSoon,
        totalWebsockets: websockets.length,
        totalWsConnections: totalConnections,
        totalWsMsgPerSec: totalMsgPerSec,
        teamMembers: team.length,
        activeMembers: team.filter(t => t.status === 'active').length,
        pendingMembers: team.filter(t => t.status === 'pending').length,
        unreadNotifications: notifications.filter(n => n.opened < n.delivered).length,
        runtimeBreakdown,
        totalSecrets: secrets.length,
        totalFlags: featureFlags.length,
        totalBackups: backups.length,
        totalRoutes: gatewayRoutes.length,
        totalAuditEvents: auditLogs.length,
      },
    })
  })
}
