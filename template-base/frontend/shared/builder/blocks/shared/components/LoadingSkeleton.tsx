/**
 * Loading Skeleton Component
 * 
 * Reusable loading skeleton for blocks.
 */

"use client"

import { cn } from "@/lib/utils"

interface SkeletonLineProps {
    width?: string
    height?: string
    className?: string
}

export function SkeletonLine({ width = "w-full", height = "h-4", className }: SkeletonLineProps) {
    return (
        <div className={cn("bg-muted animate-pulse rounded", width, height, className)} />
    )
}

interface SkeletonCircleProps {
    size?: string
    className?: string
}

export function SkeletonCircle({ size = "h-8 w-8", className }: SkeletonCircleProps) {
    return (
        <div className={cn("bg-muted animate-pulse rounded-full", size, className)} />
    )
}

interface SkeletonCardProps {
    className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("p-4 space-y-3", className)}>
            <div className="flex items-start gap-3">
                <SkeletonCircle />
                <div className="flex-1 space-y-2">
                    <SkeletonLine width="w-3/4" />
                    <SkeletonLine width="w-1/2" height="h-3" />
                </div>
            </div>
        </div>
    )
}

interface ListSkeletonProps {
    rows?: number
    className?: string
}

export function ListSkeleton({ rows = 3, className }: ListSkeletonProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    <SkeletonCircle />
                    <div className="flex-1 space-y-2">
                        <SkeletonLine width="w-3/4" />
                        <SkeletonLine width="w-1/2" height="h-3" />
                    </div>
                </div>
            ))}
        </div>
    )
}

interface GridSkeletonProps {
    columns?: number
    rows?: number
    className?: string
}

export function GridSkeleton({ columns = 4, rows = 1, className }: GridSkeletonProps) {
    return (
        <div className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns * rows }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <SkeletonLine width="w-20" height="h-3" />
                        <SkeletonCircle size="h-6 w-6" />
                    </div>
                    <SkeletonLine width="w-12" height="h-6" />
                    <SkeletonLine width="w-16" height="h-3" />
                </div>
            ))}
        </div>
    )
}

export default { SkeletonLine, SkeletonCircle, SkeletonCard, ListSkeleton, GridSkeleton }
