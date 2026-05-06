"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface SuggestionsProps extends React.ComponentProps<typeof ScrollArea> {}

/**
 * Suggestions - Scrollable container for suggestion pills
 * 
 * Features:
 * - Horizontal scrolling with hidden scrollbar
 * - Touch-Contactly scrolling
 * - Automatic overflow handling
 */
function Suggestions({ className, children, ...props }: SuggestionsProps) {
  return (
    <ScrollArea
      data-slot="suggestions"
      className={cn("w-full whitespace-nowrap", className)}
      {...props}
    >
      <div className="flex gap-2 p-1">
        {children}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}

interface SuggestionProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /**
   * Text to display and emit
   */
  suggestion: string
  /**
   * Callback when clicked
   */
  onClick?: (suggestion: string) => void
}

/**
 * Suggestion - Individual clickable suggestion button
 * 
 * Features:
 * - Click-to-send functionality
 * - Rounded pill styling
 * - Customizable button variants
 */
function Suggestion({
  suggestion,
  onClick,
  variant = "outline",
  size = "sm",
  className,
  children,
  ...props
}: SuggestionProps) {
  const handleClick = () => {
    onClick?.(suggestion)
  }

  return (
    <Button
      data-slot="suggestion"
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "shrink-0 rounded-full",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children ?? suggestion}
    </Button>
  )
}

export { Suggestions, Suggestion }
export type { SuggestionsProps, SuggestionProps }
