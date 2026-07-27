import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/security'
import { db } from '@/lib/db'

export interface AuthenticatedRequest {
  req: NextRequest
  userId: string
  userEmail: string
  userRole: string
}

/**
 * Middleware: validates auth + rate limit + returns user info
 * Use at the top of every protected API route.
 */
export async function withAuth(
  req: NextRequest,
  handler: (ctx: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const userEmail = session.user.email || ''
    const userRole = (session.user as any).role || 'owner'

    // Rate limit: 100 requests per minute per user
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const identifier = `${userId}:${ip}`
    const rl = rateLimit(identifier, 100, 60000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMIT', resetAt: rl.resetAt },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const response = await handler({ req, userId, userEmail, userRole })
    response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
    response.headers.set('X-RateLimit-Reset', String(rl.resetAt))
    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 }
    )
  }
}

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or a 400 error response.
 */
export function validateBody<T>(schema: { safeParse: (d: unknown) => { success: boolean; data?: T; error?: { errors: { path: (string|number)[]; message: string }[] } } }, data: unknown): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Validation failed', code: 'VALIDATION', details: result.error?.errors.map(e => ({ path: e.path.join('.'), message: e.message })) },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data as T }
}

/**
 * Get the owner user (for seeding / system operations)
 */
export async function getOwner() {
  return db.user.findFirst({ where: { role: 'owner' } })
}

/**
 * Get client IP from request
 */
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Standard error response
 */
export function errorResponse(message: string, status: number = 500, code?: string) {
  return NextResponse.json({ error: message, code: code || 'ERROR' }, { status })
}

/**
 * Standard success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
