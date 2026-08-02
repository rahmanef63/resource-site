"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const MODES = [
  { id: "light", label: "Terang", Icon: Sun },
  { id: "dark", label: "Gelap", Icon: Moon },
  { id: "system", label: "Sistem", Icon: Monitor },
] as const;

export type ModeId = (typeof MODES)[number]["id"];

export function ModeSelector({
  activeMode,
  setTheme,
}: {
  activeMode: ModeId;
  setTheme: (id: string) => void;
}) {
  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-border bg-popover/95 px-3 py-2 backdrop-blur">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Mode Tampilan
      </p>
      <div
        role="tablist"
        aria-label="Mode tampilan"
        className="grid grid-cols-3 gap-1 rounded-md bg-muted/60 p-1"
      >
        {MODES.map(({ id, label, Icon }) => {
          const active = id === activeMode;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTheme(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
