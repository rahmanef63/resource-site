/**
 * Header System Types
 * 
 * Comprehensive type definitions for the unified header system.
 * Supports multiple header variants: Feature, Sidebar, Container, Page, etc.
 */

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

// ============================================================================
// Base Types
// ============================================================================

/**
 * Header size variants
 */
export type HeaderSize = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Header visual variants
 */
export type HeaderVariant = 
  | "default"      // Standard with border bottom
  | "minimal"      // No background, subtle
  | "compact"      // Reduced padding
  | "elevated"     // With shadow
  | "transparent"  // No background
  | "sticky"       // Sticky positioning
  | "floating"     // Floating with shadow

/**
 * Header layout types
 */
export type HeaderLayout = 
  | "standard"     // Left title, right actions
  | "centered"     // Centered title
  | "split"        // Left, center, right sections
  | "stacked"      // Title above, actions below

/**
 * Header alignment
 */
export type HeaderAlignment = "start" | "center" | "end" | "between" | "around"

// ============================================================================
// Breadcrumb Types
// ============================================================================

export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Navigation href */
  href?: string
  /** Click handler (alternative to href) */
  onClick?: () => void
  /** Optional icon */
  icon?: LucideIcon
  /** Is this the current/active item */
  isCurrent?: boolean
}

// ============================================================================
// Action Types
// ============================================================================

/**
 * Action button configuration
 */
export interface HeaderAction {
  /** Unique identifier */
  id: string
  /** Button label */
  label: string
  /** Button icon */
  icon?: LucideIcon
  /** Click handler */
  onClick?: () => void
  /** Navigation href */
  href?: string
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  /** Button size */
  size?: "sm" | "default" | "lg" | "icon"
  /** Is loading state */
  loading?: boolean
  /** Is disabled */
  disabled?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Keyboard shortcut */
  shortcut?: string
  /** Icon only (no label) */
  iconOnly?: boolean
  /** Additional className */
  className?: string
}

/**
 * Action group for dropdowns
 */
export interface HeaderActionGroup {
  /** Group label */
  label?: string
  /** Actions in this group */
  actions: HeaderAction[]
  /** Dropdown trigger */
  trigger?: {
    label: string
    icon?: LucideIcon
    iconOnly?: boolean
  }
}

// ============================================================================
// Badge Types
// ============================================================================

export interface HeaderBadgeConfig {
  /** Badge text */
  text: string
  /** Badge variant */
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  /** Badge icon */
  icon?: LucideIcon
}

// ============================================================================
// Search Types
// ============================================================================

export interface HeaderSearchConfig {
  /** Search value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Search icon */
  icon?: LucideIcon
  /** Show clear button */
  clearable?: boolean
  /** On clear handler */
  onClear?: () => void
  /** On submit handler */
  onSubmit?: (value: string) => void
  /** Keyboard shortcut */
  shortcut?: string
  /** Additional className */
  className?: string
}

// ============================================================================
// Meta/Stats Types
// ============================================================================

export interface HeaderMetaItem {
  /** Label */
  label: string
  /** Value */
  value: string | number
  /** Icon */
  icon?: LucideIcon
  /** Tooltip */
  tooltip?: string
}

export interface HeaderStats {
  /** Stats items */
  items: HeaderMetaItem[]
  /** Separator */
  separator?: "dot" | "pipe" | "slash" | "none"
}

// ============================================================================
// Slot Types
// ============================================================================

/**
 * Header slots for custom content
 */
export interface HeaderSlots {
  /** Content before title */
  beforeTitle?: ReactNode
  /** Content after title */
  afterTitle?: ReactNode
  /** Content before actions */
  beforeActions?: ReactNode
  /** Content after actions */
  afterActions?: ReactNode
  /** Center section content */
  center?: ReactNode
  /** Toolbar row below header */
  toolbar?: ReactNode
  /** Left section content */
  left?: ReactNode
  /** Right section content */
  right?: ReactNode
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Base header props (shared by all variants)
 */
export interface HeaderBaseProps {
  /** Header title */
  title?: string
  /** Title as ReactNode for custom rendering */
  titleNode?: ReactNode
  /** Subtitle/description */
  subtitle?: string
  /** Subtitle as ReactNode */
  subtitleNode?: ReactNode
  /** Feature/section icon */
  icon?: LucideIcon
  /** Icon size */
  iconSize?: HeaderSize
  /** Header variant */
  variant?: HeaderVariant
  /** Header size */
  size?: HeaderSize
  /** Header layout */
  layout?: HeaderLayout
  /** Background style */
  background?: boolean
  /** Border bottom */
  border?: boolean
  /** Shadow */
  shadow?: boolean
  /** Sticky header */
  sticky?: boolean
  /** Full width */
  fullWidth?: boolean
  /** Additional className */
  className?: string
  /** Children for custom content */
  children?: ReactNode
}

/**
 * Navigation props
 */
export interface HeaderNavigationProps {
  /** Breadcrumbs */
  breadcrumbs?: BreadcrumbItem[]
  /** Show back button */
  showBack?: boolean
  /** Back button handler */
  onBack?: () => void
  /** Back button label */
  backLabel?: string
}

/**
 * Action props
 */
export interface HeaderActionProps {
  /** Primary action button */
  primaryAction?: HeaderAction | ReactNode
  /** Secondary actions */
  secondaryActions?: HeaderAction[] | ReactNode
  /** Action groups (dropdowns) */
  actionGroups?: HeaderActionGroup[]
  /** Quick actions (icon buttons) */
  quickActions?: HeaderAction[]
}

/**
 * Content props
 */
export interface HeaderContentProps {
  /** Badge/status indicator */
  badge?: HeaderBadgeConfig | ReactNode
  /** Meta information */
  meta?: HeaderMetaItem[] | ReactNode
  /** Stats display */
  stats?: HeaderStats | ReactNode
  /** Search configuration */
  search?: HeaderSearchConfig | ReactNode
  /** Custom slots */
  slots?: HeaderSlots
}

/**
 * Complete Header props (combines all)
 */
export interface HeaderProps extends 
  HeaderBaseProps,
  HeaderNavigationProps,
  HeaderActionProps,
  HeaderContentProps {}

// ============================================================================
// Compound Component Props
// ============================================================================

/**
 * Header.Root props
 */
export interface HeaderRootProps {
  /** Header variant */
  variant?: HeaderVariant
  /** Header size */
  size?: HeaderSize
  /** Header layout */
  layout?: HeaderLayout
  /** Background */
  background?: boolean
  /** Border */
  border?: boolean
  /** Shadow */
  shadow?: boolean
  /** Sticky */
  sticky?: boolean
  /** Full width */
  fullWidth?: boolean
  /** Additional className */
  className?: string
  /** Children */
  children?: ReactNode
}

/**
 * Header.Title props
 */
export interface HeaderTitleProps {
  /** Title text */
  title?: string
  /** Subtitle text */
  subtitle?: string
  /** Icon */
  icon?: LucideIcon
  /** Icon size */
  iconSize?: HeaderSize
  /** Size variant */
  size?: HeaderSize
  /** Additional className */
  className?: string
  /** Children (alternative to title prop) */
  children?: ReactNode
}

/**
 * Header.Actions props
 */
export interface HeaderActionsProps {
  /** Actions array */
  actions?: HeaderAction[]
  /** Primary action */
  primaryAction?: HeaderAction
  /** Additional className */
  className?: string
  /** Children */
  children?: ReactNode
}

/**
 * Header.Breadcrumbs props
 */
export interface HeaderBreadcrumbsProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[]
  /** Separator */
  separator?: ReactNode
  /** Max items before collapsing */
  maxItems?: number
  /** Additional className */
  className?: string
}

/**
 * Header.Search props
 */
export interface HeaderSearchProps extends HeaderSearchConfig {
  /** Expandable */
  expandable?: boolean
  /** Position */
  position?: "left" | "center" | "right"
}

/**
 * Header.Toolbar props
 */
export interface HeaderToolbarProps {
  /** Additional className */
  className?: string
  /** Children */
  children?: ReactNode
}

/**
 * Header.Section props (for split layout)
 */
export interface HeaderSectionProps {
  /** Section position */
  position: "left" | "center" | "right"
  /** Alignment within section */
  align?: "start" | "center" | "end"
  /** Additional className */
  className?: string
  /** Children */
  children?: ReactNode
}

/**
 * Header.Back props
 */
export interface HeaderBackProps {
  /** Click handler */
  onClick?: () => void
  /** Navigation href */
  href?: string
  /** Label */
  label?: string
  /** Icon */
  icon?: LucideIcon
  /** Additional className */
  className?: string
}

/**
 * Header.Badge props
 */
export interface HeaderBadgeProps extends HeaderBadgeConfig {
  /** Additional className */
  className?: string
}

/**
 * Header.Meta props
 */
export interface HeaderMetaProps {
  /** Meta items */
  items: HeaderMetaItem[]
  /** Separator */
  separator?: "dot" | "pipe" | "slash" | "none"
  /** Additional className */
  className?: string
}

// ============================================================================
// Context Types
// ============================================================================

export interface HeaderContextValue {
  /** Current variant */
  variant: HeaderVariant
  /** Current size */
  size: HeaderSize
  /** Current layout */
  layout: HeaderLayout
  /** Is sticky */
  isSticky: boolean
  /** Has background */
  hasBackground: boolean
  /** Has border */
  hasBorder: boolean
  /** Register a section */
  registerSection: (position: "left" | "center" | "right", element: ReactNode) => void
  /** Unregister a section */
  unregisterSection: (position: "left" | "center" | "right") => void
}

// ============================================================================
// Preset Types
// ============================================================================

export type HeaderPresetName = 
  | "feature"       // Feature page header
  | "sidebar"       // Sidebar header
  | "container"     // Container/panel header
  | "page"          // Full page header
  | "minimal"       // Minimal header

export interface HeaderPreset {
  /** Preset variant */
  variant?: HeaderVariant
  /** Preset size */
  size?: HeaderSize
  /** Preset layout */
  layout?: HeaderLayout
  /** Background */
  background?: boolean
  /** Border */
  border?: boolean
  /** Shadow */
  shadow?: boolean
  /** Sticky */
  sticky?: boolean
  /** Full width */
  fullWidth?: boolean
}

/**
 * Header presets configuration
 */
export const HEADER_PRESETS: Record<HeaderPresetName, HeaderPreset> = {
  feature: {
    variant: "default",
    size: "lg",
    layout: "standard",
    background: true,
    border: true,
    shadow: false,
    sticky: false,
    fullWidth: true,
  },
  sidebar: {
    variant: "minimal",
    size: "sm",
    layout: "standard",
    background: false,
    border: true,
    shadow: false,
    sticky: true,
    fullWidth: true,
  },
  container: {
    variant: "default",
    size: "md",
    layout: "standard",
    background: true,
    border: true,
    shadow: false,
    sticky: false,
    fullWidth: true,
  },
  page: {
    variant: "default",
    size: "xl",
    layout: "standard",
    background: true,
    border: true,
    shadow: false,
    sticky: false,
    fullWidth: true,
  },
  minimal: {
    variant: "transparent",
    size: "sm",
    layout: "standard",
    background: false,
    border: false,
    shadow: false,
    sticky: false,
    fullWidth: true,
  },
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Get icon size in pixels
 */
export const ICON_SIZES: Record<HeaderSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

/**
 * Get title text size classes
 */
export const TITLE_SIZES: Record<HeaderSize, string> = {
  xs: "text-sm font-medium",
  sm: "text-base font-semibold",
  md: "text-lg font-semibold",
  lg: "text-xl font-bold",
  xl: "text-2xl font-bold",
}

/**
 * Get subtitle text size classes
 */
export const SUBTITLE_SIZES: Record<HeaderSize, string> = {
  xs: "text-xs text-muted-foreground",
  sm: "text-xs text-muted-foreground",
  md: "text-sm text-muted-foreground",
  lg: "text-sm text-muted-foreground",
  xl: "text-base text-muted-foreground",
}

/**
 * Get padding classes
 */
export const PADDING_SIZES: Record<HeaderSize, string> = {
  xs: "px-2 py-1",
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
  xl: "px-8 py-6",
}
