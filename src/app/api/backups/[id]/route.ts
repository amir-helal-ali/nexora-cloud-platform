import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const backup = await db.backup.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_backup', category: 'database', resource: 'backup', resourceId: id, ip: getClientIp(req), details: `Deleted backup: ${backup.name}`, severity: 'info' })
    return NextResponse.json({ ok: true })
  })
}
