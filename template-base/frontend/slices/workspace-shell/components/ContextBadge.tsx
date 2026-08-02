"use client"

import * as React from "react"
import { Building2, Layers, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContextBadgeProps {
  workspaceName: string | null | undefined
  menuSetName: string | null | undefined
  loading?: boolean
  compact?: boolean
  /** Visual variant — controls density/border. */
  variant?: "button" | "chip"
  className?: string
}

/**
 * ContextBadge — chip showing current (workspace · menuSet) pair.
 * Use as switcher trigger or breadcrumb header anchor.
 */
export const ContextBadge = React.forwardRef<HTMLDivElement, ContextBadgeProps>(
  function ContextBadge(
    { workspaceName, menuSetName, loading, compact, variant = "button", className },
    ref,
  ) {
    const wsLabel = loading ? "…" : workspaceName ?? "No workspace"
    const msLabel = loading ? "…" : menuSetName ?? "Default menu"

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 text-sm",
          variant === "button" &&
            "rounded-md border bg-card px-3 py-1.5 hover:bg-accent transition-colors cursor-pointer",
          variant === "chip" && "rounded-full bg-muted/60 px-3 py-1",
          compact && "text-xs gap-1.5 px-2 py-1",
          className,
        )}
      >
        <Building2 className={cn("opacity-70", compact ? "h-3 w-3" : "h-4 w-4")} />
        <span className="font-medium truncate max-w-32">{wsLabel}</span>
        <span className="text-muted-foreground">·</span>
        <Layers className={cn("opacity-70", compact ? "h-3 w-3" : "h-4 w-4")} />
        <span className="text-muted-foreground truncate max-w-32">{msLabel}</span>
        {variant === "button" && (
          <ChevronDown className={cn("opacity-50", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
        )}
      </div>
    )
  },
)
