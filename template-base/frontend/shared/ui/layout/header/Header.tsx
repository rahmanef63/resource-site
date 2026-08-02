/**
 * Header Components
 * 
 * Compound component pattern for the unified header system.
 * Provides flexible, composable header building blocks.
 * 
 * Components are split into individual files in ./components/
 * This file re-exports them as a compound component.
 */

"use client"

// Import all components from modular files
import {
  HeaderRoot,
  HeaderSection,
  HeaderTitle,
  HeaderActions,
  HeaderActionGroupMenu,
  HeaderBreadcrumbs,
  HeaderSearch,
  HeaderBadge,
  HeaderMeta,
  HeaderToolbar,
  HeaderBack,
  HeaderControls,
} from "./components"

// Re-export individual components for direct imports
export {
  HeaderRoot,
  HeaderSection,
  HeaderTitle,
  HeaderActions,
  HeaderActionGroupMenu,
  HeaderBreadcrumbs,
  HeaderSearch,
  HeaderBadge,
  HeaderMeta,
  HeaderToolbar,
  HeaderBack,
  HeaderControls,
}

// Re-export types
export type {
  HeaderRootProps,
  HeaderTitleProps,
  HeaderActionsProps,
  HeaderBreadcrumbsProps,
  HeaderSearchProps,
  HeaderToolbarProps,
  HeaderSectionProps,
  HeaderBackProps,
  HeaderBadgeProps,
  HeaderMetaProps,
  HeaderAction,
  HeaderActionGroup,
  HeaderSize,
  HeaderVariant,
  HeaderLayout,
  BreadcrumbItem,
  HeaderMetaItem,
} from "./types"

// ============================================================================
// Compound Export
// ============================================================================

export const Header = Object.assign(HeaderRoot, {
  Root: HeaderRoot,
  Section: HeaderSection,
  Title: HeaderTitle,
  Actions: HeaderActions,
  ActionGroup: HeaderActionGroupMenu,
  Breadcrumbs: HeaderBreadcrumbs,
  Search: HeaderSearch,
  Badge: HeaderBadge,
  Meta: HeaderMeta,
  Toolbar: HeaderToolbar,
  Back: HeaderBack,
  Controls: HeaderControls,
})
