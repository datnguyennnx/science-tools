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
  description:
    'A collection of interactive tools for science, math, and productivity. Explore sorting algorithms, boolean algebra, Pomodoro timers, and more.',
  keywords: [
    'science tools',
    'interactive learning',
    'STEM education',
    'developer tools',
    'math tools',
    'logic solver',
    'pomodoro technique',
    'algorithm visualization',
    'boolean algebra simplifier',
    'Karnaugh map',
    'truth table',
    'venn diagram',
  ],
  authors: [
    {
      name: 'Science Tools Team',
      url: 'https://data-science.hallucinationguys.com/',
    },
  ],
  category: 'Education',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://data-science.hallucinationguys.com/',
    siteName: 'Science Tools',
    title: 'Science Tools: Interactive Learning for Math & Logic',
    description:
      'Discover a suite of interactive tools for visualizing algorithms, simplifying boolean algebra, managing tasks with Pomodoro, and more. Perfect for students and developers.',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Science Tools - Interactive Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Science Tools: Interactive Learning for Math & Logic',
    description:
      'Explore interactive tools for algorithms, boolean algebra, and productivity on Science Tools.',
    images: ['/hero-images.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
          integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
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
