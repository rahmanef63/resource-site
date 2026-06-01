"use client";

/** SelectableBlock — wrap each list item with this to opt it into multi-
 *  selection (needs a <BlockSelectionProvider> ancestor; without one it
 *  renders children untouched, so it's safe to leave in place). Thin top /
 *  bottom edge strips select on click: Shift = range from the anchor,
 *  Cmd/Ctrl = toggle, plain = select only. */

import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useBlockSelection } from "../lib/blockSelection";

export interface SelectableBlockProps {
  id: string;
  orderedIds: string[];
  children: ReactNode;
  className?: string;
}

export function SelectableBlock({ id, orderedIds, children, className }: SelectableBlockProps) {
  const sel = useBlockSelection();
  if (!sel) return <>{children}</>;

  const selected = sel.isSelected(id);
  const onEdge = (e: MouseEvent) => {
    e.preventDefault();
    if (e.shiftKey) sel.selectRange(id, orderedIds);
    else if (e.metaKey || e.ctrlKey) sel.toggle(id);
    else sel.selectOnly(id);
  };

  return (
    <div
      data-block-selected={selected || undefined}
      className={cn("relative rounded-sm", selected && "bg-primary/10 ring-2 ring-primary/40", className)}
    >
      <div onMouseDown={onEdge} aria-hidden className="absolute inset-x-0 top-0 z-10 h-1.5 cursor-pointer" />
      {children}
      <div onMouseDown={onEdge} aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-1.5 cursor-pointer" />
    </div>
  );
}
