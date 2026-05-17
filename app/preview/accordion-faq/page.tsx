"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { q: "What is a slice?", a: "A vertical feature unit — frontend + Convex backend + agent recipe — that you can drop into any compatible project." },
  { q: "Do I need Clerk?", a: "No. Auth is @convex-dev/auth across the kitab. Clerk is forbidden by hard rule." },
  { q: "Can I host Convex myself?", a: "Yes — the entire stack runs on Dokploy with self-hosted Convex via docker-compose." },
  { q: "How does bidir sync work?", a: "Consumer projects drop a .kitab.json next to each slice; rr scan-consumers surfaces up/down deltas." },
  { q: "What's the audit-bp score for?", a: "Best-practice gate. Score ≥80 to ship. Auditor pulls latest Next/React/Convex docs before scoring." },
];

export default function Page() {
  const [open, setOpen] = React.useState(0);
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-2xl px-6 py-20">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-3 text-muted-foreground">Quick answers about the kitab and slice mesh.</p>
        </header>
        <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex h-auto w-full items-center justify-between rounded-none px-5 py-4 text-left text-sm font-medium hover:bg-muted/30"
                >
                  {it.q}
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </Button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">{it.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
