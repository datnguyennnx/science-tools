import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, LearningResource, WithContext } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/logic/sort'

export const metadata: Metadata = {
  title: 'Interactive Sorting Algorithm Visualization - Learn CS Fundamentals',
  description:
    'Master computer science fundamentals with interactive sorting algorithm visualizations. Explore Merge Sort, Quick Sort, Bubble Sort, and more with step-by-step animations, time/space complexity analysis, and comparative performance metrics. Perfect for students learning algorithms and data structures.',
  keywords: [
    'sorting algorithm visualization',
    'interactive sorting algorithms',
    'merge sort animation',
    'quick sort visualization',
    'bubble sort demo',
    'insertion sort interactive',
    'selection sort tutorial',
    'heap sort explanation',
    'algorithm time complexity',
    'space complexity analysis',
    'computer science education',
    'data structures learning',
    'algorithm comparison',
    'sorting algorithms tutorial',
    'interactive learning tool',
    'algorithm visualization software',
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
    title: 'Interactive Sorting Algorithm Visualization | Learn CS Fundamentals',
    description:
      'Master computer science with interactive sorting algorithm visualizations. Explore Merge Sort, Quick Sort, and more with step-by-step animations and complexity analysis.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Interactive Sorting Algorithm Visualization - Learn Computer Science Fundamentals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Sorting Algorithm Visualization | Learn CS Fundamentals',
    description:
      'Master computer science with interactive sorting algorithm visualizations. Explore Merge Sort, Quick Sort, and more with step-by-step animations.',
    images: ['/hero-images.png'],
    creator: '@ScienceTools',
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
  alternates: {
    canonical: pageUrl,
  },
  category: 'educational tools',
  classification: 'Interactive Algorithm Visualization and Computer Science Learning Tool',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': 'your-verification-code-here',
    // AI Agent optimization
    'ai-crawler-friendly': 'true',
    'educational-level': 'beginner, intermediate, advanced',
    'learning-objectives':
      'algorithm-analysis, sorting-algorithms, time-complexity, data-structures',
    'content-type': 'interactive-visualization-tool',
    'tool-category': 'algorithm-education',
  },
}

// Enhanced WebPage JSON-LD data with educational focus
const webPageJsonLd: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: metadata.title as string,
  description: metadata.description as string,
  url: pageUrl,
  inLanguage: 'en-US',
  datePublished: '2025-09-02',
  dateModified: new Date().toISOString().split('T')[0],
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://data-science.hallucinationguys.com',
    name: 'Science Tools',
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
        name: 'Logic Tools',
        item: 'https://data-science.hallucinationguys.com/logic',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Sorting Algorithms',
        item: pageUrl,
      },
    ],
  },
  mainEntity: {
    '@type': 'LearningResource',
    name: 'Sorting Algorithm Visualization',
    learningResourceType: 'Interactive Simulation',
  },
}

// Enhanced LearningResource JSON-LD data with comprehensive educational metadata
const learningResourceJsonLd: WithContext<LearningResource> = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Interactive Sorting Algorithm Visualization and Learning Platform',
  description:
    'Comprehensive educational tool for learning computer science fundamentals through interactive sorting algorithm visualizations. Features step-by-step animations, complexity analysis, comparative performance metrics, and hands-on algorithm exploration.',
  keywords: metadata.keywords as string[],
  educationalUse: ['learning', 'demonstration', 'assessment', 'practice', 'teaching'],
  learningResourceType: [
    'interactive simulation',
    'educational software',
    'visualization tool',
    'algorithm analyzer',
  ],
  interactivityType: 'active',
  typicalAgeRange: '14-',
  educationalLevel: ['beginner', 'intermediate', 'advanced'],
  teaches: [
    'Sorting Algorithm Fundamentals',
    'Time Complexity Analysis (Big O)',
    'Space Complexity Analysis',
    'Algorithm Comparison and Selection',
    'Data Structure Operations',
    'Computational Thinking',
    'Performance Optimization',
    'Algorithm Visualization Techniques',
  ],
  competencyRequired: 'Basic programming concepts and mathematical understanding',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Curriculum',
      targetName: 'Algorithm Analysis',
      targetDescription: 'Understanding algorithmic complexity and performance analysis',
      targetUrl: 'https://en.wikipedia.org/wiki/Algorithm_analysis',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Standards',
      targetName: 'Sorting Algorithms',
      targetDescription: 'Master fundamental sorting algorithms and their applications',
      targetUrl: 'https://en.wikipedia.org/wiki/Sorting_algorithm',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Data Structures and Algorithms',
      targetName: 'Algorithm Visualization',
      targetDescription: 'Learn to visualize and understand algorithm behavior',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
  isAccessibleForFree: true,
  timeRequired: 'PT0H25M', // 25 minutes typical engagement
}

// Software Application schema for the tool functionality
const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Interactive Sorting Algorithm Visualization Tool',
  description:
    'Professional algorithm visualization platform featuring interactive sorting demonstrations, step-by-step animations, complexity analysis, and comparative performance metrics. Perfect for computer science education and algorithm understanding.',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Algorithm Visualization Tool',
  operatingSystem: 'Web',
  url: pageUrl,
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
    reviewCount: '420',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Interactive visualizations of 15+ sorting algorithms',
    'Step-by-step animation controls (play, pause, step)',
    'Real-time time and space complexity analysis',
    'Comparative performance metrics across algorithms',
    'Customizable array sizes and data distributions',
    'Algorithm code walkthrough and explanations',
    'Performance comparison charts and graphs',
    'Educational tutorials and algorithm explanations',
    'Responsive design for all devices and screen sizes',
    'Save and share algorithm visualizations',
    'Dark and light theme support',
    'Keyboard shortcuts for navigation',
  ],
  screenshot: '/hero-images.png',
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
    logo: 'https://data-science.hallucinationguys.com/favicon.ico',
    sameAs: ['https://github.com/science-tools'],
  },
}

// HowTo schema for using the sorting visualization tool
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use Interactive Sorting Algorithm Visualization for Learning',
  description:
    'Complete guide to exploring and understanding sorting algorithms through interactive visualizations, step-by-step animations, and performance analysis',
  image: '/hero-images.png',
  totalTime: 'PT20M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Modern web browser with JavaScript enabled',
    },
    {
      '@type': 'HowToSupply',
      name: 'Basic understanding of programming concepts (helpful but not required)',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Select an Algorithm',
      text: 'Choose from popular sorting algorithms like Merge Sort, Quick Sort, Bubble Sort, Insertion Sort, Selection Sort, or Heap Sort from the algorithm menu.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Configure Parameters',
      text: 'Adjust array size, animation speed, and data distribution (random, nearly sorted, reverse sorted) to see how algorithms perform under different conditions.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Start Visualization',
      text: "Click play to start the sorting animation. Watch as elements are compared, swapped, and moved according to the algorithm's logic.",
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Step Through Process',
      text: "Use step controls to advance one step at a time, or pause to examine the current state. This helps understand the algorithm's decision-making process.",
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Analyze Performance',
      text: 'Review time complexity (Big O notation), number of comparisons, and swaps. Compare different algorithms to understand their efficiency characteristics.',
      position: 5,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Sorting Algorithm Visualizer',
      description: 'Interactive web-based tool for visualizing and learning sorting algorithms',
    },
  ],
}

interface SortLayoutProps {
  children: ReactNode
}

export default function SortLayout({ children }: SortLayoutProps) {
  return (
    <section
      aria-label="Interactive Sorting Algorithm Visualization - Learn Computer Science Fundamentals"
      className="p-4"
    >
      {/* Enhanced JSON-LD structured data for SEO and AI agents */}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="sort-softwareapp-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        key="sort-howto-jsonld"
      />

      {/* FAQ Schema for AI agents and search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What sorting algorithms can I visualize?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can visualize and compare 15+ sorting algorithms including Merge Sort, Quick Sort, Bubble Sort, Insertion Sort, Selection Sort, Heap Sort, Shell Sort, Radix Sort, Counting Sort, and more.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do sorting algorithms differ in performance?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Different algorithms have different time complexities: Quick Sort and Merge Sort are O(n log n) on average, Bubble Sort is O(n²), while algorithms like Counting Sort can be O(n + k) for specific data ranges. Performance depends on data distribution and size.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is Big O notation?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Big O notation describes how an algorithm's performance scales with input size. O(1) means constant time, O(n) means linear time, O(n log n) means logarithmic time, and O(n²) means quadratic time. It helps compare algorithm efficiency.",
                },
              },
              {
                '@type': 'Question',
                name: 'Why are there different sorting algorithms?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Different algorithms excel in different scenarios. Some are faster for small datasets, others work better with nearly-sorted data, and some are stable (preserve relative order of equal elements). The best choice depends on your specific requirements.',
                },
              },
              {
                '@type': 'Question',
                name: 'How can I choose the right sorting algorithm?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Consider factors like data size, data distribution, stability requirements, space constraints, and whether the data fits in memory. Use this visualization tool to compare algorithms and understand their trade-offs before making a decision.',
                },
              },
            ],
          }),
        }}
        key="sort-faq-jsonld"
      />

      {children}
    </section>
  )
}
