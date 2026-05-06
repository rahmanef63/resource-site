/**
 * Empty State Component
 * 
 * Reusable empty state for three-column layout panels.
 */

"use client"

import * as React from "react"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EmptyStateConfig } from "../types"

export interface EmptyStateProps extends EmptyStateConfig {
    /** Additional class name */
    className?: string
}

/**
 * EmptyState Component
 * 
 * Standard empty state for panels when no content is available.
 * Supports custom icon, title, description, and action button.
 */
export function EmptyState({
    icon: Icon = FileQuestion,
    title = "No items",
    description = "Nothing to display",
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center h-full text-center p-8",
            className
        )}>
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border/50">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>

            <h3 className="font-semibold text-xl tracking-tight mb-2">{title}</h3>

            {description && (
                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed mb-4">
                    {description}
                </p>
            )}

            {action && (
                <Button onClick={action.onClick} size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
