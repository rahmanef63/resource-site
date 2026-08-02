import type { ComponentProps, ReactNode } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SecondaryHeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputProps?: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "placeholder">;
}

export interface SortOption {
  label: string;
  value: string;
  icon?: React.ElementType;
}

export interface FilterOption {
  label: string;
  value: string;
  active?: boolean;
  icon?: React.ElementType;
  count?: number;
}

export interface ViewOption {
  label: string;
  value: string;
  icon?: React.ElementType;
}

export interface SecondarySidebarToolsProps {
  // Search
  search?: SecondaryHeaderSearchProps;

  // Sort
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (value: string) => void;

  // Filter
  filterOptions?: FilterOption[];
  onFilterToggle?: (value: string) => void;

  // View Toggle
  viewOptions?: ViewOption[];
  currentView?: string;
  onViewChange?: (value: string) => void;

  // Custom tools
  customTools?: ReactNode;

  className?: string;
}

export function SecondarySidebarTools({
  search,
  sortOptions,
  currentSort,
  onSortChange,
  filterOptions,
  onFilterToggle,
  viewOptions,
  currentView,
  onViewChange,
  customTools,
  className,
}: SecondarySidebarToolsProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search */}
      {search && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder || "Search..."}
            className={cn("pl-10", search.inputProps?.className)}
            {...search.inputProps}
          />
        </div>
      )}

      {/* Tools Row: Sort, Filter, View */}
      {(sortOptions || filterOptions || viewOptions || customTools) && (
        <div className="flex items-center gap-2">
          {/* Sort */}
          {sortOptions && sortOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onSortChange?.(option.value)}
                      className={cn(
                        currentSort === option.value && "bg-accent"
                      )}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Filter */}
          {filterOptions && filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {filterOptions.filter(f => f.active).length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      {filterOptions.filter(f => f.active).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onFilterToggle?.(option.value)}
                      className={cn(
                        option.active && "bg-accent"
                      )}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <span className="flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {option.count}
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View Toggle */}
          {viewOptions && viewOptions.length > 0 && (
            <div className="ml-auto flex items-center gap-1 rounded-md border p-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={currentView === option.value ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 gap-1.5 px-2"
                    onClick={() => onViewChange?.(option.value)}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Custom Tools */}
          {customTools}
        </div>
      )}
    </div>
  );
}
