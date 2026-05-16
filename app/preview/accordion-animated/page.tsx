"use client";

import * as React from "react";
import { Plus } from "lucide-react";

const ITEMS = [
  { q: "Can I customize the slice after import?", a: "Yes. Slices are copied into your repo — you own the files. Editing them is the expected flow." },
  { q: "How are conflicts resolved?", a: "rr-prep prints a diff, you decide which side wins. The kitab favors needs-adapter slices to avoid merges." },
  { q: "Is there a community?", a: "Discord + GitHub Discussions. Slack channel for Team plan customers." },
  { q: "Do you support monorepos?", a: "Pnpm workspaces, Turborepo, and Nx all work. rr.json sits per-app." },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow data-[open]:shadow-md" data-open={open || undefined}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-medium">{q}</span>
        <span className={`grid size-7 shrink-0 place-items-center rounded-full border border-border/60 bg-background transition-transform ${open ? "rotate-45 bg-primary text-primary-foreground" : ""}`}>
          <Plus className="size-3.5" />
        </span>
      </button>
      <div
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="grid"
      >
        <div className="overflow-hidden">
          <p ref={ref} className="px-6 pb-6 text-sm text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-2xl px-6 py-20">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Smooth-open FAQ</h1>
          <p className="mt-3 text-muted-foreground">Grid-row animation. No janky height jumps.</p>
        </header>
        <div className="space-y-3">
          {ITEMS.map((it) => <Item key={it.q} {...it} />)}
        </div>
      </section>
    </main>
  );
}
