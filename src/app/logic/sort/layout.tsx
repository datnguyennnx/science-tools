import { Metadata } from 'next'
import { ReactNode } from 'react'

const pageUrl = 'https://data-science.hallucinationguys.com/logic/sort'

export const metadata: Metadata = {
  title: 'Sorting Algorithm Visualization | Interactive Learning Tool',
  description:
    'Explore and visualize various sorting algorithms like Merge Sort, Quick Sort, Bubble Sort, etc. Understand their mechanics with interactive animations and step-by-step explanations.',
  keywords: [
    'sorting algorithms',
    'visualization',
    'interactive sort',
    'data structures',
    'algorithms',
    'computer science',
    'education',
    'merge sort',
    'quick sort',
    'bubble sort',
    'insertion sort',
    'selection sort',
    'heap sort',
  ],
  openGraph: {
    title: 'Interactive Sorting Algorithm Visualization',
    description:
      'Visualize how different sorting algorithms work step-by-step. An educational tool for students and developers.',
    type: 'website',
    url: 'https://data-science.hallucinationguys.com/logic/sort',
    siteName: 'Science Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualize Sorting Algorithms Interactively',
    description:
      'See Merge Sort, Quick Sort, and more in action. A great tool for learning algorithm mechanics.',
    images: ['/images/og-sort.png'],
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
    icon: '/favicon.ico', // Ensure you have this file in your public folder
    apple: '/apple-touch-icon.png', // Ensure you have this file in your public folder
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

// Define LearningResource JSON-LD data for the Sort Visualization tool
const learningResourceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Interactive Sorting Algorithm Visualization',
  description:
    'Explore and visualize various sorting algorithms like Merge Sort, Quick Sort, Bubble Sort, etc. Understand their mechanics with interactive animations and step-by-step explanations.',
  keywords: metadata.keywords as string[],
  educationalUse: '["learning", "demonstration", "visualization"]',
  learningResourceType: '["interactive simulation", "educational tool"]',
  interactivityType: 'active',
  typicalAgeRange: '14-', // Example: 14 years and older
  url: pageUrl,
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
}

interface SortLayoutProps {
  children: ReactNode
}

export default function SortLayout({ children }: SortLayoutProps) {
  return (
    <section aria-label="Algorithm Visualization" className="p-4">
      {/* Add JSON-LD to the head of this layout/page segment */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="sort-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
        key="sort-learning-resource-jsonld"
      />
      {children}
    </section>
  )
}
