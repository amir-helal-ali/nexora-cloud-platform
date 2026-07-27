import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/nexora/theme-provider'
import { DirectionProvider } from '@/components/nexora/direction-provider'
import { Providers } from '@/components/nexora/providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexora Cloud — Multi-Runtime Hosting Platform",
  description: "Unified hosting platform for Rust, PHP, Next.js, WebSocket services, Push Notifications, and everything a professional web app needs.",
  keywords: ["Nexora", "Cloud Hosting", "Rust", "PHP", "Next.js", "WebSocket", "Push Notifications", "Multi-runtime", "منصة استضافة"],
  authors: [{ name: "Nexora Cloud" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Nexora Cloud — Multi-Runtime Hosting Platform",
    description: "Unified platform for Rust, PHP, Next.js, WebSocket, and Push Notifications",
    siteName: "Nexora Cloud",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground font-[var(--font-cairo)]`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <DirectionProvider>
              {children}
            </DirectionProvider>
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
