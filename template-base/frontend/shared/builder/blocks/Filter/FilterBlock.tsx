/**
 * Filter Block
 * 
 * A generic filtering and search component.
 */

"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BlockCard } from "../shared"

// ============================================================================
// Types
// ============================================================================

export interface FilterOption {
    label: string
    value: string
}

export interface FilterField {
    key: string
    label: string
    type: "select" | "text" | "boolean"
    options?: FilterOption[]
}

export interface FilterBlockProps {
    fields: FilterField[]
    onFilterChange: (filters: Record<string, any>) => void
    onSearchChange: (query: string) => void
    searchPlaceholder?: string
    title?: string
    activeFilters?: Record<string, any>
    className?: string
}

// ============================================================================
// Filter Block
// ============================================================================

export function FilterBlock({
    fields,
    onFilterChange,
    onSearchChange,
    searchPlaceholder = "Search...",
    title,
    activeFilters = {},
    className,
}: FilterBlockProps) {
    const [search, setSearch] = React.useState("")
    const [filters, setFilters] = React.useState<Record<string, any>>(activeFilters)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        onSearchChange(e.target.value)
    }

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const clearFilter = (key: string) => {
        const newFilters = { ...filters }
        delete newFilters[key]
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const activeCount = Object.keys(filters).length

    return (
        <BlockCard className={className} header={title ? { title } : undefined}>
            <div className="flex flex-col gap-4">
                {/* Search Bar & Filter Toggle */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-8"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 relative">
                                <SlidersHorizontal className="h-4 w-4" />
                                {activeCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Filters</h4>
                                <div className="space-y-4">
                                    {fields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label htmlFor={field.key}>{field.label}</Label>
                                            {field.type === "select" ? (
                                                <Select
                                                    value={filters[field.key]}
                                                    onValueChange={(v) => handleFilterChange(field.key, v)}
                                                >
                                                    <SelectTrigger id={field.key}>
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === "boolean" ? (
                                                <Select
                                                    value={filters[field.key]}
                                                    onValueChange={(v) => handleFilterChange(field.key, v)}
                                                >
                                                    <SelectTrigger id={field.key}>
                                                        <SelectValue placeholder="All" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id={field.key}
                                                    value={filters[field.key] || ""}
                                                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Active Filter Badges */}
                {activeCount > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="gap-1 pl-2">
                                {fields.find(f => f.key === key)?.label}: {value}
                                <button
                                    className="ml-1 hover:text-destructive"
                                    onClick={() => clearFilter(key)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                                setFilters({})
                                onFilterChange({})
                            }}
                        >
                            Clear all
                        </Button>
                    </div>
                )}
            </div>
        </BlockCard>
    )
}
