import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/markdown'

export const metadata: Metadata = {
  title: 'Markdown Editor - Interactive Markdown with Diagrams & Math',
  description:
    'Create, edit, and preview markdown documents with support for mermaid diagrams, KaTeX math formulas, tables, and code highlighting.',
  keywords: [
    'markdown editor',
    'markdown preview',
    'mermaid diagrams',
    'KaTeX math',
    'code highlighting',
    'tables',
    'document editor',
    'technical writing',
  ],
  openGraph: {
    title: 'Markdown Editor | Interactive Markdown with Diagrams & Math',
    description:
      'Create and preview markdown documents with mermaid diagrams, KaTeX math formulas, tables, and code highlighting.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown Editor | Interactive Markdown with Diagrams & Math',
    description:
      'Create and preview markdown documents with mermaid diagrams, KaTeX math formulas, tables, and code highlighting.',
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

// Define SoftwareApplication JSON-LD data for the Markdown Editor
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Interactive Markdown Editor',
  description:
    'An interactive application to create and preview markdown documents with support for mermaid diagrams, KaTeX math formulas, tables, and code highlighting.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'Productivity',
  operatingSystem: 'Web',
  url: pageUrl,
  featureList: [
    'Live markdown preview',
    'Mermaid diagram rendering',
    'KaTeX math formula support',
    'Code syntax highlighting',
    'Table formatting',
    'File upload and download',
    'Fullscreen diagram viewing',
    'Zoom controls for diagrams',
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  } as Organization,
}

interface MarkdownLayoutProps {
  children: ReactNode
}

export default function MarkdownLayout({ children }: MarkdownLayoutProps) {
  return (
    <>
      {/* Add JSON-LD to the head of this layout/page segment */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="markdown-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="markdown-softwareapp-jsonld"
      />
      {children}
    </>
  )
}
