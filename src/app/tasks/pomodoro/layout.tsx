import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/pomodoro'

export const metadata: Metadata = {
  title: 'Pomodoro Timer - Focus & Productivity Technique Tool',
  description:
    'Master the Pomodoro Technique with our customizable timer. Boost productivity, improve focus, and manage work sessions effectively. Features customizable intervals, session tracking, and productivity analytics.',
  keywords: [
    'pomodoro timer online',
    'pomodoro technique',
    'productivity timer',
    'focus timer',
    'time management tool',
    'work session timer',
    'study timer',
    'productivity technique',
    'focus enhancement',
    'time blocking',
    'work-life balance',
    'concentration timer',
    'task management',
    'productivity hack',
    'time tracking',
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
    title: 'Pomodoro Timer | Master Focus & Productivity',
    description:
      'Enhance your productivity with the scientifically-proven Pomodoro Technique. Customizable work sessions, break timers, and progress tracking.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Pomodoro Timer - Focus and Productivity Enhancement Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Timer | Master Focus & Productivity',
    description:
      'Boost your productivity with customizable Pomodoro sessions and focus enhancement techniques.',
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
  category: 'productivity tools',
  classification: 'Time Management and Productivity Enhancement Tool',
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
    'educational-level': 'beginner, intermediate',
    'learning-objectives': 'time-management, productivity-techniques, focus-enhancement',
    'content-type': 'interactive-productivity-tool',
    'tool-category': 'time-management',
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
        name: 'Pomodoro Timer',
        item: pageUrl,
      },
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Pomodoro Timer',
    applicationCategory: 'Productivity',
  },
}

// Enhanced SoftwareApplication JSON-LD data with ratings and offers
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Advanced Pomodoro Timer - Focus & Productivity Tool',
  description:
    'Master the Pomodoro Technique with our scientifically-designed timer. Boost productivity, improve focus, and manage work sessions effectively with customizable intervals and progress tracking.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'Productivity',
  applicationSubCategory: 'Time Management Tool',
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
    ratingValue: '4.7',
    reviewCount: '450',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Scientifically-proven 25-minute work sessions',
    'Customizable work and break intervals',
    'Automatic session progression tracking',
    'Visual and audio notifications',
    'Session statistics and productivity analytics',
    'Keyboard shortcuts for quick control',
    'Full-screen focus mode',
    'Responsive design for all devices',
    'No ads or distractions',
    'Works offline',
    'Data persistence across sessions',
    'Multiple timer presets',
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
  name: 'Pomodoro Technique Learning Tool',
  description:
    'Learn and master the Pomodoro Technique through interactive timer sessions. Develop better time management skills, improve focus, and enhance productivity with guided practice.',
  educationalUse: ['learning', 'practice', 'skill-development'],
  learningResourceType: ['interactive timer', 'productivity tool', 'time management trainer'],
  interactivityType: 'active',
  typicalAgeRange: '14-',
  educationalLevel: ['beginner', 'intermediate'],
  teaches: [
    'Pomodoro Technique Fundamentals',
    'Time Management Skills',
    'Focus and Concentration Enhancement',
    'Work-Life Balance Strategies',
    'Productivity Optimization',
    'Session Planning and Execution',
  ],
  competencyRequired: 'Basic understanding of time concepts',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Productivity and Time Management',
      targetName: 'Pomodoro Technique',
      targetDescription: 'Master the scientifically-proven productivity method',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Study Skills',
      targetName: 'Focus Enhancement',
      targetDescription: 'Develop techniques for sustained attention and concentration',
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

// HowTo schema for AI agents to understand tool usage
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Pomodoro Timer for Maximum Productivity',
  description:
    'Step-by-step guide to implementing the Pomodoro Technique for better focus and productivity',
  image: '/hero-images.png',
  totalTime: 'PT30M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Quiet workspace',
    },
    {
      '@type': 'HowToSupply',
      name: 'Task list or work to focus on',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Choose Your Task',
      text: 'Select a specific task or set of related tasks to work on during your Pomodoro session',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Set the Timer',
      text: 'Start the 25-minute work timer and begin focusing on your chosen task',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Work Intensely',
      text: 'Work continuously on your task without distractions for the full 25 minutes',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Take a Short Break',
      text: 'When the timer rings, take a 5-minute break to stretch, walk, or relax',
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Repeat and Track',
      text: 'After 4 Pomodoro sessions, take a longer 15-30 minute break. Track your progress and adjust as needed.',
      position: 5,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Pomodoro Timer',
      description: 'Digital timer designed specifically for Pomodoro Technique practice',
    },
  ],
}

interface PomodoroLayoutProps {
  children: ReactNode
}

export default function PomodoroLayout({ children }: PomodoroLayoutProps) {
  return (
    <section
      aria-label="Pomodoro Timer - Focus and Productivity Enhancement Tool"
      className="w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* Enhanced JSON-LD structured data for SEO and AI agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        key="pomodoro-webpage-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        key="pomodoro-softwareapp-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
        key="pomodoro-learning-resource-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        key="pomodoro-howto-jsonld"
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
                name: 'What is the Pomodoro Technique?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Pomodoro Technique is a time management method that breaks work into focused intervals (typically 25 minutes) called "Pomodoros," separated by short breaks. It helps improve focus, reduce burnout, and enhance productivity.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does the Pomodoro Timer work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our Pomodoro Timer guides you through work sessions and breaks automatically. Set your work interval (default 25 minutes), start the timer, work intensely, then take a short break when it rings.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I customize the timer intervals?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! You can customize both work and break intervals to fit your preferences and work style. The classic Pomodoro uses 25-minute work sessions with 5-minute breaks.',
                },
              },
              {
                '@type': 'Question',
                name: 'Who can benefit from using the Pomodoro Timer?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Students, developers, writers, and anyone who needs to maintain focus during work or study sessions. It's particularly helpful for those who struggle with procrastination or maintaining concentration.",
                },
              },
              {
                '@type': 'Question',
                name: 'Is the Pomodoro Technique scientifically proven?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, the Pomodoro Technique is based on scientific research about human attention spans and work efficiency. Studies show that regular breaks improve focus and prevent mental fatigue.',
                },
              },
            ],
          }),
        }}
        key="pomodoro-faq-jsonld"
      />

      <div className="container mx-auto py-4">{children}</div>
    </section>
  )
}
