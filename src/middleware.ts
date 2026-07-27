export { default } from 'next-auth/middleware'

export const config = {
  // Protect all routes except: auth pages, API auth, static files, and the realtime socket endpoint
  matcher: [
    '/((?!login|register|api/auth|_next/static|_next/image|favicon.ico|logo.svg|realtime).*)',
  ],
}
