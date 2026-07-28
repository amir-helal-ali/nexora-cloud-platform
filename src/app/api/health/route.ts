import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const checks: Record<string, { status: string; latency?: number }> = {}
  let allHealthy = true

  // Check database
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    checks.database = { status: 'healthy', latency: Date.now() - start }
  } catch {
    checks.database = { status: 'unhealthy' }
    allHealthy = false
  }

  // Check realtime service
  try {
    const start = Date.now()
    const res = await fetch(`http://localhost:${process.env.REALTIME_PORT || 3003}/`, {
      signal: AbortSignal.timeout(3000),
    })
    checks.realtime = { status: res.ok ? 'healthy' : 'degraded', latency: Date.now() - start }
  } catch {
    checks.realtime = { status: 'unhealthy' }
    allHealthy = false
  }

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  )
}
