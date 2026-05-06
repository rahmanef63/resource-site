"use client"

import type React from "react"
import { useMemo } from "react"
import { Check, Info, Loader2, Lock } from "lucide-react"
import * as Icons from "lucide-react"

import { cn } from "@/lib/utils"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"
import { getAllFeatures } from "@/frontend/shared/lib/features/registry"

import type { AvailableFeatureId } from "../constants"
import { getMergedBundleAllFeatures, useBundleWithFeatures } from "../hooks/useBundles"

const featureIconMap = Icons as unknown as Record<
  string,
  React.ComponentType<{ className?: string }>
>

interface FeatureCustomizerProps {
  selectedBundleId: string | null
  enabledFeatures: AvailableFeatureId[]
  onToggleFeature: (featureId: AvailableFeatureId) => void
}

interface FeatureItemProps {
  featureId: AvailableFeatureId
  featureConfig: FeatureConfig | undefined
  isEnabled: boolean
  isCore: boolean
  isRecommended: boolean
  onToggle: () => void
}

function FeatureItem({
  featureId,
  featureConfig,
  isEnabled,
  isCore,
  isRecommended,
  onToggle,
}: FeatureItemProps) {
  const IconComponent = featureConfig
    ? (featureIconMap[featureConfig.ui.icon] ?? Icons.HelpCircle)
    : Icons.HelpCircle

  const name = featureConfig?.name || featureId
  const description = featureConfig?.description || ""

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isCore}
      className={cn(
        "flex min-h-[78px] w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 sm:p-3.5",
        isCore
          ? "cursor-not-allowed border-primary/25 bg-primary/[0.05]"
          : isEnabled
            ? "border-primary/50 bg-primary/[0.05] hover:bg-primary/[0.08]"
            : "border-border/70 bg-card/60 hover:border-muted-foreground/40 hover:bg-muted/35",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
          isCore
            ? "bg-primary/20"
            : isEnabled
              ? "bg-primary"
              : "border border-border bg-muted",
        )}
      >
        {isCore ? (
          <Lock className="h-3 w-3 text-primary" />
        ) : isEnabled ? (
          <Check className="h-3 w-3 text-primary-foreground" />
        ) : null}
      </div>

      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isEnabled ? "bg-primary/10" : "bg-muted",
        )}
      >
        <IconComponent
          className={cn(
            "h-4 w-4",
            isEnabled ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isEnabled ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {name}
          </span>
          {isCore ? (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              Required
            </span>
          ) : null}
          {isRecommended && !isCore ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              Recommended
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>
    </button>
  )
}

export function FeatureCustomizer({
  selectedBundleId,
  enabledFeatures,
  onToggleFeature,
}: FeatureCustomizerProps) {
  const { bundle, isLoading } = useBundleWithFeatures(selectedBundleId)
  const allFeatures = useMemo(() => getAllFeatures(), [])

  const featuresByCategory = useMemo(() => {
    if (!bundle) return {}

    const allBundleFeatures = getMergedBundleAllFeatures(bundle)
    const categories: Record<string, Array<{
      featureId: AvailableFeatureId
      config: FeatureConfig | undefined
      isCore: boolean
      isRecommended: boolean
    }>> = {}

    allBundleFeatures.forEach((featureId) => {
      const config = allFeatures.find((feature) => feature.id === featureId)
      const category = config?.ui.category || "other"
      const isCore = bundle.features.core.includes(featureId)
      const isRecommended = bundle.features.recommended.includes(featureId)

      if (!categories[category]) {
        categories[category] = []
      }

      categories[category].push({
        featureId,
        config,
        isCore,
        isRecommended,
      })
    })

    const sortOrder = [
      "productivity",
      "communication",
      "collaboration",
      "analytics",
      "content",
      "creativity",
      "administration",
      "social",
    ]

    return Object.fromEntries(
      Object.entries(categories).sort((a, b) => {
        const aIdx = sortOrder.indexOf(a[0])
        const bIdx = sortOrder.indexOf(b[0])

        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
      }),
    )
  }, [bundle, allFeatures])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="py-8 text-center">
        <Info className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">Select a Template First</h3>
        <p className="text-muted-foreground">
          Go back and choose a workspace template to customize features
        </p>
      </div>
    )
  }

  const enabledCount = enabledFeatures.length
  const totalCount =
    bundle.features.core.length +
    bundle.features.recommended.length +
    bundle.features.optional.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Required features stay enabled. Optional features can be turned on now or later from
          workspace settings.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
          <Check className="h-4 w-4 text-primary" />
          <span>
            {enabledCount} of {totalCount} enabled
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {features.map(({ featureId, config, isCore, isRecommended }) => (
                <FeatureItem
                  key={featureId}
                  featureId={featureId}
                  featureConfig={config}
                  isEnabled={enabledFeatures.includes(featureId)}
                  isCore={isCore}
                  isRecommended={isRecommended}
                  onToggle={() => onToggleFeature(featureId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
