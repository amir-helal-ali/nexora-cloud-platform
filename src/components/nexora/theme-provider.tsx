'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Note: The previous `useMounted` hook was removed because conditional rendering
// based on mount status (e.g., `if (!mounted) return <placeholder />`) causes
// React useId counter shifts that break Radix UI hydration.
//
// Instead, always render the same DOM structure on server and client, and use
// CSS (e.g., Tailwind's `dark:` variant) or `suppressHydrationWarning` to
// handle client-only differences.
