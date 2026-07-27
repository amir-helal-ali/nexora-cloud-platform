import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit, encrypt } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const secrets = await db.secret.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ secrets })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createSecret, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const encryptedValue = encrypt(data.value)

    const secret = await db.secret.create({
      data: {
        key: data.key,
        value: encryptedValue,
        type: data.type,
        environment: data.environment,
        rotationDays: data.rotationDays,
        userId,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_secret', category: 'secret', resource: 'secret', resourceId: secret.id,
      ip: getClientIp(req), details: `Created secret: ${data.key}`,
      severity: 'warning',
    })

    return NextResponse.json({ secret }, { status: 201 })
  })
}
