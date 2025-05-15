'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3Icon, BinaryIcon, TimerIcon } from 'lucide-react'

interface ToolInfo {
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const tools: ToolInfo[] = [
  {
    title: 'Interactive Sorting Visualizer',
    description:
      'Explore and understand various sorting algorithms like Merge Sort, Quick Sort, and Bubble Sort through dynamic, step-by-step visualizations.',
    href: '/logic/sort',
    icon: BarChart3Icon,
  },
  {
    title: 'Boolean Algebra Toolkit',
    description:
      'Simplify boolean expressions, generate truth tables, visualize with Karnaugh maps, and delve into the fundamentals of logic gates.',
    href: '/logic/boolean-algebra',
    icon: BinaryIcon,
  },
  {
    title: 'Productivity Pomodoro Timer',
    description:
      'Boost your focus and manage your work or study sessions effectively with a customizable Pomodoro timer. Track your cycles and stay productive.',
    href: '/tasks/pomodoro',
    icon: TimerIcon,
  },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Science Tools
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover a collection of interactive tools designed to enhance your understanding of
          complex concepts and boost your productivity.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <Card
              key={tool.href}
              className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:shadow-primary/20"
            >
              <CardHeader className="pb-4">
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <tool.icon className="size-6" />
                </div>
                <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    Explore Tool <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <footer className="mt-16 border-t pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Science Tools. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
