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
      data-slot="panel-trigger"
      data-panel-section="trigger"
      className={cn(
        // Trigger = panel chrome — icon-only collapse button. Label is
        // owned by the slice (via PanelSection.Header) or by CollapsedPanel
        // when collapsed. Uses sidebar tokens so it adapts to theme presets
        // and sits ABOVE the slice header without reading as content.
        "flex items-center w-full h-9 px-2",
        "border-b border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150",
        "cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset",
        side === "left" ? "justify-start" : "justify-end",
      )}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-expanded={!collapsed}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </button>
  )
}
