/**
 * Mobile Inspector Drawer
 * 
 * Bottom drawer for displaying inspector/right panel content on mobile devices.
 * Provides smooth slide-up animation and backdrop.
 */

"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MobileInspectorDrawerProps {
    /** Whether drawer is open */
    open: boolean
    /** Close callback */
    onClose: () => void
    /** Drawer content */
    children: React.ReactNode
    /** Optional title */
    title?: string
    /** Additional className */
    className?: string
}

/**
 * MobileInspectorDrawer Component
 * 
 * Renders inspector content as a bottom drawer on mobile.
 * Features smooth animations, backdrop, and swipe-to-close.
 */
export function MobileInspectorDrawer({
    open,
    onClose,
    children,
    title,
    className,
}: MobileInspectorDrawerProps) {
    const [touchStart, setTouchStart] = React.useState<number | null>(null)
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

    // Minimum swipe distance (in px) to close
    const minSwipeDistance = 100

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientY)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchEnd - touchStart
        const isSwipeDown = distance > minSwipeDistance

        if (isSwipeDown) {
            onClose()
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    React.useEffect(() => {
        if (open) {
            // Prevent body scroll when drawer is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in-0 duration-200"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50",
                    "bg-background border-t rounded-t-xl shadow-2xl",
                    "max-h-[85vh] flex flex-col",
                    "animate-in slide-in-from-bottom-full duration-300",
                    className
                )}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Drag Handle */}
                <div className="flex items-center justify-center py-2 px-4 border-b shrink-0">
                    <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                    <h3 className="font-semibold text-sm">
                        {title || "Inspector"}
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0 pb-[env(safe-area-inset-bottom)]">
                    {children}
                </div>
            </div>
        </>
    )
}
