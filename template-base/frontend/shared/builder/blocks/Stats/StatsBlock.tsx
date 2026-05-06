/**
 * Stats Block
 * 
 * Display metrics in a responsive grid layout.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { GridSkeleton } from "../shared"
import * as LucideIcons from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface StatItem {
    title: string
    value: number | string
    description?: string
    icon?: string | LucideIcon
    iconBgClass?: string
    iconColorClass?: string
    trend?: {
        value: number
        label?: string
        isPositive?: boolean
    }
    badges?: Array<{ label: string; count: number }>
}

export interface StatsBlockProps {
    stats: StatItem[]
    columns?: 2 | 3 | 4
    loading?: boolean
    className?: string
}

// ============================================================================
// Icon Helper
// ============================================================================

function getIcon(iconName?: string | LucideIcon): LucideIcon | null {
    if (!iconName) return null
    if (typeof iconName !== "string") return iconName
    return (LucideIcons as any)[iconName] || null
}

// ============================================================================
// Stat Card
// ============================================================================

function StatCard({
    title,
    value,
    description,
    icon: iconName,
    iconBgClass = "bg-primary/10",
    iconColorClass = "text-primary",
    trend,
    badges,
    loading = false,
}: StatItem & { loading?: boolean }) {
    const Icon = getIcon(iconName)

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && (
                    <div className={cn("p-2 rounded-lg", iconBgClass)}>
                        <Icon className={cn("h-4 w-4", iconColorClass)} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}

                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 mt-2 text-xs",
                        trend.isPositive !== false ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.isPositive !== false ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{trend.value}% {trend.label}</span>
                    </div>
                )}

                {badges && badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {badges.map((badge) => (
                            <Badge key={badge.label} variant="secondary" className="text-xs">
                                {badge.count} {badge.label}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ============================================================================
// Stats Block
// ============================================================================

const COLUMN_CLASSES = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
}

export function StatsBlock({
    stats,
    columns = 4,
    loading = false,
    className,
}: StatsBlockProps) {
    if (loading) {
        return <GridSkeleton columns={columns} className={className} />
    }

    return (
        <div className={cn("grid gap-4", COLUMN_CLASSES[columns], className)}>
            {stats.map((stat, index) => (
                <StatCard key={stat.title + index} {...stat} loading={loading} />
            ))}
        </div>
    )
}

export default StatsBlock
