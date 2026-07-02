"use client";

import { AlertTriangle, CircleCheckBig, Flag } from "lucide-react";
import type { AiActionListVisualBlock } from "../types";

interface Props {
  block: AiActionListVisualBlock;
}

const priorityClass: Record<NonNullable<AiActionListVisualBlock["items"][number]["priority"]>, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  low: "bg-primary/10 text-primary",
};

export function ChatActionList({ block }: Props) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{block.title}</h3>
        {block.subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p> : null}
      </div>
      <div className="space-y-3">
        {block.items.map((item, i) => (
          <div key={`${item.title}-${i}`} className="rounded-xl border border-border/60 bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <CircleCheckBig className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{item.description}</p>
                  ) : null}
                </div>
              </div>
              {item.priority ? (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityClass[item.priority]}`}>
                  <Flag className="inline h-3 w-3 mr-1" />
                  {item.priority}
                </span>
              ) : null}
            </div>
            {item.impact ? (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                <span>{item.impact}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
