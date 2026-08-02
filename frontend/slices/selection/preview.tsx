"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { cn } from "@/lib/utils";
import { SelectionProvider, useSelection } from "./components/SelectionProvider";
import { SelectableBlock } from "./components/SelectableBlock";
import { SelectionMarquee } from "./components/SelectionMarquee";

const ROWS = [
  { id: "r1", label: "Quarterly roadmap" },
  { id: "r2", label: "Design tokens spec" },
  { id: "r3", label: "Release checklist" },
  { id: "r4", label: "Postmortem notes" },
];
const ORDER = ROWS.map((r) => r.id);

function Surface({ edges }: { edges: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const sel = useSelection();
  return (
    <div
      ref={ref}
      className="relative flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/20 p-3 select-none"
    >
      <SelectionMarquee containerRef={ref} />
      {ROWS.map((row) => (
        <SelectableBlock key={row.id} id={row.id} orderedIds={ORDER} edges={edges}>
          <div
            className={cn(
              "rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors",
              sel?.isSelected(row.id) && "ring-2 ring-primary",
            )}
          >
            {row.label}
          </div>
        </SelectableBlock>
      ))}
    </div>
  );
}

const SelectionPreview: SlicePreviewModule["SelectionProvider"] = ({ variant }) => {
  const edges = variant.edges !== "off";
  return (
    <div className="p-4">
      <SelectionProvider onBulkDelete={() => {}}>
        <Surface edges={edges} />
      </SelectionProvider>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Drag on empty space to marquee-select (right = enclose, left = touch);
        click a row {edges ? "edge" : "(marquee only — edges off)"} to select.
      </p>
    </div>
  );
};

const preview: SlicePreviewModule = { SelectionProvider: SelectionPreview };
export default preview;
