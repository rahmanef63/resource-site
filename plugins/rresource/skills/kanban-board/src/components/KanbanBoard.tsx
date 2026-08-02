// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import type { Card } from "../hooks/useKanbanStore";

type Props = {
  columns: { id: string; title: string }[];
  cards: Card[];
  onMove: (id: string, toCol: string) => void;
  renderCard?: (c: Card) => React.ReactNode;
  className?: string;
};

export function KanbanBoard({ columns, cards, onMove, renderCard, className }: Props) {
  const [dragId, setDragId] = React.useState<string | null>(null);

  return (
    <div className={className ?? "grid auto-cols-fr grid-flow-col gap-3 overflow-x-auto"}>
      {columns.map((col) => {
        const colCards = cards.filter((c) => c.column === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) { onMove(dragId, col.id); setDragId(null); } }}
            className="flex min-h-[300px] flex-col rounded-lg border bg-muted/40 p-2"
          >
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {col.title} <span className="text-foreground/40">({colCards.length})</span>
            </p>
            <div className="flex-1 space-y-2">
              {colCards.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab rounded-md border bg-background p-2 text-sm shadow-sm active:cursor-grabbing"
                >
                  {renderCard ? renderCard(c) : c.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
