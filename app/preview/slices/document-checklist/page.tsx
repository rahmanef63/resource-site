"use client";

import * as React from "react";
import { ListChecks, Check, Circle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { id: string; label: string; group: string; done: boolean };

const INITIAL: Item[] = [
  { id: "1", label: "Connect domain to Dokploy", group: "Setup", done: true },
  { id: "2", label: "Configure Convex env vars", group: "Setup", done: true },
  { id: "3", label: "Seed RBAC roles", group: "Setup", done: true },
  { id: "4", label: "Add first 3 slices", group: "Build", done: true },
  { id: "5", label: "Wire forbidden-words guard", group: "Build", done: false },
  { id: "6", label: "Test convex-auth flow", group: "Build", done: false },
  { id: "7", label: "Run audit-bp ≥ 80", group: "Ship", done: false },
  { id: "8", label: "Push to main (Dokploy auto-deploy)", group: "Ship", done: false },
  { id: "9", label: "Verify Lighthouse 90+", group: "Ship", done: false },
];

export default function Page() {
  const [items, setItems] = React.useState(INITIAL);
  const toggle = (id: string) => setItems((arr) => arr.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const groups = Array.from(new Set(items.map((i) => i.group)));
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><ListChecks className="size-5 text-primary" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Document checklist</h1>
          <p className="text-xs text-muted-foreground">Per-user state, Convex-backed, drag-to-reorder.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{done}<span className="text-sm font-normal text-muted-foreground">/{items.length}</span></p>
          <p className="text-[10px] text-muted-foreground">{pct}% complete</p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</h2>
              <div className="space-y-1.5">
                {items.filter((i) => i.group === g).map((i) => (
                  <Button
                    key={i.id}
                    variant="outline"
                    onClick={() => toggle(i.id)}
                    className={`group flex h-auto w-full items-center justify-start gap-3 whitespace-normal rounded-lg p-3 text-left font-normal ${i.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-card hover:border-border"}`}
                  >
                    <GripVertical className="size-3.5 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                    <div className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${i.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"}`}>
                      {i.done ? <Check className="size-3" /> : <Circle className="size-2.5 opacity-0" />}
                    </div>
                    <span className={`flex-1 text-sm ${i.done ? "text-muted-foreground line-through" : ""}`}>{i.label}</span>
                  </Button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
