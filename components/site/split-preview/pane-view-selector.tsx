"use client";

import * as React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { PreviewView } from "@/lib/preview-presets";
import { cn } from "@/lib/utils";

const OPTIONS: { id: PreviewView; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "mobile", label: "Mobile", Icon: Smartphone },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "desktop", label: "Desktop", Icon: Monitor },
];

interface Props {
  value: PreviewView;
  onChange: (view: PreviewView) => void;
}

/** Compact 3-icon toggle for per-pane viewport. Renders inside split-pane
 *  headers — lets users mix viewports (e.g. public mobile + admin desktop). */
export function PaneViewSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex shrink-0 rounded-md border border-border/60 bg-background/60 p-0.5">
      {OPTIONS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            title={label}
            className={cn(
              "flex size-5 items-center justify-center rounded-sm transition-colors",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="size-3" />
          </button>
        );
      })}
    </div>
  );
}
