import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  avatar: z.string().optional(),
})

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get API keys
    const apiKeys = await db.apiKey.findMany({
      where: { userId },
      select: { id: true, name: true, keyPreview: true, createdAt: true, lastUsed: true },
    })

    return NextResponse.json({ user, apiKeys })
  })
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = profileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'update_profile', category: 'config', resource: 'user', resourceId: userId,
      ip: getClientIp(req), details: `Updated profile: ${data.name}`,
      severity: 'info',
    })

    return NextResponse.json({ user: updated })
  })
}

export async function POST(req: NextRequest) {
  // Generate API key
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json().catch(() => ({}))
    const keyName = body.name || 'New API Key'

    // Generate a random API key
    const crypto = await import('crypto')
    const rawKey = `nx_live_sk_${crypto.randomBytes(16).toString('hex')}`
    const keyPreview = rawKey.slice(-4)
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex')

    const apiKey = await db.apiKey.create({
      data: {
        name: keyName,
        key: hashedKey,
        keyPreview,
        userId,
      },
    })

    await logAudit({
      db, userId, actor: userEmail,
      action: 'generate_api_key', category: 'security', resource: 'api_key', resourceId: apiKey.id,
      ip: getClientIp(req), details: `Generated API key: ${keyName}`,
      severity: 'warning',
    })

    return NextResponse.json({
      apiKey,
      rawKey, // Only shown once
    }, { status: 201 })
  })
}
