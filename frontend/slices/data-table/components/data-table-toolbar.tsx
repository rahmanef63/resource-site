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
import type { DataTableLabels } from "../lib/core";

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  labels: DataTableLabels;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  labels,
}: DataTableToolbarProps<TData>) {
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      {searchColumn ? (
        <Input
          value={(searchColumn.getFilterValue() as string) ?? ""}
          onChange={(event) => searchColumn.setFilterValue(event.target.value)}
          placeholder={searchPlaceholder ?? labels.searchPlaceholder}
          aria-label={searchPlaceholder ?? labels.searchPlaceholder}
          className="h-8 max-w-xs"
        />
      ) : (
        <span />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-8">
            <SlidersHorizontal className="size-4" />
            {labels.view}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>{labels.toggleColumns}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
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
