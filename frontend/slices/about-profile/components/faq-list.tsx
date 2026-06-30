"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AboutFaq } from "../lib/host";

// Accordion-style FAQ — one row open at a time, first row open by default.
export function FaqList({ items }: { items: AboutFaq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="rounded-lg border border-border bg-card/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="h-auto w-full justify-start gap-2 whitespace-normal px-3 py-2 text-left text-sm font-medium"
            >
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  isOpen ? "rotate-0" : "-rotate-90",
                )}
              />
              <span className="flex-1">{f.q}</span>
            </Button>
            {isOpen ? (
              <p className="px-3 pb-3 pl-9 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
