import { ReactNode } from 'react'
import { Metadata } from 'next'
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/url-preview'

export const metadata: Metadata = {
  title: 'URL Previewer | Social Media Snippet Simulator',
  description:
    'See how your links will appear on different social platforms. Our URL Previewer simulates snippets for Facebook, Twitter, LinkedIn, and more.',
  keywords: [
    'url previewer',
    'social media preview',
    'link preview',
    'seo tools',
    'snippet generator',
    'open graph',
    'twitter card',
  ],
  openGraph: {
    title: 'URL Previewer | See How Your Links Look When Shared',
    description:
      'Optimize your social media sharing by previewing your links for Facebook, Twitter, LinkedIn, and more before you post.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Previewer | See How Your Links Look When Shared',
    description:
      'Optimize your social media sharing by previewing your links for Facebook, Twitter, LinkedIn, and more before you post.',
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
  alternates: {
    canonical: pageUrl,
  },
}

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

const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'URL Previewer',
  description:
    'See how your links will appear on different social platforms. Our URL Previewer simulates snippets for Facebook, Twitter, LinkedIn, and more.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'DeveloperTool',
  operatingSystem: 'Web',
  url: pageUrl,
  featureList: [
    'Simulate social media snippets',
    'Preview Open Graph data',
    'Preview Twitter Card data',
    'Supports Facebook, Twitter, Google, LinkedIn, Reddit, Discord',
    'Real-time SEO analysis',
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  } as Organization,
}

interface UrlPreviewLayoutProps {
  children: ReactNode
}

export default function UrlPreviewLayout({ children }: UrlPreviewLayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="url-preview-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="url-preview-softwareapp-jsonld"
      />
      {children}
    </>
  )
}
