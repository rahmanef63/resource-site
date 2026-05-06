/**
 * Feature Header Export/Import Actions
 * Provides ready-to-use export/import buttons for FeatureHeader
 */

import React, { useState, useEffect } from "react"
import { Download, Upload, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExportDialog } from "./ExportDialog"
import { ImportDialog } from "./ImportDialog"
import type { HeaderAction } from "@/frontend/shared/ui/layout/header/types"
import { isExportImportSupported, getSupportedExportFeatures } from "@/frontend/shared/foundation/utils/data/shared/config/data-export-registry"

// ============================================================================
// Export/Import Actions Provider
// ============================================================================

export interface FeatureExportImportProps {
  /** Feature identifier */
  featureId: string
  /** Show separate buttons or dropdown? */
  variant?: "separate" | "dropdown"
  /** Custom button variant */
  buttonVariant?: "default" | "outline" | "ghost" | "destructive"
  /** Button size */
  buttonSize?: "sm" | "default" | "lg"
  /** Custom className */
  className?: string
  /** Disable export? */
  disableExport?: boolean
  /** Disable import? */
  disableImport?: boolean
  /** Custom trigger icon for dropdown variant */
  triggerIcon?: React.ReactNode
  /** Selected item IDs for export */
  selectedIds?: string[]
  /** 
   * Direct data to export (overrides registry) 
   * @deprecated Not yet fully implemented - currently only used for type compatibility
   */
  data?: any[]
  /** 
   * Callback for import (overrides registry)
   * @deprecated Not yet fully implemented - currently only used for type compatibility
   */
  onImport?: (data: any[]) => void
}

export function FeatureExportImport({
  featureId,
  variant = "separate",
  buttonVariant = "outline",
  buttonSize = "sm",
  className,
  disableExport = false,
  disableImport = false,
  selectedIds = [],
  triggerIcon,
  data,
  onImport,
}: FeatureExportImportProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize registry if not already done
  useEffect(() => {
    const initializeRegistry = async () => {
      try {
        const { initializeDataExportRegistry } = await import("@/frontend/shared/foundation/utils/data/shared/config/data-export-registry")
        await initializeDataExportRegistry()
        setIsInitialized(true)
      } catch (error) {
        console.error("Failed to initialize export/import registry:", error)
      }
    }

    initializeRegistry()
  }, [])

  // Check if feature supports export/import
  const isSupported = isExportImportSupported(featureId)

  // Don't render until registry is initialized
  if (!isInitialized || !isSupported) {
    if (!isInitialized) {
      return null // Don't show anything while initializing
    }
    return null
  }

  const handleExportClick = () => {
    setExportOpen(true)
  }

  const handleImportClick = () => {
    setImportOpen(true)
  }

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={buttonVariant} size={buttonSize} className={className}>
              {triggerIcon || <MoreVertical className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!disableExport && (
              <>
                <DropdownMenuItem onClick={handleExportClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!disableImport && (
              <>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ExportDialog
          featureId={featureId}
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          selectedIds={selectedIds}
        />
        <ImportDialog
          featureId={featureId}
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className || ''}`}>
        {!disableExport && (
          <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={handleExportClick}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
        {!disableImport && (
          <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={handleImportClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
      </div>

      <ExportDialog
        featureId={featureId}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        selectedIds={selectedIds}
      />
      <ImportDialog
        featureId={featureId}
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </>
  )
}

// ============================================================================
// Header Action Helpers
// ============================================================================

/**
 * Creates export/import header actions for FeatureHeader
 */
export function createExportImportActions(
  featureId: string,
  options?: Partial<FeatureExportImportProps>
): HeaderAction[] | React.ReactNode {
  const {
    variant = "separate",
    buttonVariant = "outline",
    disableExport = false,
    disableImport = false,
    selectedIds = [],
  } = options || {}

  // Check if feature supports export/import
  if (!isExportImportSupported(featureId)) {
    return null
  }

  if (variant === "dropdown") {
    // Return a component for dropdown variant
    return (
      <FeatureExportImport
        featureId={featureId}
        variant="dropdown"
        buttonVariant={buttonVariant}
        disableExport={disableExport}
        disableImport={disableImport}
        selectedIds={selectedIds}
      />
    )
  }

  // Return array of header actions
  const actions: HeaderAction[] = []

  if (!disableExport) {
    actions.push({
      id: "export",
      label: "Export",
      icon: Download,
      onClick: () => {
        // This will be handled by the component
        // The actual implementation is handled by FeatureExportImport component
      },
      variant: buttonVariant,
    })
  }

  if (!disableImport) {
    actions.push({
      id: "import",
      label: "Import",
      icon: Upload,
      onClick: () => {
        // This will be handled by the component
      },
      variant: buttonVariant,
    })
  }

  return actions
}

// ============================================================================
// Hook for Feature Header Integration
// ============================================================================

/**
 * Hook to get export/import functionality for feature headers
 */
export function useFeatureHeaderExportImport(featureId: string) {
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const isSupported = isExportImportSupported(featureId)

  const handleExport = () => {
    if (isSupported) {
      setExportOpen(true)
    }
  }

  const handleImport = () => {
    if (isSupported) {
      setImportOpen(true)
    }
  }

  const getSecondaryActions = (options?: Partial<FeatureExportImportProps>) => {
    if (!isSupported) return undefined

    return <FeatureExportImport featureId={featureId} {...options} />
  }

  return {
    isSupported,
    exportOpen,
    importOpen,
    setExportOpen,
    setImportOpen,
    handleExport,
    handleImport,
    getSecondaryActions,
  }
}

// ============================================================================
// Preset Configurations
// ============================================================================

export const EXPORT_IMPORT_PRESETS = {
  // Minimal: Only dropdown menu
  minimal: {
    variant: "dropdown" as const,
    buttonVariant: "ghost" as const,
  },

  // Standard: Separate buttons
  standard: {
    variant: "separate" as const,
    buttonVariant: "outline" as const,
  },

  // Compact: Small buttons with icons only
  compact: {
    variant: "separate" as const,
    buttonVariant: "outline" as const,
    buttonSize: "sm" as const,
  },

  // Prominent: Default variant buttons
  prominent: {
    variant: "separate" as const,
    buttonVariant: "default" as const,
  },
} as const