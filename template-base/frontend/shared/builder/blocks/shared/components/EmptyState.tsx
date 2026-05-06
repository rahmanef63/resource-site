/**
 * Empty State Component
 * 
 * Reusable empty state for blocks.
 */

"use client"

import { cn } from "@/lib/utils"
import type { EmptyStateProps } from "../types"

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps & { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-8 text-center",
            className
        )}>
            {Icon && (
                <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            )}
            <h4 className="font-medium text-foreground mb-1">{title}</h4>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {action && (
                <div className="mt-4">{action}</div>
            )}
        </div>
    )
}

export default EmptyState
