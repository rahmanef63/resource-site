/**
 * Header Presets
 * 
 * Pre-configured header variants for common use cases.
 * These provide consistent styling across the application.
 */

"use client"

import * as React from "react"
import { Plus, Settings, ChevronLeft, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import Link from "next/link"

import {
  Header,
} from "./Header"
import { useRegisterMobileContentHeader } from "@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title"
import { HEADER_PRESETS, type HeaderAction, type HeaderMetaItem, type BreadcrumbItem } from "./types"

// Import ViewToolbar types and component
import { ViewToolbar, type ViewToolbarProps } from "./components"

const isHeaderActionConfig = (action: HeaderAction | React.ReactNode): action is HeaderAction => (
  !React.isValidElement(action) &&
  typeof action === "object" &&
  action !== null &&
  ("label" in action || "id" in action)
)

// ============================================================================
// Feature Header (Main page headers)
// ============================================================================

export interface FeatureHeaderProps {
  /** Feature title */
  title: string
  /** Feature subtitle/description */
  subtitle?: string
  /** Feature icon */
  icon?: LucideIcon
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
  /** Primary action (usually "Add" button) */
  primaryAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
    disabled?: boolean
  }
  /** Secondary actions - can be array of action config or React nodes */
  secondaryActions?: Array<HeaderAction | React.ReactNode> | React.ReactNode
  /** Badge (e.g., "Beta", "New") */
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
    icon?: LucideIcon
  }
  /** Meta information (e.g., count, last updated) */
  meta?: HeaderMetaItem[]
  /** @deprecated Use viewToolbar prop instead. Raw toolbar content below header */
  toolbar?: React.ReactNode
  /** ViewToolbar configuration - renders consistent toolbar with search/sort/filter */
  viewToolbar?: ViewToolbarProps
  /** Additional className */
  className?: string
  /** Hide the mobile top-bar title strip when this header is present */
  hideMobileChromeTitle?: boolean
  /** Children */
  children?: React.ReactNode
}

export const FeatureHeader: React.FC<FeatureHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  badge,
  meta,
  toolbar,
  viewToolbar,
  className,
  hideMobileChromeTitle = true,
  children,
}) => {
  const preset = HEADER_PRESETS.feature
  useRegisterMobileContentHeader(hideMobileChromeTitle)

  // Determine what toolbar to render
  const hasToolbar = toolbar || viewToolbar

  // Helper to render secondary actions
  const renderSecondaryActions = () => {
    if (!secondaryActions) return null

    // If it's a React element, render it directly
    if (React.isValidElement(secondaryActions)) {
      return secondaryActions
    }

    // If it's an array, handle config objects and ReactNodes
    if (Array.isArray(secondaryActions)) {
      return secondaryActions.map((action, index) => {
        // Generate a stable key for this item
        const itemKey = `secondary-action-${index}`;

        if (isHeaderActionConfig(action)) {
          const ActionIcon = action.icon
          return (
            <Button
              key={action.id || action.label || itemKey}
              variant={action.variant || "outline"}
              size={action.size || "sm"}
              onClick={action.onClick}
              disabled={action.disabled}
              className="shrink-0"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 md:mr-2" />}
              <span className="hidden md:inline">{action.label}</span>
            </Button>
          )
        }

        if (React.isValidElement(action)) {
          // Use the existing key if present, otherwise use index-based key
          const existingKey = action.key;
          return (
            <React.Fragment key={existingKey ?? itemKey}>
              {action}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={itemKey}>
            {action}
          </React.Fragment>
        )
      })
    }


    // Otherwise render as-is (for other ReactNode types)
    return secondaryActions
  }

  return (
    <div className="flex flex-col">
      <Header
        variant={preset.variant}
        size={preset.size}
        layout="standard"
        background={preset.background}
        border={!hasToolbar && preset.border}
        className={className}
      >
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Header.Breadcrumbs items={breadcrumbs} className="mb-2" />
          )}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Header.Title
              title={title}
              subtitle={subtitle}
              icon={icon}
              iconSize="lg"
              className="[&_h1]:text-lg [&_h1]:sm:text-xl"
            />
            {badge && (
              <Header.Badge text={badge.text} variant={badge.variant} />
            )}
          </div>
          {meta && meta.length > 0 && (
            <Header.Meta items={meta} className="mt-1" />
          )}
        </div>
        <Header.Actions className="shrink-0 gap-1 sm:gap-2 flex-wrap">
          {renderSecondaryActions()}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              asChild={!!primaryAction.href}
              disabled={primaryAction.disabled}
            >
              {primaryAction.href ? (
                <Link href={primaryAction.href}>
                  {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
                  {primaryAction.label}
                </Link>
              ) : (
                <>
                  {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
                  {primaryAction.label}
                </>
              )}
            </Button>
          )}
          {children}
        </Header.Actions>
      </Header>
      {/* ViewToolbar takes precedence over legacy toolbar prop */}
      {viewToolbar && (
        <ViewToolbar {...viewToolbar} />
      )}
      {/* Legacy toolbar support */}
      {!viewToolbar && toolbar && (
        <Header.Toolbar>{toolbar}</Header.Toolbar>
      )}
    </div>
  )
}
FeatureHeader.displayName = "FeatureHeader"

// ============================================================================
// Sidebar Header
// ============================================================================

export interface SidebarHeaderProps {
  /** Header title */
  title: string
  /** Subtitle or meta info */
  subtitle?: string
  /** Settings/options button */
  onSettings?: () => void
  /** Add button */
  onAdd?: () => void
  /** Custom actions */
  actions?: React.ReactNode
  /** Search configuration */
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  /** Additional className */
  className?: string
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  subtitle,
  onSettings,
  onAdd,
  actions,
  search,
  className,
}) => {
  const preset = HEADER_PRESETS.sidebar

  return (
    <div className="flex flex-col">
      <Header
        variant={preset.variant}
        size={preset.size}
        layout="standard"
        background={preset.background}
        border={preset.border}
        sticky={preset.sticky}
        className={cn("shrink-0", className)}
      >
        <Header.Title title={title} subtitle={subtitle} size="sm" />
        <Header.Actions>
          {actions}
          {onSettings && (
            <Button variant="ghost" size="icon" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {onAdd && (
            <Button variant="ghost" size="icon" onClick={onAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </Header.Actions>
      </Header>
      {search && (
        <div className="px-3 py-2 border-b">
          <Header.Search
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder ?? "Search..."}
          />
        </div>
      )}
    </div>
  )
}
SidebarHeader.displayName = "SidebarHeader"

// ============================================================================
// Container Header (Panel/Container headers)
// ============================================================================

export interface ContainerHeaderProps {
  /** Header title */
  title: string
  /** Subtitle */
  subtitle?: string
  /** Icon */
  icon?: LucideIcon
  /** Show back button */
  showBack?: boolean
  /** Back button handler */
  onBack?: () => void
  /** Back href */
  backHref?: string
  /** Actions */
  actions?: React.ReactNode
  /** Badge */
  badge?: React.ReactNode
  /** Collapse toggle */
  collapsible?: boolean
  /** Is collapsed */
  isCollapsed?: boolean
  /** Toggle collapse handler */
  onToggleCollapse?: () => void
  /** Additional className */
  className?: string
}

export const ContainerHeader: React.FC<ContainerHeaderProps> = ({
  title,
  subtitle,
  icon,
  showBack,
  onBack,
  backHref,
  actions,
  badge,
  collapsible,
  isCollapsed,
  onToggleCollapse,
  className,
}) => {
  const preset = HEADER_PRESETS.container

  return (
    <Header
      variant={preset.variant}
      size={preset.size}
      layout="standard"
      background={preset.background}
      border={preset.border}
      className={className}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <Header.Back
            onClick={onBack}
            href={backHref}
            label=""
          />
        )}
        <Header.Title
          title={title}
          subtitle={subtitle}
          icon={icon}
          size="md"
        />
        {badge}
      </div>
      <Header.Actions>
        {actions}
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        )}
      </Header.Actions>
    </Header>
  )
}
ContainerHeader.displayName = "ContainerHeader"

// ============================================================================
// Page Header (Full page header with breadcrumbs)
// ============================================================================

export interface PageHeaderProps {
  /** Page title */
  title: string
  /** Page description */
  description?: string
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
  /** Primary action */
  primaryAction?: HeaderAction | React.ReactNode
  /** Secondary actions */
  secondaryActions?: React.ReactNode
  /** Additional className */
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  className,
}) => {
  const preset = HEADER_PRESETS.page

  const renderPrimaryAction = () => {
    if (!primaryAction) return null
    if (React.isValidElement(primaryAction)) return primaryAction

    const action = primaryAction as HeaderAction
    const ActionIcon = action.icon

    return (
      <Button onClick={action.onClick} asChild={!!action.href}>
        {action.href ? (
          <Link href={action.href}>
            {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
            {action.label}
          </Link>
        ) : (
          <>
            {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
            {action.label}
          </>
        )}
      </Button>
    )
  }

  return (
    <Header
      variant={preset.variant}
      size={preset.size}
      layout="standard"
      background={preset.background}
      border={preset.border}
      className={className}
    >
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Header.Breadcrumbs items={breadcrumbs} className="mb-3" />
        )}
        <Header.Title title={title} subtitle={description} size="xl" />
      </div>
      <Header.Actions>
        {secondaryActions}
        {renderPrimaryAction()}
      </Header.Actions>
    </Header>
  )
}
PageHeader.displayName = "PageHeader"

// ============================================================================
// Minimal Header
// ============================================================================

export interface MinimalHeaderProps {
  /** Title */
  title?: string
  /** Actions */
  actions?: React.ReactNode
  /** Additional className */
  className?: string
  /** Children */
  children?: React.ReactNode
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  title,
  actions,
  className,
  children,
}) => {
  const preset = HEADER_PRESETS.minimal

  return (
    <Header
      variant={preset.variant}
      size={preset.size}
      layout="standard"
      background={preset.background}
      border={preset.border}
      className={className}
    >
      {title && <Header.Title title={title} size="sm" />}
      {children}
      {actions && <Header.Actions>{actions}</Header.Actions>}
    </Header>
  )
}
MinimalHeader.displayName = "MinimalHeader"

// ============================================================================
// Standard Feature Header (Dynamic layout for Features)
// ============================================================================

export interface StandardFeatureHeaderProps {
  /** Feature Title */
  title: string
  /** Search Configuration */
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  /** Toggle options (e.g. Public/Private) */
  toggles?: React.ReactNode
  /** Main Action Buttons (Export, AI, Add) */
  actions?: React.ReactNode
  className?: string
}

export const StandardFeatureHeader: React.FC<StandardFeatureHeaderProps> = ({
  title,
  search,
  toggles,
  actions,
  className,
}) => {
  const preset = HEADER_PRESETS.feature
  // Tell MobileTopBar to hide its title strip — this component IS the feature header
  useRegisterMobileContentHeader(true)

  return (
    <Header
      variant={preset.variant}
      size={preset.size}
      layout="standard"
      background={preset.background}
      border={preset.border}
      className={className}
    >
      {/* 1. Title — hidden on mobile (MobileTopBar already shows it) */}
      <Header.Title title={title} size="lg" className="mr-4 shrink-0 hidden md:flex" />

      {/* 2. Controls Area (Right - Flex) */}
      <div className="flex flex-1 items-center justify-end gap-3 min-w-0 overflow-x-auto">
        {/* Search */}
        {search && (
          <div className="w-full max-w-[240px] shrink-1">
            <Header.Search
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder}
              className="h-8"
            />
          </div>
        )}

        {/* Visibility Toggles */}
        {toggles && (
          <div className="shrink-0">
            {toggles}
          </div>
        )}

        {/* Feature-specific Action Buttons only — no global chrome here */}
        {actions && (
          <Header.Actions className="shrink-0 ml-0">
            {actions}
          </Header.Actions>
        )}
      </div>
    </Header>
  )
}
StandardFeatureHeader.displayName = "StandardFeatureHeader"
