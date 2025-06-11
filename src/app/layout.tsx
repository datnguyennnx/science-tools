import type { Metadata, Viewport } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { CommandProvider } from '@/app/_command-manager/CommandProvider'
import { GlobalClientEffects } from '@/components/global-client-effects'
import './globals.css'

const websiteUrl = 'https://data-science.hallucinationguys.com'

export const metadata: Metadata = {
  metadataBase: new URL(websiteUrl),
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

// Define Organization JSON-LD data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Science Tools',
  url: websiteUrl,
}

// Define WebSite JSON-LD data
const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Science Tools',
  url: websiteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${websiteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Science Tools',
    logo: {
      '@type': 'ImageObject',
    },
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
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        {/* Add JSON-LD to the head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
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
          <CommandProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="p-2 w-full min-h-screen">
                <div>{children}</div>
              </main>
            </SidebarProvider>
            <GlobalClientEffects />
          </CommandProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
