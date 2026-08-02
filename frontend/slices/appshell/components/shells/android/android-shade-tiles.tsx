"use client";
/* Quick-Settings pill tiles (android-qs-pill-tiles) — split out of
   android-shade.tsx to keep it under the 200-LOC gate. M3 stadium tiles:
   2-column grid, ~64dp tall, tonal fill when active (Agent A's
   --m3-primary-container/--m3-on-primary-container), neutral
   --m3-surface-container when off. Two-stage reveal: a compact 2x2 of the
   most important tiles by default, a chevron expands to the full set. */
import { useState } from "react";
import { CaretDown as ChevronDown, type Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QsTile = { id: string; label: string; icon: Icon; on: boolean; onClick: () => void };

// One M3 quick-settings pill.
function Tile({ icon: Icon, label, on, onClick }: { icon: Icon; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex h-16 items-center gap-3 rounded-full px-5 text-left text-sm transition-colors",
        on
          ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]"
          : "bg-[var(--m3-surface-container)] text-foreground",
      )}
    >
      <Icon className={cn("size-5 shrink-0", on && "text-[var(--m3-on-primary-container)]")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

// Collapsed = tiles[0..4) (a 2x2 of the most important — callers should put
// the wired real-state tiles first); expanded = the full set.
export function QsGrid({ tiles }: { tiles: QsTile[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? tiles : tiles.slice(0, 4);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {shown.map((t) => (
          <Tile key={t.id} icon={t.icon} label={t.label} on={t.on} onClick={t.onClick} />
        ))}
      </div>
      {tiles.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Show fewer tiles" : "Show more tiles"}
          className="mx-auto mt-1 flex h-6 w-full items-center justify-center text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </Button>
      )}
    </div>
  );
}
