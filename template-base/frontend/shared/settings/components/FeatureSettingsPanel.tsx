"use client"

/**
 * Feature Settings Panel
 *
 * A panel component that displays settings for a specific feature only.
 * Used when opening settings from within a feature (e.g., via header button).
 */

import React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useSettingsRegistry } from "../SettingsProvider"
import type { SettingsCategory } from "../types"

export interface FeatureSettingsPanelProps {
  /** Feature slug to filter settings for */
  featureSlug: string
  /** Feature display name (optional, for header) */
  featureName?: string
  /** Additional CSS classes */
  className?: string
  /** Callback when back/close is triggered */
  onClose?: () => void
  /** Whether to show back button */
  showBackButton?: boolean
  /** Default category to show (first category if not specified) */
  defaultCategory?: string
}

/**
 * Displays settings panel for a specific feature
 *
 * @example
 * ```tsx
 * <FeatureSettingsPanel
 *   featureSlug="chat"
 *   featureName="Chat"
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function FeatureSettingsPanel({
  featureSlug,
  featureName,
  className,
  onClose,
  showBackButton = true,
  defaultCategory,
}: FeatureSettingsPanelProps) {
  const { categories, getFeatureSettings } = useSettingsRegistry()
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  // Get settings for this feature only
  // First try to get feature-specific settings, if empty use all categories
  // (for when panel is used inside a provider pre-loaded with feature settings)
  const featureSettings = React.useMemo(() => {
    const filtered = getFeatureSettings(featureSlug)

    if (process.env.NODE_ENV === "development") {
      console.log("[FeatureSettingsPanel] featureSlug:", featureSlug)
      console.log("[FeatureSettingsPanel] all categories:", categories.length, categories.map(c => ({ id: c.id, featureSlug: c.featureSlug })))
      console.log("[FeatureSettingsPanel] filtered by getFeatureSettings:", filtered.length)
    }

    // If no feature-specific settings found, the provider might have
    // been initialized with pre-loaded settings (e.g., from FeatureSettingsButton)
    if (filtered.length === 0 && categories.length > 0) {
      // Check if all categories belong to this feature or no feature
      const allMatch = categories.every(
        (cat) => !cat.featureSlug || cat.featureSlug === featureSlug
      )
      if (allMatch) {
        if (process.env.NODE_ENV === "development") {
          console.log("[FeatureSettingsPanel] Using all categories (pre-loaded)")
        }
        return categories
      }
    }
    return filtered
  }, [getFeatureSettings, featureSlug, categories])

  // Set default active category
  React.useEffect(() => {
    if (featureSettings.length === 0) {
      setActiveCategory(null)
      return
    }

    if (defaultCategory) {
      const hasDefault = featureSettings.some((cat) => cat.id === defaultCategory)
      if (hasDefault) {
        setActiveCategory(defaultCategory)
        return
      }
    }

    // Default to first category
    setActiveCategory(featureSettings[0]?.id || null)
  }, [featureSettings, defaultCategory])

  const activeSetting = featureSettings.find((cat) => cat.id === activeCategory)
  const ActiveComponent = activeSetting?.component

  // If only one category, show it directly without sidebar
  const showSidebar = featureSettings.length > 1

  if (featureSettings.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {showBackButton && (
          <div className="flex items-center gap-2 p-4 border-b">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <p>No settings available for this feature.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h2 className="text-lg font-semibold">
            {featureName || featureSlug} Settings
          </h2>
          {activeSetting && showSidebar && (
            <p className="text-sm text-muted-foreground">
              {activeSetting.label}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (only if multiple categories) */}
        {showSidebar && (
          <ScrollArea className="w-48 border-r bg-muted/30 shrink-0">
            <nav className="p-2 space-y-1">
              {featureSettings.map((category) => {
                const Icon = category.icon
                const isActive = category.id === activeCategory

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{category.label}</span>
                    {category.badge && (
                      <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded shrink-0">
                        {category.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </ScrollArea>
        )}

        {/* Settings Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Select a settings category</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
