// components/ui/dialog-guide/index.tsx
'use client'

import * as React from 'react'
import { ChevronDown, HelpCircle, Menu, X } from 'lucide-react'
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

// Type definitions for mobile state props
interface MobileStateProps {
  isMobileSidebarOpen?: boolean
  onMobileSidebarClose?: () => void
  currentPath?: string[]
  setCurrentPath?: React.Dispatch<React.SetStateAction<string[]>>
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

// Guide root component
const DialogGuide = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    trigger?: React.ReactNode
    title?: string
    description?: string
  }
>(({ className, trigger, title, description, children, ...props }, ref) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState<string[]>(['Home'])

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
        className={cn(
          // Remove default padding and gap, we'll handle our own
          '!p-0 !gap-0',
          // Base responsive width (50-75% based on screen)
          'w-[95vw] max-w-4xl',
          'sm:w-[85vw] sm:max-w-3xl',
          'md:w-[80vw] md:max-w-5xl',
          'lg:w-[75vw] lg:max-w-4xl',
          'xl:w-[70vw] xl:max-w-5xl',
          '2xl:w-[65vw] 2xl:max-w-6xl',
          '3xl:w-[60vw] 3xl:max-w-7xl',
          '4xl:w-[55vw] 4xl:max-w-[90rem]',
          '5xl:w-[50vw] 5xl:max-w-[100rem]',
          '6xl:w-[48vw] 6xl:max-w-[110rem]',
          '7xl:w-[45vw] 7xl:max-w-[120rem]',
          '8xl:w-[40vw] 8xl:max-w-[140rem]',
          // Height management (responsive)
          'h-[90vh] max-h-[90vh]',
          'sm:h-[85vh] sm:max-h-[85vh]',
          'md:h-[80vh] md:max-h-[80vh]',
          // Modern scrollbar and animations
          'overflow-hidden scrollbar-hide',
          'transition-all duration-300 ease-in-out',
          className
        )}
        {...props}
        ref={ref}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
              <div className="flex-1">
                <DialogTitle className="text-foreground text-lg font-semibold">
                  {title || 'Guide'}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-muted-foreground mt-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
              {/* Mobile Navigation Toggle - Full Width with Breadcrumbs */}
              <Button
                variant="outline"
                className="md:hidden w-full justify-start"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                aria-label={isMobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
              >
                <Menu className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="flex items-center min-w-0 flex-1">
                  <span className="text-sm truncate">
                    {currentPath.length > 1 ? currentPath[currentPath.length - 1] : 'Navigation'}
                  </span>
                  {currentPath.length > 1 && (
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {currentPath.slice(0, -1).join(' › ')}
                    </span>
                  )}
                </div>
                {!isMobileSidebarOpen && <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />}
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            {/* Pass mobile state to children */}
            {React.isValidElement(children) &&
              React.cloneElement(children as React.ReactElement<MobileStateProps>, {
                isMobileSidebarOpen,
                onMobileSidebarClose: () => setIsMobileSidebarOpen(false),
                currentPath,
                setCurrentPath,
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
DialogGuide.displayName = 'DialogGuide'

// Guide Content wrapper
const GuideWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isMobileSidebarOpen?: boolean
    onMobileSidebarClose?: () => void
  }
>(({ className, children, isMobileSidebarOpen = false, onMobileSidebarClose, ...props }, ref) => {
  return (
    <div
      className={cn(
        'flex w-full h-full min-h-0',
        // Desktop: side-by-side layout
        'md:flex-row md:gap-6',
        // Mobile: stacked layout
        'flex-col',
        className
      )}
      ref={ref}
      {...props}
    >
      {/* Pass mobile state to children, especially the sidebar */}
      {React.Children.map(children, (child, index) => {
        // First child should be the sidebar
        if (index === 0 && React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<SidebarProps>, {
            isOpen: isMobileSidebarOpen,
            onClose: onMobileSidebarClose,
            ...(child.props as object),
          })
        }
        return child
      })}
    </div>
  )
})
GuideWrapper.displayName = 'GuideWrapper'

// Guide Sidebar
const GuideSidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
    onClose?: () => void
  }
>(({ className, children, isOpen = false, onClose, ...props }, ref) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          // Hide on mobile, show on desktop
          'hidden md:flex',
          // Desktop dimensions
          'w-[280px] min-w-[240px] max-w-[320px]',
          'lg:w-[280px] lg:max-w-[320px]',
          // Minimal modern styling
          'flex-shrink-0 flex-col',
          'bg-card/50 backdrop-blur-sm',
          'border-r border-border/20',
          // Scrollbar hidden with smooth scroll
          'overflow-y-auto scrollbar-hide',
          'scroll-smooth',
          className
        )}
        ref={ref}
        {...props}
      >
        <nav className="p-4 space-y-2 flex-1">{children}</nav>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          // Mobile overlay positioning - ensure it's above the overlay
          'fixed top-0 left-0 z-[60] h-full',
          'md:hidden', // Hide on desktop
          // Mobile dimensions
          'w-[280px] max-w-[85vw]',
          // Minimal mobile styling
          'bg-card/95 backdrop-blur-sm',
          'border-r border-border/20',
          // Ensure pointer events work
          'pointer-events-auto',
          // Animation
          'transform transition-transform duration-300 ease-in-out',
          // Show/hide based on isOpen state
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        {...props}
      >
        <div
          className="flex flex-col h-full"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking inside sidebar
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4">
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Navigation Content */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">{children}</nav>
        </div>
      </div>
    </>
  )
})
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
      <div className={cn('mb-2', className)} ref={ref} {...props}>
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            'flex items-center justify-between w-full text-left',
            'hover:bg-accent/30 transition-colors duration-200',
            'px-3 py-2 h-auto',
            'text-sm font-medium text-foreground/90'
          )}
        >
          <span className="truncate">{name}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
              expanded && 'rotate-180'
            )}
          />
        </Button>

        {expanded && (
          <div className="mt-2 ml-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
            {children}
          </div>
        )}
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
        className={cn(
          'flex items-center text-left w-full justify-start',
          'hover:bg-accent/40 transition-all duration-200',
          'px-3 py-2 h-auto text-sm',
          'text-muted-foreground hover:text-foreground',
          'focus:ring-1 focus:ring-ring/50',
          active && ['bg-accent/60 text-accent-foreground', 'font-medium'],
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
      </Button>
    )
  }
)
GuideItem.displayName = 'GuideItem'

// Guide Content Area
const GuideContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex-1 w-full min-w-0',
          // Mobile: full width, no margin/padding adjustments needed
          'md:flex-1 md:w-full',
          // Minimal modern styling
          'bg-card/30 backdrop-blur-sm',
          // Hidden scrollbar with smooth scroll
          'overflow-y-auto scrollbar-hide',
          'scroll-smooth',
          // Content spacing
          'p-6',
          className
        )}
        ref={ref}
        {...props}
      >
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
        className={cn(
          'group relative',
          'border-b border-border/20 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0',
          'hover:bg-accent/3 transition-colors duration-200',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">{children}</div>
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
    <h3
      className={cn(
        'font-semibold text-base text-foreground mb-2',
        'group-hover:text-accent-foreground transition-colors duration-200',
        className
      )}
      ref={ref}
      {...props}
    >
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
      className={cn(
        'text-sm text-muted-foreground leading-relaxed',
        'group-hover:text-muted-foreground/80 transition-colors duration-200',
        className
      )}
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
