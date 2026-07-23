import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const databases = await db.database.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ databases })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const ports: Record<string, number> = {
      postgresql: 5432, mysql: 3306, redis: 6379, mongodb: 27017, mariadb: 3307, sqlite: 0,
    }
    const database = await db.database.create({
      data: {
        name: body.name,
        engine: body.engine,
        version: body.version || 'latest',
        region: body.region || 'fra1',
        status: 'creating',
        size: body.size || 1,
        usedMb: 0,
        connections: 0,
        maxConnections: body.maxConnections || 100,
        host: `db-${body.name.toLowerCase()}.internal.nexora.app`,
        port: ports[body.engine] || 5432,
        username: body.username || 'admin',
        password: '••••••••••••',
        ssl: body.ssl !== false,
        backupEnabled: body.backupEnabled !== false,
        userId: owner.id,
      },
    })

    // Simulate provision: mark running after 2s
    setTimeout(async () => {
      try {
        await db.database.update({ where: { id: database.id }, data: { status: 'running' } })
      } catch {}
    }, 2000)

    await db.activity.create({
      data: {
        action: 'create_db',
        resource: 'database',
        resourceId: database.id,
        detail: `Created ${body.engine} database ${body.name}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    return NextResponse.json({ database })
  } catch (e) {
    console.error('POST /api/databases error:', e)
    return NextResponse.json({ error: 'Failed to create database' }, { status: 500 })
  }
}
