import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json()
    const route = await db.gatewayRoute.update({ where: { id }, data: body })
    await logAudit({ db, userId, actor: userEmail, action: 'update_route', category: 'config', resource: 'gateway_route', resourceId: id, ip: getClientIp(req), details: `Updated route: ${route.method} ${route.path}`, severity: 'info' })
    return NextResponse.json({ route })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const route = await db.gatewayRoute.delete({ where: { id } })
    await logAudit({ db, userId, actor: userEmail, action: 'delete_route', category: 'config', resource: 'gateway_route', resourceId: id, ip: getClientIp(req), details: `Deleted route: ${route.method} ${route.path}`, severity: 'warning' })
    return NextResponse.json({ ok: true })
  })
}
