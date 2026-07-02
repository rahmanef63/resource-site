"use client";

import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { SortDirection } from "../hooks/useTableSortAndFilter";

interface EnhancedTableHeaderProps {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: SortDirection;
  isActive?: boolean;
  onSort?: () => void;
  className?: string;
}

export function EnhancedTableHeader({
  children,
  sortable = false,
  sortDirection = null,
  isActive = false,
  onSort,
  className,
}: EnhancedTableHeaderProps) {
  if (!sortable) {
    return (
      <TableHead className={cn("font-medium", className)}>
        {children}
      </TableHead>
    );
  }

  return (
    <TableHead
      className={cn(
        "font-medium cursor-pointer select-none transition-colors hover:bg-muted/50",
        isActive && "bg-muted/100",
        className
      )}
      onClick={onSort}
    >
      <div className="flex items-center gap-1">
        {children}
        <div className="flex flex-col">
          <ChevronUp
            className={cn(
              "h-3 w-3 -mb-1 transition-colors",
              sortDirection === "asc" && isActive
                ? "text-primary"
                : "text-muted-foreground/30"
            )}
          />
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-colors",
              sortDirection === "desc" && isActive
                ? "text-primary"
                : "text-muted-foreground/30"
            )}
          />
        </div>
      </div>
    </TableHead>
  );
}