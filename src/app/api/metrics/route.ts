import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api'
import { formatMetrics, collectSystemMetrics, incrementCounter } from '@/lib/metrics'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    // Only allow owner/admin to view metrics
    const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Increment request counter
    incrementCounter('nexora_http_requests_total', 1, { method: 'GET', path: '/api/metrics' })

    // Collect current system metrics
    await collectSystemMetrics()

    // Collect application metrics from database
    const [appCount, dbCount, userCount, deploymentCount] = await Promise.all([
      db.app.count(),
      db.database.count(),
      db.user.count(),
      db.deployment.count(),
    ])

    // Application metrics
    const { setGauge } = await import('@/lib/metrics')
    setGauge('nexora_apps_total', appCount, undefined, 'Total number of apps')
    setGauge('nexora_databases_total', dbCount, undefined, 'Total number of databases')
    setGauge('nexora_users_total', userCount, undefined, 'Total number of users')
    setGauge('nexora_deployments_total', deploymentCount, undefined, 'Total number of deployments')

    // Return Prometheus format
    const metricsText = formatMetrics()
    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  })
}
