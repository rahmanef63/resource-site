"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

// Context for citation index management
interface InlineCitationCarouselContextValue {
  currentIndex: number
  totalItems: number
  goToNext: () => void
  goToPrevious: () => void
}

const InlineCitationCarouselContext = React.createContext<InlineCitationCarouselContextValue>({
  currentIndex: 0,
  totalItems: 0,
  goToNext: () => {},
  goToPrevious: () => {},
})

// ============================================================================
// InlineCitation
// ============================================================================

interface InlineCitationProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * Container for citation text and card
 */
function InlineCitation({ className, children, ...props }: InlineCitationProps) {
  return (
    <span
      data-slot="inline-citation"
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {children}
    </span>
  )
}

// ============================================================================
// InlineCitationText
// ============================================================================

interface InlineCitationTextProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * Styled text that shows hover effects
 */
function InlineCitationText({ className, ...props }: InlineCitationTextProps) {
  return (
    <span
      data-slot="inline-citation-text"
      className={cn(
        "border-b border-dashed border-foreground/30 hover:border-foreground/60 transition-colors",
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// InlineCitationCard
// ============================================================================

interface InlineCitationCardProps extends React.ComponentPropsWithoutRef<typeof HoverCard> {}

/**
 * Hover card container for citation details
 */
function InlineCitationCard({ ...props }: InlineCitationCardProps) {
  return <HoverCard data-slot="inline-citation-card" openDelay={200} closeDelay={100} {...props} />
}

// ============================================================================
// InlineCitationCardTrigger
// ============================================================================

interface InlineCitationCardTriggerProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  /**
   * Array of source URLs
   */
  sources: string[]
}

/**
 * Badge trigger showing source hostname and count
 */
function InlineCitationCardTrigger({ sources, className, ...props }: InlineCitationCardTriggerProps) {
  const hostname = React.useMemo(() => {
    if (!sources.length) return "unknown"
    try {
      const url = new URL(sources[0])
      return url.hostname.replace("www.", "")
    } catch {
      return "unknown"
    }
  }, [sources])

  const count = sources.length

  return (
    <HoverCardTrigger asChild>
      <Badge
        data-slot="inline-citation-card-trigger"
        variant="secondary"
        className={cn(
          "cursor-pointer text-xs px-1.5 py-0.5 font-normal hover:bg-accent",
          className
        )}
        {...props}
      >
        {hostname}
        {count > 1 && <span className="ml-1 opacity-60">+{count - 1}</span>}
      </Badge>
    </HoverCardTrigger>
  )
}

// ============================================================================
// InlineCitationCardBody
// ============================================================================

interface InlineCitationCardBodyProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Content container for citation details
 */
function InlineCitationCardBody({ className, ...props }: InlineCitationCardBodyProps) {
  return (
    <HoverCardContent
      data-slot="inline-citation-card-body"
      className={cn("w-80 p-0", className)}
      align="start"
      {...props}
    />
  )
}

// ============================================================================
// InlineCitationCarousel
// ============================================================================

interface InlineCitationCarouselProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Carousel for navigating multiple citations
 */
function InlineCitationCarousel({ className, children, ...props }: InlineCitationCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [totalItems, setTotalItems] = React.useState(0)

  const isCarouselContentElement = React.useCallback(
    (child: React.ReactNode): child is React.ReactElement<InlineCitationCarouselContentProps> =>
      React.isValidElement<InlineCitationCarouselContentProps>(child) &&
      (child.type as { displayName?: string })?.displayName === "InlineCitationCarouselContent",
    []
  )

  // Count children to set total
  React.useEffect(() => {
    React.Children.forEach(children, (child) => {
      if (isCarouselContentElement(child)) {
        setTotalItems(React.Children.count(child.props.children))
      }
    })
  }, [children, isCarouselContentElement])

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
  }, [totalItems])

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
  }, [totalItems])

  return (
    <InlineCitationCarouselContext.Provider value={{ currentIndex, totalItems, goToNext, goToPrevious }}>
      <div
        data-slot="inline-citation-carousel"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </InlineCitationCarouselContext.Provider>
  )
}

// ============================================================================
// InlineCitationCarouselHeader
// ============================================================================

interface InlineCitationCarouselHeaderProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Header with navigation controls
 */
function InlineCitationCarouselHeader({ className, children, ...props }: InlineCitationCarouselHeaderProps) {
  const { currentIndex, totalItems, goToNext, goToPrevious } = React.useContext(InlineCitationCarouselContext)

  if (totalItems <= 1) return null

  return (
    <div
      data-slot="inline-citation-carousel-header"
      className={cn("flex items-center justify-between px-3 py-2 border-b", className)}
      {...props}
    >
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={goToPrevious}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      {children}
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={goToNext}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ============================================================================
// InlineCitationCarouselIndex
// ============================================================================

interface InlineCitationCarouselIndexProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * Current index display
 */
function InlineCitationCarouselIndex({ className, ...props }: InlineCitationCarouselIndexProps) {
  const { currentIndex, totalItems } = React.useContext(InlineCitationCarouselContext)

  return (
    <span
      data-slot="inline-citation-carousel-index"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {currentIndex + 1} of {totalItems}
    </span>
  )
}

// ============================================================================
// InlineCitationCarouselContent
// ============================================================================

interface InlineCitationCarouselContentProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Content wrapper for carousel items
 */
function InlineCitationCarouselContent({ className, children, ...props }: InlineCitationCarouselContentProps) {
  const { currentIndex } = React.useContext(InlineCitationCarouselContext)
  const childArray = React.Children.toArray(children)

  return (
    <div
      data-slot="inline-citation-carousel-content"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {childArray[currentIndex]}
    </div>
  )
}
InlineCitationCarouselContent.displayName = "InlineCitationCarouselContent"

// ============================================================================
// InlineCitationCarouselItem
// ============================================================================

interface InlineCitationCarouselItemProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Individual citation item in carousel
 */
function InlineCitationCarouselItem({ className, ...props }: InlineCitationCarouselItemProps) {
  return (
    <div
      data-slot="inline-citation-carousel-item"
      className={cn("p-3", className)}
      {...props}
    />
  )
}

// ============================================================================
// InlineCitationSource
// ============================================================================

interface InlineCitationSourceProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Source title
   */
  title?: string
  /**
   * Source URL
   */
  url?: string
  /**
   * Source description
   */
  description?: string
}

/**
 * Source information display
 */
function InlineCitationSource({ title, url, description, className, ...props }: InlineCitationSourceProps) {
  return (
    <div
      data-slot="inline-citation-source"
      className={cn("space-y-1", className)}
      {...props}
    >
      {title && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm hover:underline flex items-center gap-1"
        >
          {title}
          <ExternalLinkIcon className="h-3 w-3 opacity-50" />
        </a>
      )}
      {url && (
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      )}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
    </div>
  )
}

// ============================================================================
// InlineCitationQuote
// ============================================================================

interface InlineCitationQuoteProps extends React.ComponentPropsWithoutRef<'blockquote'> {}

/**
 * Styled blockquote for excerpts
 */
function InlineCitationQuote({ className, ...props }: InlineCitationQuoteProps) {
  return (
    <blockquote
      data-slot="inline-citation-quote"
      className={cn(
        "mt-2 border-l-2 border-muted-foreground/30 pl-2 text-xs text-muted-foreground italic",
        className
      )}
      {...props}
    />
  )
}

export {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationQuote,
}
export type {
  InlineCitationProps,
  InlineCitationTextProps,
  InlineCitationCardProps,
  InlineCitationCardTriggerProps,
  InlineCitationCardBodyProps,
  InlineCitationCarouselProps,
  InlineCitationCarouselHeaderProps,
  InlineCitationCarouselIndexProps,
  InlineCitationCarouselContentProps,
  InlineCitationCarouselItemProps,
  InlineCitationSourceProps,
  InlineCitationQuoteProps,
}
