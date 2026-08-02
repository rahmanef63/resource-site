/**
 * Panel Header Component (panel trigger)
 *
 * Icon-only collapse trigger rendered as panel chrome — separate from the
 * slice's own header (which lives inside `left`/`center`/`right` content via
 * PanelSection.Header). Clicking anywhere toggles the panel.
 *
 * The `tone` prop controls hierarchy color:
 *   - "feature" → sidebar tokens (default, matches app sidebar)
 *   - "layout"  → blue accent (top-level shell — legacy preview chrome)
 */

"use client"

import { cn } from "@/lib/utils"
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import type { PanelHeaderProps } from "./types"

export function PanelHeader({
  side,
  collapsed,
  onToggle,
  label,
  showButton,
  tone = "feature",
  children,
}: PanelHeaderProps) {
  if (!showButton) return null

  const Icon =
    side === "left"
      ? collapsed
        ? PanelLeftOpen
        : PanelLeftClose
      : collapsed
        ? PanelRightOpen
        : PanelRightClose

  const ariaLabel = collapsed
    ? `Expand ${label || side} panel`
    : `Collapse ${label || side} panel`

  const layoutTone =
    "border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 focus-visible:ring-ring dark:text-blue-300"
  const featureTone =
    "border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-sidebar-ring"

  const iconCls =
    tone === "layout"
      ? "text-blue-600 dark:text-blue-300"
      : "text-muted-foreground"

  return (
    <button
      data-slot="panel-trigger"
      data-panel-section="trigger"
      className={cn(
        "flex items-center w-full h-9 px-2 border-b transition-colors duration-150",
        tone === "layout" ? layoutTone : featureTone,
        "cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
        side === "left" ? "justify-start" : "justify-end",
      )}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-expanded={!collapsed}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", iconCls)} />
      {/* Label rendered only when slice opts in (back-compat for previews
          that still pass children as the header label). Most callers should
          rely on the slice's own PanelSection.Header sibling below this. */}
      {!collapsed && children && (
        <span className="flex-1 truncate text-sm font-medium text-left ml-2">
          {children}
        </span>
      )}
    </button>
  )
}
