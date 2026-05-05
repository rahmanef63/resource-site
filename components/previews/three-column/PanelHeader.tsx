/**
 * Panel Header Component
 *
 * The full-width header row is a single interactive trigger —
 * clicking anywhere (label text or icon) toggles the panel.
 *
 * The `tone` prop controls hierarchy color:
 *   - "layout"  → blue accent (top-level shell)
 *   - "feature" → default muted (nested inner shell)
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
    "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300"
  const featureTone =
    "bg-muted/30 hover:bg-muted/50 border-border/50 text-foreground"

  const iconCls =
    tone === "layout"
      ? "text-blue-600 dark:text-blue-300"
      : "text-muted-foreground"

  return (
    <button
      className={cn(
        "flex items-center w-full h-10 gap-2 px-3 transition-colors duration-150",
        tone === "layout" ? layoutTone : featureTone,
        "border-b cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-expanded={!collapsed}
    >
      {side === "left" && (
        <Icon className={cn("h-4 w-4 flex-shrink-0", iconCls)} />
      )}

      {!collapsed && children && (
        <span className="flex-1 truncate text-sm font-medium text-left">
          {children}
        </span>
      )}

      {side === "right" && (
        <Icon className={cn("h-4 w-4 flex-shrink-0 ml-auto", iconCls)} />
      )}
    </button>
  )
}
