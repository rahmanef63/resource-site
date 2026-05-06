/**
 * Feature Preview Wrapper Component
 * 
 * Wraps feature preview components with common UI elements
 * like mock data selector, loading states, and error boundaries
 */

"use client"

import * as React from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { FeaturePreviewConfig, FeaturePreviewMockData } from './types'

interface FeaturePreviewWrapperProps {
  /** Preview configuration */
  config: FeaturePreviewConfig
  /** Current mock data */
  mockData: FeaturePreviewMockData
  /** Available mock data sets */
  mockDataSets: FeaturePreviewMockData[]
  /** Callback when mock data changes */
  onMockDataChange: (mockDataId: string) => void
  /** Whether in compact mode */
  compact?: boolean
  /** Whether interactive */
  interactive?: boolean
  /** Additional class names */
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Preview Error</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || 'An error occurred while rendering the preview'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              this.props.onReset()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function FeaturePreviewWrapper({
  config,
  mockData,
  mockDataSets,
  onMockDataChange,
  compact = false,
  interactive = true,
  className,
}: FeaturePreviewWrapperProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showInteractive, setShowInteractive] = React.useState(interactive)
  const PreviewComponent = config.component

  const handleMockDataChange = React.useCallback((mockDataId: string) => {
    setIsLoading(true)
    onMockDataChange(mockDataId)
    // Simulate loading for visual feedback
    setTimeout(() => setIsLoading(false), 300)
  }, [onMockDataChange])

  const handleReset = React.useCallback(() => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  const handleInteraction = React.useCallback((action: string, data?: unknown) => {
    console.log(`[FeaturePreview] Interaction: ${action}`, data)
    // Could emit events for analytics or UI feedback
  }, [])

  if (compact) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <PreviewErrorBoundary onReset={handleReset}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <PreviewComponent
                mockData={mockData}
                compact={true}
                interactive={showInteractive}
                onInteraction={handleInteraction}
              />
            )}
          </PreviewErrorBoundary>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      <CardHeader className="flex-shrink-0 pb-3 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {config.name}
              <Badge variant="secondary" className="text-xs">
                Preview
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              {config.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInteractive(!showInteractive)}
                  >
                    {showInteractive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showInteractive ? 'Disable interactions' : 'Enable interactions'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {mockDataSets.length > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Scenario:</span>
            <Select
              value={mockData.id}
              onValueChange={handleMockDataChange}
            >
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                {mockDataSets.map((mock) => (
                  <SelectItem key={mock.id} value={mock.id}>
                    {mock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {config.tags && config.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {config.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        <PreviewErrorBoundary onReset={handleReset}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PreviewComponent
              mockData={mockData}
              compact={false}
              interactive={showInteractive}
              onInteraction={handleInteraction}
            />
          )}
        </PreviewErrorBoundary>
      </CardContent>
    </Card>
  )
}

export default FeaturePreviewWrapper
