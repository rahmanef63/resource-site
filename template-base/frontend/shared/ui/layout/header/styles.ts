/**
 * Header Styles
 * 
 * CSS class generators for the header system.
 * Provides consistent styling across all header variants.
 */

import { cn } from "@/lib/utils"
import type {
  HeaderVariant,
  HeaderSize,
  HeaderLayout,
  HeaderAlignment,
} from "./types"

// ============================================================================
// Container Styles
// ============================================================================

/**
 * Get header container classes
 */
export function getHeaderContainerClasses(options: {
  variant?: HeaderVariant
  size?: HeaderSize
  layout?: HeaderLayout
  background?: boolean
  border?: boolean
  shadow?: boolean
  sticky?: boolean
  fullWidth?: boolean
  className?: string
}): string {
  const {
    variant = "default",
    size = "md",
    layout = "standard",
    background = true,
    border = true,
    shadow = false,
    sticky = false,
    fullWidth = true,
    className,
  } = options

  return cn(
    // Base
    "relative w-full",
    
    // Layout
    layout === "standard" && "flex items-center justify-between gap-4",
    layout === "centered" && "flex flex-col items-center text-center gap-2",
    layout === "split" && "grid grid-cols-3 gap-4 items-center",
    layout === "stacked" && "flex flex-col gap-3",
    
    // Padding by size
    size === "xs" && "px-2 py-1",
    size === "sm" && "px-3 py-2",
    size === "md" && "px-4 py-3",
    size === "lg" && "px-6 py-4",
    size === "xl" && "px-8 py-6",
    
    // Background
    background && variant !== "transparent" && "bg-background",
    variant === "elevated" && "bg-card",
    variant === "floating" && "bg-card mx-4 rounded-lg",
    
    // Border
    border && "border-b border-border",
    variant === "floating" && "border rounded-lg",
    
    // Shadow
    shadow && "shadow-sm",
    variant === "elevated" && "shadow-md",
    variant === "floating" && "shadow-lg",
    
    // Sticky
    sticky && "sticky top-0 z-40",
    variant === "sticky" && "sticky top-0 z-40",
    
    // Width
    !fullWidth && "max-w-7xl mx-auto",
    
    // Variant overrides
    variant === "compact" && "py-2",
    variant === "minimal" && "bg-transparent border-0",
    variant === "transparent" && "bg-transparent",
    
    className
  )
}

// ============================================================================
// Section Styles
// ============================================================================

/**
 * Get header section classes (for split layout)
 */
export function getHeaderSectionClasses(options: {
  position: "left" | "center" | "right"
  align?: HeaderAlignment
  className?: string
}): string {
  const { position, align, className } = options

  return cn(
    "flex items-center gap-3",
    
    // Position-based alignment
    position === "left" && "justify-start",
    position === "center" && "justify-center",
    position === "right" && "justify-end",
    
    // Custom alignment override
    align === "start" && "justify-start",
    align === "center" && "justify-center",
    align === "end" && "justify-end",
    align === "between" && "justify-between",
    align === "around" && "justify-around",
    
    className
  )
}

// ============================================================================
// Title Styles
// ============================================================================

/**
 * Get title wrapper classes
 */
export function getTitleWrapperClasses(options: {
  layout?: HeaderLayout
  hasIcon?: boolean
  className?: string
}): string {
  const { layout = "standard", hasIcon, className } = options

  return cn(
    "flex items-center gap-3",
    layout === "centered" && "flex-col text-center gap-1",
    layout === "stacked" && "flex-col items-start gap-1",
    hasIcon && "min-w-0", // For text truncation
    className
  )
}

/**
 * Get title text classes
 */
export function getTitleClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "font-semibold tracking-tight",
    
    // Size variants
    size === "xs" && "text-sm",
    size === "sm" && "text-base",
    size === "md" && "text-lg",
    size === "lg" && "text-xl",
    size === "xl" && "text-2xl",
    
    className
  )
}

/**
 * Get subtitle text classes
 */
export function getSubtitleClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "text-muted-foreground",
    
    // Size variants
    size === "xs" && "text-xs",
    size === "sm" && "text-xs",
    size === "md" && "text-sm",
    size === "lg" && "text-sm",
    size === "xl" && "text-base",
    
    className
  )
}

// ============================================================================
// Icon Styles
// ============================================================================

/**
 * Get icon container classes
 */
export function getIconContainerClasses(options: {
  size?: HeaderSize
  variant?: "default" | "muted" | "primary" | "secondary"
  className?: string
}): string {
  const { size = "md", variant = "default", className } = options

  return cn(
    "shrink-0 flex items-center justify-center rounded-md",
    
    // Size variants
    size === "xs" && "h-6 w-6",
    size === "sm" && "h-8 w-8",
    size === "md" && "h-10 w-10",
    size === "lg" && "h-12 w-12",
    size === "xl" && "h-14 w-14",
    
    // Variant colors
    variant === "default" && "bg-primary/10 text-primary",
    variant === "muted" && "bg-muted text-muted-foreground",
    variant === "primary" && "bg-primary text-primary-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground",
    
    className
  )
}

/**
 * Get icon size in pixels or class
 */
export function getIconSizeClass(size?: HeaderSize): string {
  switch (size) {
    case "xs":
      return "h-3.5 w-3.5"
    case "sm":
      return "h-4 w-4"
    case "md":
      return "h-5 w-5"
    case "lg":
      return "h-6 w-6"
    case "xl":
      return "h-8 w-8"
    default:
      return "h-5 w-5"
  }
}

/**
 * Get icon size in pixels
 */
export function getIconSizePixels(size?: HeaderSize): number {
  switch (size) {
    case "xs":
      return 14
    case "sm":
      return 16
    case "md":
      return 20
    case "lg":
      return 24
    case "xl":
      return 32
    default:
      return 20
  }
}

// ============================================================================
// Actions Styles
// ============================================================================

/**
 * Get actions container classes
 */
export function getActionsContainerClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "flex items-center shrink-0",
    
    // Gap by size
    size === "xs" && "gap-1",
    size === "sm" && "gap-1.5",
    size === "md" && "gap-2",
    size === "lg" && "gap-3",
    size === "xl" && "gap-4",
    
    className
  )
}

// ============================================================================
// Breadcrumb Styles
// ============================================================================

/**
 * Get breadcrumbs container classes
 */
export function getBreadcrumbsContainerClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "flex items-center flex-wrap",
    
    // Size variants
    size === "xs" && "text-xs gap-1",
    size === "sm" && "text-xs gap-1",
    size === "md" && "text-sm gap-1.5",
    size === "lg" && "text-sm gap-2",
    size === "xl" && "text-base gap-2",
    
    className
  )
}

/**
 * Get breadcrumb item classes
 */
export function getBreadcrumbItemClasses(options: {
  isLink?: boolean
  isCurrent?: boolean
  className?: string
}): string {
  const { isLink, isCurrent, className } = options

  return cn(
    "flex items-center gap-1",
    
    // Link styles
    isLink && "hover:text-foreground transition-colors cursor-pointer",
    isLink && !isCurrent && "text-muted-foreground hover:text-foreground",
    
    // Current item
    isCurrent && "text-foreground font-medium",
    !isCurrent && !isLink && "text-muted-foreground",
    
    className
  )
}

/**
 * Get breadcrumb separator classes
 */
export function getBreadcrumbSeparatorClasses(options?: {
  className?: string
}): string {
  return cn(
    "text-muted-foreground/50 mx-0.5 select-none",
    options?.className
  )
}

// ============================================================================
// Search Styles
// ============================================================================

/**
 * Get search container classes
 */
export function getSearchContainerClasses(options: {
  size?: HeaderSize
  expanded?: boolean
  className?: string
}): string {
  const { size = "md", expanded, className } = options

  return cn(
    "relative flex items-center",
    
    // Width
    expanded && "flex-1 max-w-md",
    !expanded && "w-auto",
    
    // Size
    size === "xs" && "h-7",
    size === "sm" && "h-8",
    size === "md" && "h-9",
    size === "lg" && "h-10",
    size === "xl" && "h-12",
    
    className
  )
}

/**
 * Get search input classes
 */
export function getSearchInputClasses(options: {
  size?: HeaderSize
  hasIcon?: boolean
  className?: string
}): string {
  const { size = "md", hasIcon, className } = options

  return cn(
    "w-full rounded-md border border-input bg-background",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "placeholder:text-muted-foreground",
    
    // Size
    size === "xs" && "h-7 text-xs",
    size === "sm" && "h-8 text-sm",
    size === "md" && "h-9 text-sm",
    size === "lg" && "h-10 text-base",
    size === "xl" && "h-12 text-base",
    
    // Padding with icon
    hasIcon && "pl-9",
    !hasIcon && "px-3",
    
    className
  )
}

// ============================================================================
// Badge Styles
// ============================================================================

/**
 * Get header badge classes
 */
export function getHeaderBadgeClasses(options: {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  size?: HeaderSize
  className?: string
}): string {
  const { variant = "default", size = "md", className } = options

  return cn(
    "inline-flex items-center rounded-full font-medium",
    
    // Size
    size === "xs" && "px-1.5 py-0.5 text-[10px]",
    size === "sm" && "px-2 py-0.5 text-xs",
    size === "md" && "px-2.5 py-0.5 text-xs",
    size === "lg" && "px-3 py-1 text-sm",
    size === "xl" && "px-3.5 py-1 text-sm",
    
    // Variants
    variant === "default" && "bg-primary text-primary-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground",
    variant === "destructive" && "bg-destructive text-destructive-foreground",
    variant === "outline" && "border border-border text-foreground",
    variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    variant === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    
    className
  )
}

// ============================================================================
// Meta/Stats Styles
// ============================================================================

/**
 * Get meta container classes
 */
export function getMetaContainerClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "flex items-center text-muted-foreground",
    
    // Size
    size === "xs" && "text-[10px] gap-2",
    size === "sm" && "text-xs gap-2",
    size === "md" && "text-xs gap-3",
    size === "lg" && "text-sm gap-3",
    size === "xl" && "text-sm gap-4",
    
    className
  )
}

/**
 * Get meta item classes
 */
export function getMetaItemClasses(options?: {
  className?: string
}): string {
  return cn(
    "flex items-center gap-1",
    options?.className
  )
}

/**
 * Get meta separator classes
 */
export function getMetaSeparatorClasses(options: {
  separator?: "dot" | "pipe" | "slash" | "none"
  className?: string
}): string {
  const { separator = "dot", className } = options

  if (separator === "none") return "hidden"

  return cn(
    "text-muted-foreground/50",
    separator === "dot" && "text-[8px]", // For bullet point
    separator === "pipe" && "text-xs",
    separator === "slash" && "text-xs",
    className
  )
}

// ============================================================================
// Toolbar Styles
// ============================================================================

/**
 * Get toolbar container classes
 */
export function getToolbarClasses(options: {
  size?: HeaderSize
  border?: boolean
  className?: string
}): string {
  const { size = "md", border, className } = options

  return cn(
    "flex items-center gap-2 w-full",
    
    // Size (padding)
    size === "xs" && "px-2 py-1",
    size === "sm" && "px-3 py-1.5",
    size === "md" && "px-4 py-2",
    size === "lg" && "px-6 py-2.5",
    size === "xl" && "px-8 py-3",
    
    // Border
    border && "border-t border-border",
    
    className
  )
}

// ============================================================================
// Back Button Styles
// ============================================================================

/**
 * Get back button classes
 */
export function getBackButtonClasses(options: {
  size?: HeaderSize
  className?: string
}): string {
  const { size = "md", className } = options

  return cn(
    "flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors",
    
    // Size
    size === "xs" && "text-xs",
    size === "sm" && "text-sm",
    size === "md" && "text-sm",
    size === "lg" && "text-base",
    size === "xl" && "text-base",
    
    className
  )
}
