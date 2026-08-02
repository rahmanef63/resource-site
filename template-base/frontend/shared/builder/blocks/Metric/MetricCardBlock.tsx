/**
 * Metric Card Block
 * 
 * A single high-impact metric card.
 */

"use client"

import * as React from "react"
import { BlockCard } from "../shared"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface MetricCardBlockProps {
    title: string
    value: string | number
    trend?: {
        value: number
        label?: string
        direction: "up" | "down" | "neutral"
    }
    icon?: React.ComponentType<any>
    description?: string
    className?: string
}

// ============================================================================
// Metric Card Block
// ============================================================================

export function MetricCardBlock({
    title,
    value,
    trend,
    icon: Icon,
    description,
    className,
}: MetricCardBlockProps) {
    return (
        <BlockCard className={className}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:underline-offset-4 hover:underline cursor-pointer">
                    {title}
                </p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="pt-2">
                <div className="text-2xl font-bold">{value}</div>
                {(trend || description) && (
                    <div className="flex items-center gap-2 mt-1">
                        {trend && (
                            <span className={`text-xs flex items-center gap-0.5 font-medium ${trend.direction === "up" ? "text-green-500" :
                                trend.direction === "down" ? "text-red-500" :
                                    "text-muted-foreground"
                                }`}>
                                {trend.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
                                {trend.direction === "down" && <ArrowDownRight className="h-3 w-3" />}
                                {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </BlockCard>
    )
}
