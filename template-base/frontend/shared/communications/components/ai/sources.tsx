"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { BookOpenIcon, ChevronDownIcon } from "lucide-react"

interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Initial open state
   */
  defaultOpen?: boolean
}

/**
 * Sources - Collapsible source citations for AI-generated content
 * 
 * Features:
 * - Clean trigger showing source count
 * - Smooth expand/collapse animations
 * - Clickable source links opening in new tabs
 */
function Sources({ defaultOpen = false, className, children, ...props }: SourcesProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      data-slot="sources"
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg border bg-muted/30",
        className
      )}
      {...props}
    >
      {children}
    </Collapsible>
  )
}

interface SourcesTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
  /**
   * Number of sources
   */
  count: number
}

/**
 * SourcesTrigger - Clickable trigger showing source count
 */
function SourcesTrigger({ count, className, children, ...props }: SourcesTriggerProps) {
  return (
    <CollapsibleTrigger
      data-slot="sources-trigger"
      className={cn(
        "flex w-full items-center justify-between gap-2 p-3 text-sm",
        "hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      {children ?? (
        <div className="flex items-center gap-2">
          <BookOpenIcon className="size-4" />
          <span className="font-medium">
            Used {count} source{count !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      <ChevronDownIcon className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
    </CollapsibleTrigger>
  )
}

interface SourcesContentProps extends React.ComponentProps<typeof CollapsibleContent> {}

/**
 * SourcesContent - Container for source links with animations
 */
function SourcesContent({ className, children, ...props }: SourcesContentProps) {
  return (
    <CollapsibleContent
      data-slot="sources-content"
      className={cn("border-t", className)}
      {...props}
    >
      <div className="p-3 space-y-2">
        {children}
      </div>
    </CollapsibleContent>
  )
}

interface SourceProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Source URL
   */
  href?: string
  /**
   * Source title or description
   */
  title?: string
}

/**
 * Source - Individual source link with icon
 */
function Source({ href, title, children, className, ...props }: SourceProps) {
  return (
    <a
      data-slot="source"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 text-sm text-primary hover:underline underline-offset-2",
        className
      )}
      {...props}
    >
      <BookOpenIcon className="size-3.5 shrink-0" />
      <span className="truncate">{children ?? title ?? href}</span>
    </a>
  )
}

export { Sources, SourcesTrigger, SourcesContent, Source }
export type { SourcesProps, SourcesTriggerProps, SourcesContentProps, SourceProps }
