import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const routes = await db.gatewayRoute.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ routes })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createGatewayRoute, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const route = await db.gatewayRoute.create({
      data: {
        path: data.path,
        method: data.method,
        targetApp: data.targetApp,
        targetPath: data.targetPath,
        auth: data.auth,
        rateLimit: data.rateLimit,
        timeoutMs: data.timeoutMs,
        cacheEnabled: data.cacheEnabled,
        corsEnabled: data.corsEnabled,
        userId,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_route', category: 'config', resource: 'gateway_route', resourceId: route.id,
      ip: getClientIp(req), details: `Created route: ${data.method} ${data.path}`,
      severity: 'info',
    })

    return NextResponse.json({ route }, { status: 201 })
  })
}
