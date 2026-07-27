import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validateBody, getClientIp } from '@/lib/api'
import { schemas, logAudit } from '@/lib/security'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const domains = await db.domain.findMany({
      where: { userId },
      include: { targetApp: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ domains })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = validateBody(schemas.createDomain, body)
    if (!validation.success) return validation.response

    const data = validation.data
    const domain = await db.domain.create({
      data: {
        domain: data.domain,
        type: data.type,
        status: 'verifying',
        sslStatus: 'pending',
        autoRenew: data.autoRenew,
        nameservers: data.nameservers || null,
        targetAppId: data.targetAppId || null,
        userId,
      },
    })

    // Simulate DNS verification
    setTimeout(async () => {
      try {
        await db.domain.update({
          where: { id: domain.id },
          data: {
            status: 'active',
            sslStatus: 'active',
            sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            dnsVerified: true,
          },
        })
      } catch {}
    }, 3000)

    await logAudit({
      db, userId, actor: userEmail,
      action: 'add_domain', category: 'domain', resource: 'domain', resourceId: domain.id,
      ip: getClientIp(req), details: `Added domain: ${data.domain}`,
      severity: 'info',
    })

    return NextResponse.json({ domain }, { status: 201 })
  })
}
