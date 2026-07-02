"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ColumnDef, ColumnSizingState } from "@/frontend/shared/ui/components/data-views/table";
import {
  TableProvider,
  TableBody,
  TableRow,
  TableCell,
  TableContext,
} from "@/frontend/shared/ui/components/data-views/table";
import {
  TableHeader as TableHeaderElement,
  TableRow as TableRowElement,
  TableHead as TableHeadElement,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRightIcon,
  FileSpreadsheet,
  Plus,
  Filter,
  GripVertical,
} from "lucide-react";
import type {
  DatabaseFeature,
  DatabaseField,
  DatabaseFieldType,
  DatabaseView,
  FieldMapping,
} from "../../../types";
import { DATABASE_FIELD_DEFINITIONS } from "../../../config/fields";
import {
  EditableCell,
  RowActions,
  SortableHeader,
} from "./components";
import { SortableRow } from "./components/SortableRow";
import { getRowValue, isEditableField } from "./lib";
import { cn } from "@/lib/utils";
import { usePropertyMenuHandlers } from "../../PropertyMenu/usePropertyMenuHandlers";
import type { Id } from "@convex/_generated/dataModel";
import { useOptimizedColumnResize } from "../../../hooks/useOptimizedColumnResize";
import { useCellEditor } from "../../../hooks/useCellEditor";

type RowData = DatabaseFeature;

const MIN_COLUMN_WIDTH = 120;

interface TableHeaderContentProps {
  columnOrder: string[];
  fixedColumnIds: string[];
}

function TableHeaderContent({ columnOrder, fixedColumnIds }: TableHeaderContentProps) {
  const { table } = useContext(TableContext);

  if (!table) {
    return null;
  }

  // Fixed columns that should not be draggable
  const fixedSet = new Set(fixedColumnIds);

  return (
    <TableHeaderElement>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRowElement key={headerGroup.id}>
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {headerGroup.headers.map((header) => {
              const canResize = header.column.getCanResize();
              const isResizing = header.column.getIsResizing();
              const isFixed = fixedSet.has(header.id);

              return (
                <TableHeadElement
                  key={header.id}
                  className="relative group align-middle select-none"
                  style={{
                    width: header.getSize(),
                    minWidth: header.column.columnDef.minSize ?? MIN_COLUMN_WIDTH,
                    maxWidth: header.column.columnDef.maxSize,
                  }}
                  data-fixed={isFixed || undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}

                  {/* Google Sheets-like resize handle */}
                  {canResize && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() => header.column.resetSize()}
                      className={cn(
                        "absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize select-none",
                        "hover:bg-primary/60 active:bg-primary transition-colors",
                        isResizing && "bg-primary"
                      )}
                      style={{
                        transform: "translateX(50%)", // Center on border: half inside, half outside
                      }}
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Resize column"
                      title="Drag to resize column"
                    />
                  )}
                </TableHeadElement>
              );
            })}
          </SortableContext>
        </TableRowElement>
      ))}
    </TableHeaderElement>
  );
}

import type { PropertyOptions } from '@/frontend/shared/foundation/types/property-options';

export interface DatabaseTableViewProps {
  tableId: Id<"dbTables">; // Add tableId for PropertyMenu handlers
  features: DatabaseFeature[];
  fields: DatabaseField[];
  mapping?: FieldMapping | null;
  activeView?: DatabaseView | null;
  onAddProperty?: (type: DatabaseFieldType) => void;
  onAddRow?: () => void;
  onUpdateCell?: (
    rowId: DatabaseFeature["id"],
    updates: Record<string, unknown>,
  ) => Promise<void> | void;
  onDeleteRow?: (rowId: DatabaseFeature["id"]) => Promise<void> | void;
  onRenameField?: (fieldId: string, name: string) => Promise<void> | void;
  onToggleFieldRequired?: (
    fieldId: string,
    required: boolean,
  ) => Promise<void> | void;
  onDeleteField?: (fieldId: string) => Promise<void> | void;
  onToggleFieldVisibility?: (
    fieldId: string,
    visible: boolean,
  ) => Promise<void> | void;
  onReorderFields?: (orderedFieldIds: string[]) => Promise<void> | void;
  onReorderRows?: (orderedRowIds: string[]) => Promise<void> | void;
  onColumnSizingChange?: (sizes: Record<string, number>) => void;
  onUpdateFieldOptions?: (fieldId: string, options: Partial<PropertyOptions>) => Promise<void> | void;
}

export function DatabaseTableView({
  tableId,
  features,
  fields,
  mapping,
  activeView,
  onAddProperty,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
  onRenameField,
  onToggleFieldRequired,
  onDeleteField,
  onToggleFieldVisibility,
  onReorderFields,
  onReorderRows,
  onColumnSizingChange,
  onUpdateFieldOptions,
}: DatabaseTableViewProps) {
  // Navigation handler for cell editor
  const handleNavigate = useCallback((
    direction: 'up' | 'down' | 'left' | 'right',
    current: { rowId: string; fieldId: string; rowIndex: number; colIndex: number }
  ) => {
    const { rowIndex, colIndex } = current;
    let newRowIndex = rowIndex;
    let newColIndex = colIndex;

    if (direction === 'up') newRowIndex = Math.max(0, rowIndex - 1);
    if (direction === 'down') newRowIndex = Math.min(features.length - 1, rowIndex + 1);
    if (direction === 'left') newColIndex = Math.max(0, colIndex - 1);
    if (direction === 'right') newColIndex = Math.min(fields.length - 1, colIndex + 1);

    if (newRowIndex === rowIndex && newColIndex === colIndex) return null;

    const newRow = features[newRowIndex];
    const newField = fields[newColIndex];
    if (!newRow || !newField) return null;

    return {
      rowId: String(newRow.id),
      fieldId: String(newField._id),
      rowIndex: newRowIndex,
      colIndex: newColIndex,
    };
  }, [features, fields]);

  // Cell editor state management with Google Sheets behavior
  const cellEditor = useCellEditor({
    onNavigate: handleNavigate,
  });

  // Use PropertyMenu handlers hook
  const propertyMenuHandlers = usePropertyMenuHandlers({
    tableId,
    fields,
    activeView,
  });

  const orderedFields = useMemo(
    () =>
      [...fields].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      ),
    [fields],
  );

  const fieldById = useMemo(
    () =>
      new Map<string, DatabaseField>(
        orderedFields.map((field) => [String(field._id), field]),
      ),
    [orderedFields],
  );

  const titleFieldId = useMemo(() => {
    if (mapping?.titleField) {
      return String(mapping.titleField);
    }
    const primaryField = orderedFields.find((field) => field.isPrimary);
    return primaryField ? String(primaryField._id) : null;
  }, [mapping?.titleField, orderedFields]);

  const titleField = titleFieldId
    ? fieldById.get(titleFieldId) ?? null
    : null;

  const visibleFieldIds = useMemo(() => {
    if (!activeView) {
      return orderedFields.map((field) => String(field._id));
    }
    const visible =
      activeView.settings.visibleFields?.map((id) => String(id)) ?? [];
    const normalizedVisible = visible.filter((id) => fieldById.has(id));
    const missing = orderedFields
      .map((field) => String(field._id))
      .filter((id) => !normalizedVisible.includes(id));

    return [...normalizedVisible, ...missing];
  }, [activeView, orderedFields, fieldById]);

  const displayFieldIds = useMemo(() => {
    const ids = visibleFieldIds.filter((id) => id !== titleFieldId);
    return ids;
  }, [visibleFieldIds, titleFieldId]);

  const displayFields = useMemo(
    () =>
      displayFieldIds
        .map((id) => fieldById.get(id))
        .filter((field): field is DatabaseField => Boolean(field)),
    [displayFieldIds, fieldById],
  );

  const visibleFieldSet = useMemo(
    () => new Set(displayFieldIds),
    [displayFieldIds],
  );

  const hiddenFields = useMemo(
    () =>
      orderedFields.filter((field) => {
        const id = String(field._id);
        if (titleFieldId && id === titleFieldId) return false;
        return !visibleFieldSet.has(id);
      }),
    [orderedFields, titleFieldId, visibleFieldSet],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(displayFieldIds);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setColumnOrder((prev) => {
      const next = displayFieldIds;

      // If no previous state (first render), use next
      if (prev.length === 0) {
        return next;
      }

      // Check if field set changed (added or removed)
      const prevSet = new Set(prev);
      const nextSet = new Set(next);

      const added = next.filter(id => !prevSet.has(id));
      const removed = prev.filter(id => !nextSet.has(id));

      // Only reset if fields were added or removed
      // Don't reset if it's just the same fields in different order (preserve user's drag order)
      if (added.length > 0 || removed.length > 0) {
        // Merge: keep order of existing fields, add new ones at the end
        const reordered = prev.filter(id => nextSet.has(id));
        const newOnes = added;
        return [...reordered, ...newOnes];
      }

      // If same fields, keep existing order (user might have dragged columns)
      return prev;
    });
  }, [displayFieldIds]);

  const rowIds = useMemo(() => features.map((f) => String(f.id)), [features]);

  // Optimized column resize with local state + debounced persistence
  const {
    columnSizing: optimizedColumnSizing,
    handleColumnSizingChange: handleOptimizedResize
  } = useOptimizedColumnResize({
    initialSizing: activeView?.settings.fieldWidths,
    onPersist: onColumnSizingChange,
    debounceMs: 500, // Persist to backend after 500ms of inactivity
    minColumnWidth: MIN_COLUMN_WIDTH,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Check if this is a column drag (fieldId in columnOrder)
      if (columnOrder.includes(activeId) && columnOrder.includes(overId)) {
        setColumnOrder((prev) => {
          const oldIndex = prev.indexOf(activeId);
          const newIndex = prev.indexOf(overId);

          if (oldIndex === -1 || newIndex === -1) {
            return prev;
          }

          const nextOrder = arrayMove(prev, oldIndex, newIndex);

          // Track column order changes

          if (onReorderFields) {
            void onReorderFields(nextOrder);
          }
          return nextOrder;
        });
      }
      // Check if this is a row drag (rowId in rowIds)
      else if (rowIds.includes(activeId)) {
        const oldIndex = rowIds.indexOf(activeId);
        const newIndex = rowIds.indexOf(overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const nextOrder = arrayMove(rowIds, oldIndex, newIndex);
        if (onReorderRows) {
          void onReorderRows(nextOrder);
        }
      }
    },
    [columnOrder, rowIds, onReorderFields, onReorderRows],
  );

  const handleCommitCell = useCallback(
    (rowId: DatabaseFeature["id"], fieldId: string, nextValue: unknown) => {
      if (!onUpdateCell) {
        console.error('No onUpdateCell handler provided');
        return;
      }
      void onUpdateCell(rowId, { [fieldId]: nextValue });
    },
    [onUpdateCell]
  );

  const renderAddPropertyTrigger = useCallback(() => {
    if (!onAddProperty) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" className="w-60 p-2">
          <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
            Select type
          </DropdownMenuLabel>
          {Object.values(DATABASE_FIELD_DEFINITIONS).map((definition) => (
            <DropdownMenuItem
              key={definition.type}
              onClick={() => onAddProperty(definition.type)}
              className="flex items-start gap-2"
            >
              <definition.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{definition.label}</span>
                <span className="text-xs text-muted-foreground">
                  {definition.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
            Hidden properties
          </DropdownMenuLabel>
          {hiddenFields.length === 0 ? (
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              No hidden properties
            </DropdownMenuItem>
          ) : (
            hiddenFields.map((field) => (
              <DropdownMenuItem
                key={String(field._id)}
                onClick={() =>
                  onToggleFieldVisibility?.(String(field._id), true)
                }
                className="flex items-center justify-between gap-2"
              >
                <span>{field.name}</span>
                {field.isRequired ? (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    Required
                  </Badge>
                ) : null}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [hiddenFields, onAddProperty, onToggleFieldVisibility]);

  // Fixed columns that should not be draggable/reorderable
  const FIXED_COLUMN_IDS = useMemo(() => ['select', 'drag', 'name', 'propertyActions', 'rowActions'], []);

  const columns = useMemo<ColumnDef<RowData>[]>(() => {
    const fieldWidths = activeView?.settings.fieldWidths ?? {};

    const baseColumns: ColumnDef<RowData>[] = [];

    // Checkbox column for row selection
    baseColumns.push({
      id: "select",
      enableResizing: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
      header: ({ table }) => (
        <div className="flex h-full items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-full items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      ),
    });

    // DnD handle column
    baseColumns.push({
      id: "drag",
      enableResizing: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
      header: () => <div className="h-full w-full" />,
      cell: () => (
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 transition group-hover:opacity-100" />
      ),
    });

    baseColumns.push({
      id: "name",
      accessorFn: (feature) => feature.name,
      enableResizing: true,
      minSize: 240,
      size: fieldWidths.name ?? 320,
      header: () => (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <span className="rounded border border-dashed px-1.5 py-0.5 font-semibold leading-none">
            Aa
          </span>
          <span>Name</span>
        </div>
      ),
      cell: ({ row }) => {
        const feature = row.original;
        const owner = feature.owner;
        const status = feature.status;
        const rowId = String(feature.id);

        const titleValue = titleFieldId
          ? getRowValue(feature, titleFieldId)
          : feature.name;

        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-transparent p-1 text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-border hover:bg-muted hover:text-foreground"
              aria-label="Open row preview"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex flex-col gap-1">
                {titleField && isEditableField(titleField) && titleFieldId ? (() => {
                  const rowIndex = features.findIndex(f => String(f.id) === rowId);
                  const colIndex = -1; // Title column is special, not in columnOrder

                  const isFocused = cellEditor.isCellFocused(rowId, titleFieldId);
                  const isEditing = cellEditor.isCellEditing(rowId, titleFieldId);

                  return (
                    <EditableCell
                      field={titleField}
                      value={titleValue}
                      onCommit={(next) => handleCommitCell(feature.id, titleFieldId, next)}
                      onPropertyUpdate={onUpdateFieldOptions}
                      isSelected={isFocused}
                      isEditing={isEditing}
                      onSelect={() => cellEditor.focusCell({ rowId, fieldId: titleFieldId, rowIndex, colIndex })}
                      onStartEdit={() => cellEditor.startEditing({ rowId, fieldId: titleFieldId, rowIndex, colIndex })}
                      onStopEdit={() => cellEditor.stopEditing()}
                    />
                  );
                })() : (
                  <span className="text-sm font-medium leading-none text-foreground">
                    {feature.name || "Untitled"}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {/* <span className="font-mono uppercase tracking-wide">
                    {rowId.slice(-6).toUpperCase()}
                  </span> */}
                  {status ? (
                    <>
                      <span aria-hidden="true">{`\u2022`}</span>
                      <span>{status.name}</span>
                    </>
                  ) : null}
                  {feature.product ? (
                    <>
                      <span aria-hidden="true">{`\u2022`}</span>
                      <span>{feature.product}</span>
                    </>
                  ) : null}
                  {feature.group ? (
                    <>
                      <ChevronRightIcon className="h-3 w-3" />
                      <span>{feature.group}</span>
                    </>
                  ) : null}
                </div>
              </div>
              {owner ? (
                <Avatar className="h-7 w-7">
                  {owner.avatarUrl ? <AvatarImage src={owner.avatarUrl} /> : null}
                  <AvatarFallback>
                    {owner.label.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          </div>
        );
      },
    });

    columnOrder.forEach((fieldId) => {
      const field = fieldById.get(fieldId);
      if (!field) {
        return;
      }

      baseColumns.push({
        id: fieldId,
        accessorFn: (feature) => getRowValue(feature, fieldId),
        enableResizing: true,
        minSize: MIN_COLUMN_WIDTH,
        size: fieldWidths[fieldId] ?? MIN_COLUMN_WIDTH,
        header: ({ column }) => (
          <SortableHeader
            id={fieldId}
            column={column}
            field={field}
            isVisible
            isRequired={field.isRequired}
            // Pass all PropertyMenu handlers from hook
            {...propertyMenuHandlers}
          />
        ),
        cell: ({ row }) => {
          const rowId = String(row.original.id);
          const rowIndex = features.findIndex(f => String(f.id) === rowId);
          const colIndex = columnOrder.indexOf(fieldId);

          const isFocused = cellEditor.isCellFocused(rowId, fieldId);
          const isEditing = cellEditor.isCellEditing(rowId, fieldId);

          return (
            <EditableCell
              field={field}
              value={getRowValue(row.original, fieldId)}
              disabled={!isEditableField(field)}
              onCommit={(next) => handleCommitCell(row.original.id, fieldId, next)}
              onPropertyUpdate={onUpdateFieldOptions}
              isSelected={isFocused}
              isEditing={isEditing}
              onSelect={() => cellEditor.focusCell({ rowId, fieldId, rowIndex, colIndex })}
              onStartEdit={() => cellEditor.startEditing({ rowId, fieldId, rowIndex, colIndex })}
              onStopEdit={() => cellEditor.stopEditing()}
            />
          );
        },
      });
    });

    if (onAddProperty) {
      baseColumns.push({
        id: "propertyActions",
        enableResizing: false,
        size: 200,
        header: () => renderAddPropertyTrigger(),
        cell: () => null,
      });
    }

    if (onDeleteRow) {
      baseColumns.push({
        id: "rowActions",
        enableResizing: false,
        size: 64,
        header: () => null,
        cell: ({ row }) => (
          <RowActions
            rowId={String(row.original.id)}
            rowTitle={row.original.name}
            docId={row.original.docId ?? null}
            onDelete={(rowId) => onDeleteRow?.(rowId as DatabaseFeature["id"])}
          />
        ),
      });
    }

    return baseColumns;
  }, [
    activeView?.settings.fieldWidths,
    columnOrder,
    fieldById,
    handleCommitCell,
    onDeleteField,
    onDeleteRow,
    onRenameField,
    onToggleFieldRequired,
    onToggleFieldVisibility,
    onAddProperty,
    renderAddPropertyTrigger,
    titleField,
    titleFieldId,
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border px-6 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Inline editing enabled — double-click a cell to edit.</span>
        </div>
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {Object.keys(rowSelection).length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setRowSelection({})}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-auto">
          <TableProvider<RowData, unknown>
            columns={columns}
            data={features}
            className="table-fixed min-w-full"
            initialColumnSizing={optimizedColumnSizing}
            onColumnSizingChange={handleOptimizedResize}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          >
            <TableHeaderContent
              columnOrder={columnOrder}
              fixedColumnIds={FIXED_COLUMN_IDS}
            />
            <SortableContext
              items={rowIds}
              strategy={verticalListSortingStrategy}
            >
              <TableBody
                className={cn(features.length === 0 && "[&>tr]:hidden")}
              >
                {({ row }) => (
                  <SortableRow key={row.id} row={row} className="group" />
                )}
              </TableBody>
            </SortableContext>
          </TableProvider>
          {onAddRow ? (
            <div className="border-t border-border px-6 py-3">
              <button
                type="button"
                onClick={onAddRow}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                <span className="text-lg leading-none">+</span>
                <span>New page</span>
              </button>
            </div>
          ) : null}
        </div>
      </DndContext>
    </div>
  );
}
