"use client"

import * as React from "react"
import Link from "next/link"
import { useHeaderContextSafe } from "../context"
import { getActionsContainerClasses } from "../styles"
import type { HeaderActionsProps, HeaderAction } from "../types"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const HeaderActions = React.forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ actions, primaryAction, className, children }, ref) => {
    const context = useHeaderContextSafe()
    const size = context?.size ?? "md"

    const renderAction = (action: HeaderAction) => {
      const ActionIcon = action.icon

      const buttonContent = (
        <Button
          key={action.id}
          variant={action.variant ?? "outline"}
          size={action.size ?? "default"}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={action.className}
          asChild={!!action.href}
        >
          {action.href ? (
            <Link href={action.href}>
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {!action.iconOnly && action.label}
            </Link>
          ) : (
            <>
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {!action.iconOnly && action.label}
            </>
          )}
        </Button>
      )

      if (action.tooltip) {
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
              <p>{action.tooltip}</p>
              {action.shortcut && (
                <kbd className="ml-2 text-xs">{action.shortcut}</kbd>
              )}
            </TooltipContent>
          </Tooltip>
        )
      }

      return buttonContent
    }

    return (
      <div
        ref={ref}
        className={getActionsContainerClasses({ size, className })}
      >
        {children}
        {actions?.map(renderAction)}
        {primaryAction && renderAction(primaryAction)}
      </div>
    )
  }
)
HeaderActions.displayName = "HeaderActions"
