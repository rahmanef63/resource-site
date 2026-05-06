/**
 * Resize Handle Component
 * 
 * A draggable handle for resizing adjacent panels.
 * Shows visual feedback on hover (bold line with shade).
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface ResizeHandleProps {
  /** Direction of the split container */
  direction: "vertical" | "horizontal"
  /** Index of this handle (for tracking which handle is being dragged) */
  index: number
  /** Callback when resize starts */
  onResizeStart: (index: number, startPosition: number) => void
  /** Callback during resize */
  onResize: (delta: number) => void
  /** Callback when resize ends */
  onResizeEnd: () => void
  /** Additional class name */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function ResizeHandle({
  direction,
  index,
  onResizeStart,
  onResize,
  onResizeEnd,
  className,
}: ResizeHandleProps) {
  const handleRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const startPosRef = React.useRef(0)

  // Mouse down handler - start drag
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startPos = direction === "vertical" ? e.clientX : e.clientY
    startPosRef.current = startPos
    setIsDragging(true)
    onResizeStart(index, startPos)
    
    // Add global listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = direction === "vertical" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }, [direction, index, onResizeStart])

  // Mouse move handler - during drag
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    const currentPos = direction === "vertical" ? e.clientX : e.clientY
    const delta = currentPos - startPosRef.current
    onResize(delta)
  }, [direction, onResize])

  // Mouse up handler - end drag
  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
    onResizeEnd()
    
    // Remove global listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [handleMouseMove, onResizeEnd])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [handleMouseMove, handleMouseUp])

  // Touch support
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startPos = direction === "vertical" ? touch.clientX : touch.clientY
    startPosRef.current = startPos
    setIsDragging(true)
    onResizeStart(index, startPos)
  }, [direction, index, onResizeStart])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const currentPos = direction === "vertical" ? touch.clientX : touch.clientY
    const delta = currentPos - startPosRef.current
    onResize(delta)
  }, [direction, onResize])

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false)
    onResizeEnd()
  }, [onResizeEnd])

  const isActive = isHovered || isDragging

  return (
    <div
      ref={handleRef}
      className={cn(
        // Base styles
        "relative flex-shrink-0 z-10",
        // Direction-specific sizing
        direction === "vertical" 
          ? "w-1 cursor-col-resize" 
          : "h-1 cursor-row-resize",
        // Transition
        "transition-all duration-150",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="separator"
      aria-orientation={direction}
      tabIndex={0}
      onKeyDown={(e) => {
        // Keyboard support for accessibility
        const step = e.shiftKey ? 50 : 10
        if (direction === "vertical") {
          if (e.key === "ArrowLeft") {
            onResizeStart(index, 0)
            onResize(-step)
            onResizeEnd()
          } else if (e.key === "ArrowRight") {
            onResizeStart(index, 0)
            onResize(step)
            onResizeEnd()
          }
        } else {
          if (e.key === "ArrowUp") {
            onResizeStart(index, 0)
            onResize(-step)
            onResizeEnd()
          } else if (e.key === "ArrowDown") {
            onResizeStart(index, 0)
            onResize(step)
            onResizeEnd()
          }
        }
      }}
    >
      {/* Hover/Active area (larger hit target) */}
      <div
        className={cn(
          "absolute",
          direction === "vertical"
            ? "inset-y-0 -left-1 -right-1 w-3"
            : "inset-x-0 -top-1 -bottom-1 h-3"
        )}
      />
      
      {/* Visual line - the actual visible handle */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-150",
          // Position
          direction === "vertical"
            ? "left-0 right-0 top-0 bottom-0 w-full"
            : "top-0 bottom-0 left-0 right-0 h-full",
          // Base state - subtle
          "bg-border",
          // Hover/Active state - bold with shade
          isActive && [
            "bg-primary/80",
            direction === "vertical" ? "w-1 -mx-0.5 shadow-lg" : "h-1 -my-0.5 shadow-lg",
            "shadow-primary/20"
          ],
          // Dragging state - even more prominent
          isDragging && "bg-primary scale-110"
        )}
      />
      
      {/* Drag indicator dots (shown on hover/active) */}
      {isActive && (
        <div
          className={cn(
            "absolute flex items-center justify-center pointer-events-none",
            direction === "vertical"
              ? "inset-y-0 left-1/2 -translate-x-1/2 flex-col gap-1"
              : "inset-x-0 top-1/2 -translate-y-1/2 flex-row gap-1"
          )}
        >
          <span className="w-1 h-1 rounded-full bg-primary/60" />
          <span className="w-1 h-1 rounded-full bg-primary/60" />
          <span className="w-1 h-1 rounded-full bg-primary/60" />
        </div>
      )}
    </div>
  )
}
