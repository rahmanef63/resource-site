import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  SortingState,
  Table,
  ColumnSizingState,
  RowSelectionState,
  Updater,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { atom, useAtom } from "jotai";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { createContext, memo, useCallback, useContext, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody as TableBodyRaw,
  TableCell as TableCellRaw,
  TableHeader as TableHeaderRaw,
  TableHead as TableHeadRaw,
  Table as TableRaw,
  TableRow as TableRowRaw,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type { ColumnDef, ColumnSizingState } from "@tanstack/react-table";

const sortingAtom = atom<SortingState>([]);

export const TableContext = createContext<{
  data: unknown[];
  columns: ColumnDef<unknown, unknown>[];
  table: Table<unknown> | null;
}>({
  data: [],
  columns: [],
  table: null,
});

export type TableProviderProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children: ReactNode;
  className?: string;

  // Controlled state (optional)
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  // Initial state (if uncontrolled)
  initialColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;

  // Feature flags
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enableColumnResizing?: boolean;
  enablePagination?: boolean;
  enableGlobalSearch?: boolean;
  renderAsTable?: boolean;
};

export function TableProvider<TData, TValue>({
  columns,
  data,
  children,
  className,

  initialColumnSizing,
  onColumnSizingChange,

  sorting: controlledSorting,
  onSortingChange,

  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,

  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,

  rowSelection: controlledRowSelection,
  onRowSelectionChange,

  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,

  pagination: controlledPagination,
  onPaginationChange,

  enableRowSelection = true,
  enableMultiRowSelection = true,
  enableColumnResizing = true,
  enablePagination = true,
  enableGlobalSearch = true,
  renderAsTable = true,
}: TableProviderProps<TData, TValue>) {
  // Internal state for uncontrolled mode
  const [internalSorting, setInternalSorting] = useAtom(sortingAtom);
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>("");
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(
    initialColumnSizing ?? {},
  );

  // Derived state (controlled ?? internal)
  const sorting = controlledSorting ?? internalSorting;
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;
  const pagination = controlledPagination ?? internalPagination;


  useEffect(() => {
    setColumnSizing(initialColumnSizing ?? {});
  }, [initialColumnSizing]);

  const handleColumnSizingChange = useCallback(
    (updater: Updater<ColumnSizingState>) => {
      setColumnSizing((previous) => {
        const next =
          typeof updater === "function"
            ? (updater as (old: ColumnSizingState) => ColumnSizingState)(previous)
            : updater;

        onColumnSizingChange?.(next);
        return next;
      });
    },
    [onColumnSizingChange],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    enableColumnResizing,

    enableRowSelection,
    enableMultiRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      pagination: enablePagination ? pagination : undefined,
    },

    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onColumnSizingChange: handleColumnSizingChange,
  });

  const contextValue = useMemo(() => ({
    data,
    columns: columns as never,
    table: table as never,
  }), [data, columns, table]);

  return (
    <TableContext.Provider value={contextValue}>
      {renderAsTable ? <TableRaw className={className}>{children}</TableRaw> : children}
    </TableContext.Provider>
  );
}

// ... helper components like TableHead, TableRow etc. (mostly unchanged but good to ensure they are exported)
// I will include them to make sure the file is complete and correct.

export type TableHeadProps = {
  header: Header<unknown, unknown>;
  className?: string;
};

export const TableHead = memo(({ header, className }: TableHeadProps) => {
  const width = header.getSize();
  const minWidth = header.column.columnDef.minSize ?? 80;
  const maxWidth = header.column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;

  return (
    <TableHeadRaw
      className={cn("relative group", className)}
      key={header.id}
      style={{ width, minWidth, maxWidth }}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize select-none",
            "hover:bg-primary/60 active:bg-primary transition-colors",
            header.column.getIsResizing() && "bg-primary"
          )}
          style={{
            transform: "translateX(50%)", // Center on border
          }}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize column"
          title="Drag to resize column"
        />
      )}
    </TableHeadRaw>
  );
});

TableHead.displayName = "TableHead";

export type TableHeaderGroupProps = {
  headerGroup: HeaderGroup<unknown>;
  children: ((props: { header: Header<unknown, unknown> }) => ReactNode) | ReactNode;
};

export const TableHeaderGroup = ({
  headerGroup,
  children,
}: TableHeaderGroupProps) => (
  <TableRowRaw key={headerGroup.id}>
    {typeof children === 'function'
      ? headerGroup.headers.map((header) => children({ header }))
      : children}
  </TableRowRaw>
);

export type TableHeaderProps = {
  className?: string;
  children: ((props: { headerGroup: HeaderGroup<unknown> }) => ReactNode) | ReactNode;
};

export const TableHeader = ({ className, children }: TableHeaderProps) => {
  const { table } = useContext(TableContext);

  return (
    <TableHeaderRaw className={className}>
      {typeof children === 'function'
        ? table?.getHeaderGroups().map((headerGroup) => children({ headerGroup }))
        : children}
    </TableHeaderRaw>
  );
};

export interface TableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function TableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: TableColumnHeaderProps<TData, TValue>) {
  const handleSortAsc = useCallback(() => {
    column.toggleSorting(false);
  }, [column]);

  const handleSortDesc = useCallback(() => {
    column.toggleSorting(true);
  }, [column]);

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            size="sm"
            variant="ghost"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleSortAsc}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSortDesc}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export type TableCellProps = {
  cell: Cell<unknown, unknown>;
  className?: string;
};

export const TableCell = ({ cell, className }: TableCellProps) => (
  <TableCellRaw
    className={className}
    style={{
      width: cell.column.getSize(),
      minWidth: cell.column.columnDef.minSize ?? 60,
      maxWidth: cell.column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
    }}
  >
    {flexRender(cell.column.columnDef.cell, cell.getContext())}
  </TableCellRaw>
);

export type TableRowProps = {
  row: Row<unknown>;
  children?: ((props: { cell: Cell<unknown, unknown> }) => ReactNode) | ReactNode;
  className?: string;
  onClick?: () => void;
  // allow other props
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children">;

export const TableRow = ({ row, children, className, ...props }: TableRowProps) => (
  <TableRowRaw
    className={className}
    data-state={row.getIsSelected() && "selected"}
    key={row.id}
    {...props}
  >
    {typeof children === 'function'
      ? row.getVisibleCells().map((cell) => children({ cell }))
      : children
        ? children
        : row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} cell={cell} />
        ))
    }
  </TableRowRaw>
);

export type TableBodyProps = {
  children: ((props: { row: Row<unknown> }) => ReactNode) | ReactNode;
  emptyContent?: ReactNode;
  className?: string;
};

export const TableBody = ({ children, emptyContent, className }: TableBodyProps) => {
  const { columns, table } = useContext(TableContext);
  const rows = table?.getRowModel().rows;

  return (
    <TableBodyRaw className={className}>
      {typeof children === 'function' ? (
        rows?.length ? (
          rows.map((row) => children({ row }))
        ) : (
          emptyContent ?? (
            <TableRowRaw>
              <TableCellRaw className="h-24 text-center" colSpan={columns.length}>
                No results.
              </TableCellRaw>
            </TableRowRaw>
          )
        )
      ) : (
        children
      )}
    </TableBodyRaw>
  );
};

export type TablePaginationProps = {
  className?: string;
};

export function TablePagination({ className }: TablePaginationProps) {
  const { table } = useContext(TableContext);
  if (!table) return null;

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="text-sm text-muted-foreground">
        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
        {Math.min(
          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
          table.getFilteredRowModel().rows.length
        )}{" "}
        of {table.getFilteredRowModel().rows.length} rows
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
