import type { Metadata, Viewport } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { CommandProvider } from '@/app/_command-manager/CommandProvider'
import { GlobalClientEffects } from '@/components/global-client-effects'
import './globals.css'

const websiteUrl = 'https://data-science.hallucinationguys.com'

export const metadata: Metadata = {
  metadataBase: new URL(websiteUrl),
  title: {
    template: '%s | Science Tools - Interactive STEM Learning Platform',
    default: 'Science Tools - Interactive Learning for Math, Logic & Programming',
  },
  description:
    'Free interactive tools for STEM education. Visualize sorting algorithms, simplify boolean algebra, format JSON, compare text files, and boost productivity. Perfect for students, developers, and educators. Features include real-time visualizations, step-by-step tutorials, and hands-on learning experiences.',
  keywords: [
    'science tools',
    'interactive learning',
    'STEM education',
    'developer tools',
    'math tools',
    'logic solver',
    'pomodoro technique',
    'algorithm visualization',
    'boolean algebra simplifier',
    'Karnaugh map',
    'truth table',
    'venn diagram',
    'sorting algorithms',
    'JSON formatter',
    'text diff tool',
    'markdown editor',
    'typing test',
    'URL previewer',
    'computer science education',
    'programming tools',
    'data structures',
    'algorithms',
    'educational software',
    'learning platform',
    'interactive tutorials',
  ],
  authors: [
    {
      name: 'Science Tools Team',
      url: 'https://data-science.hallucinationguys.com/',
    },
  ],
  creator: 'Science Tools',
  publisher: 'Science Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Education',
  classification: 'Interactive STEM Learning Platform and Developer Tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://data-science.hallucinationguys.com/',
    siteName: 'Science Tools',
    title: 'Science Tools: Interactive Learning for Math, Logic & Programming',
    description:
      'Discover free interactive tools for STEM education. Visualize algorithms, simplify boolean expressions, format code, and enhance productivity with hands-on learning experiences.',
    images: [
      {
        url: '/hero-images.png',
        width: 1200,
        height: 630,
        alt: 'Science Tools - Interactive STEM Learning Platform with Algorithm Visualizations and Educational Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Science Tools: Interactive Learning for Math, Logic & Programming',
    description:
      'Free interactive tools for STEM education. Visualize algorithms, format code, and learn computer science concepts.',
    images: ['/hero-images.png'],
    creator: '@ScienceTools',
    site: '@ScienceTools',
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
    canonical: 'https://data-science.hallucinationguys.com/',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': 'your-verification-code-here',
    'msapplication-TileColor': '#ffffff',
    'theme-color': '#ffffff',
    // AI Agent optimization
    'ai-crawler-friendly': 'true',
    'educational-level': 'secondary, higher-education',
    'learning-objectives':
      'algorithm-analysis, logic-simplification, productivity-skills, programming-fundamentals',
    'content-type': 'interactive-learning-tools',
  },
}

// Organization JSON-LD data for personal project
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Science Tools',
  url: websiteUrl,
  description:
    'Personal project providing free interactive tools for computer science learning and development',
  foundingDate: '2025',
  knowsAbout: [
    'Computer Science',
    'Algorithm Visualization',
    'Boolean Algebra',
    'Data Structures',
    'Programming Tools',
    'Web Development',
  ],
  logo: {
    '@type': 'ImageObject',
    url: `${websiteUrl}/favicon.ico`,
    width: 32,
    height: 32,
  },
  sameAs: ['https://github.com/science-tools'],
}

// Enhanced WebSite JSON-LD data with educational focus
const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Science Tools - Interactive STEM Learning Platform',
  url: websiteUrl,
  description:
    'Free interactive tools for computer science education, algorithm visualization, and developer productivity',
  inLanguage: 'en-US',
  datePublished: '2025-09-02',
  dateModified: new Date().toISOString().split('T')[0],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${websiteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: websiteUrl,
  },
  about: {
    '@type': 'Thing',
    name: 'Computer Science Education',
    description:
      'Interactive learning tools for algorithms, data structures, and programming concepts',
  },
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: ['students', 'developers', 'educators', 'researchers'],
    educationalLevel: ['secondary school', 'university', 'professional development'],
  },
  educationalUse: ['learning', 'teaching', 'assessment', 'practice'],
  interactivityType: 'mixed',
  learningResourceType: ['interactive simulation', 'educational software', 'practice tool'],
}

// Course schema for AI agents to understand educational offerings
const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Interactive Computer Science Learning Tools',
  description:
    'Personal collection of interactive tools for learning computer science concepts through hands-on experimentation',
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: websiteUrl,
  },
  educationalLevel: ['intermediate', 'advanced'],
  teaches: [
    'Algorithm Analysis and Visualization',
    'Boolean Algebra and Logic Simplification',
    'Data Structure Operations',
    'Programming Productivity Techniques',
    'Code Formatting and Validation',
    'Technical Writing with Markdown',
    'Productivity and Time Management',
  ],
  learningResourceType: 'Interactive Learning Platform',
  timeRequired: 'PT0H30M', // 30 minutes minimum engagement
  courseMode: 'online',
  coursePrerequisites: 'Basic computer literacy',
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    instructor: {
      '@type': 'Organization',
      name: 'Science Tools Team',
    },
  },
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
      educationalFramework: 'Computer Science Curriculum',
      targetName: 'Boolean Algebra',
      targetDescription: 'Logic simplification and digital circuit design',
      targetUrl: 'https://en.wikipedia.org/wiki/Boolean_algebra',
    },
  ],
}

// Learning Resource schema for AI agents
const learningResourceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Science Tools Interactive Learning Platform',
  description:
    'A comprehensive suite of interactive educational tools for computer science and programming education, designed for students and developers',
  educationalUse: ['learning', 'demonstration', 'assessment', 'practice', 'teaching'],
  learningResourceType: [
    'interactive simulation',
    'educational software',
    'practice tool',
    'visualization tool',
  ],
  interactivityType: 'active',
  typicalAgeRange: '14-',
  educationalLevel: ['secondary', 'higher education', 'professional'],
  teaches: [
    'Sorting Algorithms',
    'Boolean Logic',
    'Data Formatting',
    'Text Processing',
    'Productivity Techniques',
    'Technical Writing',
    'Algorithm Visualization',
  ],
  competencyRequired: 'Basic computer operation skills',
  educationalAlignment: [
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Standards',
      targetName: 'Algorithm Analysis',
      targetDescription: 'Computational thinking and algorithm design',
    },
    {
      '@type': 'AlignmentObject',
      alignmentType: 'teaches',
      educationalFramework: 'Computer Science Standards',
      targetName: 'Data Structures',
      targetDescription: 'Understanding fundamental data organization',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Science Tools',
    url: websiteUrl,
  },
  isAccessibleForFree: true,
  license: {
    '@type': 'CreativeWork',
    name: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        {/* Enhanced JSON-LD structured data for SEO and AI agents */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          key="organization-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
          key="website-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
          key="course-jsonld"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
          key="learning-resource-jsonld"
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
                  name: 'What is Science Tools?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Science Tools is a free interactive platform offering educational tools for computer science, mathematics, and productivity. It includes algorithm visualizations, boolean algebra simplifiers, code formatters, and more to help students and developers learn through hands-on experimentation.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Who can use Science Tools?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Science Tools is designed for students, developers, educators, and anyone interested in learning computer science concepts through interactive visualizations and hands-on tools. No prior experience required for most tools.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Are these tools free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, all Science Tools are completely free to use. No registration, no ads, no limitations. Simply visit the site and start learning computer science concepts through interactive tools.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What computer science concepts can I learn?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Learn algorithm analysis and visualization, boolean algebra and logic simplification, data structures, programming productivity techniques, code formatting, technical writing with markdown, and time management skills.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do the interactive visualizations help learning?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our interactive visualizations show algorithms in action, step-by-step. You can see how sorting algorithms work, how boolean expressions are simplified, and how data structures operate, making complex concepts easier to understand.',
                  },
                },
              ],
            }),
          }}
          key="faq-jsonld"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SpeedInsights />
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CommandProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="p-2 w-full min-h-screen">
                <div>{children}</div>
              </main>
            </SidebarProvider>
            <GlobalClientEffects />
          </CommandProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
