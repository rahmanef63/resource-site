"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const GROUPS = [
  {
    title: "Getting started",
    items: [
      { q: "How do I install?", a: "Run `npx rahman-resources init <app>` and pick a template." },
      { q: "Which Node version?", a: "Node 20+. The CLI checks at startup." },
    ],
  },
  {
    title: "Slices",
    items: [
      { q: "Are slices portable?", a: "Tier-3 slices ship a slice.manifest.json and lift in one folder." },
      { q: "What if I edit a slice?", a: "Use rr-prep + rr-send to flow your edits back into the kitab." },
    ],
  },
  {
    title: "Billing",
    items: [
      { q: "Do you offer a free tier?", a: "Yes. Hobby plan stays free forever for non-commercial use." },
      { q: "Can I cancel anytime?", a: "Yes. No retention tricks." },
    ],
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="flex h-auto w-full items-center justify-between rounded-none px-0 py-3 text-left text-sm font-medium hover:bg-transparent"
      >
        {q}
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && <p className="pb-3 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-20">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Questions, grouped</h1>
          <p className="mt-3 text-muted-foreground">Bigger FAQ broken into themed sections.</p>
        </header>
        <div className="space-y-8">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</h2>
              <div className="rounded-2xl border border-border/60 bg-card px-5">
                {g.items.map((it) => <Item key={it.q} {...it} />)}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
