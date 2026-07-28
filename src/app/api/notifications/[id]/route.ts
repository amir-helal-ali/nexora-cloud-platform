import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const notif = await db.notification.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_notification', category: 'notification', resource: 'notification', resourceId: id, ip: getClientIp(req), details: `Updated notification: ${notif.title}`, severity: 'info' })
    return NextResponse.json({ notification: notif })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const notif = await db.notification.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_notification', category: 'notification', resource: 'notification', resourceId: id, ip: getClientIp(req), details: `Deleted notification: ${notif.title}`, severity: 'info' })
    return NextResponse.json({ ok: true })
  })
}
