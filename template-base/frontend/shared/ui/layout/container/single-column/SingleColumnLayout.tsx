/**
 * Single Column Layout
 * 
 * A simple container layout for single-column pages.
 * Supports max-width constraints, centering, and header/footer slots.
 */

import { cn } from "@/lib/utils"
import type { SingleColumnLayoutProps } from "./types"

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
  "screen-xl": "max-w-screen-xl", // Alias
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export function SingleColumnLayout({
  children,
  header,
  footer,
  className,
  maxWidth = "full",
  centered = true,
  padding = "none",
}: SingleColumnLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-full w-full bg-background", className)}>
      {header && <header className="shrink-0">{header}</header>}
      
      <main 
        className={cn(
          "flex-1 w-full",
          centered && "mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding]
        )}
      >
        {children}
      </main>
      
      {footer && <footer className="shrink-0">{footer}</footer>}
    </div>
  )
}
