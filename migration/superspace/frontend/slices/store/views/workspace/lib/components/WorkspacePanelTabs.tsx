/**
 * Workspace Panel Tabs Component
 * 
 * Dynamic tab navigation for workspace store panels
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPanelTabs, getTabsByGroup, type PanelMode } from "@/lib/utils/panel-config"
import type { WorkspaceStoreItem } from "../../types"

export interface WorkspacePanelTabsProps {
    mode: PanelMode
    onModeChange: (mode: PanelMode) => void
    selectedWorkspace: WorkspaceStoreItem | null
    className?: string
}

export function WorkspacePanelTabs({
    mode,
    onModeChange,
    selectedWorkspace,
    className
}: WorkspacePanelTabsProps) {
    const contextualTabs = getTabsByGroup("contextual")
    const globalTabs = getTabsByGroup("global")

    return (
        <div className={cn("px-3 pb-2", className)}>
            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/50">
                {/* Contextual Group - Active when workspace selected */}
                <div className="flex flex-1 gap-1">
                    {contextualTabs.map((tab) => (
                        <Button
                            key={tab.mode}
                            variant={mode === tab.mode ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "flex-1 text-xs h-7 px-2 font-medium transition-all",
                                mode === tab.mode && "bg-background shadow-sm text-foreground",
                                !selectedWorkspace && "opacity-50"
                            )}
                            onClick={() => onModeChange(tab.mode)}
                            disabled={tab.requiresWorkspace && !selectedWorkspace}
                            title={tab.requiresWorkspace && !selectedWorkspace
                                ? "Select a workspace first"
                                : tab.tooltip}
                        >
                            <tab.icon className="h-3.5 w-3.5 mr-1.5" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Visual Divider */}
                <div className="w-px h-4 bg-border mx-1" />

                {/* Global Group */}
                <div className="flex flex-1 gap-1">
                    {globalTabs.map((tab) => (
                        <Button
                            key={tab.mode}
                            variant={mode === tab.mode ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "flex-1 text-xs h-7 px-2 font-medium transition-all",
                                mode === tab.mode && "bg-background shadow-sm text-foreground"
                            )}
                            onClick={() => onModeChange(tab.mode)}
                            title={tab.tooltip}
                        >
                            <tab.icon className="h-3.5 w-3.5 mr-1.5" />
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
