/**
 * Universal Database Table View
 *
 * Refactored to use the shared Table component.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableRow as TableRowUI,
  TableCell as TableCellUI,
  // TableBody, TableCell, TableHead, TableHeader, TableRow removed from here, imported from shared
} from "@/components/ui/table";
import {
  TableProvider,
  TablePagination,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/frontend/shared/ui/components/data-views/table";
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
import { Settings2, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createTableColumns,
  type PropertyColumnConfig,
  type PropertyRowData,
  type ColumnFactoryOptions,
} from "./table-columns";
import { matchesRecordSearch } from "./search-utils";

/**
 * Universal Table View Props
 */
export interface UniversalTableViewProps {
  /** Table data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Callback when cell value is updated */
  onCellUpdate?: (
    rowId: string,
    propertyKey: string,
    value: any
  ) => Promise<void>;

  /** Callback when row is deleted */
  onRowDelete?: (rowId: string) => Promise<void>;

  /** Callback when new row is added */
  onRowAdd?: () => Promise<void>;

  /** Enable row selection */
  enableRowSelection?: boolean;

  /** Enable row actions dropdown */
  enableRowActions?: boolean;

  /** Enable drag handle for reordering */
  enableDragHandle?: boolean;

  /** Enable pagination */
  enablePagination?: boolean;

  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;

  /** Enable global search */
  enableGlobalSearch?: boolean;

  /** Initial page size */
  pageSize?: number;

  /** Custom CSS class */
  className?: string;

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

import { ViewToolbar } from "@/frontend/shared/ui/layout/header";

/**
 * Universal Table View Component
 */
export function UniversalTableView({
  data,
  properties,
  onCellUpdate,
  onRowDelete,
  onRowAdd,
  enableRowSelection = true,
  enableRowActions = true,
  enableDragHandle = false,
  enablePagination = true,
  enableColumnVisibility = true,
  enableGlobalSearch = true,
  pageSize = 50,
  className,
  onSelectionChange,
}: UniversalTableViewProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageSize,
    }));
  }, [pageSize]);

  // Generate table columns
  const columns = useMemo(() => {
    const options: ColumnFactoryOptions = {
      onCellUpdate,
      onRowDelete,
      enableRowSelection,
      enableRowActions,
      enableDragHandle,
    };

    return createTableColumns(properties, options);
  }, [
    properties,
    onCellUpdate,
    onRowDelete,
    enableRowSelection,
    enableRowActions,
    enableDragHandle,
  ]);

  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) {
      return data;
    }

    return data.filter((row) => matchesRecordSearch(row, globalFilter));
  }, [data, globalFilter]);

  // Handle selection change side-effect
  const handleRowSelectionChange = (
    updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => {
    let newSelection: RowSelectionState;
    if (typeof updaterOrValue === 'function') {
      newSelection = updaterOrValue(rowSelection);
    } else {
      newSelection = updaterOrValue;
    }
    setRowSelection(newSelection);

    if (onSelectionChange) {
      const selectedIds = Object.keys(newSelection).filter(
        (key) => newSelection[key]
      );
      onSelectionChange(selectedIds);
    }
  };

  const emptyContent = useMemo(() => {
    if (!onRowAdd) {
      return undefined;
    }

    return (
      <>
        {[...Array(3)].map((_, i) => (
          <TableRowUI key={`empty-${i}`} className="hover:bg-transparent">
            {columns.map((col) => (
              <TableCellUI key={col.id} className="h-10 border-b" />
            ))}
          </TableRowUI>
        ))}

        <TableRowUI
          className="cursor-pointer hover:bg-muted/50 group"
          onClick={() => onRowAdd?.()}
        >
          <TableCellUI colSpan={columns.length} className="h-10 p-0 border-b-0">
            <div className="flex items-center h-full px-4 text-muted-foreground group-hover:text-foreground">
              <Plus className="h-4 w-4 mr-2" />
              New page
            </div>
          </TableCellUI>
        </TableRowUI>
      </>
    );
  }, [columns, onRowAdd]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <TableProvider
        data={filteredData}
        columns={columns}

        sorting={sorting}
        onSortingChange={setSorting}

        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}

        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}

        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}

        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}

        pagination={pagination}
        onPaginationChange={setPagination}

        enableRowSelection={enableRowSelection}
        enablePagination={enablePagination}
        enableGlobalSearch={enableGlobalSearch}
        renderAsTable={false}
      >
        <ViewToolbar
          enableSearch={false}
          enableFiltering={false}

          // Search Actions
          onAddItem={onRowAdd}
          addItemLabel="Add row"
          enableSorting={false}
          leadingActions={
            enableGlobalSearch ? (
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  placeholder="Search all columns..."
                  className="h-8 pl-8 text-sm"
                />
              </div>
            ) : undefined
          }

          // Custom Actions (Column Visibility)
          trailingActions={
            enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Since access to "table" instance inside toolbar slot is tricky without context, 
                      we rely on internal implementation or passed props. 
                      Actually, strictly speaking, clean separation would require properties here. 
                      But we are inside the component where we can access columns? 
                      Wait, "columns" variable is defined above, but visibility toggling requires access to table instance API usually.
                      Or we can control it via "columnVisibility" state passed to TableProvider.
                  */}
                  {properties.map((property) => {
                    const isVisible = columnVisibility[property.key] !== false;
                    return (
                      <DropdownMenuCheckboxItem
                        key={property.key}
                        className="capitalize"
                        checked={isVisible}
                        onCheckedChange={(val) => {
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [property.key]: !!val,
                          }));
                        }}
                      >
                        {property.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        />

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {({ headerGroup }) => (
                <TableRowUI key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} header={header} className="relative" />
                  ))}
                </TableRowUI>
              )}
            </TableHeader>
            <TableBody emptyContent={emptyContent}>
              {({ row }) => (
                <TableRow key={row.id} row={row} className="group" />
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {enablePagination && (
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TablePagination className="p-4" />
          </div>
        )}
      </TableProvider>
    </div>
  );
}

export default UniversalTableView;
