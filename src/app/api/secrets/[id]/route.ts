import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()

    if (body.rotated) {
      const secret = await db.secret.update({
        where: { id },
        data: { lastRotated: new Date() },
      })
      await logAudit({
        db, userId, actor: userEmail,
        action: 'rotate_secret', category: 'secret', resource: 'secret', resourceId: id,
        ip: '', details: `Rotated secret: ${secret.key}`,
        severity: 'warning',
      })
      return NextResponse.json({ secret })
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const secret = await db.secret.delete({ where: { id } })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'delete_secret', category: 'secret', resource: 'secret', resourceId: id,
      ip: '', details: `Deleted secret: ${secret.key}`,
      severity: 'critical',
    })

    return NextResponse.json({ ok: true })
  })
}
