/**
 * Table Block
 * 
 * A powerful data table using @tanstack/react-table.
 * Supports sorting, selection, and custom cell rendering.
 */

"use client"

import * as React from "react"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BlockCard } from "../shared"
import { Input } from "@/components/ui/input"

// ============================================================================
// Types
// ============================================================================

export interface TableBlockProps<TData = any> {
    data: TData[]
    columns: ColumnDef<TData>[]
    title?: string
    description?: string
    searchable?: boolean
    searchColumn?: string
    className?: string
    loading?: boolean
    onRowClick?: (row: TData) => void
}

// ============================================================================
// Table Block
// ============================================================================

export function TableBlock<TData>({
    data,
    columns,
    title,
    description,
    searchable = false,
    searchColumn,
    className,
    loading = false,
    onRowClick,
}: TableBlockProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    })

    return (
        <BlockCard
            header={title ? { title, description } : undefined}
            loading={loading}
            className={className}
        >
            <div className="w-full">
                {searchable && (
                    <div className="flex items-center py-4 px-1">
                        <Input
                            placeholder={`Filter ${searchColumn || "..."}`}
                            className="max-w-sm"
                        />
                    </div>
                )}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onClick={() => onRowClick?.(row.original)}
                                        className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4 px-1">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                </div>
            </div>
        </BlockCard>
    )
}
