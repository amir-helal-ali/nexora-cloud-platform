import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit, schemas } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const backups = await db.backup.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ backups })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = schemas.createBackupRequest.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 })
    }
    const resource = body.resource || 'unknown'
    const type = body.type || 'manual'

    const backup = await db.backup.create({
      data: {
        name: `${resource}-${type}-${Date.now()}`,
        resourceName: resource,
        status: 'queued',
        type,
        userId,
        retentionDays: type === 'snapshot' ? 90 : 14,
        expiresAt: new Date(Date.now() + (type === 'snapshot' ? 90 : 14) * 86400000),
      },
    })

    // Simulate backup completion
    setTimeout(async () => {
      try {
        await db.backup.update({
          where: { id: backup.id },
          data: {
            status: 'completed',
            sizeMb: 500 + Math.floor(Math.random() * 800),
            durationSec: 30 + Math.floor(Math.random() * 60),
          },
        })
      } catch {}
    }, 4000)

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_backup', category: 'database', resource: 'backup', resourceId: backup.id,
      ip: getClientIp(req), details: `Queued backup: ${backup.name}`,
      severity: 'info',
    })

    return NextResponse.json({ backup }, { status: 201 })
  })
}
