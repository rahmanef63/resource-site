"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type TemplateOption = {
  slug: string;
  title: string;
  description: string;
  category: string;
  status?:
    | "stable" | "beta" | "wip" | "draft" | "experimental"
    | "deprecated" | "coming-soon";
  previewPath?: string;
  adminPreviewPath?: string;
  defaultSurface?: "public" | "admin";
  tags?: string[];
};

/** Compact template list — single click selects (radio). Accordion holds detail. */
export function TemplatePicker({
  templates,
  selected,
  onSelect,
}: {
  templates: TemplateOption[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <section className="space-y-1">
      <header className="flex items-center gap-2 px-1 pb-2">
        <Layers className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Template
        </h3>
        <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
          {selected ? "1 picked" : "none"}
        </Badge>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            clear
          </button>
        )}
      </header>

      <ul className="space-y-1">
        {templates.map((t) => {
          const on = selected === t.slug;
          const disabled = t.status === "coming-soon";
          return (
            <li key={t.slug}>
              <div
                className={cn(
                  "rounded-md border bg-card transition-colors",
                  on && "border-foreground/40 bg-accent/30",
                  disabled && "opacity-60",
                )}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(on ? null : t.slug)}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left disabled:cursor-not-allowed"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 place-items-center rounded-full border",
                      on ? "border-foreground bg-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {on && <span className="size-1.5 rounded-full bg-background" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{t.title}</span>
                  </span>
                  {t.status && t.status !== "stable" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[9px]",
                        t.status === "coming-soon" &&
                          "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                        t.status === "draft" &&
                          "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                      )}
                    >
                      {t.status === "coming-soon" ? "soon" : "draft"}
                    </Badge>
                  )}
                  <Badge variant="outline" className="rounded-full text-[9px]">{t.category}</Badge>
                </button>

                <Accordion type="single" collapsible className="px-2.5 pb-1">
                  <AccordionItem value={t.slug} className="border-0">
                    <AccordionTrigger className="py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:no-underline">
                      details
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2">
                      <p className="text-[11px] text-muted-foreground">{t.description}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Link
                          href={`/layouts/${t.slug}`}
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          full doc <ExternalLink className="size-3" />
                        </Link>
                        {t.previewPath && (
                          <Link
                            href={t.previewPath}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            open public <ExternalLink className="size-3" />
                          </Link>
                        )}
                        {t.adminPreviewPath && (
                          <Link
                            href={t.adminPreviewPath}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            open admin <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
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
