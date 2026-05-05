/**
 * Collapsed Panel Indicator Component
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

export function CollapsedPanel({ side, label, onClick, width }: CollapsedPanelProps) {
  const Icon = side === "left" ? PanelLeftOpen : PanelRightOpen

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-2",
              "h-full bg-muted/30 hover:bg-muted/50",
              side === "left" ? "border-r border-border" : "border-l border-border",
              "transition-colors duration-150",
              "cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            )}
            style={{ width }}
            onClick={onClick}
            aria-label={`Expand ${label || side} panel`}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label && (
              <span 
                className="text-xs text-muted-foreground font-medium"
                style={{ 
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: side === "left" ? "rotate(180deg)" : "none"
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
