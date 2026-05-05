"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TemplateOption = {
  slug: string;
  title: string;
  description: string;
  category: string;
  previewPath?: string;
  adminPreviewPath?: string;
  defaultSurface?: "public" | "admin";
  tags?: string[];
};

export function TemplateRadio({
  templates,
  selected,
  onSelect,
}: {
  templates: TemplateOption[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Template</h3>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {templates.map((t) => {
          const on = selected === t.slug;
          return (
            <li key={t.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border bg-card p-2.5 transition-colors",
                  on && "border-foreground/50 bg-accent/30",
                )}
              >
                <input
                  type="radio"
                  name="rr-template"
                  checked={on}
                  onChange={() => onSelect(t.slug)}
                  className="mt-1 size-3.5 cursor-pointer accent-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{t.title}</span>
                    <Badge variant="outline" className="rounded-full text-[9px]">{t.category}</Badge>
                    <Link
                      href={`/layouts/${t.slug}`}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                      aria-label="Open detail"
                    >
                      <ExternalLink className="size-3" />
                    </Link>
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {t.description}
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
