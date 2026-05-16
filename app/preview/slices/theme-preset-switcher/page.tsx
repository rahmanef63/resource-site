"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react";

const PRESETS = [
  { id: "default", name: "Default", swatches: ["#0f172a", "#3b82f6", "#f1f5f9", "#94a3b8"] },
  { id: "rose", name: "Rose", swatches: ["#1c0e10", "#f43f5e", "#fdf2f5", "#9f1239"] },
  { id: "violet", name: "Violet", swatches: ["#1c1633", "#8b5cf6", "#f5f3ff", "#5b21b6"] },
  { id: "emerald", name: "Emerald", swatches: ["#022c22", "#10b981", "#ecfdf5", "#047857"] },
  { id: "amber", name: "Amber", swatches: ["#2a1a05", "#f59e0b", "#fffbeb", "#92400e"] },
  { id: "graphite", name: "Graphite", swatches: ["#18181b", "#71717a", "#fafafa", "#3f3f46"] },
];

export default function Page() {
  const [active, setActive] = React.useState("violet");
  const current = PRESETS.find((p) => p.id === active)!;
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><Palette className="size-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Theme presets</h1>
          <p className="text-xs text-muted-foreground">OKLch tokens, switch live without a reload.</p>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${active === p.id ? "border-primary/60 bg-primary/[0.04] shadow-sm" : "border-border/60 hover:border-border"}`}
            >
              <div className="flex gap-1">
                {p.swatches.map((c) => <div key={c} className="size-6 rounded-md shadow-inner" style={{ background: c }} />)}
              </div>
              <span className="flex-1 text-sm font-medium">{p.name}</span>
              {active === p.id && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
        <aside className="rounded-lg border border-border/60 bg-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
          <p className="mt-1 text-sm font-medium">{current.name}</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-md p-4" style={{ background: current.swatches[0], color: current.swatches[2] }}>
              <p className="text-xs opacity-70">card.background</p>
              <p className="mt-1 text-lg font-semibold">Sample heading</p>
              <button className="mt-3 rounded px-3 py-1.5 text-xs font-medium" style={{ background: current.swatches[1], color: current.swatches[2] }}>Primary action</button>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-[10px] font-mono text-muted-foreground">
              <p>--primary: oklch(...)</p>
              <p>--background: oklch(...)</p>
              <p>--foreground: oklch(...)</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
