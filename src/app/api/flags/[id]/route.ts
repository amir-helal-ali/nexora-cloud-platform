import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const flag = await db.featureFlag.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_flag', category: 'config', resource: 'feature_flag', resourceId: id, ip: getClientIp(req), details: `Updated flag: ${flag.key} (${JSON.stringify(body)})`, severity: 'info' })
    return NextResponse.json({ flag })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const flag = await db.featureFlag.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_flag', category: 'config', resource: 'feature_flag', resourceId: id, ip: getClientIp(req), details: `Deleted flag: ${flag.key}`, severity: 'warning' })
    return NextResponse.json({ ok: true })
  })
}
