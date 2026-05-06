/**
 * Mobile Panel Wrapper
 * 
 * Wrapper component for mobile panels with optional gesture support.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface MobilePanelWrapperProps {
    /** Panel content */
    children: React.ReactNode
    /** Whether this panel is currently visible */
    visible: boolean
    /** Class name for the wrapper */
    className?: string
    /** Enable swipe gestures */
    enableGestures?: boolean
    /** Callback when swiped right (back) */
    onSwipeRight?: () => void
}

/**
 * MobilePanelWrapper Component
 * 
 * Wraps mobile panel content with optional gesture support.
 * Provides smooth transitions between panels.
 */
export function MobilePanelWrapper({
    children,
    visible,
    className,
    enableGestures = false,
    onSwipeRight,
}: MobilePanelWrapperProps) {
    const [touchStart, setTouchStart] = React.useState<number | null>(null)
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

    // Minimum swipe distance (in px) to trigger swipe
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        if (!enableGestures) return
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (!enableGestures) return
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!enableGestures || !touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isSwipeRight = distance < -minSwipeDistance

        if (isSwipeRight && onSwipeRight) {
            onSwipeRight()
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    if (!visible) return null

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-background",
                "animate-in slide-in-from-right-full duration-200",
                className
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {children}
        </div>
    )
}
