import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const domain = await db.domain.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_domain', category: 'domain', resource: 'domain', resourceId: id, ip: getClientIp(req), details: `Removed domain: ${domain.domain}`, severity: 'warning' })
    return NextResponse.json({ ok: true })
  })
}
