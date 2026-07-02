import { ReactNode, useState, useEffect, useRef } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface AdminListProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  bulkActions?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  hasSelection?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export function AdminList<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  bulkActions,
  rowActions,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  hasSelection = false,
}: AdminListProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;

    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tableRef.current || sortedRows.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev => {
            const next = prev < sortedRows.length - 1 ? prev + 1 : prev;
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => {
            const next = prev > 0 ? prev - 1 : prev;
            return next;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedRowIndex >= 0 && focusedRowIndex < sortedRows.length) {
            const row = sortedRows[focusedRowIndex];
            if (selectable && onToggleSelection) {
              onToggleSelection(getRowId(row));
            } else if (onRowClick) {
              onRowClick(row);
            }
          }
          break;
        case ' ':
          e.preventDefault();
          if (selectable && focusedRowIndex >= 0 && focusedRowIndex < sortedRows.length) {
            const row = sortedRows[focusedRowIndex];
            onToggleSelection?.(getRowId(row));
          }
          break;
        case 'Escape':
          setFocusedRowIndex(-1);
          break;
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('keydown', handleKeyDown);
      return () => tableElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedRowIndex, sortedRows, selectable, onToggleSelection, onRowClick, getRowId]);

  const SortIcon = ({ columnKey }: { columnKey: keyof T | string }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {bulkActions && hasSelection && (
        <div className="bg-muted border-b p-3 flex items-center gap-2">
          {bulkActions}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full" tabIndex={0}>
          <thead className="bg-muted">
            <tr>
              {selectable && (
                <th className="w-12 p-4">
                  <button aria-label="Select"
                    onClick={() => (hasSelection ? onClearSelection?.() : onSelectAll?.())}
                    className="hover:text-primary transition-colors"
                  >
                    {hasSelection ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
              )}
              
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`text-left p-4 ${col.className || ""}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {col.label}
                      <SortIcon columnKey={col.key} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              
              {rowActions && (
                <th className="text-right p-4">Actions</th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {sortedRows.map((row, index) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);
              const isFocused = focusedRowIndex === index;
              
              return (
                <tr
                  key={String(rowId)}
                  className={`border-t hover:bg-muted/50 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${isFocused ? "ring-2 ring-primary ring-inset" : ""}`}
                  onClick={() => onRowClick?.(row)}
                  onFocus={() => setFocusedRowIndex(index)}
                >
                  {selectable && (
                    <td
                      className="w-12 p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button aria-label="Select"
                        onClick={() => onToggleSelection?.(rowId)}
                        className="hover:text-primary transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}
                  
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`p-4 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "")}
                    </td>
                  ))}
                  
                  {rowActions && (
                    <td
                      className="p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedRows.length === 0 && (
        <div className="p-8 text-center text-foreground/60">
          No data available
        </div>
      )}
    </div>
  );
}
