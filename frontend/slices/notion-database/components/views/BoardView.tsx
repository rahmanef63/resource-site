"use client";

/** BoardView — kanban grouped by the view's `groupBy` select / status
 *  property. Drag cards between columns to reassign the property value;
 *  click "+" on a column header to add a row with that bucket pre-set.
 *  Each card hover reveals RowActionsMenu (open / duplicate / delete).
 *  Same-column reorder is intentionally NOT implemented — view sorts
 *  determine row order. */

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "rahman-shared/lib/utils";
import { Button } from "@/components/ui/button";
import { RowActionsMenu } from "../RowActionsMenu";
import { groupBy as groupRows } from "../../lib/viewData";
import type { Page, Property } from "../../types";
import type { ViewProps } from "./types";

const GROUP_PREFIX = "group:";
const CARD_PREFIX = "card:";

export function BoardView({
  db, view, rows, renderCell, readOnly,
  onRowUpdate, onOpenRow, onRowDuplicate, onRowRemove, onRowAddInGroup,
}: ViewProps) {
  const groupProp = db.properties.find((p) => p.id === view.groupBy);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const [activeDrag, setActiveDrag] = useState<string | null>(null);

  if (!groupProp || (groupProp.type !== "select" && groupProp.type !== "status")) {
    return (
      <div className="px-4 py-8 text-center text-xs text-muted-foreground">
        Board view needs a <span className="font-medium">select</span> or{" "}
        <span className="font-medium">status</span> property to group by. Set
        one via the view options.
      </div>
    );
  }

  const groups = groupRows(rows, groupProp);
  const draggable = !readOnly && !!onRowUpdate;

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    if (!draggable || !onRowUpdate) return;
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (!activeId.startsWith(CARD_PREFIX) || !overId.startsWith(GROUP_PREFIX)) return;
    const rowId = activeId.slice(CARD_PREFIX.length);
    const targetGroupKey = overId.slice(GROUP_PREFIX.length);
    const newValue = targetGroupKey === "_none" ? null : targetGroupKey;
    const row = rows.find((r) => r.id === rowId);
    const current = row?.rowProps?.[groupProp.id];
    const same = (current ?? null) === newValue;
    if (same) return;
    onRowUpdate(rowId, groupProp.id, newValue as never);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveDrag(String(e.active.id))}
      onDragCancel={() => setActiveDrag(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto p-3">
        {groups.map((g) => (
          <BoardColumn
            key={g.key ?? "_none"}
            groupKey={g.key}
            label={g.label}
            count={g.rows.length}
            onAdd={
              onRowAddInGroup
                ? () => onRowAddInGroup({ groupPropId: groupProp.id, groupValue: g.key })
                : undefined
            }
          >
            {g.rows.map((r) => (
              <BoardCard
                key={r.id}
                row={r}
                groupProp={groupProp}
                draggable={draggable}
                isDragging={activeDrag === `${CARD_PREFIX}${r.id}`}
                onOpen={onOpenRow ? () => onOpenRow(r.id) : undefined}
                onDuplicate={onRowDuplicate ? () => onRowDuplicate(r.id) : undefined}
                onRemove={onRowRemove ? () => onRowRemove(r.id) : undefined}
                renderCell={renderCell}
                db={db}
              />
            ))}
            {g.rows.length === 0 && (
              <div className="rounded border border-dashed border-border/60 px-2 py-3 text-center text-[11px] italic text-muted-foreground">
                drop here
              </div>
            )}
          </BoardColumn>
        ))}
      </div>
    </DndContext>
  );
}

function BoardColumn({
  groupKey, label, count, onAdd, children,
}: {
  groupKey: string | null;
  label: string;
  count: number;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  const id = `${GROUP_PREFIX}${groupKey ?? "_none"}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-64 shrink-0 flex-col rounded-md border border-border bg-muted/20 transition-colors",
        isOver && "border-foreground/40 bg-accent/40",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span className="text-xs font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
          {onAdd && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={onAdd}
              aria-label={`Add card to ${label}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
    </div>
  );
}

function BoardCard({
  row, groupProp, draggable, isDragging,
  onOpen, onDuplicate, onRemove, renderCell, db,
}: {
  row: Page;
  groupProp: Property;
  draggable: boolean;
  isDragging: boolean;
  onOpen?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  renderCell: ViewProps["renderCell"];
  db: ViewProps["db"];
}) {
  const id = `${CARD_PREFIX}${row.id}`;
  const { attributes, listeners, setNodeRef } = useDraggable({ id, disabled: !draggable });
  const showActions = !!onOpen || !!onDuplicate || !!onRemove;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/card relative rounded-md border border-border bg-card p-2 shadow-sm transition",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-foreground/30",
        onOpen && !draggable && "cursor-pointer",
      )}
      {...attributes}
      {...listeners}
    >
      {showActions && (
        <div className="absolute right-1 top-1 z-10 opacity-0 transition group-hover/card:opacity-100">
          <RowActionsMenu
            onOpen={onOpen}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        </div>
      )}
      <div
        className={cn("mb-1 pr-6 text-sm font-medium", onOpen && "cursor-pointer hover:underline")}
        onClick={onOpen}
      >
        {row.title || "Untitled"}
      </div>
      <div className="space-y-1">
        {db.properties
          .filter((p) => !p.hidden && p.id !== groupProp.id)
          .slice(0, 4)
          .map((p) => (
            <div key={p.id} className="text-[11px]">{renderCell(p, row)}</div>
          ))}
      </div>
    </div>
  );
}
