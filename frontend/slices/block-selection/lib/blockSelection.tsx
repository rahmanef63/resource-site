"use client";

/** Block multi-selection — a small, framework-agnostic context for selecting
 *  items in any vertical list (Notion-style blocks, table rows, cards…). Wrap
 *  the list in <BlockSelectionProvider onBulkDelete>; wrap each item in
 *  <SelectableBlock> (sibling file), whose thin top/bottom edge strips select
 *  on click (Shift = range from the anchor, Cmd/Ctrl = toggle). Backspace /
 *  Delete with a non-empty selection (and focus outside any editable) deletes
 *  them all; Escape clears. A floating count toolbar offers the same.
 *
 *  Pure UI — owns only the selected-id set; the host owns the data and
 *  performs the actual delete via `onBulkDelete(ids)`. */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";

export interface BlockSelectionCtx {
  isSelected: (id: string) => boolean;
  size: number;
  selectOnly: (id: string) => void;
  toggle: (id: string) => void;
  selectRange: (id: string, orderedIds: string[]) => void;
  clear: () => void;
}

const Ctx = createContext<BlockSelectionCtx | null>(null);
export const useBlockSelection = () => useContext(Ctx);

export function BlockSelectionProvider({
  children, onBulkDelete,
}: {
  children: ReactNode;
  onBulkDelete?: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const anchorRef = useRef<string | null>(null);

  const clear = useCallback(() => { anchorRef.current = null; setSelected(new Set()); }, []);
  const selectOnly = useCallback((id: string) => { anchorRef.current = id; setSelected(new Set([id])); }, []);
  const toggle = useCallback((id: string) => {
    anchorRef.current = id;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const selectRange = useCallback((id: string, ordered: string[]) => {
    const a = anchorRef.current ?? id;
    const from = ordered.indexOf(a);
    const to = ordered.indexOf(id);
    if (from < 0 || to < 0) { anchorRef.current = id; setSelected(new Set([id])); return; }
    const [lo, hi] = from < to ? [from, to] : [to, from];
    setSelected(new Set(ordered.slice(lo, hi + 1)));
  }, []);

  const del = useCallback(() => {
    if (selected.size === 0) return;
    onBulkDelete?.(Array.from(selected));
    clear();
  }, [selected, onBulkDelete, clear]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected.size === 0) return;
      if (e.key === "Escape") { clear(); return; }
      const editing = (e.target as HTMLElement)?.getAttribute?.("contenteditable") === "true";
      if (!editing && (e.key === "Backspace" || e.key === "Delete")) { e.preventDefault(); del(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [selected, clear, del]);

  return (
    <Ctx.Provider value={{ isSelected: (id) => selected.has(id), size: selected.size, selectOnly, toggle, selectRange, clear }}>
      {children}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-sm shadow-md">
          <span className="text-muted-foreground">{selected.size} selected</span>
          <button type="button" onClick={del} className="rounded px-2 py-0.5 font-medium text-destructive hover:bg-destructive/10">Delete</button>
          <button type="button" onClick={clear} className="rounded px-2 py-0.5 text-muted-foreground hover:bg-muted">Clear</button>
        </div>
      )}
    </Ctx.Provider>
  );
}
