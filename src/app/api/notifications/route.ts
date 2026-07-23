import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const notifications = await db.notification.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ notifications })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const notif = await db.notification.create({
      data: {
        userId: owner.id,
        title: body.title,
        message: body.message,
        type: body.type || 'info',
        channel: body.channel || 'push',
        status: 'delivered',
        recipients: body.recipients || 4,
        delivered: body.recipients || 4,
        opened: 0,
        payload: JSON.stringify({ source: 'manual', priority: 'normal' }),
      },
    })

    return NextResponse.json({ notification: notif })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
