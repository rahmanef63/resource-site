"use client";

import * as React from "react";
import { GripVertical, X } from "lucide-react";
import { SelectableBlock, useSelection } from "@/features/selection";

export interface CanvasNodeData { id: string; x: number; y: number; text: string }

interface Props {
  node: CanvasNodeData;
  orderedIds: string[];
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

/** A free-floating, draggable, editable node on the selection canvas. The
 *  grip moves it (drag) and selects it (click); the marquee can rubber-band
 *  it; ✕ or Backspace deletes it. */
export function CanvasNode({ node, orderedIds, onMove, onEdit, onDelete }: Props) {
  const sel = useSelection();
  const drag = React.useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (e.shiftKey || e.metaKey || e.ctrlKey) sel?.toggle(node.id);
    else if (!sel?.isSelected(node.id)) sel?.selectOnly(node.id);
    drag.current = { px: e.clientX, py: e.clientY, x: node.x, y: node.y };
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      onMove(node.id, d.x + (ev.clientX - d.px), d.y + (ev.clientY - d.py));
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <SelectableBlock id={node.id} orderedIds={orderedIds} edges={false} style={{ position: "absolute", left: node.x, top: node.y }}>
      <div className="w-44 rounded-md border border-border bg-card shadow-sm">
        <div data-no-marquee onPointerDown={startDrag} className="flex cursor-grab items-center justify-between rounded-t-md border-b border-border bg-muted/50 px-2 py-1 active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <button data-no-marquee type="button" onClick={() => onDelete(node.id)} aria-label="Delete node" className="text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          data-no-marquee
          value={node.text}
          onChange={(e) => onEdit(node.id, e.target.value)}
          className="w-full bg-transparent px-2 py-2 text-sm outline-none"
        />
      </div>
    </SelectableBlock>
  );
}
