"use client";
// glass-desktop — file-search (utilities, WP wide pill). A shadcn Input "Find
// files…" plus an ⏎ chip; typing filters the 6 seeded files into a glass
// results overlay layered at Z.overlay (Esc clears + closes it). Content only —
// the canvas supplies the outer glass shell; the results panel is an internal
// popover, so it carries its own glass surface by design (§ contract).
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Z } from "@/features/glass-desktop/config/constants";
import { fileSearchSeed } from "@/features/glass-desktop/lib/seeds/utilities-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

export function FileSearch(_props: WidgetProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const open = q.length > 0;

  const matches = useMemo(
    () =>
      q.length === 0
        ? []
        : fileSearchSeed.files.filter((f) => f.name.toLowerCase().includes(q)),
    [q],
  );

  return (
    <div className="relative flex h-full w-full items-center gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
        }}
        placeholder={fileSearchSeed.placeholder}
        aria-label={fileSearchSeed.placeholder}
        aria-expanded={open}
        className={cn(
          "h-9 flex-1 rounded-[var(--radius-control)] border-0 text-xs",
          "[background:var(--color-glass-lo)] [color:var(--color-ink-hi)]",
          "placeholder:[color:var(--color-ink-low)]",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "grid h-6 min-w-6 place-items-center rounded-[var(--radius-control)] px-1.5 text-[11px]",
          "[background:var(--color-glass-hi)] [color:var(--color-ink-mid)]",
        )}
        style={{ fontFamily: "var(--font-numeric)" }}
      >
        {fileSearchSeed.enterHint}
      </span>

      {open ? (
        <div
          role="listbox"
          aria-label={fileSearchSeed.resultsLabel}
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+8px)] flex flex-col gap-0.5 p-1.5",
            "rounded-[var(--radius-widget)] border shadow-[var(--shadow-widget)]",
            "[background:var(--color-glass-solid)]",
          )}
          style={{
            zIndex: Z.overlay,
            borderColor: "var(--color-hairline)",
            backdropFilter: "blur(var(--blur-glass)) saturate(140%)",
            WebkitBackdropFilter: "blur(var(--blur-glass)) saturate(140%)",
          }}
        >
          {matches.length === 0 ? (
            <p className="px-2 py-2 text-xs" style={{ color: "var(--color-ink-low)" }}>
              {fileSearchSeed.emptyLabel}
            </p>
          ) : (
            matches.map((f) => (
              <div
                key={f.id}
                role="option"
                aria-label={f.name}
                aria-selected={false}
                className="flex items-baseline justify-between gap-3 rounded-[var(--radius-control)] px-2 py-1.5"
              >
                <span
                  className="min-w-0 flex-1 truncate text-xs font-medium"
                  style={{ color: "var(--color-ink-hi)" }}
                >
                  {f.name}
                </span>
                <span
                  className="shrink-0 text-[10px]"
                  style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
                >
                  {f.meta}
                </span>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
