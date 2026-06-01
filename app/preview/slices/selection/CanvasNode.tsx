"use client";

import * as React from "react";
import { GripVertical, X } from "lucide-react";
import { SelectableBlock, useSelection } from "@/features/selection";

export interface CanvasNodeData { id: string; x: number; y: number; text: string }

interface Props {
  node: CanvasNodeData;
  orderedIds: string[];
  onDragStart: (ids: string[]) => void;
  onDragMove: (dx: number, dy: number) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

/** A free-floating, draggable, editable node on the selection canvas. The
 *  grip moves it (drag) and selects it (click); the marquee can rubber-band
 *  it; ✕ or Backspace deletes it. When >1 node is selected, dragging any
 *  selected node moves the whole selection together. */
export function CanvasNode({ node, orderedIds, onDragStart, onDragMove, onEdit, onDelete }: Props) {
  const sel = useSelection();

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const mod = e.shiftKey || e.metaKey || e.ctrlKey;
    if (mod) sel?.toggle(node.id);
    else if (!sel?.isSelected(node.id)) sel?.selectOnly(node.id);
    // Group-move: drag the whole selection when this node is already part of a
    // multi-select; otherwise just this node.
    const multi = !mod && sel?.isSelected(node.id) && (sel?.size ?? 0) > 1;
    onDragStart(multi ? (sel?.snapshot() ?? [node.id]) : [node.id]);
    const px = e.clientX, py = e.clientY;
    const move = (ev: PointerEvent) => onDragMove(ev.clientX - px, ev.clientY - py);
    const up = () => {
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
