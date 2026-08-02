/**
 * Mobile Header Component
 * 
 * Shared mobile header for three-column layout features.
 * Provides consistent navigation and actions across mobile views.
 */

"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MobileHeaderProps } from "../types"

/**
 * MobileHeader Component
 * 
 * Standard mobile header with back button, title, icon, and actions.
 * Used across all three-column layout features for consistency.
 */
export function MobileHeader({
    title,
    subtitle,
    icon: Icon,
    onBack,
    actions,
    showBackButton = !!onBack,
    className,
}: MobileHeaderProps & { className?: string }) {
    return (
        <div className={cn(
            "flex items-center gap-2 border-b p-2 h-14 bg-background shrink-0",
            className
        )}>
            {showBackButton && onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            )}

            {Icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-sm">{title}</h3>
                {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-1 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}
