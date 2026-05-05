/**
 * Right Panel Tabs Component
 * 
 * Standardized tabbed interface for right panel modes (inspector/AI/settings).
 */

"use client"

import * as React from "react"
import { Info, Sparkles, Settings, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RightPanelMode } from "../types"

export interface RightPanelTabsProps {
    /** Available modes */
    modes: RightPanelMode[]
    /** Currently active mode */
    currentMode: RightPanelMode
    /** Mode change callback */
    onModeChange: (mode: RightPanelMode) => void
    /** Panel content */
    children: React.ReactNode
    /** Allow closing the panel */
    collapsible?: boolean
    /** Close callback */
    onClose?: () => void
    /** Additional class name */
    className?: string
}

const MODE_CONFIG: Record<RightPanelMode, {
    icon: React.ComponentType<{ className?: string }>
    label: string
}> = {
    inspector: { icon: Info, label: "Inspector" },
    ai: { icon: Sparkles, label: "AI" },
    notifications: { icon: Bell, label: "Inbox" },
    settings: { icon: Settings, label: "Settings" },
    custom: { icon: Info, label: "Custom" },
}

/**
 * RightPanelTabs Component
 * 
 * Provides tabbed interface for right panel with mode switching.
 * Standardizes inspector/AI/settings navigation across features.
 */
export function RightPanelTabs({
    modes,
    currentMode,
    onModeChange,
    children,
    collapsible = false,
    onClose,
    className,
}: RightPanelTabsProps) {
    return (
        <div className={cn("flex flex-col h-full border-l bg-background", className)}>
            {modes.length > 1 && (
                <div className="flex items-center gap-1 p-2 border-b bg-muted/30 shrink-0">
                    <div className="flex w-full items-center justify-evenly gap-1 flex-1">
                        {modes.map(mode => {
                            const config = MODE_CONFIG[mode]
                            const Icon = config.icon
                            const isActive = currentMode === mode

                            return (
                                <Button
                                    key={mode}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => onModeChange(mode)}
                                    className={cn(
                                        "gap-1.5 h-7 text-xs",
                                        isActive && "bg-background shadow-sm"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {config.label}
                                </Button>
                            )
                        })}
                    </div>

                    {collapsible && onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-auto"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-auto min-h-0">
                {children}
            </div>
        </div>
    )
}
