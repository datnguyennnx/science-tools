import { Metadata } from 'next'
import { ReactNode } from 'react'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/keyboard'

export const metadata: Metadata = {
  title: 'Typing Test - Keyboard Speed & Accuracy',
  description:
    'Test and improve your typing speed and accuracy with our interactive keyboard typing test. Get detailed WPM and CPM analytics.',
  keywords: [
    'typing test',
    'keyboard test',
    'typing speed',
    'WPM test',
    'CPM test',
    'accuracy test',
    'typing practice',
    'keyboard skills',
  ],
  openGraph: {
    title: 'Typing Test | Keyboard Speed & Accuracy Challenge',
    description:
      'Measure and enhance your typing skills. Track WPM, CPM, and accuracy. Ideal for practice and skill improvement.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typing Test | Keyboard Speed & Accuracy Challenge',
    description:
      'Test your typing speed and accuracy. Get detailed performance metrics and improve your keyboard skills.',
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
const webPageJsonLd = {
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

// Define SoftwareApplication JSON-LD data for the Typing Test
const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Keyboard Typing Test',
  description:
    'An interactive application to test and improve typing speed (WPM), characters per minute (CPM), and accuracy.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'Utilities',
  operatingSystem: 'Web',
  url: pageUrl,
  featureList: [
    'Words Per Minute (WPM) calculation',
    'Characters Per Minute (CPM) calculation',
    'Typing accuracy measurement',
    'Real-time feedback',
    'Performance analytics over time',
    'Randomized text generation',
    'Keyboard shortcuts for navigation (Retry, New Test)',
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
}

interface KeyboardLayoutProps {
  children: ReactNode
}

export default function KeyboardLayout({ children }: KeyboardLayoutProps) {
  return (
    <section
      aria-label="Keyboard Typing Test Application" // More descriptive aria-label
      className="flex flex-col items-center w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* Add JSON-LD to the head of this layout/page segment */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="keyboard-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="keyboard-softwareapp-jsonld"
      />
      {children}
    </section>
  )
}
