"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqEntry = { q: React.ReactNode; a: React.ReactNode };

type PreviewFaqProps = {
  items: FaqEntry[];
  /** Single-open (default) vs multi-open. Matches shadcn Accordion's type. */
  type?: "single" | "multiple";
  /** Default open value(s). For type=single use a string; multiple an array. */
  defaultValue?: string | string[];
  /** Outer chrome: "card" wraps in a shadcn Card; "plain" no wrapper. */
  chrome?: "card" | "plain";
  /** Stagger value (used for keys + default open) — pass index. */
  className?: string;
  itemClassName?: string;
};

/**
 * FAQ accordion preview block — thin wrapper over shadcn Accordion.
 * Used by every accordion-* preview variant so the chevron + animation
 * stay identical and consumers don't reimplement open-state logic.
 */
export function PreviewFaq({
  items,
  type = "single",
  defaultValue,
  chrome = "card",
  className,
  itemClassName,
}: PreviewFaqProps) {
  const body = (
    <Accordion
      type={type as "single"}
      collapsible={type === "single" ? true : undefined}
      defaultValue={defaultValue as string | undefined}
      className={cn(chrome === "card" ? "px-5" : "", className)}
    >
      {items.map((it, i) => (
        <AccordionItem key={i} value={`item-${i}`} className={itemClassName}>
          <AccordionTrigger className="hover:no-underline">{it.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
  if (chrome === "plain") return body;
  return <Card className="overflow-hidden p-0">{body}</Card>;
}
