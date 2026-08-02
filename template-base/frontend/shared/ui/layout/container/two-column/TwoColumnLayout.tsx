/**
 * Two Column Layout
 * 
 * A responsive two-column layout with:
 * - Resizable sidebar (left or right)
 * - Collapsible sidebar
 * - Responsive behavior
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResizeHandle } from "../ResizeHandle"
import { TwoColumnContext } from "./context"
import { usePersistedState, useResponsiveCollapse, useStackedLayout } from "./hooks"
import type { TwoColumnLayoutProps } from "./types"

const DEFAULT_SIDEBAR_WIDTH = 280
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 600
const COLLAPSE_AT = 768
const STACK_AT = 480

export function TwoColumnLayout({
  main,
  sidebar,
  sidebarPosition = "left",
  className,
  
  // Sizing
  sidebarWidth: defaultSidebarWidth = DEFAULT_SIDEBAR_WIDTH,
  minSidebarWidth = MIN_SIDEBAR_WIDTH,
  maxSidebarWidth = MAX_SIDEBAR_WIDTH,
  mainMinWidth = 300,
  
  // Behavior
  collapsible = true,
  defaultCollapsed = false,
  persistState = false,
  storageKey = "two-column-layout",
  
  // Responsive
  collapseAt = COLLAPSE_AT,
  stackAt = STACK_AT,
}: TwoColumnLayoutProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // State
  const [sidebarWidth, setSidebarWidth] = usePersistedState(
    `${storageKey}-width`,
    defaultSidebarWidth,
    persistState
  )
  
  const [isCollapsed, setIsCollapsed] = usePersistedState(
    `${storageKey}-collapsed`,
    defaultCollapsed,
    persistState
  )

  // Responsive
  const shouldCollapse = useResponsiveCollapse(collapseAt)
  const isStacked = useStackedLayout(stackAt)

  // Sync responsive collapse
  React.useEffect(() => {
    if (shouldCollapse) {
      setIsCollapsed(true)
    }
  }, [shouldCollapse, setIsCollapsed])

  // Resizing Logic
  const handleResizeStart = React.useCallback(() => {
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  const handleResizeEnd = React.useCallback(() => {
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [])

  const handleResize = React.useCallback((delta: number) => {
    setSidebarWidth(prev => {
      // If sidebar is on right, delta is inverted (dragging left increases width)
      // Wait, ResizeHandle usually gives delta based on mouse movement.
      // If dragging right, delta is positive.
      // Left sidebar: width + delta
      // Right sidebar: width - delta
      
      const change = sidebarPosition === "left" ? delta : -delta
      const newWidth = prev + change
      
      return Math.min(Math.max(newWidth, minSidebarWidth), maxSidebarWidth)
    })
  }, [sidebarPosition, minSidebarWidth, maxSidebarWidth, setSidebarWidth])

  // Context
  const contextValue = React.useMemo(() => ({
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed: setIsCollapsed,
    sidebarWidth,
    setSidebarWidth,
    isStacked,
    isMobile: isStacked, // Simplified mapping
    sidebarPosition
  }), [isCollapsed, setIsCollapsed, sidebarWidth, setSidebarWidth, isStacked, sidebarPosition])

  // Render Helpers
  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  // Stacked Layout (Mobile)
  if (isStacked) {
    return (
      <TwoColumnContext.Provider value={contextValue}>
        <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
          {/* Mobile Header / Toggle could go here if needed, but usually handled by children */}
          <div className="flex-1 overflow-hidden relative">
             {/* Simple stacking: if collapsed, show main. If not, show sidebar over main? 
                 Or just stack them vertically? 
                 Let's follow ThreeColumn pattern: Mobile view state.
                 But for simplicity here, let's just stack them vertically or use a simple toggle.
                 Actually, standard mobile pattern is Sidebar as drawer or hidden.
                 Let's just render Main for now, and assume Sidebar is handled via a Sheet/Drawer on mobile 
                 by the consumer, OR render both vertically.
                 
                 Let's render Main. Sidebar usually becomes a drawer.
             */}
             {main}
          </div>
        </div>
      </TwoColumnContext.Provider>
    )
  }

  // Desktop Layout
  return (
    <TwoColumnContext.Provider value={contextValue}>
      <div 
        ref={containerRef}
        className={cn("flex h-full w-full overflow-hidden bg-background", className)}
      >
        {/* Left Sidebar */}
        {sidebarPosition === "left" && (
          <>
            <aside
              style={{ width: isCollapsed ? 0 : sidebarWidth }}
              className={cn(
                "relative flex flex-col border-r border-border transition-[width] duration-300 ease-in-out overflow-hidden",
                isCollapsed && "border-none"
              )}
            >
              <div className="flex-1 overflow-hidden min-w-[200px]">
                {sidebar}
              </div>
            </aside>
            
            {/* Resize Handle */}
            {!isCollapsed && (
              <ResizeHandle
                direction="vertical"
                index={0}
                onResizeStart={handleResizeStart}
                onResize={handleResize}
                onResizeEnd={handleResizeEnd}
              />
            )}

            {/* Collapse Button (Left) */}
            {collapsible && (
              <div className="relative w-0 h-0 overflow-visible z-10">
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute top-4 h-6 w-6 rounded-full border shadow-sm bg-background hover:bg-accent",
                      isCollapsed ? "left-4" : "-left-3"
                    )}
                    onClick={toggleCollapse}
                  >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                  </Button>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-hidden relative">
          {main}
          
          {/* Collapse Button for Right Sidebar (when collapsed) */}
          {sidebarPosition === "right" && isCollapsed && collapsible && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-6 w-6 rounded-full border shadow-sm bg-background hover:bg-accent z-10"
                onClick={toggleCollapse}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
          )}
           {/* Collapse Button for Left Sidebar (when collapsed) */}
           {sidebarPosition === "left" && isCollapsed && collapsible && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 h-6 w-6 rounded-full border shadow-sm bg-background hover:bg-accent z-10"
                onClick={toggleCollapse}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
          )}
        </main>

        {/* Right Sidebar */}
        {sidebarPosition === "right" && (
          <>
             {/* Resize Handle */}
             {!isCollapsed && (
              <ResizeHandle
                direction="vertical"
                index={1}
                onResizeStart={handleResizeStart}
                onResize={handleResize}
                onResizeEnd={handleResizeEnd}
              />
            )}

            <aside
              style={{ width: isCollapsed ? 0 : sidebarWidth }}
              className={cn(
                "relative flex flex-col border-l border-border transition-[width] duration-300 ease-in-out overflow-hidden",
                isCollapsed && "border-none"
              )}
            >
               <div className="flex-1 overflow-hidden min-w-[200px]">
                {sidebar}
              </div>
              
               {/* Collapse Button (Right) */}
               {collapsible && !isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 -left-3 h-6 w-6 rounded-full border shadow-sm bg-background hover:bg-accent z-10"
                    onClick={toggleCollapse}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
               )}
            </aside>
          </>
        )}
      </div>
    </TwoColumnContext.Provider>
  )
}
