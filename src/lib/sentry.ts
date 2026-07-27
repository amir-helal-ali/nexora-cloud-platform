/**
 * Sentry Error Monitoring Integration
 * 
 * This module provides a lightweight Sentry wrapper that initializes
 * error tracking when SENTRY_DSN is configured.
 * 
 * Usage:
 * 1. Set SENTRY_DSN in your .env file
 * 2. Import { captureError, captureMessage } from '@/lib/sentry'
 * 3. Call captureError(error) in catch blocks
 * 
 * In production, this automatically sends errors to Sentry.
 * In development (no SENTRY_DSN), it's a no-op.
 */

interface SentryLike {
  captureException: (error: Error | string, context?: Record<string, any>) => void
  captureMessage: (message: string, level?: string) => void
  setUser: (user: { id: string; email: string } | null) => void
  addBreadcrumb: (crumb: { message: string; category?: string; level?: string }) => void
}

// No-op Sentry implementation (when DSN is not configured)
const noopSentry: SentryLike = {
  captureException: (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Sentry noop] Error:', error)
    }
  },
  captureMessage: (message, level) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Sentry noop] ${level || 'info'}: ${message}`)
    }
  },
  setUser: () => {},
  addBreadcrumb: () => {},
}

// Lazy-loaded Sentry instance
let sentryInstance: SentryLike = noopSentry
let initialized = false

/**
 * Initialize Sentry (called once on app start)
 */
export async function initSentry() {
  if (initialized) return sentryInstance
  initialized = true

  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.log('[Sentry] No SENTRY_DSN configured — running in no-op mode')
    return sentryInstance
  }

  try {
    // Dynamic import to avoid loading Sentry when not needed
    const Sentry = await import('@sentry/node')

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.prismaIntegration(),
      ],
    })

    sentryInstance = {
      captureException: (error, context) => {
        if (context) Sentry.getCurrentScope().setContext('extra', context)
        Sentry.captureException(error)
      },
      captureMessage: (message, level) => {
        Sentry.captureMessage(message, level as any)
      },
      setUser: (user) => {
        if (user) {
          Sentry.getCurrentScope().setUser(user)
        } else {
          Sentry.getCurrentScope().setUser(null)
        }
      },
      addBreadcrumb: (crumb) => {
        Sentry.addBreadcrumb(crumb)
      },
    }

    console.log('[Sentry] Initialized successfully')
  } catch (e) {
    console.warn('[Sentry] Failed to initialize — running in no-op mode:', e)
  }

  return sentryInstance
}

/**
 * Capture an error and send to Sentry
 */
export function captureError(error: Error | string, context?: Record<string, any>) {
  return sentryInstance.captureException(error, context)
}

/**
 * Capture a message with optional severity level
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  return sentryInstance.captureMessage(message, level)
}

/**
 * Set the current user for error attribution
 */
export function setSentryUser(user: { id: string; email: string } | null) {
  return sentryInstance.setUser(user)
}

/**
 * Add a breadcrumb for tracing
 */
export function addBreadcrumb(message: string, category?: string, level?: string) {
  return sentryInstance.addBreadcrumb({ message, category, level })
}

/**
 * Get current Sentry instance (for advanced usage)
 */
export function getSentry() {
  return sentryInstance
}
