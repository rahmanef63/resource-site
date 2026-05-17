"use client";

import * as React from "react";
import { ChevronRight, Cog, PanelLeft, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROGRESS_ROWS } from "./mock-data";

export function Header({
  sidebarToggle,
  tabsHeader,
  rightNav,
}: {
  sidebarToggle: boolean;
  tabsHeader: boolean;
  rightNav: "avatar" | "settings" | "none";
}) {
  return (
    <header className="flex flex-col border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {sidebarToggle && (
            <Button type="button" variant="ghost" className="-ml-1 flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-400">
              <PanelLeft className="size-4" />
            </Button>
          )}
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Workspace</p>
            <p className="-mt-0.5 text-sm font-semibold">Studio · Personal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="flex size-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-400">
            <Search className="size-4" />
          </Button>
          {rightNav === "settings" && (
            <Button type="button" variant="ghost" className="flex size-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-400">
              <Cog className="size-4" />
            </Button>
          )}
          {rightNav === "avatar" && (
            <Button type="button" variant="default" className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white hover:opacity-90">
              R
            </Button>
          )}
        </div>
      </div>
      {tabsHeader && (
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-800/60 px-3 py-1.5 text-xs">
          {(["Today", "Upcoming", "Backlog", "Archive"] as const).map((t, i) => (
            <Button type="button" variant="ghost" key={t} className={cn(
              "h-auto shrink-0 rounded-md px-2.5 py-1 text-xs font-normal hover:bg-transparent",
              i === 0 ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100" : "text-zinc-500 hover:text-zinc-200",
            )}>{t}</Button>
          ))}
        </div>
      )}
    </header>
  );
}

export function HeroCard({ variant }: { variant: string }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Today · variant {variant}</p>
      <p className="mt-1 text-2xl font-bold">3 tasks · 1 mention</p>
      <p className="mt-1 text-xs text-zinc-400">You're on track. Two reviews left.</p>
    </section>
  );
}

export function ProgressList() {
  return (
    <section className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">In progress</p>
      {PROGRESS_ROWS.map((row) => {
        const Icon = row.icon;
        return (
          <div key={row.title} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              row.state === "green" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300",
            )}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.title}</p>
              <p className="truncate text-[11px] text-zinc-500">{row.sub}</p>
            </div>
            <ChevronRight className="size-4 text-zinc-600" />
          </div>
        );
      })}
    </section>
  );
}
