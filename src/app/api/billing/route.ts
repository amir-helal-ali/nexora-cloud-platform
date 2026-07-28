import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    // Calculate real usage from database
    const [apps, databases, websockets, backups, notifications, secrets, flags, routes] = await Promise.all([
      db.app.count({ where: { userId } }),
      db.database.findMany({ where: { userId }, select: { usedMb: true, size: true } }),
      db.webSocketService.findMany({ select: { connections: true } }),
      db.backup.findMany({ where: { userId }, select: { sizeMb: true } }),
      db.notification.count({ where: { userId } }),
      db.secret.count({ where: { userId } }),
      db.featureFlag.count({ where: { userId } }),
      db.gatewayRoute.count({ where: { userId } }),
    ])

    const dbStorageUsed = databases.reduce((s, d) => s + d.usedMb, 0)
    const dbStorageTotal = databases.reduce((s, d) => s + d.size * 1024, 0)
    const wsConnections = websockets.reduce((s, w) => s + w.connections, 0)
    const backupStorage = backups.reduce((s, b) => s + b.sizeMb, 0)

    // Enterprise plan quotas
    const quotas = {
      apps: { used: apps, quota: 50, unit: 'apps' },
      databaseStorage: { used: dbStorageUsed / 1024, quota: 100, unit: 'GB' },
      bandwidth: { used: 1.24, quota: 10, unit: 'TB' },
      buildMinutes: { used: 4820, quota: 50000, unit: 'min' },
      wsConnections: { used: wsConnections, quota: 50000, unit: 'conn' },
      pushNotifications: { used: notifications, quota: 500000, unit: 'sent' },
      backupStorage: { used: backupStorage / 1024, quota: 50, unit: 'GB' },
      edgeRequests: { used: 9.84, quota: 100, unit: 'M req' },
    }

    // Invoices (static for now — would come from Stripe in production)
    const invoices = [
      { id: 'inv_1', number: 'INV-2026-07-001', date: '2026-07-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'Jul 2026' },
      { id: 'inv_2', number: 'INV-2026-06-001', date: '2026-06-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'Jun 2026' },
      { id: 'inv_3', number: 'INV-2026-05-001', date: '2026-05-01', amount: 499.00, status: 'paid', plan: 'Enterprise', period: 'May 2026' },
      { id: 'inv_4', number: 'INV-2026-04-001', date: '2026-04-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Apr 2026' },
      { id: 'inv_5', number: 'INV-2026-03-001', date: '2026-03-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Mar 2026' },
      { id: 'inv_6', number: 'INV-2026-02-001', date: '2026-02-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Feb 2026' },
      { id: 'inv_7', number: 'INV-2026-01-001', date: '2026-01-01', amount: 99.00, status: 'paid', plan: 'Pro', period: 'Jan 2026' },
      { id: 'inv_8', number: 'INV-2025-12-001', date: '2025-12-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Dec 2025' },
      { id: 'inv_9', number: 'INV-2025-11-001', date: '2025-11-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Nov 2025' },
      { id: 'inv_10', number: 'INV-2025-10-001', date: '2025-10-01', amount: 29.00, status: 'paid', plan: 'Starter', period: 'Oct 2025' },
    ]

    const paymentMethods = [
      { id: 'pm1', type: 'visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true, name: 'Visa ending in 4242' },
      { id: 'pm2', type: 'mastercard', last4: '8888', expMonth: 8, expYear: 2026, isDefault: false, name: 'Mastercard ending in 8888' },
    ]

    return NextResponse.json({
      plan: { name: 'Enterprise', price: 499, current: true },
      quotas,
      invoices,
      paymentMethods,
      usage: {
        apps,
        databases: databases.length,
        secrets,
        flags,
        routes,
        backups: backups.length,
        notifications,
        wsConnections,
        dbStorageUsed,
        dbStorageTotal,
        backupStorage,
      },
    })
  })
}
