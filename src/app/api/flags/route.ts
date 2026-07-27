import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const flags = await db.featureFlag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ flags })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createFlag, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const flag = await db.featureFlag.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        type: data.type,
        percentage: data.percentage,
        userId,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_flag', category: 'config', resource: 'feature_flag', resourceId: flag.id,
      ip: getClientIp(req), details: `Created flag: ${data.key}`,
      severity: 'info',
    })

    return NextResponse.json({ flag }, { status: 201 })
  })
}
