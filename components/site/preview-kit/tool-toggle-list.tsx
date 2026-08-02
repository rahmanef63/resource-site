"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type ToolToggleItem = {
  id: string;
  name: string;
  description?: string;
  icon?: LucideIcon;
};

export type ToolToggleListProps = {
  items: ToolToggleItem[];
  /** Set of active tool ids. */
  active: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
};

/** Vertical list of toolable capabilities. Composes shadcn Switch.
 *  Compact density tuned for sidebar use. */
export function ToolToggleList({ items, active, onToggle, className }: ToolToggleListProps) {
  return (
    <ul className={cn("space-y-0.5", className)}>
      {items.map((it) => {
        const on = active.has(it.id);
        return (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => onToggle(it.id)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition",
                "hover:bg-accent",
                on && "bg-primary/[0.04]",
              )}
            >
              {it.icon && (
                <it.icon
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    on ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-xs font-medium leading-tight",
                    on ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {it.name}
                </p>
                {it.description && (
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                    {it.description}
                  </p>
                )}
              </div>
              <Switch
                checked={on}
                onCheckedChange={() => onToggle(it.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 scale-75"
                aria-label={`Toggle ${it.name}`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
