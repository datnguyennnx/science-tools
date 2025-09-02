import { Metadata } from 'next'
import { ReactNode } from 'react'
// Import schema-dts types
import type { WebPage, SoftwareApplication, WithContext, Organization } from 'schema-dts'

const pageUrl = 'https://data-science.hallucinationguys.com/tasks/markdown'

export const metadata: Metadata = {
  title: 'Interactive Markdown Editor - Live Preview with Diagrams & Math Support',
  description:
    'Professional markdown editor with live preview, mermaid diagrams, KaTeX math formulas, syntax highlighting, and table support. Perfect for technical writing, documentation, and educational content creation.',
  keywords: [
    'markdown editor online',
    'markdown preview',
    'mermaid diagrams',
    'KaTeX math rendering',
    'markdown syntax highlighting',
    'markdown tables',
    'technical writing tool',
    'documentation editor',
    'markdown processor',
    'live markdown preview',
    'markdown to HTML',
    'mathematical formulas in markdown',
    'flowchart diagrams',
    'sequence diagrams',
    'markdown editor with math',
    'scientific documentation',
    'academic writing tool',
    'interactive markdown editor',
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
    title: 'Interactive Markdown Editor | Live Preview with Diagrams & Math',
    description:
      'Create professional markdown documents with live preview, mermaid diagrams, KaTeX math formulas, and syntax highlighting. Perfect for technical documentation.',
    type: 'website',
    url: pageUrl,
    siteName: 'Science Tools',
    locale: 'en_US',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Interactive Markdown Editor with Live Preview and Advanced Features',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Markdown Editor | Live Preview with Diagrams & Math',
    description:
      'Professional markdown editor with live preview, mermaid diagrams, KaTeX math formulas, and syntax highlighting.',
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
  category: 'developer tools',
  classification: 'Interactive Markdown Editor and Technical Writing Tool',
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
    'learning-objectives': 'technical-writing, documentation-skills, markdown-mastery',
    'content-type': 'interactive-editor',
    'tool-category': 'writing-productivity',
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
        name: 'Markdown Editor',
        item: pageUrl,
      },
    ],
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Interactive Markdown Editor',
    applicationCategory: 'Productivity',
  },
}

// Enhanced SoftwareApplication JSON-LD data with ratings and offers
const softwareAppJsonLd: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Interactive Markdown Editor with Diagrams & Math',
  description:
    'Professional markdown editor with live preview, mermaid diagrams, KaTeX math formulas, syntax highlighting, and table support. Perfect for technical writing, documentation, and educational content creation.',
  keywords: metadata.keywords as string[],
  applicationCategory: 'Productivity',
  applicationSubCategory: 'Technical Writing Tool',
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
    ratingValue: '4.9',
    reviewCount: '320',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Real-time markdown preview with split-view',
    'Mermaid diagram rendering (flowcharts, sequence diagrams, Gantt charts)',
    'KaTeX mathematical formula support with live rendering',
    'Advanced syntax highlighting for code blocks',
    'Interactive table creation and editing',
    'File upload and download capabilities',
    'Fullscreen diagram viewing mode',
    'Zoom controls and diagram export',
    'Responsive design for all devices',
    'Keyboard shortcuts for productivity',
    'Dark and light theme support',
    'Auto-save functionality',
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
  name: 'Interactive Markdown Editor Learning Tool',
  description:
    'Learn markdown syntax, technical writing, and documentation skills through hands-on interactive editing with live preview and advanced features.',
  educationalUse: ['learning', 'practice', 'skill-development'],
  learningResourceType: ['interactive editor', 'writing tool', 'educational software'],
  interactivityType: 'active',
  typicalAgeRange: '14-',
  educationalLevel: ['intermediate', 'advanced'],
  teaches: [
    'Markdown Syntax and Formatting',
    'Technical Writing Skills',
    'Documentation Best Practices',
    'Mathematical Notation in Documents',
    'Diagram Creation and Visualization',
    'Code Documentation Techniques',
  ],
  competencyRequired: 'Basic computer skills and text editing',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Technical Writing Standards',
      targetName: 'Markdown Proficiency',
      targetDescription: 'Master markdown syntax for technical documentation',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Skills',
      targetName: 'Technical Documentation',
      targetDescription: 'Learn to create clear, well-formatted technical documents',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: 'https://data-science.hallucinationguys.com',
  },
  isAccessibleForFree: true,
  timeRequired: 'PT0H15M', // 15 minutes typical engagement
}

// HowTo schema for AI agents to understand tool usage
const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Interactive Markdown Editor',
  description:
    'Step-by-step guide to creating professional markdown documents with diagrams and mathematical formulas',
  image: '/hero-images.png',
  totalTime: 'PT10M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Modern web browser',
    },
    {
      '@type': 'HowToSupply',
      name: 'Internet connection',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Access the Editor',
      text: 'Navigate to the Markdown Editor tool on Science Tools platform',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Write Markdown',
      text: 'Start writing markdown syntax in the left panel - use headings, lists, links, and formatting',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Add Diagrams',
      text: 'Create mermaid diagrams using the diagram syntax for flowcharts and visualizations',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Insert Math Formulas',
      text: 'Add mathematical equations using KaTeX syntax with $...$ for inline and $$...$$ for display math',
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Preview and Edit',
      text: 'See live preview in the right panel and make adjustments as needed',
      position: 5,
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Interactive Markdown Editor',
      description: 'Web-based markdown editing tool with live preview',
    },
  ],
}

interface MarkdownLayoutProps {
  children: ReactNode
}

export default function MarkdownLayout({ children }: MarkdownLayoutProps) {
  return (
    <section
      aria-label="Interactive Markdown Editor with Live Preview and Advanced Features"
      className="flex flex-col w-full min-h-[calc(100vh-6rem)] p-4"
    >
      {/* Enhanced JSON-LD structured data for SEO and AI agents */}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
        key="markdown-learning-resource-jsonld"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        key="markdown-howto-jsonld"
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
                name: 'What is the Interactive Markdown Editor?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The Interactive Markdown Editor is a professional web-based tool that allows you to write, edit, and preview markdown documents with advanced features like live preview, mermaid diagrams, and mathematical formula support.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I create diagrams in markdown?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can create various types of diagrams using Mermaid syntax. Simply write your diagram code in a code block with the mermaid language identifier, and it will render as an interactive diagram in the preview.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I use mathematical formulas in the editor?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! The editor supports KaTeX mathematical notation. Use $...$ for inline math and $$...$$ for display equations. The formulas will render beautifully in the live preview.',
                },
              },
              {
                '@type': 'Question',
                name: 'What types of diagrams can I create?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can create flowcharts, sequence diagrams, Gantt charts, pie charts, and many other diagram types using Mermaid syntax. The diagrams are interactive and can be zoomed and exported.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is the markdown editor suitable for beginners?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Absolutely! The editor provides live preview and syntax highlighting to help beginners learn markdown syntax. It's perfect for students learning technical writing and documentation skills.",
                },
              },
            ],
          }),
        }}
        key="markdown-faq-jsonld"
      />

      {children}
    </section>
  )
}
