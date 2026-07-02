/**
 * Workspace Toolbar
 * 
 * Search, filter, and action controls
 */

"use client"

import * as React from "react"
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  TreeDeciduous,
  List,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toggle } from "@/components/ui/toggle"
import { WORKSPACE_TYPE_OPTIONS } from "../constants"
import type { WorkspaceType, WorkspaceFilters } from "../types"

interface WorkspaceToolbarProps {
  filters: WorkspaceFilters
  onFiltersChange: (filters: Partial<WorkspaceFilters>) => void
  onSearchChange: (search: string) => void
  onCreateClick: () => void
  onRefresh: () => void
  viewMode: "tree" | "list"
  onViewModeChange: (mode: "tree" | "list") => void
  isLoading?: boolean
  totalCount?: number
  filteredCount?: number
}

export function WorkspaceToolbar({
  filters,
  onFiltersChange,
  onSearchChange,
  onCreateClick,
  onRefresh,
  viewMode,
  onViewModeChange,
  isLoading,
  totalCount = 0,
  filteredCount = 0,
}: WorkspaceToolbarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search || "")
  
  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])
  
  const activeFiltersCount = [
    filters.types?.length,
    filters.hasChildren !== undefined,
    filters.hierarchyLevel !== undefined,
  ].filter(Boolean).length
  
  return (
    <div className="flex flex-col gap-3 pb-4 border-b">
      {/* Top row: Search and actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workspaces..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Filter" variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WORKSPACE_TYPE_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.types?.includes(opt.value)}
                onCheckedChange={(checked) => {
                  const currentTypes = filters.types || []
                  const newTypes = checked
                    ? [...currentTypes, opt.value]
                    : currentTypes.filter((t) => t !== opt.value)
                  onFiltersChange({
                    types: newTypes.length > 0 ? newTypes : undefined,
                  })
                }}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.hasChildren === true}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  hasChildren: checked ? true : undefined,
                })
              }}
            >
              Has Children
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.hasChildren === false}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  hasChildren: checked ? false : undefined,
                })
              }}
            >
              No Children
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex border rounded-md">
          <Toggle
            pressed={viewMode === "tree"}
            onPressedChange={() => onViewModeChange("tree")}
            size="sm"
            className="rounded-r-none border-r"
          >
            <TreeDeciduous className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === "list"}
            onPressedChange={() => onViewModeChange("list")}
            size="sm"
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Button aria-label="Refresh"
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
        
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
      
      {/* Bottom row: Count and active filters */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </span>
          ) : (
            <>
              Showing {filteredCount} of {totalCount} workspaces
            </>
          )}
        </span>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2"
            onClick={() =>
              onFiltersChange({
                types: undefined,
                hasChildren: undefined,
                hierarchyLevel: undefined,
              })
            }
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
