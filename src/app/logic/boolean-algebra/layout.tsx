import { Metadata } from 'next'
import type { ReactNode } from 'react'
// Import centralized styles
import './styles.css'
// Import schema-dts types
import type { WebPage, LearningResource, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/logic/boolean-algebra'

export const metadata: Metadata = {
  title: 'Boolean Algebra Simplifier',
  description:
    'Simplify boolean expressions, visualize with K-maps, and learn boolean algebra laws and theorems',
  keywords: [
    'boolean algebra',
    'logic',
    'simplification',
    'k-map',
    'karnaugh map',
    'truth tables',
    'venn diagram',
  ],
  openGraph: {
    title: 'Boolean Algebra Simplifier Tool',
    description: 'Simplify boolean expressions and visualize with interactive tools',
    type: 'website',
    url: 'https://data-science.hallucinationguys.com/logic/boolean-algebra',
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boolean Algebra Simplifier Tool',
    description:
      'Simplify boolean expressions and visualize with interactive K-maps and truth tables.',
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

// Define LearningResource JSON-LD data for the Boolean Algebra tool
const learningResourceJsonLd: WithContext<LearningResource> = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Boolean Algebra Simplifier Tool',
  description:
    'An interactive tool to simplify boolean expressions, visualize with K-maps, truth tables, and Venn diagrams, and learn boolean algebra laws.',
  keywords: metadata.keywords as string[],
  educationalUse: ['learning', 'demonstration', 'homework'],
  learningResourceType: ['interactive simulation', 'problem solver'],
  interactivityType: 'active',
  url: pageUrl,
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  } as Organization,
}

interface BooleanAlgebraLayoutProps {
  children: ReactNode
}

export default function BooleanAlgebraLayout({ children }: BooleanAlgebraLayoutProps) {
  return (
    <section aria-label="Boolean Algebra Tool" className="flex flex-col h-full p-2 sm:p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="boolean-algebra-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
        key="boolean-algebra-learning-resource-jsonld"
      />
      <header className="w-full flex items-center justify-between mb-1 sm:mb-2 pt-1 sm:pt-2">
        <h1 className="text-lg sm:text-xl font-bold text-[--color-foreground]">
          Boolean Algebra Simplifier
        </h1>
      </header>
      <main className="w-full overflow-auto flex-1">{children}</main>
      <footer className="ba-bg-background py-1 sm:py-2 mt-auto">
        <p className="ba-text-muted text-balance text-xs sm:text-sm text-center">
          This is a basic Boolean algebra simplifier. For complex expressions, consider using
          advanced simplification algorithms.
        </p>
      </footer>
    </section>
  )
}
