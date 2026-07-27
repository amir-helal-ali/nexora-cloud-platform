import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Generate a short-lived WebSocket auth token for the realtime service.
 * The realtime service validates this token before allowing connections.
 * Tokens expire after 1 hour.
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production-32chars' })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const crypto = await import('crypto')
  const wsToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 3600000

  return NextResponse.json({
    token: wsToken,
    expiresAt,
    endpoint: process.env.REALTIME_URL || 'http://localhost:3003',
  })
}
