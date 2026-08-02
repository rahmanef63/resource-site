"use client";

import * as React from "react";
import { Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { getCompat, type CompatStatus } from "@/lib/build/compat";

export type FeatureOption = {
  slug: string;
  title: string;
  description: string;
  category: string;
  usedBy?: string[];
};

/** Compact feature checklist — title-only by default, accordion reveals detail. */
export function FeaturePicker({
  features,
  selected,
  onToggle,
  highlightTemplate,
}: {
  features: FeatureOption[];
  selected: string[];
  onToggle: (slug: string) => void;
  highlightTemplate?: string | null;
}) {
  return (
    <section className="space-y-1">
      <header className="flex items-center gap-2 px-1 pb-2">
        <Boxes className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Features
        </h3>
        <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
          {selected.length}/{features.length}
        </Badge>
      </header>

      <ul className="space-y-1">
        {features.map((f) => {
          const on = selected.includes(f.slug);
          const fits = highlightTemplate ? f.usedBy?.includes(highlightTemplate) : false;
          const compat = getCompat(highlightTemplate ?? null, f.slug);
          return (
            <li key={f.slug}>
              <div
                className={cn(
                  "rounded-md border bg-card transition-colors",
                  on && "border-foreground/40 bg-accent/30",
                )}
              >
                <label className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onToggle(f.slug)}
                    className="size-3.5 cursor-pointer accent-foreground"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-medium">{f.title}</span>
                      {fits && (
                        <Badge variant="secondary" className="rounded-full text-[9px]">fits</Badge>
                      )}
                      {compat && <CompatBadge status={compat.status} />}
                    </span>
                  </span>
                  <Badge variant="outline" className="rounded-full text-[9px]">{f.category}</Badge>
                </label>

                <Accordion type="single" collapsible className="px-2.5 pb-1">
                  <AccordionItem value={f.slug} className="border-0">
                    <AccordionTrigger className="py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:no-underline">
                      details
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2">
                      <p className="text-[11px] text-muted-foreground">{f.description}</p>
                      {compat?.note && (
                        <p className="mt-1.5 text-[10px] italic text-muted-foreground">
                          compat: {compat.note}
                        </p>
                      )}
                      {f.usedBy?.length ? (
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          used by: {f.usedBy.join(", ")}
                        </p>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CompatBadge({ status }: { status: CompatStatus }) {
  const cls: Record<CompatStatus, string> = {
    native:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    recommended:
      "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300",
    warn:
      "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
    incompatible:
      "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300",
  };
  const label: Record<CompatStatus, string> = {
    native: "native",
    recommended: "rec",
    warn: "warn",
    incompatible: "x",
  };
  return (
    <span
      className={cn(
        "inline-flex h-3.5 items-center rounded-full border px-1 text-[9px]",
        cls[status],
      )}
      title={status}
    >
      {label[status]}
    </span>
  );
}
