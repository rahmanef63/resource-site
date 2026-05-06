/**
 * HeaderControls Component
 * 
 * Integrated controls for the header system including:
 * - Search (searchable)
 * - Filter (filterable)
 * - Sort (sortable)
 * - DateRange (dateRangeable)
 * - Pagination (paginatable)
 * 
 * Usage: Enable via boolean props in Header component
 * 
 * @example
 * ```tsx
 * <Header
 *   title="Documents"
 *   searchable
 *   searchProps={{ value, onChange, placeholder: "Search documents..." }}
 *   filterable
 *   filterProps={{ chips, onRemoveChip }}
 *   sortable
 *   sortProps={{ options, value, onChange }}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, SlidersHorizontal, ArrowUpDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker"
import { format, parseISO } from "date-fns"
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

// ============================================================================
// Types
// ============================================================================

export interface SearchControlProps {
  value?: string
  placeholder?: string
  debounceMs?: number
  autoFocus?: boolean
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  className?: string
  /** Compact mode - icon only that expands */
  compact?: boolean
}

export type FilterChip = { 
  key: string
  label: string
  value: string | number | boolean 
}

export interface FilterControlProps {
  chips?: FilterChip[]
  children?: React.ReactNode
  onRemoveChip?: (key: string) => void
  onClearAll?: () => void
  className?: string
  /** Show as popover button */
  asPopover?: boolean
  popoverContent?: React.ReactNode
}

export type SortOption = { 
  label: string
  value: string
  direction?: "asc" | "desc" 
}

export interface SortControlProps {
  options: SortOption[]
  value?: string
  direction?: "asc" | "desc"
  onChange?: (value: string, direction: "asc" | "desc") => void
  className?: string
  /** Show as popover button */
  asPopover?: boolean
}

export interface DateRange {
  start: string | null // "YYYY-MM-DD"
  end: string | null
}

export interface DateRangeControlProps {
  value?: DateRange
  onChange?: (next: DateRange) => void
  className?: string
  labels?: { start?: string; end?: string }
  /** Show as popover button */
  asPopover?: boolean
}

export interface PaginationControlProps {
  page: number // 1-based
  pageSize: number
  total: number
  onChange?: (nextPage: number) => void
  className?: string
  /** Compact mode - minimal UI */
  compact?: boolean
}

// ============================================================================
// Search Control
// ============================================================================

export function SearchControl({
  value = "",
  placeholder = "Search…",
  debounceMs = 250,
  autoFocus,
  onChange,
  onSubmit,
  className,
  compact = false,
}: SearchControlProps) {
  const [q, setQ] = React.useState(value)
  const [expanded, setExpanded] = React.useState(!compact)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => setQ(value), [value])

  React.useEffect(() => {
    const id = setTimeout(() => onChange?.(q), debounceMs)
    return () => clearTimeout(id)
  }, [q, debounceMs, onChange])

  const handleClear = () => {
    setQ("")
    onChange?.("")
    inputRef.current?.focus()
  }

  if (compact && !expanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setExpanded(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className={className}
          >
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <form
      className={cn("relative flex items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(q)
      }}
      role="search"
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-9 pr-8 w-full min-w-[200px]"
        onKeyDown={(e) => {
          if (e.key === "Escape" && compact) {
            setExpanded(false)
            setQ("")
          }
        }}
      />
      {q && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </form>
  )
}

// ============================================================================
// Filter Control
// ============================================================================

export function FilterControl({
  chips = [],
  children,
  onRemoveChip,
  onClearAll,
  className,
  asPopover = false,
  popoverContent,
}: FilterControlProps) {
  const hasActiveFilters = chips.length > 0

  if (asPopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "secondary" : "outline"}
            size="sm"
            className={cn("gap-2", className)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {chips.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          {popoverContent || children}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
              {chips.map((c) => (
                <Button
                  key={c.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveChip?.(c.key)}
                  className="h-7 rounded-full text-xs"
                >
                  {c.label}: {String(c.value)}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
              {onClearAll && chips.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((c) => (
        <Button
          key={c.key}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemoveChip?.(c.key)}
          className="h-7 rounded-full text-xs"
        >
          <span className="font-medium">{c.label}:</span>
          <span className="ml-1 opacity-80">{String(c.value)}</span>
          <X className="ml-1 h-3 w-3" />
        </Button>
      ))}
      {children}
    </div>
  )
}

// ============================================================================
// Sort Control
// ============================================================================

export function SortControl({
  options,
  value,
  direction = "asc",
  onChange,
  className,
  asPopover = false,
}: SortControlProps) {
  const [field, setField] = React.useState(value ?? options[0]?.value)
  const [dir, setDir] = React.useState<"asc" | "desc">(direction)

  React.useEffect(() => {
    if (value) setField(value)
  }, [value])

  React.useEffect(() => {
    if (field) onChange?.(field, dir)
  }, [field, dir, onChange])

  const currentLabel = options.find((o) => o.value === field)?.label || "Sort"

  if (asPopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <ArrowUpDown className="h-4 w-4" />
            <span>{currentLabel}</span>
            <span className="text-xs opacity-60">{dir === "asc" ? "↑" : "↓"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="space-y-2">
            <div className="text-sm font-medium">Sort by</div>
            {options.map((opt) => (
              <Button
                key={opt.value}
                variant={field === opt.value ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setField(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
            <div className="border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
              >
                {dir === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        className="h-9 rounded-md border bg-background px-3 py-1 text-sm"
        value={field}
        onChange={(e) => setField(e.target.value)}
        aria-label="Sort field"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
        aria-label="Toggle sort direction"
      >
        {dir === "asc" ? "↑" : "↓"}
      </Button>
    </div>
  )
}

// ============================================================================
// DateRange Control
// ============================================================================

export function DateRangeControl({
  value = { start: null, end: null },
  onChange,
  className,
  labels = {},
  asPopover = false,
}: DateRangeControlProps) {
  const [start, setStart] = React.useState<string | null>(value.start)
  const [end, setEnd] = React.useState<string | null>(value.end)

  React.useEffect(() => {
    setStart(value.start)
    setEnd(value.end)
  }, [value.start, value.end])

  const handleChange = React.useCallback((newStart: string | null, newEnd: string | null) => {
    setStart(newStart)
    setEnd(newEnd)
    onChange?.({ start: newStart, end: newEnd })
  }, [onChange])

  const displayValue = start || end
    ? `${start || "..."} – ${end || "..."}`
    : "Select dates"

  if (asPopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <Calendar className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <div className="flex items-center gap-2">
            <div>
              <label className="text-xs text-muted-foreground">{labels.start ?? "Start"}</label>
              <SharedDatePicker
                date={start ? parseISO(start) : undefined}
                onChange={(d) => handleChange(d ? format(d, "yyyy-MM-dd") : null, end)}
                placeholder={labels.start ?? "Start"}
                className="w-[180px]"
              />
            </div>
            <span className="mt-5 text-muted-foreground">—</span>
            <div>
              <label className="text-xs text-muted-foreground">{labels.end ?? "End"}</label>
              <SharedDatePicker
                date={end ? parseISO(end) : undefined}
                onChange={(d) => handleChange(start, d ? format(d, "yyyy-MM-dd") : null)}
                placeholder={labels.end ?? "End"}
                className="w-[180px]"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{labels.start ?? "Start"}</span>
        <SharedDatePicker
          date={start ? parseISO(start) : undefined}
          onChange={(d) => handleChange(d ? format(d, "yyyy-MM-dd") : null, end)}
          placeholder={labels.start ?? "Start"}
          className="w-[180px]"
        />
      </div>
      <span className="text-muted-foreground">—</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{labels.end ?? "End"}</span>
        <SharedDatePicker
          date={end ? parseISO(end) : undefined}
          onChange={(d) => handleChange(start, d ? format(d, "yyyy-MM-dd") : null)}
          placeholder={labels.end ?? "End"}
          className="w-[180px]"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Pagination Control
// ============================================================================

function pageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / Math.max(1, size)))
}

export function PaginationControl({
  page,
  pageSize,
  total,
  onChange,
  className,
  compact = false,
}: PaginationControlProps) {
  const pages = pageCount(total, pageSize)
  const canPrev = page > 1
  const canNext = page < pages

  const go = (p: number) => onChange?.(Math.min(Math.max(1, p), pages))

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canPrev}
          onClick={() => go(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm text-muted-foreground">
          {page} / {pages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canNext}
          onClick={() => go(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const around = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 2
  )

  const seq: (number | "...")[] = []
  for (let i = 0; i < around.length; i++) {
    seq.push(around[i])
    if (i < around.length - 1 && around[i + 1] - around[i] > 1) seq.push("...")
  }

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => go(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>

      {seq.map((it, idx) =>
        it === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={it}
            type="button"
            variant={it === page ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => go(it)}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </Button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => go(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  )
}

// ============================================================================
// Combined HeaderControls Component
// ============================================================================

export interface HeaderControlsProps {
  // Search
  searchable?: boolean
  searchProps?: SearchControlProps

  // Filter
  filterable?: boolean
  filterProps?: FilterControlProps

  // Sort
  sortable?: boolean
  sortProps?: SortControlProps

  // DateRange
  dateRangeable?: boolean
  dateRangeProps?: DateRangeControlProps

  // Pagination
  paginatable?: boolean
  paginationProps?: PaginationControlProps

  // Layout
  className?: string
  /** Stack controls vertically on mobile */
  responsive?: boolean
}

export function HeaderControls({
  searchable,
  searchProps,
  filterable,
  filterProps,
  sortable,
  sortProps,
  dateRangeable,
  dateRangeProps,
  paginatable,
  paginationProps,
  className,
  responsive = true,
}: HeaderControlsProps) {
  const hasControls = searchable || filterable || sortable || dateRangeable || paginatable

  if (!hasControls) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        responsive && "flex-wrap",
        className
      )}
    >
      {searchable && <SearchControl {...searchProps} />}
      {filterable && <FilterControl asPopover {...filterProps} />}
      {sortable && sortProps?.options && <SortControl asPopover {...sortProps} />}
      {dateRangeable && <DateRangeControl asPopover {...dateRangeProps} />}
      {paginatable && paginationProps && (
        <PaginationControl compact {...paginationProps} />
      )}
    </div>
  )
}
