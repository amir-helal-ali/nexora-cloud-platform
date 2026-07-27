import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, schemas, logAudit } from '@/lib/security'
import { getClientIp } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = schemas.register.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, name, password } = validation.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const isFirstUser = (await db.user.count()) === 0

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: isFirstUser ? 'owner' : 'viewer',
        plan: isFirstUser ? 'enterprise' : 'free',
      },
    })

    await logAudit({
      db,
      userId: user.id,
      actor: email,
      action: 'register',
      category: 'auth',
      resource: 'user',
      resourceId: user.id,
      ip: getClientIp(req),
      details: `New user registered: ${name}`,
      severity: 'info',
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
