import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export const metadata: Metadata = {
  title: {
    template: '%s | Science Tools',
    default: 'Science Tools',
  },
  description: 'A collection of interactive tools for science, math, and productivity',
  keywords: ['science', 'tools', 'productivity', 'mathematics', 'logic', 'pomodoro'],
  authors: [
    {
      name: 'Science Tools Team',
    },
  ],
  category: 'Education',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Science Tools',
    title: 'Science Tools',
    description: 'A collection of interactive tools for science, math, and productivity',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Science Tools',
    description: 'A collection of interactive tools for science, math, and productivity',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased" suppressHydrationWarning>
        <SpeedInsights />
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="p-2 w-full min-h-screen">
              <SidebarTrigger />
              <div>{children}</div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
