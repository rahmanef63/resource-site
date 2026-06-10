"use client";

import { Plus, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hostOf } from "../lib/url";
import type { Tab } from "../lib/use-remote-browser";

type TabBarProps = {
  tabs: Tab[];
  activeId: number;
  aiOpen: boolean;
  onSwitch: (id: number) => void;
  onClose: (id: number) => void;
  onNew: () => void;
  onToggleAi: () => void;
};

// Chrome-style tab strip. Each tab is its own remote page/stream; the AI toggle
// opens the agent-activity panel.
export function TabBar({ tabs, activeId, aiOpen, onSwitch, onClose, onNew, onToggleAi }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 bg-card/50 px-1.5 pt-1.5">
      {/* Tabs never wrap — they scroll horizontally when the pane is narrow. */}
      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto overscroll-x-contain">
        {tabs.map((t) => {
          const on = t.id === activeId;
          return (
            <div
              key={t.id}
              onClick={() => onSwitch(t.id)}
              className={cn(
                "group flex min-w-[110px] max-w-[190px] shrink-0 cursor-default items-center gap-1.5 rounded-t-md px-2.5 py-1.5 text-xs @max-[480px]:min-w-[96px] @max-[480px]:max-w-[150px]",
                on ? "bg-background font-medium" : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{t.title || hostOf(t.url) || "New Tab"}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t.id);
                }}
                aria-label="Close tab"
                className={cn(
                  // Hover-revealed on wide panes; always visible (and a bigger
                  // hit target) on the active tab + compact/touch panes.
                  "size-4 shrink-0 rounded opacity-0 transition-opacity group-hover:opacity-100 @max-[480px]:size-6 @max-[480px]:opacity-100",
                  on && "opacity-100",
                )}
              >
                <X className="size-3" />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNew}
          aria-label="New tab"
          className="mb-1 size-7 shrink-0 rounded-md text-muted-foreground"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggleAi}
        aria-label="AI panel"
        className={cn(
          "mb-1 h-auto shrink-0 gap-1.5 rounded-md px-2 py-1 text-xs",
          aiOpen
            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            : "text-muted-foreground",
        )}
      >
        <Sparkles className="size-3.5" />
        AI
      </Button>
    </div>
  );
}
