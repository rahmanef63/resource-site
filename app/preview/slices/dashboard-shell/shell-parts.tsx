"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopBar() {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-2">
      <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" /> Search…
        <kbd className="ml-auto rounded border bg-background px-1 font-mono text-[10px]">⌘K</kbd>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Bell className="h-3.5 w-3.5" />
      </Button>
      <div className="h-7 w-7 rounded-full bg-foreground" />
    </header>
  );
}

export function ContentArea({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex-1 space-y-3 overflow-y-auto p-4", compact && "p-0")}>
      <div className="flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Dashboard</h1>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-4")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Metric {i + 1}</div>
            <div className="mt-1 font-mono text-lg font-bold">{(1234 * (i + 1)).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-4/5 rounded bg-muted" />
        <div className="h-2 w-3/5 rounded bg-muted" />
      </div>
    </div>
  );
}

export function SideRow({
  icon: Icon,
  label,
  badge,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      type="button"
      className={cn(
        "flex h-auto w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition",
        active ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="rounded bg-foreground/10 px-1 text-[10px]">{badge}</span>}
    </Button>
  );
}

export function DockButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      type="button"
      className={cn(
        "flex h-auto flex-col items-center gap-0.5 rounded-none py-2 text-[10px]",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
