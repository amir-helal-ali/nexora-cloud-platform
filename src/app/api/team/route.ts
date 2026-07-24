import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const team = await db.teamMember.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ team })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const member = await db.teamMember.create({
      data: {
        userId: owner.id,
        email: body.email,
        name: body.name || body.email.split('@')[0],
        role: body.role || 'developer',
        status: 'pending',
      },
    })

    await db.activity.create({
      data: {
        action: 'invite',
        resource: 'team',
        resourceId: member.id,
        detail: `Invited ${body.email} as ${body.role || 'developer'}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    return NextResponse.json({ member })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
