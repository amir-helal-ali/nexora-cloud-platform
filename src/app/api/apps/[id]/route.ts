import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit, schemas } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const validation = schemas.updateApp.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 })
    }
    const data = validation.data
    const updated = await db.app.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_app', category: 'app', resource: 'app', resourceId: id, ip: getClientIp(req), details: `Updated ${updated.name} status to ${body.status || 'updated'}`, severity: 'info' })
    return NextResponse.json({ app: updated })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const app = await db.app.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_app', category: 'app', resource: 'app', resourceId: id, ip: getClientIp(req), details: `Deleted app: ${app.name}`, severity: 'warning' })
    return NextResponse.json({ ok: true, deleted: app.name })
  })
}
