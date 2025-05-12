import { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Guide } from './components/common' // Assuming Guide is in a common components directory

export const metadata: Metadata = {
  title: 'Boolean Algebra Simplifier',
  description:
    'Simplify boolean expressions, visualize with K-maps, and learn boolean algebra laws and theorems',
  keywords: [
    'boolean algebra',
    'logic',
    'simplification',
    'k-map',
    'karnaugh map',
    'truth tables',
    'logic gates',
  ],
  openGraph: {
    title: 'Boolean Algebra Simplifier Tool',
    description: 'Simplify boolean expressions and visualize with interactive tools',
    type: 'website',
  },
}

interface BooleanAlgebraLayoutProps {
  children: ReactNode
}

export default function BooleanAlgebraLayout({ children }: BooleanAlgebraLayoutProps) {
  return (
    <section aria-label="Boolean Algebra Tool" className="flex flex-col h-full p-2 sm:p-4">
      <header className="w-full flex items-center justify-between mb-1 sm:mb-2 pt-1 sm:pt-2">
        <h1 className="text-lg sm:text-xl font-bold text-[--color-foreground]">
          Boolean Algebra Simplifier
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open Boolean Algebra Guide">
              <HelpCircle className="h-5 w-5" />
              <p className="sr-only">Open Guide</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-3xl max-h-[80vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-[--color-foreground]">Boolean Algebra Guide</DialogTitle>
              <DialogDescription className="text-[--color-muted-foreground]">
                Learn about boolean algebra operators and laws
              </DialogDescription>
            </DialogHeader>{' '}
            <Guide />
          </DialogContent>
        </Dialog>
      </header>
      <main className="w-full overflow-auto flex-1">{children}</main>
      <footer className="py-1 sm:py-2 mt-auto bg-[--color-background]">
        <p className="text-balance text-xs sm:text-sm text-center text-[--color-muted-foreground]">
          This is a basic Boolean algebra simplifier. For complex expressions, consider using
          advanced simplification algorithms.
        </p>
      </footer>
    </section>
  )
}
