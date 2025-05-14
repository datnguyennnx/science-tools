import { Metadata } from 'next'
import { ReactNode } from 'react'

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
    siteName: 'Your Site Name',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualize Sorting Algorithms Interactively',
    description:
      'See Merge Sort, Quick Sort, and more in action. A great tool for learning algorithm mechanics.',
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

interface SortLayoutProps {
  children: ReactNode
}

export default function SortLayout({ children }: SortLayoutProps) {
  return (
    <section aria-label="Algorithm Visualization" className="p-4">
      {children}
    </section>
  )
}
