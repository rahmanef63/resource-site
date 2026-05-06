"use client"

import type React from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import * as Icons from "lucide-react"

import { cn } from "@/lib/utils"

import {
  getMergedBundleEnabledFeatures,
  useBundlesForWorkspaceType,
} from "../hooks/useBundles"
import type { WorkspaceType } from "../types"

const bundleIconMap = Icons as unknown as Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
>

interface BundleSelectorProps {
  workspaceType: WorkspaceType
  selectedBundleId: string | null
  onSelect: (bundleId: string) => void
}

export function BundleSelector({
  workspaceType,
  selectedBundleId,
  onSelect,
}: BundleSelectorProps) {
  const { bundles, isLoading } = useBundlesForWorkspaceType(workspaceType)

  const getIcon = (iconName: string) => {
    const IconComponent = bundleIconMap[iconName]

    return IconComponent ?? Icons.HelpCircle
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Start from a bundle to pre-enable the most useful tools, or choose custom to configure
        everything yourself.
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {bundles.map((bundle) => {
          const IconComponent = getIcon(bundle.icon)
          const isSelected = selectedBundleId === bundle.id
          const isRecommended = bundle.recommendedFor.includes(workspaceType)
          const enabledCount = getMergedBundleEnabledFeatures(bundle).length

          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => onSelect(bundle.id)}
              className={cn(
                "relative flex h-full min-h-[170px] flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 sm:p-3.5",
                isSelected
                  ? "border-primary/60 bg-primary/[0.05] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.18)]"
                  : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-muted/35",
              )}
            >
              {isRecommended && bundle.id !== "custom" ? (
                <div className="absolute -right-2 -top-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              ) : null}

              {isSelected ? (
                <div className="absolute right-3 top-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              ) : null}

              <div className="mb-2.5 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    isSelected ? "bg-primary/20" : "bg-muted",
                  )}
                  style={{
                    backgroundColor:
                      isSelected && bundle.theme?.primaryColor
                        ? `${bundle.theme.primaryColor}20`
                        : undefined,
                  }}
                >
                  <IconComponent
                    className={cn(
                      "h-4 w-4",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                    style={{
                      color:
                        isSelected && bundle.theme?.primaryColor
                          ? bundle.theme.primaryColor
                          : undefined,
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[15px] font-semibold leading-6">{bundle.name}</h3>
                  <span className="text-xs capitalize text-muted-foreground">
                    {bundle.category}
                  </span>
                </div>
              </div>

              <p className="mb-3 text-sm leading-6 text-muted-foreground line-clamp-2">
                {bundle.description}
              </p>

              <div className="mt-auto flex w-full flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    {enabledCount} features enabled
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {bundle.tags.slice(0, 4).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
