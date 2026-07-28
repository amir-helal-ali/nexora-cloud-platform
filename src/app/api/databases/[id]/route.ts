import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit, schemas } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const validation = schemas.updateDatabase.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 })
    }
    const data = validation.data
    const updated = await db.database.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_db', category: 'database', resource: 'database', resourceId: id, ip: getClientIp(req), details: `Updated database: ${updated.name}`, severity: 'info' })
    return NextResponse.json({ database: updated })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const db_ = await db.database.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_db', category: 'database', resource: 'database', resourceId: id, ip: getClientIp(req), details: `Deleted database: ${db_.name}`, severity: 'warning' })
    return NextResponse.json({ ok: true })
  })
}
