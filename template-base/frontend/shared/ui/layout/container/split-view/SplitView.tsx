"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"
import { GripVertical, X, Maximize2, Minimize2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// Types
// ============================================================================

export interface SplitViewPane {
  id: string
  /** Content to render in this pane */
  content: React.ReactNode
  /** Title shown in pane header */
  title?: string
  /** Icon for the pane */
  icon?: React.ReactNode
  /** Minimum size percentage */
  minSize?: number
  /** Default size percentage */
  defaultSize?: number
  /** Whether this pane can be closed */
  closable?: boolean
}

export interface SplitViewProps {
  /** Panes to display */
  panes: SplitViewPane[]
  /** Split direction */
  direction?: "horizontal" | "vertical"
  /** Called when a pane is closed */
  onClosePane?: (paneId: string) => void
  /** Called when panes are reordered */
  onReorderPanes?: (paneIds: string[]) => void
  /** Whether to show pane headers */
  showHeaders?: boolean
  /** Storage key for persisting layout */
  persistKey?: string
  /** Additional className */
  className?: string
}

export interface SplitViewPaneHeaderProps {
  pane: SplitViewPane
  onClose?: () => void
  onMaximize?: () => void
  isMaximized?: boolean
  className?: string
}

// ============================================================================
// Split View Resize Handle
// ============================================================================

function SplitResizeHandle({
  direction = "horizontal",
  className,
}: {
  direction?: "horizontal" | "vertical"
  className?: string
}) {
  return (
    <PanelResizeHandle
      className={cn(
        "group relative flex items-center justify-center",
        "transition-colors duration-200",
        "bg-border/50 hover:bg-primary/30",
        direction === "horizontal" ? [
          "w-1 hover:w-1.5",
          "cursor-col-resize"
        ] : [
          "h-1 hover:h-1.5",
          "cursor-row-resize"
        ],
        className
      )}
    >
      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "text-muted-foreground/70"
        )}
      >
        <GripVertical className="h-3 w-3" />
      </div>
    </PanelResizeHandle>
  )
}

// ============================================================================
// Split View Pane Header
// ============================================================================

function SplitViewPaneHeader({
  pane,
  onClose,
  onMaximize,
  isMaximized,
  className,
}: SplitViewPaneHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "h-8 px-2 border-b bg-muted/30",
        "text-sm font-medium",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {pane.icon && (
          <span className="flex-shrink-0">{pane.icon}</span>
        )}
        <span className="truncate">{pane.title || pane.id}</span>
      </div>
      
      <div className="flex items-center gap-0.5">
        {onMaximize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        )}
        {pane.closable !== false && onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive/20"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Split View Component
// ============================================================================

/**
 * SplitView Component
 * 
 * Displays multiple content panes side by side with resizable dividers.
 * Supports horizontal (side-by-side) and vertical (stacked) layouts.
 * 
 * @example
 * ```tsx
 * <SplitView
 *   direction="horizontal"
 *   panes={[
 *     { id: "left", content: <LeftContent />, title: "Editor" },
 *     { id: "right", content: <RightContent />, title: "Preview" },
 *   ]}
 *   onClosePane={(id) => removePaneById(id)}
 * />
 * ```
 */
export function SplitView({
  panes,
  direction = "horizontal",
  onClosePane,
  onReorderPanes,
  showHeaders = true,
  persistKey,
  className,
}: SplitViewProps) {
  const [maximizedPane, setMaximizedPane] = React.useState<string | null>(null)

  // Handle pane maximization
  const handleMaximize = React.useCallback((paneId: string) => {
    setMaximizedPane((current) => (current === paneId ? null : paneId))
  }, [])

  // If no panes, render nothing
  if (panes.length === 0) {
    return null
  }

  // If only one pane, render it without split
  if (panes.length === 1) {
    const pane = panes[0]
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {showHeaders && (
          <SplitViewPaneHeader
            pane={pane}
            onClose={pane.closable !== false ? () => onClosePane?.(pane.id) : undefined}
          />
        )}
        <div className="flex-1 overflow-auto">
          {pane.content}
        </div>
      </div>
    )
  }

  // If a pane is maximized, only show that one
  if (maximizedPane) {
    const pane = panes.find((p) => p.id === maximizedPane)
    if (pane) {
      return (
        <div className={cn("flex flex-col h-full", className)}>
          {showHeaders && (
            <SplitViewPaneHeader
              pane={pane}
              onClose={pane.closable !== false ? () => onClosePane?.(pane.id) : undefined}
              onMaximize={() => handleMaximize(pane.id)}
              isMaximized={true}
            />
          )}
          <div className="flex-1 overflow-auto">
            {pane.content}
          </div>
        </div>
      )
    }
  }

  // Calculate default sizes
  const defaultSize = 100 / panes.length

  return (
    <PanelGroup
      direction={direction}
      className={cn("h-full", className)}
      autoSaveId={persistKey}
    >
      {panes.map((pane, index) => (
        <React.Fragment key={pane.id}>
          <Panel
            defaultSize={pane.defaultSize ?? defaultSize}
            minSize={pane.minSize ?? 10}
            className="flex flex-col"
          >
            {showHeaders && (
              <SplitViewPaneHeader
                pane={pane}
                onClose={pane.closable !== false ? () => onClosePane?.(pane.id) : undefined}
                onMaximize={() => handleMaximize(pane.id)}
                isMaximized={false}
              />
            )}
            <div className="flex-1 overflow-auto">
              {pane.content}
            </div>
          </Panel>
          
          {index < panes.length - 1 && (
            <SplitResizeHandle direction={direction} />
          )}
        </React.Fragment>
      ))}
    </PanelGroup>
  )
}

// ============================================================================
// Split View Hook
// ============================================================================

export interface UseSplitViewReturn {
  panes: SplitViewPane[]
  addPane: (pane: SplitViewPane) => void
  removePane: (paneId: string) => void
  updatePane: (paneId: string, updates: Partial<SplitViewPane>) => void
  reorderPanes: (paneIds: string[]) => void
  clearPanes: () => void
}

/**
 * Hook for managing split view panes
 */
export function useSplitView(
  initialPanes: SplitViewPane[] = []
): UseSplitViewReturn {
  const [panes, setPanes] = React.useState<SplitViewPane[]>(initialPanes)

  const addPane = React.useCallback((pane: SplitViewPane) => {
    setPanes((prev) => [...prev, pane])
  }, [])

  const removePane = React.useCallback((paneId: string) => {
    setPanes((prev) => prev.filter((p) => p.id !== paneId))
  }, [])

  const updatePane = React.useCallback(
    (paneId: string, updates: Partial<SplitViewPane>) => {
      setPanes((prev) =>
        prev.map((p) => (p.id === paneId ? { ...p, ...updates } : p))
      )
    },
    []
  )

  const reorderPanes = React.useCallback((paneIds: string[]) => {
    setPanes((prev) => {
      const paneMap = new Map(prev.map((p) => [p.id, p]))
      return paneIds.map((id) => paneMap.get(id)!).filter(Boolean)
    })
  }, [])

  const clearPanes = React.useCallback(() => {
    setPanes([])
  }, [])

  return {
    panes,
    addPane,
    removePane,
    updatePane,
    reorderPanes,
    clearPanes,
  }
}
