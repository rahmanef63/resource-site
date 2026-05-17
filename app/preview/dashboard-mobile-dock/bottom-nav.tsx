"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TAB_POOL, type TabKey } from "./mock-data";

export function BottomNav({
  variant, primary, moreItems, active, setActive, setMoreOpen, aiBtn,
}: {
  variant: "tabs" | "dock" | "pill";
  primary: TabKey[]; moreItems: TabKey[];
  active: TabKey; setActive: (k: TabKey) => void;
  moreOpen: boolean; setMoreOpen: (b: boolean) => void;
  aiBtn: boolean;
}) {
  if (variant === "pill") {
    return (
      <nav className="fixed inset-x-0 bottom-4 z-10 flex justify-center">
        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/95 p-1 shadow-xl backdrop-blur">
          {primary.slice(0, 3).map((id) => {
            const t = TAB_POOL[id];
            const Icon = t.icon;
            const on = active === id;
            return (
              <Button
                type="button"
                variant="ghost"
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full transition-colors hover:bg-transparent",
                  on ? "bg-violet-500 text-white hover:bg-violet-500 hover:text-white" : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                <Icon className="size-4" />
              </Button>
            );
          })}
          {moreItems.length > 0 && (
            <Button type="button" variant="ghost" onClick={() => setMoreOpen(true)} className="flex size-10 items-center justify-center rounded-full text-zinc-400 hover:bg-transparent hover:text-zinc-100">
              <MoreHorizontal className="size-4" />
            </Button>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-10 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur",
      variant === "dock" && "py-1",
    )}>
      <div className={cn("mx-auto flex max-w-md items-center", variant === "dock" ? "justify-around py-2" : "justify-around py-1.5")}>
        {primary.map((id) => {
          const t = TAB_POOL[id];
          const Icon = t.icon;
          const on = active === id;
          return (
            <Button
              type="button"
              variant="ghost"
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex h-auto flex-col items-center gap-0.5 px-3 text-[10px] font-medium transition-colors hover:bg-transparent",
                on ? "text-violet-300 hover:text-violet-300" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon className={variant === "dock" ? "size-5" : "size-4"} />
              <span>{t.label}</span>
            </Button>
          );
        })}
        {moreItems.length > 0 && (
          <Button type="button" variant="ghost" onClick={() => setMoreOpen(true)} className={cn(
            "flex h-auto flex-col items-center gap-0.5 px-3 text-[10px] font-medium hover:bg-transparent",
            "text-zinc-500 hover:text-zinc-300",
          )}>
            <MoreHorizontal className={variant === "dock" ? "size-5" : "size-4"} />
            <span>More</span>
          </Button>
        )}
      </div>
      {aiBtn && variant === "dock" && <div className="h-2" />}
    </nav>
  );
}

export function MoreSheet({
  moreItems, setActive, setMoreOpen,
}: {
  moreItems: TabKey[];
  setActive: (k: TabKey) => void;
  setMoreOpen: (b: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={() => setMoreOpen(false)}>
      <div className="w-full rounded-t-2xl bg-zinc-900 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-700" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">More</p>
        <div className="grid grid-cols-4 gap-3">
          {moreItems.map((id) => {
            const t = TAB_POOL[id];
            const Icon = t.icon;
            return (
              <Button
                type="button"
                variant="ghost"
                key={id}
                onClick={() => { setActive(id); setMoreOpen(false); }}
                className="flex h-auto flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 font-normal text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-300"
              >
                <Icon className="size-5" />
                <span className="text-[10px]">{t.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
