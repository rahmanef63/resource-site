"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    title: "Installation",
    items: [
      { q: "Prerequisites", a: "Node 20+, Docker, a VPS with Dokploy, and a domain." },
      { q: "First install", a: "Run `npx rahman-resources init my-app` and follow prompts." },
      { q: "CI tooling", a: "GitHub Actions workflows are workflow_dispatch only — push triggers Dokploy webhook." },
    ],
  },
  {
    title: "Slices",
    items: [
      { q: "Adding a slice", a: "Run `npx rahman-resources add <slug>` — files copy and rr.json updates." },
      { q: "Updating a slice", a: "Rerun `add` after bumping the package — diffs land via Dokploy webhook." },
    ],
  },
  {
    title: "Sync",
    items: [
      { q: "Bidir scan", a: "Run `rr scan-consumers` on the kitab to surface up/down deltas." },
      { q: "Push back up", a: "`/rr-prep <slug>` → `/rr-send <slug>` from the consumer project." },
    ],
  },
];

export default function Page() {
  const [section, setSection] = React.useState(0);
  const [item, setItem] = React.useState(0);
  const current = SECTIONS[section];
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {SECTIONS.map((s, i) => (
              <Button
                key={s.title}
                type="button"
                variant="ghost"
                onClick={() => { setSection(i); setItem(0); }}
                className={`flex h-auto w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-normal transition ${
                  i === section ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {s.title} <ChevronRight className="size-3" />
              </Button>
            ))}
          </nav>
        </aside>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
          <div className="mt-6 divide-y divide-border/40 rounded-2xl border border-border/60 bg-card">
            {current.items.map((it, i) => (
              <div key={it.q}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setItem(i === item ? -1 : i)}
                  className="flex h-auto w-full items-center justify-between rounded-none px-5 py-4 text-left text-sm font-medium hover:bg-transparent"
                >
                  {it.q}
                  <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${i === item ? "rotate-90" : ""}`} />
                </Button>
                {i === item && <p className="px-5 pb-4 text-sm text-muted-foreground">{it.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
