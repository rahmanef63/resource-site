/**
 * Three Column Layout (Advanced)
 * 
 * A responsive three-column layout with:
 * - Collapsible left and right panels
 * - Resizable panel widths
 * - Responsive breakpoint behavior
 * - Keyboard accessibility
 * - Smooth animations
 * - Persist collapse state (optional)
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { ResizeHandle } from "./_ResizeHandle"
import { ThreeColumnContext } from "./context"
import { usePersistedState, useResponsiveCollapse, useStackedLayout } from "./hooks"
import { PanelHeader } from "./PanelHeader"
import { CollapsedPanel } from "./CollapsedPanel"
import { MobileInspectorDrawer } from "./mobile/MobileInspectorDrawer"
import type { ThreeColumnLayoutAdvancedProps } from "./types"
import { resolveThreeColumnPreset } from "./presets"

// Default responsive breakpoints
// Priority: Right panel collapses first, then left panel on smaller desktops
const DEFAULT_COLLAPSE_RIGHT_AT = 1024 // Collapse right panel first on smaller desktops
const DEFAULT_COLLAPSE_LEFT_AT = 768   // Collapse left panel on tablets
const DEFAULT_STACK_AT = 768           // Stack on tablets and below for mobile navigation

export function ThreeColumnLayoutAdvanced(rawProps: ThreeColumnLayoutAdvancedProps) {
  const presetConfig = resolveThreeColumnPreset(rawProps.preset)

  const left = rawProps.left
  const center = rawProps.center
  const right = rawProps.right
  const className = rawProps.className

  // Optional custom panels headers
  const leftHeader = rawProps.leftHeader
  const centerHeader = rawProps.centerHeader
  const rightHeader = rawProps.rightHeader

  // Panel widths
  const defaultLeftWidth = rawProps.leftWidth ?? presetConfig.leftWidth ?? 280
  const defaultRightWidth = rawProps.rightWidth ?? presetConfig.rightWidth ?? 400
  const centerMinWidth = rawProps.centerMinWidth ?? presetConfig.centerMinWidth ?? 280
  const minSideWidth = rawProps.minSideWidth ?? presetConfig.minSideWidth ?? 200
  const maxSideWidth = rawProps.maxSideWidth ?? presetConfig.maxSideWidth ?? 600
  const collapsedWidth = rawProps.collapsedWidth ?? presetConfig.collapsedWidth ?? 40

  // Space distribution
  const spaceDistribution =
    rawProps.spaceDistribution ?? presetConfig.spaceDistribution ?? "right-priority"

  // Collapse state
  const controlledLeftCollapsed = rawProps.leftCollapsed
  const controlledRightCollapsed = rawProps.rightCollapsed
  const onLeftCollapsedChange = rawProps.onLeftCollapsedChange
  const onRightCollapsedChange = rawProps.onRightCollapsedChange
  const controlledMobileView = rawProps.mobileView
  const onMobileViewChange = rawProps.onMobileViewChange
  const mobileLeftHeader = rawProps.mobileLeftHeader
  const defaultLeftCollapsed =
    rawProps.defaultLeftCollapsed ?? presetConfig.defaultLeftCollapsed ?? false
  const defaultRightCollapsed =
    rawProps.defaultRightCollapsed ?? presetConfig.defaultRightCollapsed ?? false

  // Features
  const resizable = rawProps.resizable ?? presetConfig.resizable ?? true
  const showCollapseButtons =
    rawProps.showCollapseButtons ?? presetConfig.showCollapseButtons ?? true
  const showLeftCollapseButton = rawProps.showLeftCollapseButton
  const showRightCollapseButton = rawProps.showRightCollapseButton
  const persistState = rawProps.persistState ?? presetConfig.persistState ?? false
  const storageKey = rawProps.storageKey ?? presetConfig.storageKey ?? "three-column-layout"

  // Labels
  const leftLabel = rawProps.leftLabel ?? presetConfig.leftLabel ?? "Left Panel"
  const centerLabel = rawProps.centerLabel ?? presetConfig.centerLabel ?? "Main Content"
  const rightLabel = rawProps.rightLabel ?? presetConfig.rightLabel ?? "Right Panel"

  // Responsive - use defaults if not provided
  const collapseLeftAt =
    rawProps.collapseLeftAt ?? presetConfig.collapseLeftAt ?? DEFAULT_COLLAPSE_LEFT_AT
  const collapseRightAt =
    rawProps.collapseRightAt ?? presetConfig.collapseRightAt ?? DEFAULT_COLLAPSE_RIGHT_AT
  const stackAt = rawProps.stackAt ?? presetConfig.stackAt ?? DEFAULT_STACK_AT

  // Hidden panels (null content hides by default)
  const hideLeft = rawProps.leftHidden ?? left == null
  const hideRight = rawProps.rightHidden ?? right == null

  const containerRef = React.useRef<HTMLDivElement>(null)

  // Stack layout for mobile - check this FIRST
  const isStacked = useStackedLayout(stackAt)

  // Mobile navigation state (separate from desktop collapse state)
  // On mobile: 'left' = show list, 'center' = show main content
  // Right panel is shown as drawer instead of fullscreen
  const [internalMobileView, setInternalMobileView] = React.useState<'left' | 'center'>(() =>
    hideLeft ? "center" : "left"
  )

  // Controlled mobileView: external prop takes priority over internal state
  const mobileView = controlledMobileView ?? internalMobileView
  const setMobileView = React.useCallback((view: 'left' | 'center') => {
    setInternalMobileView(view)
    onMobileViewChange?.(view)
  }, [onMobileViewChange])

  // Mobile inspector drawer state
  const [mobileInspectorOpen, setMobileInspectorOpen] = React.useState(false)

  // Keep mobile view valid if panels become hidden
  React.useEffect(() => {
    if (hideLeft && mobileView === "left") setMobileView("center")
  }, [hideLeft, mobileView])

  // On mobile: sync inspector drawer with controlled rightCollapsed prop.
  // When parent calls setRightPanelCollapsed(false) (item selected), open the drawer.
  // When parent calls setRightPanelCollapsed(true) (inspector closed), close the drawer.
  const isRightControlledForSync = controlledRightCollapsed !== undefined
  React.useEffect(() => {
    if (isStacked && isRightControlledForSync) {
      setMobileInspectorOpen(!controlledRightCollapsed!)
    }
  }, [isStacked, isRightControlledForSync, controlledRightCollapsed])

  // Persisted state
  const [persistedState, setPersistedState] = usePersistedState(
    storageKey,
    { leftCollapsed: defaultLeftCollapsed, rightCollapsed: defaultRightCollapsed },
    persistState
  )

  // Internal collapse state (uncontrolled) - for DESKTOP only
  const [internalLeftCollapsed, setInternalLeftCollapsed] = React.useState(
    persistState ? persistedState.leftCollapsed : defaultLeftCollapsed
  )
  const [internalRightCollapsed, setInternalRightCollapsed] = React.useState(
    persistState ? persistedState.rightCollapsed : defaultRightCollapsed
  )

  // Auto-collapse based on responsive breakpoints - DESKTOP only
  const autoLeftCollapsed = useResponsiveCollapse(isStacked ? undefined : collapseLeftAt)
  const autoRightCollapsed = useResponsiveCollapse(isStacked ? undefined : collapseRightAt)

  // Determine actual collapse state - DESKTOP only
  const isLeftControlled = controlledLeftCollapsed !== undefined
  const isRightControlled = controlledRightCollapsed !== undefined

  const computedLeftCollapsed = isLeftControlled
    ? controlledLeftCollapsed
    : (autoLeftCollapsed || internalLeftCollapsed)

  const computedRightCollapsed = isRightControlled
    ? controlledRightCollapsed
    : (autoRightCollapsed || internalRightCollapsed)

  const leftCollapsed = hideLeft ? true : computedLeftCollapsed
  const rightCollapsed = hideRight ? true : computedRightCollapsed

  // Panel widths (for resizing)
  const [leftWidth, setLeftWidth] = React.useState(defaultLeftWidth)
  const [rightWidth, setRightWidth] = React.useState(defaultRightWidth)

  // Toggle handlers
  const toggleLeft = React.useCallback(() => {
    if (hideLeft) return
    const newValue = !leftCollapsed
    if (!isLeftControlled) {
      setInternalLeftCollapsed(newValue)
      if (persistState) {
        setPersistedState(prev => ({ ...prev, leftCollapsed: newValue }))
      }
    }
    onLeftCollapsedChange?.(newValue)
  }, [hideLeft, leftCollapsed, isLeftControlled, onLeftCollapsedChange, persistState, setPersistedState])

  const toggleRight = React.useCallback(() => {
    if (hideRight) return
    const newValue = !rightCollapsed
    if (!isRightControlled) {
      setInternalRightCollapsed(newValue)
      if (persistState) {
        setPersistedState(prev => ({ ...prev, rightCollapsed: newValue }))
      }
    }
    onRightCollapsedChange?.(newValue)
  }, [hideRight, rightCollapsed, isRightControlled, onRightCollapsedChange, persistState, setPersistedState])

  // Resize handlers
  const leftResizeRef = React.useRef({ startWidth: leftWidth, startPos: 0 })
  const rightResizeRef = React.useRef({ startWidth: rightWidth, startPos: 0 })

  const handleLeftResizeStart = React.useCallback((_index: number, startPos: number) => {
    leftResizeRef.current = { startWidth: leftWidth, startPos }
  }, [leftWidth])

  const handleLeftResize = React.useCallback((delta: number) => {
    const newWidth = Math.max(minSideWidth, Math.min(maxSideWidth, leftResizeRef.current.startWidth + delta))
    setLeftWidth(newWidth)
  }, [minSideWidth, maxSideWidth])

  const handleRightResizeStart = React.useCallback((_index: number, startPos: number) => {
    rightResizeRef.current = { startWidth: rightWidth, startPos }
  }, [rightWidth])

  const handleRightResize = React.useCallback((delta: number) => {
    const newWidth = Math.max(minSideWidth, Math.min(maxSideWidth, rightResizeRef.current.startWidth - delta))
    setRightWidth(newWidth)
  }, [minSideWidth, maxSideWidth])

  const handleResizeEnd = React.useCallback(() => {
    // Could persist sizes here if needed
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggleLeft()
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "B") {
        e.preventDefault()
        toggleRight()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggleLeft, toggleRight])

  // Context value
  const contextValue = React.useMemo(() => ({
    leftCollapsed,
    rightCollapsed,
    toggleLeft,
    toggleRight,
  }), [leftCollapsed, rightCollapsed, toggleLeft, toggleRight])

  // Mobile stacked layout - full screen navigation with inspector drawer
  if (isStacked) {
    const canShowLeft = !hideLeft
    const canShowRight = !hideRight

    // Mobile navigation handlers
    const goToCenter = () => setMobileView("center")
    const goToLeft = () => {
      if (canShowLeft) setMobileView("left")
    }
    const toggleInspectorDrawer = () => {
      if (canShowRight) {
        const next = !mobileInspectorOpen
        setMobileInspectorOpen(next)
        onRightCollapsedChange?.(!next)
      }
    }
    const closeInspectorDrawer = () => {
      setMobileInspectorOpen(false)
      onRightCollapsedChange?.(true)
    }

    // Context for mobile
    const mobileContextValue = {
      leftCollapsed: !canShowLeft || mobileView !== "left",
      rightCollapsed: !canShowRight || !mobileInspectorOpen,
      toggleLeft: !canShowLeft ? () => { } : (mobileView === "left" ? goToCenter : goToLeft),
      toggleRight: toggleInspectorDrawer,
    }

    return (
      <ThreeColumnContext.Provider value={mobileContextValue}>
        <div
          ref={containerRef}
          className={cn("relative flex flex-col w-full h-full overflow-hidden overscroll-none", className)}
        >
          {/* LEFT PANEL - Full screen list view */}
          {canShowLeft && mobileView === "left" && (
            <div className="absolute inset-0 flex flex-col bg-background z-10">
              {mobileLeftHeader !== undefined ? (
                mobileLeftHeader != null && <div className="flex-shrink-0">{mobileLeftHeader}</div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                  <span className="text-base font-semibold">{leftLabel}</span>
                </div>
              )}
              <div className="flex-1 overflow-auto">{left}</div>
            </div>
          )}

          {/* CENTER PANEL - Full screen main content with back/inspector buttons */}
          {mobileView === "center" && (
            <div className="absolute inset-0 flex flex-col bg-background z-20">
              <div className="flex items-center gap-3 px-2 py-2 border-b bg-muted/30 flex-shrink-0">
                {canShowLeft && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToLeft}
                    className="h-9 w-9 touch-manipulation"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <span className="text-base font-semibold flex-1">{centerLabel}</span>
                {canShowRight && (
                  <Button
                    variant={mobileInspectorOpen ? "secondary" : "ghost"}
                    size="icon"
                    onClick={toggleInspectorDrawer}
                    className="h-9 w-9 touch-manipulation"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                )}
              </div>
              {centerHeader && <div className="flex-shrink-0">{centerHeader}</div>}
              <div className="flex-1 overflow-auto">{center}</div>
            </div>
          )}

          {/* INSPECTOR DRAWER - Bottom drawer for inspector/right panel */}
          {canShowRight && (
            <MobileInspectorDrawer
              open={mobileInspectorOpen}
              onClose={closeInspectorDrawer}
              title={rightLabel}
            >
              {right}
            </MobileInspectorDrawer>
          )}
        </div>
      </ThreeColumnContext.Provider>
    )
  }

  const effectiveShowLeftCollapseButton = showLeftCollapseButton ?? showCollapseButtons
  const effectiveShowRightCollapseButton = showRightCollapseButton ?? showCollapseButtons

  // Flex-shrink priorities when viewport is constrained
  const centerFlexShrink = spaceDistribution === "center-priority" ? 0 : 1
  const rightFlexShrink = spaceDistribution === "right-priority" ? 0 : 1
  const leftFlexShrink = 1

  // Normal three-column layout
  return (
    <ThreeColumnContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn("relative flex flex-row w-full h-full overflow-hidden", className)}
      >
        {!hideLeft && (
          <>
            {/* Left Panel */}
            <div
              className={cn(
                "flex flex-col h-full border-r transition-all duration-200 ease-in-out flex-shrink-0",
                leftCollapsed && "border-r-0"
              )}
              style={{
                width: leftCollapsed ? collapsedWidth : leftWidth,
                minWidth: leftCollapsed ? collapsedWidth : minSideWidth,
                maxWidth: leftCollapsed ? collapsedWidth : maxSideWidth,
                flexShrink: leftCollapsed ? 0 : leftFlexShrink,
              }}
              data-collapsed={leftCollapsed}
              aria-label={leftLabel}
            >
              {leftCollapsed ? (
                <CollapsedPanel
                  side="left"
                  label={leftLabel}
                  onClick={toggleLeft}
                  width={collapsedWidth}
                />
              ) : (
                <>
                  {leftHeader ? (
                    <div className="flex-shrink-0">{leftHeader}</div>
                  ) : (
                    effectiveShowLeftCollapseButton && (
                      <PanelHeader
                        side="left"
                        collapsed={leftCollapsed}
                        onToggle={toggleLeft}
                        label={leftLabel}
                        showButton={effectiveShowLeftCollapseButton}
                      >
                        {leftLabel}
                      </PanelHeader>
                    )
                  )}
                  <div className="flex-1 overflow-auto">
                    {left}
                  </div>
                </>
              )}
            </div>

            {/* Left Resize Handle */}
            {resizable && !leftCollapsed && (
              <ResizeHandle
                direction="vertical"
                index={0}
                onResizeStart={handleLeftResizeStart}
                onResize={handleLeftResize}
                onResizeEnd={handleResizeEnd}
              />
            )}
          </>
        )}

        {/* Center Panel */}
        <div
          className="flex flex-col h-full overflow-hidden transition-all duration-200 flex-1"
          style={{
            minWidth: centerMinWidth,
            marginRight: rightCollapsed && !hideRight ? collapsedWidth : 0,
            flexShrink: centerFlexShrink,
          }}
          aria-label={centerLabel}
        >
          {centerHeader && <div className="flex-shrink-0">{centerHeader}</div>}
          <div className="flex-1 overflow-auto">
            {center}
          </div>
        </div>

        {!hideRight && (
          <>
            {/* Right Resize Handle */}
            {resizable && !rightCollapsed && (
              <ResizeHandle
                direction="vertical"
                index={1}
                onResizeStart={handleRightResizeStart}
                onResize={handleRightResize}
                onResizeEnd={handleResizeEnd}
              />
            )}

            {/* Right Panel */}
            <div
              className={cn(
                "flex flex-col h-full border-l transition-all duration-200 ease-in-out",
                rightCollapsed && "border-l-0 absolute right-0 top-0 bottom-0"
              )}
              style={rightCollapsed ? {
                width: collapsedWidth,
              } : {
                width: rightWidth,
                minWidth: minSideWidth,
                maxWidth: maxSideWidth,
                flexShrink: rightFlexShrink,
              }}
              data-collapsed={rightCollapsed}
              aria-label={rightLabel}
            >
              {rightCollapsed ? (
                <CollapsedPanel
                  side="right"
                  label={rightLabel}
                  onClick={toggleRight}
                  width={collapsedWidth}
                />
              ) : (
                <>
                  {rightHeader ? (
                    <div className="flex-shrink-0">{rightHeader}</div>
                  ) : (
                    effectiveShowRightCollapseButton && (
                      <PanelHeader
                        side="right"
                        collapsed={rightCollapsed}
                        onToggle={toggleRight}
                        label={rightLabel}
                        showButton={effectiveShowRightCollapseButton}
                      >
                        {rightLabel}
                      </PanelHeader>
                    )
                  )}
                  <div className="flex-1 overflow-auto">
                    {right}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ThreeColumnContext.Provider>
  )
}
