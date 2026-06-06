"use client";

import * as React from "react";
import { AlertTriangle, Check, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { slices as allSlices, type SliceEntry } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { SLICE_COMPAT } from "@/lib/build/compat";
import { SLICE_CATEGORY_LABEL, SLICE_CATEGORY_ORDER as CATEGORY_ORDER } from "@/lib/content/taxonomy";

const slices = allSlices.filter((s) => !isHidden(s.slug));



export function SlicePicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, SliceEntry[]>();
    for (const s of slices) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, []);
  const orderedGroups = CATEGORY_ORDER.filter((c) => grouped.has(c));
  const selectedSet = new Set(selected);
  const warnings = collectComposeWarnings(selected);

  return (
    <div className="flex flex-col gap-4">
      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
          <div className="mb-1 flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3" /> Compose warnings
          </div>
          <ul className="space-y-0.5 text-muted-foreground">
            {warnings.map((w, i) => (
              <li key={i}>· {w}</li>
            ))}
          </ul>
        </div>
      )}

      {orderedGroups.map((cat) => {
        const items = grouped.get(cat)!;
        return (
          <div key={cat}>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {SLICE_CATEGORY_LABEL[cat] ?? cat} <span className="font-normal text-muted-foreground/60">({items.length})</span>
            </h3>
            <div className="flex flex-col gap-1.5">
              {items.map((s) => {
                const on = selectedSet.has(s.slug);
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => onToggle(s.slug)}
                    aria-pressed={on}
                    className={cn(
                      "group flex items-start gap-2 rounded-md border px-3 py-2 text-left transition",
                      on
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-border/60 bg-card hover:bg-accent/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                        on ? "border-blue-500 bg-blue-500 text-white" : "border-border",
                      )}
                    >
                      {on && <Check className="size-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium">{s.title}</span>
                        <Badge variant="outline" className="text-[9px]">v{s.version}</Badge>
                        {s.peers && s.peers.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            ↳ {s.peers.map((p) => p.slug).join(", ")}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                    {s.providers && s.providers.length > 0 && (
                      <Layers className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-label="multi-provider" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function collectComposeWarnings(selected: string[]): string[] {
  const warnings: string[] = [];
  const sliceMap = new Map(slices.map((s) => [s.slug, s]));
  const present = new Set(selected);

  // Missing peers
  for (const slug of selected) {
    const s = sliceMap.get(slug);
    if (!s) continue;
    for (const p of s.peers ?? []) {
      if (!present.has(p.slug) && sliceMap.has(p.slug)) {
        warnings.push(`${slug} requires peer ${p.slug} ${p.range} — auto-added by the install command`);
      }
    }
  }

  // Conflicts
  for (const slug of selected) {
    const compat = SLICE_COMPAT[slug];
    if (!compat?.conflicts) continue;
    for (const conflict of compat.conflicts) {
      if (present.has(conflict)) {
        warnings.push(`${slug} CONFLICTS with ${conflict} — pick one`);
      }
    }
  }

  return warnings;
}
