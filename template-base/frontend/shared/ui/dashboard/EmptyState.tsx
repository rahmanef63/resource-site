"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/**
 * Empty State — standardized "no data" display for dashboards and lists.
 *
 * Replaces the repeated pattern:
 *   <div className="text-center py-12">
 *     <Icon /> <p>No items yet</p> <p>Description</p>
 *   </div>
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className,
      )}
    >
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />}
      <h4 className="font-medium text-foreground mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
