import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Send a test push notification through all channels
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const notif = await db.notification.create({
      data: {
        userId: owner.id,
        title: body.title || 'Test Push Notification',
        message: body.message || 'This is a test push from Nexora Cloud. If you can read this, your push setup is working.',
        type: body.type || 'info',
        channel: 'push',
        status: 'delivered',
        recipients: 4,
        delivered: 4,
        opened: 0,
        payload: JSON.stringify({ source: 'manual-test', priority: 'normal' }),
      },
    })

    await db.activity.create({
      data: {
        action: 'send_push',
        resource: 'notification',
        resourceId: notif.id,
        detail: `Sent test push: ${notif.title}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    return NextResponse.json({ notification: notif })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
