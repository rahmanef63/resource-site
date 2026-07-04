"use client";

import { GitBranch, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { Generation } from "../types";

/** Prompt-history / branch sidebar for the studio canvas. */
export function VersionTree({
  history,
  activeId,
  onSelect,
}: {
  history: Generation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col rounded-lg border bg-card lg:w-64">
      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
        <GitBranch className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        Version tree
      </div>
      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No generations yet. Write a prompt to start.
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {history.map((generation) => (
              <li key={generation.id}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSelect(generation.id)}
                  aria-label={`Open generation: ${generation.prompt}`}
                  className={cn(
                    "h-auto w-full flex-col items-start gap-0 rounded-md px-2 py-2 text-left text-xs",
                    generation.id === activeId && "bg-accent",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {generation.parentId ? (
                      <GitBranch className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className="truncate">{generation.prompt}</span>
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
                    {generation.kind}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
