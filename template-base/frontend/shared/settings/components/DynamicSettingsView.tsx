"use client"

/**
 * Dynamic Settings View
 *
 * Renders the active settings component with responsive layout
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettingsRegistry } from "../SettingsProvider"
import { DynamicSettingsSidebar } from "./DynamicSettingsSidebar"
import type { SettingsCategory } from "../types"

// Error boundary for individual settings components
class SettingsErrorBoundary extends Component<
  { children: ReactNode; categoryId: string; onReset?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; categoryId: string; onReset?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Settings component "${this.props.categoryId}" failed:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="max-w-md space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Settings Failed to Load</h2>
            <p className="text-sm text-muted-foreground">
              This settings section encountered an error and couldn't be displayed.
            </p>
            <details className="text-left text-xs bg-muted p-3 rounded-md">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                {this.state.error?.message || "Unknown error"}
              </pre>
            </details>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                this.props.onReset?.()
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export interface DynamicSettingsViewProps {
  /** Page title */
  title?: string
  /** Page description */
  description?: string
  /** Core settings categories (always visible, not from features) */
  coreCategories?: SettingsCategory[]
  /** Default category to show */
  defaultCategory?: string
  /** Whether to group settings by feature */
  groupByFeature?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to show back button on mobile */
  showMobileBack?: boolean
  /** Callback when back button is clicked */
  onBack?: () => void
}

export function DynamicSettingsView({
  title = "Settings",
  description,
  coreCategories = [],
  defaultCategory,
  groupByFeature = true,
  className,
  showMobileBack = true,
  onBack,
}: DynamicSettingsViewProps) {
  const { categories, activeCategory, setActiveCategory } = useSettingsRegistry()
  const isMobile = useIsMobile()
  const [showSidebar, setShowSidebar] = React.useState(!isMobile)

  // Combine core categories with feature categories
  const allCategories = React.useMemo(() => {
    return [...coreCategories, ...categories]
  }, [coreCategories, categories])

  const activeSettings = allCategories.find((cat) => cat.id === activeCategory)
  const ActiveComponent = activeSettings?.component

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleBackToSidebar = () => {
    setShowSidebar(true)
  }

  // Set default category on mount
  const lastAppliedDefault = React.useRef<string | undefined>(undefined)
  const categoryIds = React.useMemo(
    () => allCategories.map((c) => c.id).join(","),
    [allCategories]
  )

  React.useEffect(() => {
    if (allCategories.length === 0) {
      return
    }

    if (defaultCategory) {
      const hasDefault = allCategories.some((cat) => cat.id === defaultCategory)
      if (hasDefault && lastAppliedDefault.current !== defaultCategory) {
        setActiveCategory(defaultCategory)
        lastAppliedDefault.current = defaultCategory
      }

      if (!hasDefault) {
        lastAppliedDefault.current = undefined
      }

      return
    }

    lastAppliedDefault.current = undefined

    const activeStillValid = activeCategory
      ? allCategories.some((cat) => cat.id === activeCategory)
      : false

    if (!activeStillValid && allCategories[0]) {
      setActiveCategory(allCategories[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCategory, categoryIds])

  // Sync sidebar visibility with mobile state
  React.useEffect(() => {
    setShowSidebar(!isMobile)
  }, [isMobile])

  return (
    <div className={cn("flex flex-col w-full h-full bg-background", className)}>


      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DynamicSettingsSidebar
          categories={allCategories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          groupByFeature={groupByFeature}
          className={cn(
            "transition-all duration-300",
            isMobile ? (showSidebar ? "w-full" : "hidden") : "w-64"
          )}
        />

        {/* Content */}
        <ScrollArea
          className={cn(
            "flex-1 bg-background",
            isMobile && showSidebar && "hidden"
          )}
        >
          {/* Mobile Back Button */}
          {isMobile && !showSidebar && showMobileBack && (
            <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack || handleBackToSidebar}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </div>
          )}

          {/* Active Settings Component */}
          {ActiveComponent ? (
            <SettingsErrorBoundary categoryId={activeCategory || "unknown"}>
              <ActiveComponent />
            </SettingsErrorBoundary>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No settings selected</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a category from the sidebar
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
