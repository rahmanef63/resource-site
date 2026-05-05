/**
 * Collapsed Panel Indicator Component
 *
 * Honors the same tone scheme as PanelHeader so both states (open / collapsed)
 * read at the same hierarchy level for the user.
 */

"use client"

import { cn } from "@/lib/utils"
import { PanelLeftOpen, PanelRightOpen } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CollapsedPanelProps } from "./types"

export function CollapsedPanel({ side, label, onClick, width, tone = "feature" }: CollapsedPanelProps) {
  const Icon = side === "left" ? PanelLeftOpen : PanelRightOpen

  const isLayout = tone === "layout"
  const stripCls = isLayout
    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
    : "bg-muted/30 hover:bg-muted/50 border-border"
  const iconCls = isLayout
    ? "text-blue-600 dark:text-blue-300"
    : "text-muted-foreground"
  const labelCls = isLayout
    ? "text-blue-700 dark:text-blue-300"
    : "text-muted-foreground"

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-2 h-full",
              stripCls,
              side === "left" ? "border-r" : "border-l",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
            style={{ width }}
            onClick={onClick}
            aria-label={`Expand ${label || side} panel`}
          >
            <Icon className={cn("h-4 w-4", iconCls)} />
            {label && (
              <span
                className={cn("text-xs font-medium", labelCls)}
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: side === "left" ? "rotate(180deg)" : "none",
                }}
              >
                {label}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          <p>Expand {label || side} panel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
