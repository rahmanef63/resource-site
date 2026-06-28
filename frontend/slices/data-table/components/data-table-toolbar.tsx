"use client";

import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  /** Column id the search input filters. Omit to hide the search box. */
  searchKey?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
}

/**
 * Toolbar: a column-bound search input (left) plus a column-visibility
 * dropdown of checkbox toggles (right). Both are driven entirely through the
 * TanStack table instance.
 */
export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search…",
}: DataTableToolbarProps<TData>) {
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      {searchColumn ? (
        <Input
          value={(searchColumn.getFilterValue() as string) ?? ""}
          onChange={(e) => searchColumn.setFilterValue(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-8 max-w-xs"
        />
      ) : (
        <span />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-8">
            <SlidersHorizontal className="size-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((c) => c.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
