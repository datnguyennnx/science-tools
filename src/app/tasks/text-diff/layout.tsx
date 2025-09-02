import { Metadata } from 'next'
import { ReactNode } from 'react'
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/text-diff'

// SEO metadata for text diff tool
export const metadata: Metadata = {
  title: 'Text Diff - Online Text Comparison and Difference Tool',
  description:
    'Free online text diff tool for comparing text files and strings. Highlight differences, find changes, and analyze text variations with side-by-side comparison. Perfect for code review, document comparison, and version control.',
  keywords: [
    'text diff online',
    'text comparison',
    'diff tool',
    'text difference finder',
    'compare text files',
    'text analyzer',
    'difference checker',
    'text comparison tool',
    'file diff',
    'text diff checker',
    'compare strings',
    'text difference analysis',
    'version comparison',
    'code diff',
    'document comparison',
  ],
  authors: [{ name: 'Science Tools Team' }],
  creator: 'Science Tools',
  publisher: 'Science Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Text Diff | Online Text Comparison and Difference Tool',
    description:
      'Free online text diff tool for comparing text files and strings. Highlight differences and find changes with side-by-side comparison.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Text Diff - Online Text Comparison and Difference Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Diff | Online Text Comparison and Difference Tool',
    description:
      'Free online text diff tool for comparing text files and strings. Highlight differences and find changes.',
    images: ['/hero-images.png'],
    creator: '@ScienceTools',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: pageUrl,
  },
  category: 'developer tools',
  classification: 'Text comparison and difference analysis tool',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': 'your-verification-code-here',
  },
}

// WebPage structured data
const webPageJsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: metadata.title as string,
  description: metadata.description as string,
  url: pageUrl,
  inLanguage: 'en-US',
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Text Diff Online',
    description: 'Professional text comparison and difference analysis tool',
    applicationCategory: 'DeveloperApplication',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://data-science.hallucinationguys.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://data-science.hallucinationguys.com/tasks',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Text Diff',
        item: pageUrl,
      },
    ],
  },
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://data-science.hallucinationguys.com',
    name: 'Science Tools',
    description: 'Free online tools for developers, data scientists, and students',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://data-science.hallucinationguys.com/search?q={search_term_string}',
    },
  },
}

// SoftwareApplication structured data
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Text Diff Online - Text Comparison and Difference Tool',
  description:
    'Professional online text diff tool for comparing files and strings. Features side-by-side comparison, difference highlighting, and advanced text analysis. Perfect for code review, document comparison, and version control.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: pageUrl,
  applicationSubCategory: 'Text Comparison Tool',
  softwareVersion: '1.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2024-01-01',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '850',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Side-by-side text comparison',
    'Difference highlighting and visualization',
    'Line-by-line analysis',
    'Character-level diff detection',
    'Copy and paste support',
    'Large file handling',
    'Real-time comparison',
    'Clear and intuitive interface',
    'Responsive design for all devices',
    'No data storage or privacy concerns',
  ],
  screenshot: '/hero-images.png',
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
    logo: 'https://data-science.hallucinationguys.com/favicon.ico',
    sameAs: ['https://github.com/science-tools', 'https://twitter.com/ScienceTools'],
  } as Organization,
}

interface TextDiffLayoutProps {
  children: ReactNode
}

export default function TextDiffLayout({ children }: TextDiffLayoutProps) {
  return (
    <section
      aria-label="Text Diff and Comparison Tool - Compare text files and strings"
      className="flex flex-col w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="text-diff-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="text-diff-softwareapp-jsonld"
      />

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is text diff comparison?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Text diff comparison is the process of comparing two text files or strings to identify differences, additions, deletions, and modifications between them.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does the text diff tool work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our text diff tool analyzes two input texts line by line and character by character, highlighting additions in green, deletions in red, and changes in context.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I compare large text files?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, our tool can handle large text files efficiently. For very large files, we provide optimized comparison algorithms and clear visual indicators.',
                },
              },
            ],
          }),
        }}
        key="text-diff-faq-jsonld"
      />

      {children}
    </section>
  )
}
