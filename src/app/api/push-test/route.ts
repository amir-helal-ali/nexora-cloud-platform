import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json().catch(() => ({}))
    const notif = await db.notification.create({
      data: {
        userId, title: body.title || 'Test Push Notification',
        message: body.message || 'This is a test push from Nexora Cloud.',
        type: body.type || 'info', channel: 'push', status: 'delivered',
        recipients: 4, delivered: 4, opened: 0,
        payload: JSON.stringify({ source: 'manual-test', priority: 'normal' }),
      },
    })
    await logAudit({ db, userId, actor: userEmail, action: 'send_push', category: 'notification', resource: 'notification', resourceId: notif.id, ip: getClientIp(req), details: `Sent test push: ${notif.title}`, severity: 'info' })
    return NextResponse.json({ notification: notif })
  })
}
