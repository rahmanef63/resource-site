/**
 * Workspace Filter Popover Component
 * 
 * Reusable filter controls for workspace filtering
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { WorkspaceFilters, WorkspaceType } from "../../types"

export interface WorkspaceFilterPopoverProps {
    filters: WorkspaceFilters
    onFiltersChange: (filters: Partial<WorkspaceFilters>) => void
    typeOptions: Array<{ value: string; label: string }>
}

export function WorkspaceFilterPopover({
    filters,
    onFiltersChange,
    typeOptions
}: WorkspaceFilterPopoverProps) {
    return (
        <div className="space-y-3">
            {/* Workspace Type Filter */}
            <div>
                <p className="text-sm font-medium mb-2">Workspace Type</p>
                <div className="space-y-1">
                    {typeOptions.map((opt) => (
                        <Button
                            key={opt.value}
                            variant={filters.types?.includes(opt.value as WorkspaceType) ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => {
                                const currentTypes = filters.types || []
                                const optValue = opt.value as WorkspaceType
                                const newTypes = currentTypes.includes(optValue)
                                    ? currentTypes.filter((t) => t !== optValue)
                                    : [...currentTypes, optValue]
                                onFiltersChange({ types: newTypes.length > 0 ? newTypes : undefined })
                            }}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Has Children Filter */}
            <div className="border-t pt-2">
                <p className="text-sm font-medium mb-2">Has Children</p>
                <div className="flex gap-2">
                    <Button
                        variant={filters.hasChildren === true ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                            onFiltersChange({
                                hasChildren: filters.hasChildren === true ? undefined : true
                            })
                        }
                    >
                        Yes
                    </Button>
                    <Button
                        variant={filters.hasChildren === false ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                            onFiltersChange({
                                hasChildren: filters.hasChildren === false ? undefined : false
                            })
                        }
                    >
                        No
                    </Button>
                </div>
            </div>
        </div>
    )
}
