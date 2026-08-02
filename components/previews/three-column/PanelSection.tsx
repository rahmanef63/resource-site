/**
 * PanelSection — structural slots + primitives for ThreeColumn panels.
 *
 * Inspired by shadcn `components/ui/sidebar.tsx`. Each column = Header
 * (flex-shrink-0) + Items (flex-1 min-h-0 overflow-auto) + Footer
 * (flex-shrink-0). Visual identity uses the `--sidebar-*` design tokens
 * so panels feel consistent with the app sidebar across light/dark.
 *
 * Primitives exported:
 *   - PanelSection.Root  (alias: PanelSection)
 *   - PanelSection.Header / Items / Footer
 *   - PanelMenu / PanelMenuItem / PanelMenuButton
 *   - PanelGroup / PanelGroupLabel / PanelGroupContent
 *   - PanelSeparator
 */

"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface BaseProps {
  children?: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Root + Header / Items / Footer
// ---------------------------------------------------------------------------

interface RootProps extends BaseProps {
  /** Optional aria-label for assistive tech */
  label?: string
  /** Drop sidebar-token theming (use plain bg-background) */
  unstyled?: boolean
}

function Root({ children, className, label, unstyled }: RootProps) {
  return (
    <div
      data-slot="panel-section"
      data-panel-section="root"
      className={cn(
        "flex h-full min-h-0 flex-col",
        !unstyled && "bg-sidebar text-sidebar-foreground",
        className,
      )}
      aria-label={label}
    >
      {children}
    </div>
  )
}

function Header({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-section-header"
      data-panel-section="header"
      className={cn(
        "flex-shrink-0 border-b border-sidebar-border bg-sidebar/95 px-3 py-2 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  )
}

function Items({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-section-items"
      data-panel-section="items"
      className={cn("flex-1 min-h-0 overflow-auto", className)}
    >
      {children}
    </div>
  )
}

function Footer({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-section-footer"
      data-panel-section="footer"
      className={cn(
        "flex-shrink-0 border-t border-sidebar-border bg-sidebar/95 px-3 py-2 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Group / GroupLabel / GroupContent — matches SidebarGroup family
// ---------------------------------------------------------------------------

function PanelGroup({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-group"
      className={cn("relative flex w-full min-w-0 flex-col gap-1 p-2", className)}
    >
      {children}
    </div>
  )
}

function PanelGroupLabel({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-group-label"
      className={cn(
        "flex h-7 shrink-0 items-center rounded-md px-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60",
        className,
      )}
    >
      {children}
    </div>
  )
}

function PanelGroupContent({ children, className }: BaseProps) {
  return (
    <div
      data-slot="panel-group-content"
      className={cn("flex flex-col gap-0.5", className)}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Menu / MenuItem / MenuButton — matches SidebarMenu family
// ---------------------------------------------------------------------------

function PanelMenu({ children, className }: BaseProps) {
  return (
    <ul
      data-slot="panel-menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
    >
      {children}
    </ul>
  )
}

function PanelMenuItem({ children, className }: BaseProps) {
  return (
    <li
      data-slot="panel-menu-item"
      className={cn("group/menu-item relative", className)}
    >
      {children}
    </li>
  )
}

interface PanelMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  isActive?: boolean
}

function PanelMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: PanelMenuButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="panel-menu-button"
      data-active={isActive ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm outline-none ring-sidebar-ring transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

function PanelSeparator({ className }: BaseProps) {
  return (
    <div
      data-slot="panel-separator"
      role="separator"
      className={cn("mx-2 my-1 h-px bg-sidebar-border", className)}
    />
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compound API:
 *
 * <PanelSection label="Customers">
 *   <PanelSection.Header>…toolbar…</PanelSection.Header>
 *   <PanelSection.Items>
 *     <PanelGroup>
 *       <PanelGroupLabel>Main</PanelGroupLabel>
 *       <PanelMenu>
 *         <PanelMenuItem><PanelMenuButton isActive>Item</PanelMenuButton></PanelMenuItem>
 *       </PanelMenu>
 *     </PanelGroup>
 *   </PanelSection.Items>
 *   <PanelSection.Footer>…actions…</PanelSection.Footer>
 * </PanelSection>
 */
export const PanelSection = Object.assign(Root, {
  Root,
  Header,
  Items,
  Footer,
})

export const PanelLeftHeader = Header
export const PanelLeftItems = Items
export const PanelLeftFooter = Footer
export const PanelCenterHeader = Header
export const PanelCenterItems = Items
export const PanelCenterFooter = Footer
export const PanelRightHeader = Header
export const PanelRightItems = Items
export const PanelRightFooter = Footer

export {
  PanelGroup,
  PanelGroupLabel,
  PanelGroupContent,
  PanelMenu,
  PanelMenuItem,
  PanelMenuButton,
  PanelSeparator,
}
