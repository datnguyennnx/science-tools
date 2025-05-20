// components/ui/dialog-guide/index.tsx
'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Guide root component
const DialogGuide = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    trigger?: React.ReactNode
    title?: string
    description?: string
  }
>(({ className, trigger, title, description, children, ...props }, ref) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" aria-label="Open Guide">
            <HelpCircle className="h-5 w-5" />
            <p className="sr-only">Open Guide</p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn('min-w-4xl max-h-[80vh] overflow-y-auto no-scrollbar', className)}
        {...props}
        ref={ref}
      >
        <DialogHeader>
          <DialogTitle className="text-[--color-foreground]">{title || 'Guide'}</DialogTitle>
          {description && (
            <DialogDescription className="text-[--color-muted-foreground]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
})
DialogGuide.displayName = 'DialogGuide'

// Guide Content wrapper
const GuideWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn('flex w-full h-full space-x-4', className)} ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
GuideWrapper.displayName = 'GuideWrapper'

// Guide Sidebar
const GuideSidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('w-fit pr-4 border-r border-[var(--border)]', className)}
        ref={ref}
        {...props}
      >
        <nav className="py-2">{children}</nav>
      </div>
    )
  }
)
GuideSidebar.displayName = 'GuideSidebar'

// Guide Group
interface GuideGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  expanded?: boolean
  onToggle?: () => void
}

const GuideGroup = React.forwardRef<HTMLDivElement, GuideGroupProps>(
  ({ className, name, expanded = false, onToggle, children, ...props }, ref) => {
    return (
      <div className={cn('mb-1', className)} ref={ref} {...props}>
        <Button
          variant="ghost"
          onClick={onToggle}
          className="flex text-left w-full justify-between"
        >
          {name}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {expanded && <div className="ml-4">{children}</div>}
      </div>
    )
  }
)
GuideGroup.displayName = 'GuideGroup'

// Guide Item
interface GuideItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const GuideItem = React.forwardRef<HTMLButtonElement, GuideItemProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <Button
        variant="ghost"
        ref={ref}
        className={cn('flex text-left', active && 'bg-accent', className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
GuideItem.displayName = 'GuideItem'

// Guide Content Area
const GuideContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn('flex-1 w-full', className)} ref={ref} {...props}>
        {children}
      </div>
    )
  }
)
GuideContent.displayName = 'GuideContent'

// Guide Content Title
const GuideContentTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h2 className={cn('text-lg font-medium mb-2', className)} ref={ref} {...props}>
      {children}
    </h2>
  )
})
GuideContentTitle.displayName = 'GuideContentTitle'

// Guide Content Description
const GuideContentDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      className={cn('text-sm text-[var(--muted-foreground)] mb-4', className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  )
})
GuideContentDescription.displayName = 'GuideContentDescription'

// Guide Content Item
const GuideContentItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('border-b border-[var(--border)] pb-4 last:border-b-0', className)}
        ref={ref}
        {...props}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }
)
GuideContentItem.displayName = 'GuideContentItem'

// Guide Content Item Title
const GuideContentItemTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3 className={cn('font-medium text-sm whitespace-nowrap', className)} ref={ref} {...props}>
      {children}
    </h3>
  )
})
GuideContentItemTitle.displayName = 'GuideContentItemTitle'

// Guide Content Item Description
const GuideContentItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      className={cn('text-xs text-[var(--muted-foreground)] mt-1', className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  )
})
GuideContentItemDescription.displayName = 'GuideContentItemDescription'

export {
  DialogGuide,
  GuideWrapper,
  GuideSidebar,
  GuideGroup,
  GuideItem,
  GuideContent,
  GuideContentTitle,
  GuideContentDescription,
  GuideContentItem,
  GuideContentItemTitle,
  GuideContentItemDescription,
}
