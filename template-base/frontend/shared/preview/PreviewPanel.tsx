/**
 * Preview Panel Component
 * 
 * Right panel that displays the feature preview
 */

"use client"

import * as React from 'react'
import { X, Maximize2, Minimize2, ExternalLink, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FeaturePreviewWrapper } from './FeaturePreviewWrapper'
import { getFeaturePreview } from './registry'
import type { FeaturePreviewConfig, FeaturePreviewMockData } from './types'

interface PreviewPanelProps {
  /** Feature ID to preview */
  featureId: string | null
  /** Whether panel is visible */
  visible: boolean
  /** Callback to close panel */
  onClose: () => void
  /** Additional class names */
  className?: string
  /** Hide the internal header (use when parent provides header) */
  hideHeader?: boolean
}

export function PreviewPanel({
  featureId,
  visible,
  onClose,
  className,
  hideHeader = false,
}: PreviewPanelProps) {
  const [currentMockDataId, setCurrentMockDataId] = React.useState<string | null>(null)
  const [previewConfig, setPreviewConfig] = React.useState<FeaturePreviewConfig | null>(null)

  // Load preview config when feature changes
  React.useEffect(() => {
    if (featureId) {
      const config = getFeaturePreview(featureId)
      setPreviewConfig(config || null)
      setCurrentMockDataId(config?.defaultMockDataId || config?.mockDataSets[0]?.id || null)
    } else {
      setPreviewConfig(null)
      setCurrentMockDataId(null)
    }
  }, [featureId])

  // Get current mock data
  const currentMockData = React.useMemo<FeaturePreviewMockData | null>(() => {
    if (!previewConfig || !currentMockDataId) return null
    return previewConfig.mockDataSets.find(m => m.id === currentMockDataId) || null
  }, [previewConfig, currentMockDataId])

  const handleMockDataChange = React.useCallback((mockDataId: string) => {
    setCurrentMockDataId(mockDataId)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background transition-all duration-300",
        className
      )}
    >
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Preview</span>
            {previewConfig && (
              <span className="text-xs text-muted-foreground">
                • {previewConfig.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!visible || !featureId ? (
          <EmptyState message="Select a feature and click the eye icon to preview" />
        ) : !previewConfig ? (
          <EmptyState 
            message="No preview available for this feature" 
            showIcon={false}
          />
        ) : !currentMockData ? (
          <EmptyState message="No mock data available" />
        ) : (
          <FeaturePreviewWrapper
            config={previewConfig}
            mockData={currentMockData}
            mockDataSets={previewConfig.mockDataSets}
            onMockDataChange={handleMockDataChange}
            className="h-full rounded-none border-0"
          />
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  message: string
  showIcon?: boolean
}

function EmptyState({ message, showIcon = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {showIcon && (
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

export default PreviewPanel
