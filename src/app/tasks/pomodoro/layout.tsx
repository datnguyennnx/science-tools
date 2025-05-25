import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/pomodoro'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description:
    'Stay focused and boost productivity with our customizable Pomodoro Timer. Optimize your work sessions with timed intervals.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'time management', 'work sessions'],
  openGraph: {
    title: 'Pomodoro Timer | Focus & Productivity',
    description: 'Stay focused and boost productivity with our customizable Pomodoro Timer',
    type: 'website',
    url: 'https://data-science.hallucinationguys.com/tasks/pomodoro',
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Timer | Focus & Productivity',
    description: 'Stay focused and boost productivity with our customizable Pomodoro Timer.',
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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

// Define WebPage JSON-LD data
const webPageJsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: metadata.title as string,
  description: metadata.description as string,
  url: pageUrl,
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://data-science.hallucinationguys.com',
    name: 'Science Tools',
  },
}

// Define SoftwareApplication JSON-LD data for the Pomodoro Timer
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pomodoro Timer',
  description:
    'Stay focused and boost productivity with our customizable Pomodoro Timer. Optimize your work sessions with timed intervals.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'Productivity',
  operatingSystem: 'Web',
  url: pageUrl,
  featureList: [
    'Customizable work intervals',
    'Customizable break intervals',
    'Session tracking',
    'Keyboard shortcuts',
    'Full-screen mode',
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  } as Organization,
}

interface PomodoroLayoutProps {
  children: ReactNode
}

export default function PomodoroLayout({ children }: PomodoroLayoutProps) {
  return (
    <section aria-label="Pomodoro Timer Application" className="w-full">
      {/* Add JSON-LD to the head of this layout/page segment */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="pomodoro-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="pomodoro-softwareapp-jsonld"
      />
      <div className="container mx-auto py-4">{children}</div>
    </section>
  )
}
