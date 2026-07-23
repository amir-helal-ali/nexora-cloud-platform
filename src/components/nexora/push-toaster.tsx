'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50/95 text-amber-900 dark:border-amber-900 dark:bg-amber-950/95 dark:text-amber-100',
  error: 'border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-900 dark:bg-rose-950/95 dark:text-rose-100',
  info: 'border-sky-200 bg-sky-50/95 text-sky-900 dark:border-sky-900 dark:bg-sky-950/95 dark:text-sky-100',
}

const ICON_COLORS = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500',
  info: 'text-sky-500',
}

export function PushToaster() {
  const { pushNotifications, dismissNotification } = useRealtime()

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (pushNotifications.length === 0) return
    const t = setTimeout(() => {
      const oldest = pushNotifications[pushNotifications.length - 1]
      if (oldest) dismissNotification(oldest.id)
    }, 6000)
    return () => clearTimeout(t)
  }, [pushNotifications, dismissNotification])

  const visible = pushNotifications.slice(0, 4)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {visible.map((n) => {
          const Icon = ICONS[n.type] || Info
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-md',
                STYLES[n.type],
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ICON_COLORS[n.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{n.title}</p>
                <p className="mt-0.5 text-xs opacity-90">{n.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
