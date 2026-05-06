"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export type MetricTrendDirection = "up" | "down" | "neutral"

export interface MetricCardProps {
  /** Metric title (e.g. "Total Revenue") */
  title: string
  /** Primary value shown in large text */
  value: string | number
  /** Icon shown in header right */
  icon?: React.ComponentType<{ className?: string }>
  /** Icon color class (defaults to muted-foreground) */
  iconClassName?: string
  /** Optional subtitle below the value */
  subtitle?: React.ReactNode
  /** Optional trend indicator */
  trend?: {
    value: number
    direction: MetricTrendDirection
    label?: string
  }
  className?: string
}

/**
 * Metric Card — standardized stat card for dashboards.
 *
 * Replaces the repeated pattern across 9+ dashboards:
 * Card + CardHeader (title + icon) + CardContent (value + subtitle/trend)
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  subtitle,
  trend,
  className,
}: MetricCardProps) {
  const trendColor =
    trend?.direction === "up"
      ? "text-green-600"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground"

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || subtitle) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend && (
              <span className={cn("flex items-center gap-0.5 font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {!trend && subtitle}
            {trend && subtitle && <span>{subtitle}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
