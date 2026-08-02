"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LibraryIndexProps, LibraryRow } from "../lib/types";
import { ALL_KINDS, DEFAULT_COPY, DEFAULT_KIND_LABELS } from "../lib/defaults";

// Grid of library cards with kind + tool filters. All copy + kind
// labels are prop-driven (English defaults). Detail routes are
// `/library/<slug>` — adjust the consumer's route group if mounting
// elsewhere.
export function LibraryIndex({
  items,
  copy: copyOverride,
  kindLabels: kindLabelsOverride,
}: LibraryIndexProps) {
  const copy = { ...DEFAULT_COPY, ...copyOverride };
  const kindLabels = { ...DEFAULT_KIND_LABELS, ...kindLabelsOverride };

  const [kind, setKind] = useState<LibraryRow["kind"] | "all">("all");
  const [tool, setTool] = useState("");

  const allTools = useMemo(() => {
    const s = new Set<string>();
    for (const i of items) for (const t of i.tools ?? []) s.add(t);
    return Array.from(s).sort();
  }, [items]);

  const filtered = items.filter((i) => {
    if (kind !== "all" && i.kind !== kind) return false;
    if (tool && !(i.tools ?? []).includes(tool)) return false;
    return true;
  });

  const chip = (active: boolean) =>
    cn(
      "h-auto border-2 rounded-md px-3 py-1 text-[11px] uppercase tracking-wider font-medium transition-colors hover:bg-transparent",
      active
        ? "border-current bg-foreground text-background hover:bg-foreground hover:text-background"
        : "border-current/40 hover:border-current",
    );

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        <header className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider opacity-60">{copy.eyebrow}</div>
          <h1 className="font-serif text-4xl lg:text-6xl leading-tight">{copy.title}</h1>
          {copy.body ? <p className="text-base opacity-70 max-w-2xl">{copy.body}</p> : null}
        </header>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setKind("all")} className={chip(kind === "all")}>
              {copy.allLabel}
            </Button>
            {ALL_KINDS.map((k) => (
              <Button key={k} type="button" variant="ghost" onClick={() => setKind(k)} className={chip(kind === k)}>
                {kindLabels[k] ?? k}
              </Button>
            ))}
          </div>
          {allTools.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider opacity-50">{copy.toolLabel}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTool("")}
                className={cn(
                  "h-auto px-1 py-0 text-[11px] underline underline-offset-4 hover:bg-transparent",
                  tool === "" ? "font-bold" : "opacity-60",
                )}
              >
                {copy.toolAllLabel}
              </Button>
              {allTools.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant="ghost"
                  onClick={() => setTool(t === tool ? "" : t)}
                  className={cn(
                    "h-auto px-1 py-0 text-[11px] underline underline-offset-4 hover:bg-transparent",
                    tool === t ? "font-bold" : "opacity-60",
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm opacity-60">{copy.emptyText}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((i) => (
              <li
                key={i._id}
                className="border-2 border-current rounded-md hover:shadow-md transition-shadow"
              >
                <Link href={`/library/${i.slug}`} className="block p-4 space-y-3 group">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="border-2 border-current rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
                      {kindLabels[i.kind] ?? i.kind}
                    </span>
                    {typeof i.upvotes === "number" && i.upvotes > 0 ? (
                      <span className="text-[11px] tabular-nums opacity-60">▲ {i.upvotes}</span>
                    ) : null}
                  </div>
                  <h3 className="font-bold text-base leading-tight group-hover:underline underline-offset-4">
                    {i.title}
                  </h3>
                  <p className="text-sm opacity-70 line-clamp-3">{i.excerpt}</p>
                  {(i.tools ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {(i.tools ?? []).slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider border border-current/30 rounded px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
