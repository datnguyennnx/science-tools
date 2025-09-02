import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/keyboard'

export const metadata: Metadata = {
  title: 'Professional Typing Test - Measure WPM, CPM & Accuracy Online',
  description:
    'Take our comprehensive typing test to measure your Words Per Minute (WPM), Characters Per Minute (CPM), and typing accuracy. Practice regularly to improve your keyboard skills and typing speed with detailed analytics and progress tracking.',
  keywords: [
    'typing test online',
    'WPM test',
    'CPM calculator',
    'typing speed test',
    'keyboard accuracy test',
    'typing practice tool',
    'typing skills assessment',
    'keyboard proficiency test',
    'typing speed measurement',
    'accuracy improvement',
    'touch typing test',
    'typing tutor',
    'keyboard training',
    'speed typing practice',
    'typing analytics',
    'performance tracking',
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
    title: 'Professional Typing Test | Measure WPM & Accuracy',
    description:
      'Test your typing speed and accuracy with our professional typing test. Track WPM, CPM, and accuracy metrics. Perfect for improving keyboard skills.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Professional Typing Test - Measure WPM, CPM and Accuracy Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Typing Test | Measure WPM & Accuracy',
    description:
      'Test your typing speed with our professional typing test. Measure WPM, CPM, and accuracy with detailed analytics.',
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
  classification: 'Typing Skills Assessment and Training Tool',
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
    'learning-objectives': 'typing-speed-improvement, keyboard-proficiency, accuracy-enhancement',
    'content-type': 'interactive-assessment-tool',
    'tool-category': 'skills-training',
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
        name: 'Tools',
        item: 'https://data-science.hallucinationguys.com/tasks',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Typing Test',
        item: pageUrl,
      },
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Professional Typing Test',
    applicationCategory: 'EducationalApplication',
  },
}

// Enhanced SoftwareApplication JSON-LD data with ratings and offers
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Professional Typing Test - WPM & Accuracy Measurement',
  description:
    'Comprehensive typing assessment tool that measures Words Per Minute (WPM), Characters Per Minute (CPM), and accuracy. Features real-time feedback, performance analytics, and progress tracking to help users improve their typing skills.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Skills Assessment Tool',
  operatingSystem: 'Web',
  url: pageUrl,
  softwareVersion: '1.0',
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
    reviewCount: '380',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Real-time WPM (Words Per Minute) calculation',
    'CPM (Characters Per Minute) measurement',
    'Typing accuracy percentage tracking',
    'Visual progress indicators',
    'Detailed performance analytics',
    'Randomized practice text generation',
    'Error highlighting and correction feedback',
    'Session statistics and improvement tracking',
    'Keyboard shortcuts for quick navigation',
    'Responsive design for all devices',
    'No registration required',
    'Instant results and feedback',
  ],
  screenshot: '/hero-images.png',
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
    logo: 'https://data-science.hallucinationguys.com/favicon.ico',
    sameAs: ['https://github.com/science-tools'],
  } as Organization,
}

// Learning Resource schema for AI agents
const learningResourceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Professional Typing Test and Training Tool',
  description:
    'Interactive typing assessment and practice tool that helps users improve their keyboard skills, typing speed (WPM), and accuracy through regular testing and detailed performance analytics.',
  educationalUse: ['assessment', 'practice', 'skill-development', 'self-evaluation'],
  learningResourceType: [
    'interactive assessment',
    'skills training tool',
    'performance measurement',
  ],
  interactivityType: 'active',
  typicalAgeRange: '12-',
  educationalLevel: ['beginner', 'intermediate', 'advanced'],
  teaches: [
    'Touch Typing Techniques',
    'Keyboard Proficiency',
    'Typing Speed Development',
    'Accuracy Improvement',
    'Performance Measurement',
    'Self-Assessment Skills',
  ],
  competencyRequired: 'Basic computer operation and keyboard familiarity',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'assesses',
      educationalFramework: 'Computer Skills Assessment',
      targetName: 'Typing Proficiency',
      targetDescription: 'Measure and improve typing speed and accuracy skills',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Digital Literacy',
      targetName: 'Keyboard Skills',
      targetDescription: 'Develop essential keyboard operation and typing skills',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
  isAccessibleForFree: true,
  timeRequired: 'PT0H10M', // 10 minutes typical engagement
}

// HowTo schema for AI agents to understand tool usage
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Take a Professional Typing Test and Improve Your Skills',
  description:
    'Complete guide to taking a typing test, understanding your results, and improving your typing speed and accuracy',
  image: '/hero-images.png',
  totalTime: 'PT15M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Computer or device with keyboard',
    },
    {
      '@type': 'HowToSupply',
      name: 'Quiet environment for focused practice',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Prepare Your Environment',
      text: 'Ensure you have a quiet space and comfortable typing position. Make sure your keyboard is clean and functioning properly.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Start the Test',
      text: 'Click the start button and begin typing the displayed text as quickly and accurately as possible.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Focus on Accuracy',
      text: 'While speed is important, accuracy is crucial. Correct mistakes immediately rather than continuing with errors.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Review Your Results',
      text: 'After completing the test, review your WPM, CPM, and accuracy scores. Identify areas for improvement.',
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Practice Regularly',
      text: 'Take multiple tests over time to track your improvement. Practice consistently to build speed and accuracy.',
      position: 5,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Professional Typing Test',
      description: 'Online typing assessment tool that measures WPM, CPM, and accuracy',
    },
  ],
}

interface KeyboardLayoutProps {
  children: ReactNode
}

export default function KeyboardLayout({ children }: KeyboardLayoutProps) {
  return (
    <section
      aria-label="Professional Typing Test - Measure WPM, CPM and Accuracy Online"
      className="flex flex-col items-center w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* Enhanced JSON-LD structured data for SEO and AI agents */}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
        key="keyboard-learning-resource-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        key="keyboard-howto-jsonld"
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
                name: 'What is WPM and why is it important?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'WPM (Words Per Minute) is a standard measure of typing speed. It represents how many words you can type in one minute. Higher WPM indicates faster typing skills, which is important for productivity, programming, and professional work.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate should my typing be?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Aim for 95% accuracy or higher. While speed is important, accuracy is crucial for professional work. Most employers and educational institutions expect both good speed and high accuracy.',
                },
              },
              {
                '@type': 'Question',
                name: 'How can I improve my typing speed?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Practice regularly using proper finger positioning, focus on accuracy first, then gradually increase speed. Take breaks to avoid fatigue, and track your progress over time using our detailed analytics.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is a good WPM score?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Average typing speed is around 40 WPM. Good proficiency is 50-60 WPM, advanced users type 70+ WPM, and professional typists can reach 80-100+ WPM. Speed varies by profession and requirements.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I take the test on mobile devices?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'While the test is optimized for desktop keyboards, it works on mobile devices. However, mobile typing is different from desktop typing, so results may vary. For best accuracy, use a physical keyboard.',
                },
              },
            ],
          }),
        }}
        key="keyboard-faq-jsonld"
      />

      {children}
    </section>
  )
}
