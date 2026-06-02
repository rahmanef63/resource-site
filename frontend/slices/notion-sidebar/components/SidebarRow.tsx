"use client";

import { useState, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FlatPage, NotionSidebarProps } from "../types";

interface RowProps {
  item: FlatPage;
  active: boolean;
  collapsed: boolean;
  onToggle: (id: string) => void;
  renderIcon: NonNullable<NotionSidebarProps["renderIcon"]>;
  pick: Pick<NotionSidebarProps, "onSelect" | "onCreate" | "onRename" | "onDelete" | "onIconChange" | "renderIconPicker">;
}

/** One sortable tree row. Double-click the title to rename; the grip drags;
 *  the icon opens a picker when the host wires `renderIconPicker`. */
export function SidebarRow({ item, active, collapsed, onToggle, renderIcon, pick }: RowProps) {
  const { onSelect, onCreate, onRename, onDelete, onIconChange, renderIconPicker } = pick;
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);

  const commit = () => { if (draft.trim()) onRename?.(item.id, draft.trim()); setEditing(false); };
  const startRename = () => { setDraft(item.title); setEditing(true); };

  const icon = renderIcon(item.icon, "text-sm shrink-0");
  const iconNode: ReactNode = renderIconPicker && onIconChange
    ? renderIconPicker({ value: item.icon, onChange: (v) => onIconChange(item.id, v), children: icon })
    : icon;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, paddingLeft: 4 + item.depth * 14 }}
      className={cn("group flex items-center gap-0.5 rounded px-1 py-1 text-xs hover:bg-accent", active && "bg-accent font-medium text-foreground", isDragging && "opacity-50")}
    >
      <Button
        ref={setActivatorNodeRef} {...attributes} {...listeners}
        variant="ghost" size="icon" aria-label="Drag"
        className="h-4 w-4 cursor-grab text-muted-foreground/40 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost" size="icon" onClick={() => onToggle(item.id)}
        className={cn("h-4 w-4 p-0 text-muted-foreground", item.childCount === 0 && "invisible")}
        aria-label={collapsed ? "Expand" : "Collapse"}
      >
        <ChevronRight className={cn("h-3 w-3 transition", !collapsed && "rotate-90")} />
      </Button>
      <span className="shrink-0">{iconNode}</span>
      {editing ? (
        <Input
          autoFocus value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") { setDraft(item.title); setEditing(false); }
          }}
          className="h-auto flex-1 border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:ring-0"
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelect?.(item.id)}
          onDoubleClick={startRename}
          className="h-auto flex-1 justify-start truncate px-1 py-0 text-left text-xs font-normal"
          title="Click to open · double-click to rename"
        >
          {item.title || "Untitled"}
        </Button>
      )}
      <div className="ml-auto hidden items-center gap-0.5 group-hover:flex">
        {onCreate && <IconBtn label="New subpage" onClick={() => onCreate(item.id)}><Plus className="h-3 w-3" /></IconBtn>}
        {onDelete && <IconBtn label="Delete" danger onClick={() => onDelete(item.id)}><Trash2 className="h-3 w-3" /></IconBtn>}
      </div>
    </li>
  );
}

function IconBtn({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      variant="ghost" size="icon" title={label} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("h-5 w-5 text-muted-foreground", danger && "hover:text-destructive")}
    >
      {children}
    </Button>
  );
}
