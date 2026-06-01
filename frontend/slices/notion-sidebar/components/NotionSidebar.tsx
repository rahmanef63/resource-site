"use client";

/** <NotionSidebar /> — standalone Notion-style tree nav with full page CRUD.
 *
 *  Pure / props-driven: the host supplies a flat page list + callbacks; the
 *  sidebar builds the tree, and provides:
 *    • click to open, DOUBLE-CLICK a title to rename inline
 *    • drag (grip) to reorder + reparent (@dnd-kit sortable tree)
 *    • collapse/expand, hover +subpage / delete
 *    • optional icon PICKER per row (wire renderIconPicker + onIconChange)
 *
 *  Decoupled from notion-shell — owns its own lightweight NotionSidebarPage
 *  type, so it drops into any app (pair it with notion-shell's page editor +
 *  notion-database for the full clone). */

import { useMemo, useState } from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotionSidebarProps } from "../types";
import { flatten, removeDescendantsOf, getProjection, beforeIdAfterDrop } from "../lib/tree";
import { SidebarRow } from "./SidebarRow";

function defaultRenderIcon(icon: string, className?: string) {
  return <span className={className}>{icon}</span>;
}

export function NotionSidebar({
  pages, activeId, onSelect, onCreate, onRename, onDelete, onMove,
  className, label = "Pages", renderIcon = defaultRenderIcon, renderIconPicker, onIconChange,
}: NotionSidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const all = useMemo(() => flatten(pages), [pages]);
  const visible = useMemo(
    () => removeDescendantsOf(all, [...collapsed, ...(dragId ? [dragId] : [])]),
    [all, collapsed, dragId],
  );
  const ids = visible.map((i) => i.id);

  const toggle = (id: string) =>
    setCollapsed((c) => { const n = new Set(c); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const onDragStart = (e: DragStartEvent) => setDragId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    const overId = e.over?.id ? String(e.over.id) : null;
    const activeDragId = String(e.active.id);
    if (!overId || !onMove) return;
    const { parentId } = getProjection(visible, activeDragId, overId, e.delta.x);
    const beforeId = beforeIdAfterDrop(visible, activeDragId, overId, parentId);
    if (beforeId === activeDragId) return;
    onMove(activeDragId, parentId, beforeId);
  };

  return (
    <aside className={cn("flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-card/40 p-2", className)}>
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {onCreate && (
          <Button variant="ghost" size="icon" onClick={() => onCreate(null)} aria-label="Add page"
            className="h-5 w-5 text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-0.5 overflow-y-auto">
            {visible.map((item) => (
              <SidebarRow
                key={item.id} item={item} active={item.id === activeId}
                collapsed={collapsed.has(item.id)} onToggle={toggle} renderIcon={renderIcon}
                pick={{ onSelect, onCreate, onRename, onDelete, onIconChange, renderIconPicker }}
              />
            ))}
            {visible.length === 0 && (
              <li className="px-2 py-2 text-xs italic text-muted-foreground">No pages yet</li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </aside>
  );
}
