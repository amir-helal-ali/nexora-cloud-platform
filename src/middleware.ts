import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/api/health']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Check auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production-32chars' })

  if (!token) {
    // Redirect to login for page requests, 401 for API requests
    if (pathname.startsWith('/api/')) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
      )
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return addSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  return addSecurityHeaders(NextResponse.next())
}

/**
 * Add security headers to all responses
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  // HSTS only in production (behind HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
