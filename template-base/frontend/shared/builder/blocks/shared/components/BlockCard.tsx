/**
 * Block Card Component
 * 
 * Reusable card wrapper for blocks with header, content, loading, and empty states.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { ListSkeleton } from "./LoadingSkeleton"
import type { BlockHeaderProps, EmptyStateProps } from "../types"


// ============================================================================
// Types
// ============================================================================

export interface BlockCardProps {
    header?: {
        title?: string
        description?: string
        action?: React.ReactNode
        icon?: React.ElementType
    }
    footer?: React.ReactNode
    children?: React.ReactNode
    className?: string
    loading?: boolean
    isEmpty?: boolean
    /** Content max height for scroll */
    maxHeight?: string
    emptyState?: {
        title: string
        description: string
        icon?: React.ElementType
        action?: React.ReactNode
    }
    noPadding?: boolean
}

// ============================================================================
// Block Card Component
// ============================================================================

export function BlockCard({
    header,
    footer,
    children,
    className,
    loading,
    isEmpty,
    emptyState,
    maxHeight,
    noPadding,
}: BlockCardProps) {
    return (
        <Card className={cn("flex flex-col h-full", className)}>
            {(header?.title || header?.icon) && (
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col space-y-1.5">
                        {header.title && (
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                {header.icon && <header.icon className="h-4 w-4 text-muted-foreground" />}
                                {header.title}
                            </CardTitle>
                        )}
                        {header.description && (
                            <CardDescription>{header.description}</CardDescription>
                        )}
                    </div>
                    {header.action && <div>{header.action}</div>}
                </CardHeader>
            )}
            <CardContent className={cn("flex-1 min-h-0", noPadding ? "p-0" : "")}>
                {loading ? (
                    <div className="p-4">
                        <ListSkeleton rows={3} />
                    </div>
                ) : isEmpty && emptyState ? (
                    <EmptyState
                        title={emptyState.title}
                        description={emptyState.description}
                        icon={emptyState.icon as any}
                        action={emptyState.action}
                        className="p-4"
                    />
                ) : (
                    <div
                        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
                    >
                        {children}
                    </div>
                )}
            </CardContent>
            {footer && <div className="border-t p-4">{footer}</div>}
        </Card>
    )
}

export default BlockCard
