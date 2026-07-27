'use client'

import { Cloud, SearchX } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-muted-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Page Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-700"
        >
          <Cloud className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
