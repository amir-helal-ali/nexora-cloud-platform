import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const notifications = await db.notification.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ notifications })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createNotification, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const notif = await db.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        channel: data.channel,
        status: 'delivered',
        recipients: data.recipients,
        delivered: data.recipients,
        opened: 0,
        payload: JSON.stringify({ source: 'manual', priority: data.type === 'error' ? 'high' : 'normal' }),
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'send_push', category: 'notification', resource: 'notification', resourceId: notif.id,
      ip: getClientIp(req), details: `Sent ${data.channel} notification: ${data.title}`,
      severity: 'info',
    })

    return NextResponse.json({ notification: notif }, { status: 201 })
  })
}
