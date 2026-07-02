/**
 * Workspace Left Panel Component
 * 
 * Combines header, filters, search, and workspace tree view
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toggle } from "@/components/ui/toggle"
import { HeaderControls } from "@/frontend/shared/ui/layout/header"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { WorkspaceDnDTree, type WorkspaceDnDItem } from "@/frontend/shared/ui/layout/dnd"
import { RefreshCw, TreeDeciduous, List, Plus } from "lucide-react"
import { createFilterChips, removeFilterChip } from "@/lib/utils/workspace-store"
import { WorkspaceFilterPopover } from "./WorkspaceFilterPopover"
import type { WorkspaceStoreItem, WorkspaceFilters, MoveWorkspaceData } from "../../types"

export interface WorkspaceLeftPanelProps {
    workspaces: WorkspaceStoreItem[]
    filteredWorkspaces: WorkspaceStoreItem[]
    selectedId: string | null
    filters: WorkspaceFilters
    searchValue: string
    viewMode: "tree" | "list"
    isLoading: boolean
    typeOptions: Array<{ value: string; label: string }>
    onSearchChange: (value: string) => void
    onFiltersChange: (filters: Partial<WorkspaceFilters>) => void
    onClearFilters: () => void
    onViewModeChange: (mode: "tree" | "list") => void
    onRefresh: () => void
    onSelect: (workspace: WorkspaceStoreItem) => void
    onMove: (data: MoveWorkspaceData) => void
    onEdit: (workspace: WorkspaceStoreItem) => void
    onDelete: (workspace: WorkspaceStoreItem) => void
    onAddChild: (workspace: WorkspaceStoreItem) => void
    onCreate: () => void
    onIconChange: (workspace: WorkspaceStoreItem, icon: string) => void
    onColorChange: (workspace: WorkspaceStoreItem, color: string) => void
    onUnlink: (workspace: WorkspaceStoreItem) => void
    onShowFeatures: (workspace: WorkspaceStoreItem) => void
}

export function WorkspaceLeftPanel({
    workspaces,
    filteredWorkspaces,
    selectedId,
    filters,
    searchValue,
    viewMode,
    isLoading,
    typeOptions,
    onSearchChange,
    onFiltersChange,
    onClearFilters,
    onViewModeChange,
    onRefresh,
    onSelect,
    onMove,
    onEdit,
    onDelete,
    onAddChild,
    onCreate,
    onIconChange,
    onColorChange,
    onUnlink,
    onShowFeatures
}: WorkspaceLeftPanelProps) {
    // Ensure we have valid arrays
    const safeWorkspaces = workspaces ?? []
    const safeFilteredWorkspaces = filteredWorkspaces ?? safeWorkspaces
    
    const filterChips = createFilterChips(filters, typeOptions)

    const handleRemoveChip = (key: string) => {
        const updates = removeFilterChip(key, filters)
        onFiltersChange(updates)
    }

    return (
        <PanelSection label="Workspaces">
            <PanelSection.Header>
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{safeFilteredWorkspaces.length}</span>
                        {safeFilteredWorkspaces.length !== safeWorkspaces.length && (
                            <span>of {safeWorkspaces.length}</span>
                        )}
                        <span>workspaces</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex border rounded-md">
                            <Toggle
                                pressed={viewMode === "tree"}
                                onPressedChange={() => onViewModeChange("tree")}
                                size="sm"
                                className="rounded-r-none h-7 w-7 p-0"
                            >
                                <TreeDeciduous className="h-3.5 w-3.5" />
                            </Toggle>
                            <Toggle
                                pressed={viewMode === "list"}
                                onPressedChange={() => onViewModeChange("list")}
                                size="sm"
                                className="rounded-l-none h-7 w-7 p-0"
                            >
                                <List className="h-3.5 w-3.5" />
                            </Toggle>
                        </div>
                        <Button aria-label="Refresh"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="px-3 pb-2 flex gap-2">
                    <div className="flex-1">
                        <HeaderControls
                            searchable
                            searchProps={{
                                value: searchValue,
                                onChange: onSearchChange,
                                placeholder: "Search workspaces...",
                            }}
                            filterable
                            filterProps={{
                                chips: filterChips,
                                onRemoveChip: handleRemoveChip,
                                onClearAll: onClearFilters,
                                popoverContent: (
                                    <WorkspaceFilterPopover
                                        filters={filters}
                                        onFiltersChange={onFiltersChange}
                                        typeOptions={typeOptions}
                                    />
                                ),
                            }}
                            responsive
                        />
                    </div>
                    <Button aria-label="Add" size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={onCreate}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </PanelSection.Header>

            <PanelSection.Items>
              <ScrollArea className="h-full">
                <WorkspaceDnDTree
                    workspaces={safeFilteredWorkspaces as WorkspaceDnDItem[]}
                    selectedId={selectedId}
                    isLoading={isLoading}
                    onSelect={(ws) => onSelect(ws as WorkspaceStoreItem)}
                    onMove={onMove}
                    onEdit={(ws) => onEdit(ws as WorkspaceStoreItem)}
                    onDelete={(ws) => onDelete(ws as WorkspaceStoreItem)}
                    onAddChild={(ws) => onAddChild(ws as WorkspaceStoreItem)}
                    onIconChange={(ws, icon) => onIconChange(ws as WorkspaceStoreItem, icon)}
                    onColorChange={(ws, color) => onColorChange(ws as WorkspaceStoreItem, color)}
                    onUnlink={(ws) => onUnlink(ws as WorkspaceStoreItem)}
                    onShowFeatures={(ws) => onShowFeatures(ws as WorkspaceStoreItem)}
                />
              </ScrollArea>
            </PanelSection.Items>
        </PanelSection>
    )
}
