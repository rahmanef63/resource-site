/**
 * ViewToolbar Component
 * 
 * A comprehensive toolbar for data views with search, sort, filter, and actions.
 * Combines HeaderControls functionality with a structured toolbar layout.
 * 
 * This is the SSOT for view toolbars across all features.
 * 
 * @example
 * ```tsx
 * <ViewToolbar
 *   searchQuery={query}
 *   onSearchChange={setQuery}
 *   sortOptions={[{ label: 'Name', value: 'name' }]}
 *   onAddItem={handleAdd}
 *   addItemLabel="New Document"
 * />
 * ```
 */

"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    Search,
    ArrowUpDown,
    Filter,
    Plus,
    X,
    Table,
    List,
    LayoutGrid,
    Kanban,
    Calendar,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ToggleGroup } from "@/components/ui/toggle-group"

// ============================================================================
// Types
// ============================================================================

export interface SortOption {
    label: string
    value: string
}

export interface SortState {
    field: string
    direction: "asc" | "desc"
}

export interface FilterOption {
    label: string
    value: string
    type: "select" | "text" | "boolean" | "date"
    options?: { label: string; value: any }[]
}

export interface FilterCondition {
    id: string
    field: string
    operator: string
    value: any
}

export type ViewMode = "table" | "list" | "grid" | "kanban" | "calendar" | string

export interface ViewOption {
    id: ViewMode
    label: string
    icon: LucideIcon
    disabled?: boolean
}

export const DEFAULT_VIEW_OPTIONS: ViewOption[] = [
    { id: "table", label: "Table", icon: Table },
    { id: "list", label: "List", icon: List },
    { id: "grid", label: "Grid", icon: LayoutGrid },
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "calendar", label: "Calendar", icon: Calendar },
]

export interface ViewToolbarProps {
    // === Search ===
    /** Current search query */
    searchQuery?: string
    /** Callback when search changes */
    onSearchChange?: (query: string) => void
    /** Search input placeholder */
    searchPlaceholder?: string
    /** Enable search control */
    enableSearch?: boolean
    /** Debounce delay in ms */
    searchDebounce?: number

    // === Sorting ===
    /** Available sort options */
    sortOptions?: SortOption[]
    /** Current sort state */
    currentSort?: SortState
    /** Callback when sort changes */
    onSortChange?: (sort: SortState | null) => void
    /** Enable sort control */
    enableSorting?: boolean

    // === Filtering ===
    /** Available filter options */
    filterOptions?: FilterOption[]
    /** Active filter conditions */
    activeFilters?: FilterCondition[]
    /** Callback when filters change */
    onFilterChange?: (filters: FilterCondition[]) => void
    /** Enable filter control */
    enableFiltering?: boolean
    /** Custom filter builder content */
    filterContent?: React.ReactNode

    // === View Switcher ===
    /** Available view modes */
    viewOptions?: ViewOption[]
    /** Current view mode */
    currentView?: ViewMode
    /** Callback when view changes */
    onViewChange?: (view: ViewMode) => void
    /** Enable view switcher */
    enableViewSwitcher?: boolean
    /** View switcher variant */
    viewSwitcherVariant?: "toggle" | "dropdown"

    // === Actions ===
    /** Add item callback */
    onAddItem?: () => void
    /** Add item button label */
    addItemLabel?: string
    /** Add item button icon */
    addItemIcon?: LucideIcon

    // === Custom Slots ===
    /** Content before search (left side) */
    leadingActions?: React.ReactNode
    /** Content after add button (right side) */
    trailingActions?: React.ReactNode
    /** Center slot (between left and right groups) */
    centerContent?: React.ReactNode

    // === Layout ===
    /** Additional className */
    className?: string
    /** Size variant */
    size?: "sm" | "default" | "lg"
    /** Sticky positioning */
    sticky?: boolean
    /** Border style */
    border?: "none" | "top" | "bottom" | "both"
    /** Background variant */
    background?: "transparent" | "muted" | "card"
}

// ============================================================================
// ViewToolbar Component
// ============================================================================

export function ViewToolbar({
    // Search
    searchQuery = "",
    onSearchChange,
    searchPlaceholder = "Search...",
    enableSearch = true,
    searchDebounce = 300,

    // Sorting
    sortOptions = [],
    currentSort,
    onSortChange,
    enableSorting = true,

    // Filtering
    filterOptions = [],
    activeFilters = [],
    onFilterChange,
    enableFiltering = true,
    filterContent,

    // View Switcher
    viewOptions = DEFAULT_VIEW_OPTIONS,
    currentView,
    onViewChange,
    enableViewSwitcher = false,
    viewSwitcherVariant = "toggle",

    // Actions
    onAddItem,
    addItemLabel = "New",
    addItemIcon: AddItemIcon = Plus,

    // Custom Slots
    leadingActions,
    trailingActions,
    centerContent,

    // Layout
    className,
    size = "default",
    sticky = false,
    border = "bottom",
    background = "transparent",
}: ViewToolbarProps) {
    const [internalSearch, setInternalSearch] = useState(searchQuery)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (internalSearch !== searchQuery) {
                onSearchChange?.(internalSearch)
            }
        }, searchDebounce)
        return () => clearTimeout(timer)
    }, [internalSearch, onSearchChange, searchQuery, searchDebounce])

    // Sync prop changes to internal state
    useEffect(() => {
        setInternalSearch(searchQuery)
    }, [searchQuery])

    // Size variants
    const sizeClasses = {
        sm: "px-2 py-1 gap-1.5",
        default: "px-4 py-2 gap-2",
        lg: "px-6 py-3 gap-3",
    }

    const buttonSize = size === "lg" ? "default" : "sm"
    const inputHeight = size === "sm" ? "h-7" : size === "lg" ? "h-10" : "h-8"

    // Border classes
    const borderClasses = {
        none: "",
        top: "border-t",
        bottom: "border-b",
        both: "border-y",
    }

    // Background classes
    const backgroundClasses = {
        transparent: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        muted: "bg-muted/50",
        card: "bg-card",
    }

    // Convert viewOptions to ToggleGroup options format
    const toggleGroupOptions = viewOptions.map(opt => ({
        value: opt.id,
        label: opt.label,
        icon: <opt.icon className="h-3.5 w-3.5" />,
    }))

    return (
        <div
            className={cn(
                "flex items-center justify-between",
                sizeClasses[size],
                borderClasses[border],
                backgroundClasses[background],
                sticky && "sticky top-0 z-10",
                className
            )}
        >
            {/* Left Group: View Switcher, Search, Filters */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {leadingActions}

                {/* View Switcher */}
                {enableViewSwitcher && viewOptions.length > 0 && (
                    viewSwitcherVariant === "toggle" ? (
                        <ToggleGroup
                            type="single"
                            value={currentView}
                            onValueChange={(value) => typeof value === 'string' && value && onViewChange?.(value as ViewMode)}
                            options={toggleGroupOptions}
                            size="sm"
                            className="border rounded-lg p-0.5"
                        />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size={buttonSize}>
                                    {(() => {
                                        const current = viewOptions.find(o => o.id === currentView)
                                        const Icon = current?.icon || Table
                                        return <Icon className="h-4 w-4 mr-2" />
                                    })()}
                                    {viewOptions.find(o => o.id === currentView)?.label || "View"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {viewOptions.map((opt) => {
                                    const Icon = opt.icon
                                    return (
                                        <DropdownMenuItem
                                            key={opt.id}
                                            onClick={() => onViewChange?.(opt.id)}
                                            disabled={opt.disabled}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {opt.label}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                )}

                {/* Search */}
                {enableSearch && (
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={internalSearch}
                            onChange={(e) => setInternalSearch(e.target.value)}
                            className={cn(
                                "pl-8 text-sm focus-visible:ring-1 bg-muted/40 hover:bg-muted/60 focus:bg-background transition-colors",
                                inputHeight,
                                internalSearch && "pr-8"
                            )}
                        />
                        {internalSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setInternalSearch("")
                                    onSearchChange?.("")
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                )}

                {/* Filter Trigger */}
                {enableFiltering && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={activeFilters.length > 0 ? "secondary" : "ghost"}
                                size={buttonSize}
                                className={cn("px-2", activeFilters.length > 0 && "text-foreground")}
                            >
                                <Filter className="h-3.5 w-3.5 mr-2" />
                                Filter
                                {activeFilters.length > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1.5 h-5 px-1.5 min-w-5 text-[10px] bg-background/50"
                                    >
                                        {activeFilters.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[320px] p-0">
                            <div className="p-3 border-b">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Filters</h4>
                                    {activeFilters.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => onFilterChange?.([])}
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="p-3">
                                {filterContent || (
                                    <div className="text-sm text-muted-foreground flex items-center justify-center p-4 italic">
                                        Configure filters
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Sort Trigger */}
                {enableSorting && sortOptions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={currentSort ? "secondary" : "ghost"}
                                size={buttonSize}
                                className="px-2"
                            >
                                <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                                Sort
                                {currentSort && (
                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                        {sortOptions.find((o) => o.value === currentSort.field)?.label}
                                        {currentSort.direction === "asc" ? " ↑" : " ↓"}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Sort by
                            </DropdownMenuLabel>
                            {sortOptions.map((option) => (
                                <DropdownMenuCheckboxItem
                                    key={option.value}
                                    checked={currentSort?.field === option.value}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            onSortChange?.({ field: option.value, direction: "asc" })
                                        } else {
                                            onSortChange?.(null)
                                        }
                                    }}
                                >
                                    {option.label}
                                    {currentSort?.field === option.value && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {currentSort.direction === "asc" ? "Asc" : "Desc"}
                                        </span>
                                    )}
                                </DropdownMenuCheckboxItem>
                            ))}
                            {currentSort && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (currentSort) {
                                                onSortChange?.({
                                                    ...currentSort,
                                                    direction: currentSort.direction === "asc" ? "desc" : "asc",
                                                })
                                            }
                                        }}
                                    >
                                        <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                                        Toggle direction
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onSortChange?.(null)}>
                                        <X className="mr-2 h-3.5 w-3.5" />
                                        Clear sort
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Center Group */}
            {centerContent && (
                <div className="flex items-center justify-center flex-shrink-0">
                    {centerContent}
                </div>
            )}

            {/* Right Group: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {trailingActions}

                {onAddItem && (
                    <Button size={buttonSize} onClick={onAddItem}>
                        <AddItemIcon className="h-4 w-4 mr-2" />
                        {addItemLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}

// Re-export types for convenience
export type { LucideIcon }
