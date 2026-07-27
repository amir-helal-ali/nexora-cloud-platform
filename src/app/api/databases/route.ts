import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const databases = await db.database.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ databases })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createDatabase, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const ports: Record<string, number> = {
      postgresql: 5432, mysql: 3306, redis: 6379, mongodb: 27017, mariadb: 3307, sqlite: 0,
    }
    const database = await db.database.create({
      data: {
        name: data.name,
        engine: data.engine,
        version: data.version || 'latest',
        region: data.region,
        status: 'creating',
        size: data.size,
        usedMb: 0,
        connections: 0,
        maxConnections: data.maxConnections,
        host: `db-${data.name.toLowerCase()}.internal.nexora.app`,
        port: ports[data.engine] || 5432,
        username: data.username,
        password: '••••••••••••',
        ssl: data.ssl,
        backupEnabled: data.backupEnabled,
        userId,
      },
    })

    // Simulate provision: mark running after 2s
    setTimeout(async () => {
      try {
        await db.database.update({ where: { id: database.id }, data: { status: 'running' } })
      } catch {}
    }, 2000)

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_db', category: 'database', resource: 'database', resourceId: database.id,
      ip: getClientIp(req), details: `Created ${data.engine} database: ${data.name}`,
      severity: 'info',
    })

    return NextResponse.json({ database }, { status: 201 })
  })
}
