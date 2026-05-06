/**
 * Column Layout System
 * 
 * Provides consistent layout structure for each column in a multi-column layout.
 * Each column can have:
 * - Header (fixed, doesn't scroll)
 * - Main/Body (scrollable content area)
 * - Footer (fixed, doesn't scroll)
 * 
 * This ensures consistent behavior across all columns (left, center, right).
 * 
 * @module shared/ui/layout/container/column-layout
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Header } from "../../header"

// =============================================================================
// Types
// =============================================================================

export interface ColumnLayoutProps {
  /** Header content (fixed at top, doesn't scroll) */
  header?: React.ReactNode
  /** Main content (scrollable) */
  children: React.ReactNode
  /** Footer content (fixed at bottom, doesn't scroll) */
  footer?: React.ReactNode
  /** Use internal ScrollArea or let content handle its own scrolling */
  scrollable?: boolean
  /** Additional class for the container */
  className?: string
  /** Additional class for the header */
  headerClassName?: string
  /** Additional class for the main/body area */
  mainClassName?: string
  /** Additional class for the footer */
  footerClassName?: string
  /** Padding preset */
  padding?: "none" | "sm" | "md" | "lg"
}

export interface ColumnHeaderProps {
  children: React.ReactNode
  className?: string
  /** Border style */
  border?: boolean | "subtle"
  /** Background style */
  background?: "transparent" | "muted" | "solid"
  /** Sticky behavior */
  sticky?: boolean
}

export interface ColumnMainProps {
  children: React.ReactNode
  className?: string
  /** Use ScrollArea wrapper */
  scrollable?: boolean
  /** Padding preset */
  padding?: "none" | "sm" | "md" | "lg"
}

export interface ColumnFooterProps {
  children: React.ReactNode
  className?: string
  /** Border style */
  border?: boolean | "subtle"
  /** Background style */
  background?: "transparent" | "muted" | "solid"
}

// =============================================================================
// Padding utilities
// =============================================================================

const paddingClasses = {
  none: "",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
}

// =============================================================================
// Column Header Component
// =============================================================================

export function ColumnHeader({
  children,
  className,
  border = true,
  background = "transparent",
  sticky = false,
}: ColumnHeaderProps) {
  return (
    <Header
      variant={background === "transparent" ? "transparent" : "default"}
      border={border === true}
      sticky={sticky}
      className={cn(
        "p-0 min-h-0", // Reset padding/height constraints to act as a wrapper
        background === "muted" && "bg-muted/50",
        border === "subtle" && "border-b border-border/50",
        className
      )}
    >
      {children}
    </Header>
  )
}

// =============================================================================
// Column Main/Body Component
// =============================================================================

export function ColumnMain({
  children,
  className,
  scrollable = true,
  padding = "none",
}: ColumnMainProps) {
  const content = (
    <div className={cn("flex-1 min-h-0", paddingClasses[padding], className)}>
      {children}
    </div>
  )

  if (scrollable) {
    return (
      <ScrollArea className="flex-1 min-h-0">
        {content}
      </ScrollArea>
    )
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", paddingClasses[padding], className)}>
      {children}
    </div>
  )
}

// =============================================================================
// Column Footer Component
// =============================================================================

export function ColumnFooter({
  children,
  className,
  border = true,
  background = "transparent",
}: ColumnFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 z-10",
        // Border
        border === true && "border-t",
        border === "subtle" && "border-t border-border/50",
        // Background
        background === "muted" && "bg-muted/50",
        background === "solid" && "bg-background",
        className
      )}
    >
      {children}
    </div>
  )
}

// =============================================================================
// Main Column Layout Component
// =============================================================================

export function ColumnLayout({
  header,
  children,
  footer,
  scrollable = true,
  className,
  headerClassName,
  mainClassName,
  footerClassName,
  padding = "none",
}: ColumnLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      {/* Header - Fixed */}
      {header && (
        <ColumnHeader className={headerClassName}>
          {header}
        </ColumnHeader>
      )}

      {/* Main Content - Scrollable */}
      <ColumnMain 
        scrollable={scrollable} 
        padding={padding} 
        className={mainClassName}
      >
        {children}
      </ColumnMain>

      {/* Footer - Fixed */}
      {footer && (
        <ColumnFooter className={footerClassName}>
          {footer}
        </ColumnFooter>
      )}
    </div>
  )
}

// =============================================================================
// Preset Layouts
// =============================================================================

/**
 * Left Panel Layout - Typically for navigation/sidebar content
 */
export function LeftPanelLayout({
  header,
  children,
  footer,
  className,
}: Omit<ColumnLayoutProps, "scrollable" | "padding">) {
  return (
    <ColumnLayout
      header={header}
      footer={footer}
      scrollable={true}
      className={cn("bg-muted/30", className)}
    >
      {children}
    </ColumnLayout>
  )
}

/**
 * Center Panel Layout - Main content area
 */
export function CenterPanelLayout({
  header,
  children,
  footer,
  className,
}: Omit<ColumnLayoutProps, "scrollable" | "padding">) {
  return (
    <ColumnLayout
      header={header}
      footer={footer}
      scrollable={true}
      className={className}
    >
      {children}
    </ColumnLayout>
  )
}

/**
 * Right Panel Layout - Inspector/details panel
 */
export function RightPanelLayout({
  header,
  children,
  footer,
  className,
}: Omit<ColumnLayoutProps, "scrollable" | "padding">) {
  return (
    <ColumnLayout
      header={header}
      footer={footer}
      scrollable={true}
      className={cn("bg-muted/20", className)}
    >
      {children}
    </ColumnLayout>
  )
}

// =============================================================================
// Compound Components for Fine-grained Control
// =============================================================================

/**
 * Panel Root - The outermost container
 */
export function PanelRoot({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      {children}
    </div>
  )
}

/**
 * Panel Header - Fixed header area
 */
export function PanelHeader({
  children,
  className,
  border = true,
  background = "transparent",
  padding = "md",
}: {
  children: React.ReactNode
  className?: string
  border?: boolean | "subtle"
  background?: "transparent" | "muted" | "solid"
  padding?: "none" | "sm" | "md" | "lg"
}) {
  const paddingMap = {
    none: "",
    sm: "px-2 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  }

  return (
    <div
      className={cn(
        "shrink-0 z-10",
        paddingMap[padding],
        border === true && "border-b",
        border === "subtle" && "border-b border-border/50",
        background === "muted" && "bg-muted/50",
        background === "solid" && "bg-background",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Panel Body - Scrollable content area
 */
export function PanelBody({
  children,
  className,
  scrollable = true,
}: {
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}) {
  if (scrollable) {
    return (
      <ScrollArea className={cn("flex-1 min-h-0", className)}>
        <div className="h-full">
          {children}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-auto", className)}>
      {children}
    </div>
  )
}

/**
 * Panel Footer - Fixed footer area
 */
export function PanelFooter({
  children,
  className,
  border = true,
  background = "transparent",
  padding = "md",
}: {
  children: React.ReactNode
  className?: string
  border?: boolean | "subtle"
  background?: "transparent" | "muted" | "solid"
  padding?: "none" | "sm" | "md" | "lg"
}) {
  const paddingMap = {
    none: "",
    sm: "px-2 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  }

  return (
    <div
      className={cn(
        "shrink-0 z-10",
        paddingMap[padding],
        border === true && "border-t",
        border === "subtle" && "border-t border-border/50",
        background === "muted" && "bg-muted/50",
        background === "solid" && "bg-background",
        className
      )}
    >
      {children}
    </div>
  )
}

export default ColumnLayout
