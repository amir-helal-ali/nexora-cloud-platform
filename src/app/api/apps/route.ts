import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const apps = await db.app.findMany({
    include: {
      deployments: { take: 5, orderBy: { createdAt: 'desc' } },
      websockets: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ apps })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const app = await db.app.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        runtime: body.runtime,
        framework: body.framework || null,
        region: body.region || 'fra1',
        status: 'building',
        branch: body.branch || 'main',
        repoUrl: body.repoUrl || null,
        port: body.port || 3000,
        instances: 1,
        memoryLimit: body.memoryLimit || 512,
        cpuLimit: body.cpuLimit || 1,
        envCount: 0,
        userId: owner.id,
      },
    })

    await db.activity.create({
      data: {
        action: 'create_app',
        resource: 'app',
        resourceId: app.id,
        detail: `Created new ${body.runtime} app: ${body.name}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    return NextResponse.json({ app })
  } catch (e) {
    console.error('POST /api/apps error:', e)
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 })
  }
}
