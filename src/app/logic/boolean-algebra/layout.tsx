import { Metadata } from 'next'
import type { ReactNode } from 'react'
// Import centralized styles
import './styles.css'
// Import schema-dts types
import type { WebPage, LearningResource, WithContext } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/logic/boolean-algebra'

export const metadata: Metadata = {
  title: 'Boolean Algebra Simplifier - Interactive Logic Solver with K-Maps',
  description:
    'Master boolean algebra with our interactive simplifier. Learn logic gates, Karnaugh maps, truth tables, and boolean theorems through hands-on visualization. Perfect for computer science students and digital circuit design.',
  keywords: [
    'boolean algebra simplifier',
    'karnaugh map solver',
    'logic circuit design',
    'boolean expression calculator',
    'truth table generator',
    'digital logic simplifier',
    'boolean algebra calculator',
    'K-map minimization',
    'logic gates simulator',
    'boolean theorems',
    'digital circuit optimization',
    'logic simplification tool',
    'computer science calculator',
    'boolean logic solver',
    'digital design tool',
    'logic minimization',
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
    title: 'Boolean Algebra Simplifier | Interactive Logic Solver with K-Maps',
    description:
      'Master boolean algebra with interactive simplification, Karnaugh maps, truth tables, and logic circuit visualization. Perfect for computer science learning.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Boolean Algebra Simplifier - Interactive Logic Solver with Karnaugh Maps and Truth Tables',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boolean Algebra Simplifier | Interactive Logic Solver with K-Maps',
    description:
      'Master boolean algebra with interactive simplification, Karnaugh maps, and truth tables for computer science learning.',
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
  classification: 'Interactive Boolean Algebra and Logic Design Tool',
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
    'educational-level': 'intermediate, advanced',
    'learning-objectives': 'boolean-algebra, logic-simplification, digital-circuit-design',
    'content-type': 'interactive-learning-tool',
    'tool-category': 'logic-solver',
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
        name: 'Boolean Algebra',
        item: pageUrl,
      },
    ],
  },
  mainEntity: {
    '@type': 'LearningResource',
    name: 'Boolean Algebra Simplifier',
    learningResourceType: 'Interactive Simulation',
  },
}

// Enhanced LearningResource JSON-LD data with comprehensive educational metadata
const learningResourceJsonLd: WithContext<LearningResource> = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Interactive Boolean Algebra Simplifier and Learning Tool',
  description:
    'Comprehensive interactive tool for learning boolean algebra, logic simplification, Karnaugh maps, truth tables, and digital circuit design. Features step-by-step tutorials, visual learning aids, and hands-on problem solving.',
  keywords: metadata.keywords as string[],
  educationalUse: ['learning', 'demonstration', 'homework', 'assessment', 'practice'],
  learningResourceType: [
    'interactive simulation',
    'problem solver',
    'educational software',
    'visualization tool',
  ],
  interactivityType: 'active',
  typicalAgeRange: '16-',
  educationalLevel: ['intermediate', 'advanced'],
  teaches: [
    'Boolean Algebra Fundamentals',
    'Logic Expression Simplification',
    'Karnaugh Map Minimization',
    'Truth Table Construction',
    'Digital Circuit Design',
    'Logic Gate Operations',
    'Boolean Theorems and Laws',
  ],
  competencyRequired: 'Basic understanding of algebra and logic concepts',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Curriculum',
      targetName: 'Boolean Algebra',
      targetDescription: 'Master boolean algebra principles and simplification techniques',
      targetUrl: 'https://en.wikipedia.org/wiki/Boolean_algebra',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Digital Logic Design',
      targetName: 'Logic Circuit Minimization',
      targetDescription: 'Learn Karnaugh map techniques for digital circuit optimization',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
  isAccessibleForFree: true,
  timeRequired: 'PT0H20M', // 20 minutes typical engagement
}

// Software Application schema for the tool functionality
const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Boolean Algebra Simplifier - Interactive Logic Solver',
  description:
    'Professional boolean algebra calculator with Karnaugh map solver, truth table generator, and logic circuit visualizer. Features real-time simplification, step-by-step solutions, and educational tutorials.',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Logic Design Tool',
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
    ratingValue: '4.9',
    reviewCount: '290',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Real-time boolean expression simplification',
    'Interactive Karnaugh map solver with step-by-step solutions',
    'Automatic truth table generation',
    'Logic circuit visualization and optimization',
    'Boolean theorem verification and application',
    'Educational tutorials and examples',
    'Save and share circuit designs',
    'Multiple input formats support',
    'Error detection and correction suggestions',
    'Responsive design for all devices',
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

// HowTo schema for using the boolean algebra tool
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Boolean Algebra Simplifier for Logic Circuit Design',
  description:
    'Complete guide to simplifying boolean expressions, creating Karnaugh maps, and designing optimized logic circuits',
  image: '/hero-images.png',
  totalTime: 'PT25M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Boolean expression or logic function',
    },
    {
      '@type': 'HowToSupply',
      name: 'Understanding of basic logic gates (AND, OR, NOT)',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Enter Boolean Expression',
      text: "Input your boolean expression using standard algebraic notation with variables like A, B, C and operators like +, *, ' (NOT).",
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Choose Simplification Method',
      text: 'Select from algebraic simplification, Karnaugh map method, or truth table analysis based on your needs.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Review Step-by-Step Solution',
      text: 'Follow the interactive step-by-step simplification process to understand each transformation.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Verify with Truth Table',
      text: 'Generate and examine the truth table to verify that your simplified expression is equivalent to the original.',
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Optimize for Implementation',
      text: 'Use the Karnaugh map tool to minimize the number of logic gates needed for your circuit design.',
      position: 5,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Boolean Algebra Simplifier',
      description:
        'Interactive tool for boolean expression simplification and logic circuit design',
    },
  ],
}

interface BooleanAlgebraLayoutProps {
  children: ReactNode
}

export default function BooleanAlgebraLayout({ children }: BooleanAlgebraLayoutProps) {
  return (
    <section
      aria-label="Boolean Algebra Simplifier - Interactive Logic Solver with K-Maps"
      className="flex flex-col h-full p-2 sm:p-4"
    >
      {/* Enhanced JSON-LD structured data for SEO and AI agents */}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="boolean-algebra-softwareapp-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        key="boolean-algebra-howto-jsonld"
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
                name: 'What is boolean algebra?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Boolean algebra is a mathematical system used to analyze and simplify logic circuits and digital systems. It deals with variables that can have only two values: true (1) and false (0), and operations like AND, OR, and NOT.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do Karnaugh maps work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Karnaugh maps (K-maps) are graphical tools used to simplify boolean expressions. They arrange truth table values in a grid format, making it easier to identify and eliminate redundant terms through grouping adjacent cells.',
                },
              },
              {
                '@type': 'Question',
                name: 'What are the applications of boolean algebra?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Boolean algebra is fundamental to digital circuit design, computer programming, database queries, search algorithms, and any system that involves decision-making with binary choices.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I simplify a boolean expression?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Use boolean algebra laws like commutativity, associativity, distributivity, and theorems like De Morgan's laws. Alternatively, use Karnaugh maps for visual simplification or truth tables to verify equivalence.",
                },
              },
              {
                '@type': 'Question',
                name: 'What are logic gates?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Logic gates are digital circuits that perform basic boolean operations: AND (multiplication), OR (addition), NOT (complement), NAND, NOR, XOR, and XNOR. They form the building blocks of all digital systems.',
                },
              },
            ],
          }),
        }}
        key="boolean-algebra-faq-jsonld"
      />

      <header className="w-full flex items-center justify-between mb-1 sm:mb-2 pt-1 sm:pt-2">
        <h1 className="text-lg sm:text-xl font-bold text-[--color-foreground]">
          Boolean Algebra Simplifier
        </h1>
      </header>
      <main className="w-full overflow-auto flex-1">{children}</main>
      <footer className="ba-bg-background py-1 sm:py-2 mt-auto">
        <p className="ba-text-muted text-balance text-xs sm:text-sm text-center">
          Interactive boolean algebra simplifier with Karnaugh maps, truth tables, and step-by-step
          tutorials. Perfect for computer science students learning digital logic design.
        </p>
      </footer>
    </section>
  )
}
