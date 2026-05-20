"use client";

/** ViewTabs — horizontal tab strip + "+ Add view" trigger. Pure props —
 *  caller owns active view id and dispatches the view CRUD. Tab labels
 *  default to the view's `name`; type icon shown next to label. */

import { Plus, Table, KanbanSquare, List, Image as ImageIcon, Calendar, Rss } from "lucide-react";
import { cn } from "rahman-shared/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DatabaseViewConfig, DbView } from "../types";

const VIEW_ICONS: Record<DbView, typeof Table> = {
  table: Table,
  board: KanbanSquare,
  list: List,
  gallery: ImageIcon,
  calendar: Calendar,
  feed: Rss,
};

const ADDABLE_TYPES: DbView[] = ["table", "board", "list", "gallery", "calendar", "feed"];

export interface ViewTabsProps {
  views: DatabaseViewConfig[];
  activeViewId: string;
  onActivate: (viewId: string) => void;
  onAdd?: (type: DbView) => void;
  onRemove?: (viewId: string) => void;
  className?: string;
}

export function ViewTabs({
  views, activeViewId, onActivate, onAdd, onRemove, className,
}: ViewTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-border px-2", className)}>
      {views.map((v) => {
        const Icon = VIEW_ICONS[v.type] ?? Table;
        const active = v.id === activeViewId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onActivate(v.id)}
            onDoubleClick={() => onRemove && views.length > 1 && onRemove(v.id)}
            className={cn(
              "group/tab flex items-center gap-1.5 px-2 py-1.5 text-xs transition",
              active
                ? "border-b-2 border-primary text-foreground"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
            )}
            title={onRemove ? "Double-click to remove" : undefined}
          >
            <Icon className="h-3 w-3" />
            <span>{v.name}</span>
          </button>
        );
      })}
      {onAdd && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              aria-label="Add view"
            >
              <Plus className="h-3 w-3" /> Add view
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-44">
            {ADDABLE_TYPES.map((t) => {
              const Icon = VIEW_ICONS[t];
              return (
                <DropdownMenuItem key={t} onClick={() => onAdd(t)} className="gap-2 text-sm capitalize">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {t}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
