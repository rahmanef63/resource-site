"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  { q: "Does the kitab work offline?", a: "Slices live in your repo. After init, you only need network to pull updates or run the Convex deployment." },
  { q: "What's the licensing model?", a: "MIT for the kitab core. Some templates ship dual-license; check each slice.json." },
  { q: "Can multiple seats co-edit a slice?", a: "Yes. Convex real-time queries make collaboration live across the team." },
  { q: "Where do bug reports go?", a: "GitHub Issues. Each slice ships a `repo` field in slice.json pointing at its canonical home." },
  { q: "Is there a sandbox?", a: "Yes — every preview route on resource-site.dev is a live sandbox. Edit in your fork to try." },
];

export default function Page() {
  const [open, setOpen] = React.useState<Set<number>>(new Set([0]));
  const toggle = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-2xl px-6 py-20">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Open as many as you want</h1>
            <p className="mt-3 text-muted-foreground">Multi-open accordion. Great for compare-style reading.</p>
          </div>
          <button
            onClick={() => setOpen(open.size === ITEMS.length ? new Set() : new Set(ITEMS.map((_, i) => i)))}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {open.size === ITEMS.length ? "Collapse all" : "Expand all"}
          </button>
        </header>
        <div className="space-y-2">
          {ITEMS.map((it, i) => {
            const isOpen = open.has(i);
            return (
              <div key={it.q} className="rounded-xl border border-border/60 bg-card">
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-left"
                >
                  <span className="text-sm font-medium">{it.q}</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="px-5 pb-4 text-sm text-muted-foreground">{it.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
