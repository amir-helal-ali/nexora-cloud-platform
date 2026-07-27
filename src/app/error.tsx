'use client'

import { Cloud, RefreshCw, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 px-4 dark:from-rose-950 dark:via-orange-950 dark:to-amber-950">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Our team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-left text-xs dark:border-rose-900 dark:bg-rose-950/40">
            <summary className="cursor-pointer font-semibold text-rose-700 dark:text-rose-300">
              Error details (dev only)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-all text-rose-600 dark:text-rose-400">
              {error.message}
              {error.digest ? `\nDigest: ${error.digest}` : ''}
              {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
          </details>
        )}

        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        <a
          href="/"
          className="mt-3 block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </a>

        <p className="mt-6 text-[10px] text-muted-foreground">
          <Cloud className="mr-1 inline h-3 w-3" />
          Nexora Cloud Platform
        </p>
      </div>
    </div>
  )
}
