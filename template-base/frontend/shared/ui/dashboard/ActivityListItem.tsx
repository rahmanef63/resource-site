"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface ActivityListItemProps {
  /** Icon for the leading badge */
  icon?: LucideIcon
  /** Tailwind class for icon badge background (e.g. "bg-green-500/10 text-green-600") */
  iconClassName?: string
  /** Primary title */
  title: React.ReactNode
  /** Secondary line below title (category, timestamp, etc.) */
  meta?: React.ReactNode
  /** Right-aligned primary value (amount, count, etc.) */
  amount?: React.ReactNode
  /** Right-aligned badge/status */
  status?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  /** Click handler */
  onClick?: () => void
  className?: string
}

/**
 * Activity List Item — standardized list row for dashboards.
 *
 * Layout: [Icon] [Title / Meta] ............ [Amount] [Status badge]
 *
 * Used in: Recent Transactions, Recent Invoices, Recent Hires,
 * Leave Requests, Recent Activity, etc.
 */
export function ActivityListItem({
  icon: Icon,
  iconClassName,
  title,
  meta,
  amount,
  status,
  onClick,
  className,
}: ActivityListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 p-3 border rounded-lg transition-colors",
        onClick && "cursor-pointer hover:bg-accent/50",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className={cn("p-2 rounded-lg shrink-0", iconClassName ?? "bg-muted text-muted-foreground")}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          {meta && <p className="text-xs text-muted-foreground truncate">{meta}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {amount !== undefined && (
          <span className="text-sm font-semibold">{amount}</span>
        )}
        {status && <Badge variant={status.variant ?? "default"}>{status.label}</Badge>}
      </div>
    </div>
  )
}
