"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ListEditor<T extends { slug?: string; id?: string; title?: string; name?: string }>({
  items,
  onChange,
  renderEditor,
  blank,
  itemLabel,
  itemSubLabel,
  extraRowActions,
  isItemHidden,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderEditor: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  blank: () => T;
  itemLabel: (item: T) => string;
  itemSubLabel?: (item: T) => string;
  extraRowActions?: (item: T, index: number) => React.ReactNode;
  isItemHidden?: (item: T) => boolean;
}) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  function add() {
    onChange([...items, blank()]);
    setOpenIdx(items.length);
  }

  function remove(i: number) {
    if (!confirm("Delete this item?")) return;
    onChange(items.filter((_, idx) => idx !== i));
    setOpenIdx(null);
  }

  function update(i: number, patch: Partial<T>) {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={add} className="h-7 gap-1.5">
          <Plus className="size-3" /> Add new
        </Button>
      </div>
      <div className="divide-y divide-border rounded-lg border bg-card">
        {items.map((item, i) => {
          const open = openIdx === i;
          const hidden = isItemHidden?.(item) ?? false;
          return (
            <div key={(item.slug || item.id || itemLabel(item)) + i}>
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/40",
                  open && "bg-accent/30",
                  hidden && "opacity-50"
                )}
              >
                {open ? (
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", hidden && "line-through")}>
                    {itemLabel(item)}
                  </p>
                  {itemSubLabel && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {itemSubLabel(item)}
                    </p>
                  )}
                </div>
                {hidden && (
                  <Badge variant="outline" className="text-[9px]">
                    hidden
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-[10px]">
                  {(item.slug || item.id || "").slice(0, 24)}
                </Badge>
                {extraRowActions?.(item, i)}
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  aria-label="Delete"
                >
                  <span><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></span>
                </Button>
              </button>
              {open && (
                <div className="border-t bg-background/40 px-4 py-4">
                  {renderEditor(item, (patch) => update(i, patch))}
                </div>
              )}
            </div>
          );
        })}
        {!items.length && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No items. Click "Add new".
          </div>
        )}
      </div>
    </div>
  );
}
