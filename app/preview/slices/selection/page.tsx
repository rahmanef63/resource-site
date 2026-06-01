"use client";

import * as React from "react";
import {
  SelectionProvider,
  SelectableBlock,
  SelectionMarquee,
} from "@/features/selection";

const INITIAL = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  text: `Row ${i + 1}`,
}));

/** Standalone preview — marquee multi-select over a plain list. */
export default function Page() {
  const [items, setItems] = React.useState(INITIAL);
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const ids = items.map((i) => i.id);

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-4 bg-background p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Selection — drag to marquee</h1>
        <p className="text-sm text-muted-foreground">
          Hold-drag on empty space to rubber-band. <b>Drag right</b> = enclose
          (solid ring) · <b>Drag left</b> = cross/touch (dashed green). Shift-drag
          adds. Edge-click a row to pick it. Backspace deletes · Esc clears.
        </p>
      </header>
      <SelectionProvider
        onBulkDelete={(del) => setItems((cur) => cur.filter((i) => !del.includes(i.id)))}
      >
        <div ref={surfaceRef} className="relative space-y-2 rounded-lg border border-dashed border-border p-4">
          <SelectionMarquee containerRef={surfaceRef} />
          {items.map((i) => (
            <SelectableBlock key={i.id} id={i.id} orderedIds={ids}>
              <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">
                {i.text}
              </div>
            </SelectableBlock>
          ))}
        </div>
      </SelectionProvider>
    </main>
  );
}
