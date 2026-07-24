import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const domains = await db.domain.findMany({ include: { targetApp: true }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ domains })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const domain = await db.domain.create({
      data: {
        domain: body.domain,
        type: body.type || 'subdomain',
        status: 'verifying',
        sslStatus: 'pending',
        autoRenew: body.autoRenew !== false,
        nameservers: body.nameservers || null,
        targetAppId: body.targetAppId || null,
        userId: owner.id,
      },
    })

    // Simulate DNS verification after 3s
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

    await db.activity.create({
      data: {
        action: 'add_domain',
        resource: 'domain',
        resourceId: domain.id,
        detail: `Added domain ${body.domain}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    return NextResponse.json({ domain })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
