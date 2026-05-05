/**
 * Panel Header Component
 *
 * The full-width header row is a single interactive trigger —
 * clicking anywhere (label text or icon) toggles the panel.
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

  return (
    <button
      className={cn(
        "flex items-center w-full h-10 gap-2 px-3",
        "bg-muted/30 hover:bg-muted/50 transition-colors duration-150",
        "border-b border-border/50",
        "cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-expanded={!collapsed}
    >
      {side === "left" && (
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      )}

      {!collapsed && children && (
        <span className="flex-1 truncate text-sm font-medium text-left">
          {children}
        </span>
      )}

      {side === "right" && (
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground ml-auto" />
      )}
    </button>
  )
}
