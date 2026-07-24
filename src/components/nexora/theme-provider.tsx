'use client'

import { useSyncExternalStore } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Hook for components that need to wait for client mount (avoids hydration mismatch).
// Uses useSyncExternalStore to avoid the "setState in effect" warning.
const emptySubscribe = () => () => {}
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // client snapshot
    () => false, // server snapshot
  )
}
