"use client";

import * as React from "react";
import { BlockSelectionProvider, SelectableBlock } from "@/features/block-selection";

const INITIAL = [
  { id: "1", text: "Click the top or bottom edge of a row to select it." },
  { id: "2", text: "Shift-click another row to select the whole range." },
  { id: "3", text: "Cmd/Ctrl-click toggles a single row in or out." },
  { id: "4", text: "Press Backspace or Delete to remove every selected row." },
  { id: "5", text: "Press Escape (or Clear) to deselect everything." },
  { id: "6", text: "The host owns the data — the slice only tracks ids." },
];

/** Standalone preview — multi-select over a plain list, no Notion needed. */
export default function Page() {
  const [items, setItems] = React.useState(INITIAL);
  const ids = items.map((i) => i.id);

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-4 bg-background p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Block selection</h1>
        <p className="text-sm text-muted-foreground">
          Edge-click select · Shift = range · Cmd/Ctrl = toggle · Backspace
          deletes · Esc clears.
        </p>
      </header>
      <BlockSelectionProvider
        onBulkDelete={(del) => setItems((cur) => cur.filter((i) => !del.includes(i.id)))}
      >
        <div className="space-y-2">
          {items.map((i) => (
            <SelectableBlock key={i.id} id={i.id} orderedIds={ids}>
              <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">
                {i.text}
              </div>
            </SelectableBlock>
          ))}
        </div>
      </BlockSelectionProvider>
    </main>
  );
}
