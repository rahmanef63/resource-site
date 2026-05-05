/**
 * Collapse Button Component
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CollapseButtonProps } from "./types"

export function CollapseButton({ side, collapsed, onClick, label }: CollapseButtonProps) {
  const Icon = side === "left"
    ? (collapsed ? PanelLeftOpen : PanelLeftClose)
    : (collapsed ? PanelRightOpen : PanelRightClose)

  const tooltipText = collapsed
    ? `Expand ${label || side} panel`
    : `Collapse ${label || side} panel`

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent",
              "transition-colors duration-150"
            )}
            onClick={onClick}
            aria-label={tooltipText}
            aria-expanded={!collapsed}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
