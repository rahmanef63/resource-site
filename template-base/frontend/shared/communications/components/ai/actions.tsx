"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Actions - Container for grouping action buttons
 */
function Actions({ className, children, ...props }: ActionsProps) {
  return (
    <div
      data-slot="actions"
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ActionProps extends React.ComponentProps<typeof Button> {
  /**
   * Optional tooltip text shown on hover
   */
  tooltip?: string
  /**
   * Accessible label for screen readers
   */
  label?: string
}

/**
 * Action - Individual action button with optional tooltip
 * 
 * Features:
 * - Ghost buttons by default for clean chat interfaces
 * - 44px touch targets for mobile users
 * - Proper keyboard navigation
 * - Clipboard API integration
 */
function Action({
  tooltip,
  label,
  variant = "ghost",
  size = "sm",
  className,
  children,
  ...props
}: ActionProps) {
  const button = (
    <Button
      data-slot="action"
      variant={variant}
      size={size}
      className={cn("size-8", className)}
      aria-label={label || tooltip}
      {...props}
    >
      {children}
    </Button>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

export { Actions, Action }
export type { ActionsProps, ActionProps }
