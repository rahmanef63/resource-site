/**
 * Stats Grid Component
 * 
 * Displays key metrics in a responsive grid layout.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface StatCardProps {
  /** Stat title */
  title: string
  /** Stat value */
  value: number | string
  /** Optional description */
  description?: string
  /** Icon component */
  icon: LucideIcon
  /** Icon background color class */
  iconBgClass?: string
  /** Icon color class */
  iconColorClass?: string
  /** Trend information */
  trend?: {
    value: number
    label?: string
    isPositive?: boolean
  }
  /** Optional badges */
  badges?: Array<{ label: string; count: number }>
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
}

export interface StatsGridProps {
  /** Stats to display */
  stats: StatCardProps[]
  /** Number of columns on large screens */
  columns?: 2 | 3 | 4
  /** Additional className */
  className?: string
}

// ============================================================================
// Stat Card
// ============================================================================

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary",
  trend,
  badges,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", iconBgClass)}>
          <Icon className={cn("h-4 w-4", iconColorClass)} />
        </div>
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
// Stats Grid
// ============================================================================

const columnsClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4", columnsClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title + index} {...stat} />
      ))}
    </div>
  )
}
