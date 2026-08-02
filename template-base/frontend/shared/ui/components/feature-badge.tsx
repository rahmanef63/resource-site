"use client"

import { Badge } from "@/components/ui/badge"
import { Construction, FlaskConical, Info, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type FeatureStatus = "stable" | "beta" | "development" | "experimental" | "deprecated" | "new"

export interface FeatureBadgeProps {
  status: FeatureStatus
  className?: string
  showTooltip?: boolean
}

const statusConfig: Record<
  FeatureStatus,
  {
    label: string
    icon: typeof Construction
    color: string
    tooltip: string
  }
> = {
  stable: {
    label: "Stable",
    icon: Info,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    tooltip: "This feature is stable and ready for production use",
  },
  beta: {
    label: "Beta",
    icon: FlaskConical,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    tooltip: "This feature is in beta testing. Some functionality may change.",
  },
  development: {
    label: "Dev",
    icon: Construction,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    tooltip: "This feature is under active development",
  },
  experimental: {
    label: "Experimental",
    icon: FlaskConical,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    tooltip: "This feature is experimental and may not work as expected",
  },
  deprecated: {
    label: "Deprecated",
    icon: Info,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    tooltip: "This feature is deprecated and will be removed in a future version",
  },
  new: {
    label: "New",
    icon: Zap,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    tooltip: "This feature was recently added",
  },
}

export function FeatureBadge({ status, className = "", showTooltip = true }: FeatureBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const badge = (
    <Badge className={`${config.color} ${className} flex items-center gap-1 text-xs`} variant="secondary">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
