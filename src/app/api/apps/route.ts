import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const apps = await db.app.findMany({
      where: { userId },
      include: { deployments: { take: 5, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ apps })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createApp, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const app = await db.app.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        runtime: data.runtime,
        framework: data.framework || null,
        region: data.region,
        status: 'building',
        branch: data.branch,
        repoUrl: data.repoUrl || null,
        port: data.port,
        instances: 1,
        memoryLimit: data.memoryLimit,
        cpuLimit: data.cpuLimit,
        envCount: 0,
        userId,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_app', category: 'app', resource: 'app', resourceId: app.id,
      ip: getClientIp(req), details: `Created ${data.runtime} app: ${data.name}`,
      severity: 'info',
    })

    return NextResponse.json({ app }, { status: 201 })
  })
}
