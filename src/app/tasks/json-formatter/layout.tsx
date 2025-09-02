import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/json-formatter'

export const metadata: Metadata = {
  title: 'JSON Formatter - Online JSON Validator, Beautifier & Minifier Tool',
  description:
    'Free online JSON formatter and validator. Beautify, minify, validate and format JSON data with syntax highlighting, error detection, and real-time preview. Perfect for developers, API testing, and data analysis.',
  keywords: [
    'json formatter online',
    'json validator',
    'json beautifier',
    'json pretty print',
    'json minifier',
    'json syntax highlighter',
    'json parser',
    'json validator online',
    'format json',
    'validate json',
    'json lint',
    'json editor',
    'api json formatter',
    'json data formatting',
    'json file validator',
    'json syntax checker',
    'json beautify online',
    'json minify online',
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
    title: 'JSON Formatter | Online JSON Validator, Beautifier & Minifier',
    description:
      'Free online JSON formatter and validator. Beautify, minify, validate and format JSON data with syntax highlighting, error detection, and real-time preview.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'JSON Formatter - Online JSON Validator and Beautifier Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter | Online JSON Validator, Beautifier & Minifier',
    description:
      'Free online JSON formatter and validator. Beautify, minify, validate and format JSON data with syntax highlighting.',
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
  classification: 'JSON formatting and validation tool',
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

// Define WebPage JSON-LD data
const webPageJsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: metadata.title as string,
  description: metadata.description as string,
  url: pageUrl,
  inLanguage: 'en-US',
  datePublished: '2025-09-02',
  dateModified: new Date().toISOString().split('T')[0],
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'JSON Formatter Online',
    description: 'Professional JSON formatting and validation tool',
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
        name: 'JSON Formatter',
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

// Define SoftwareApplication JSON-LD data for the JSON Formatter
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JSON Formatter Online - Validator, Beautifier & Minifier',
  description:
    'Professional online JSON formatter and validator tool. Features real-time formatting, syntax validation, beautification, minification, and advanced error detection. Perfect for developers, API testing, and data processing.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: pageUrl,
  applicationSubCategory: 'JSON Processing Tool',
  softwareVersion: '2.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2025-09-02',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Real-time JSON formatting and validation',
    'Syntax highlighting with multiple themes',
    'Advanced error detection and suggestions',
    'Multiple indentation options (2, 4, 8 spaces)',
    'Compact and pretty print modes',
    'Key sorting and alphabetical ordering',
    'Comment removal and cleanup',
    'File upload and download support',
    'Large file handling with virtualization',
    'Copy to clipboard functionality',
    'Line numbers and error highlighting',
    'Responsive design for all devices',
    'Keyboard shortcuts support',
    'Dark and light theme support',
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

interface JsonFormatterLayoutProps {
  children: ReactNode
}

export default function JsonFormatterLayout({ children }: JsonFormatterLayoutProps) {
  return (
    <section
      aria-label="JSON Formatter and Validator - Format, validate, and beautify JSON data"
      className="flex flex-col w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* Enhanced JSON-LD structured data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="json-formatter-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="json-formatter-softwareapp-jsonld"
      />

      {/* Add FAQ structured data for common JSON formatting questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is JSON formatting?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'JSON formatting is the process of organizing JSON data in a readable, structured format with proper indentation, making it easier for developers to read and debug.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does JSON validation work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'JSON validation checks if the JSON data follows proper syntax rules, including correct brackets, commas, quotes, and data types. Our tool provides real-time validation with detailed error messages.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I upload and download JSON files?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, our JSON formatter supports file upload and download. You can upload .json or .txt files, format them, and download the results as formatted JSON files.',
                },
              },
            ],
          }),
        }}
        key="json-formatter-faq-jsonld"
      />

      {children}
    </section>
  )
}
