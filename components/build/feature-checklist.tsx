"use client";

import * as React from "react";
import { Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FeatureOption = {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Templates that already use this feature (informational badge). */
  usedBy?: string[];
};

export function FeatureChecklist({
  features,
  selected,
  onToggle,
  highlightTemplate,
}: {
  features: FeatureOption[];
  selected: string[];
  onToggle: (slug: string) => void;
  /** Optional template slug — features that list it in usedBy get a "fits" badge. */
  highlightTemplate?: string | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Boxes className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Features</h3>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {selected.length} / {features.length}
        </Badge>
      </div>

      <ul className="space-y-1.5">
        {features.map((f) => {
          const on = selected.includes(f.slug);
          const fits = highlightTemplate ? f.usedBy?.includes(highlightTemplate) : false;
          return (
            <li key={f.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border bg-card p-2 transition-colors",
                  on && "border-foreground/40 bg-accent/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(f.slug)}
                  className="mt-0.5 size-3.5 cursor-pointer accent-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{f.title}</span>
                    <Badge variant="outline" className="rounded-full text-[9px]">{f.category}</Badge>
                    {fits && <Badge variant="secondary" className="rounded-full text-[9px]">fits template</Badge>}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {f.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
