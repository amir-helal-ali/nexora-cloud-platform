import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit, schemas } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const validation = schemas.updateTeamMember.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 })
    }
    const data = validation.data
    const updated = await db.teamMember.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_member', category: 'team', resource: 'team', resourceId: id, ip: getClientIp(req), details: `Updated ${updated.name} role to ${body.role || updated.role}`, severity: 'info' })
    return NextResponse.json({ member: updated })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const member = await db.teamMember.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'remove_member', category: 'team', resource: 'team', resourceId: id, ip: getClientIp(req), details: `Removed team member: ${member.name}`, severity: 'warning' })
    return NextResponse.json({ ok: true })
  })
}
