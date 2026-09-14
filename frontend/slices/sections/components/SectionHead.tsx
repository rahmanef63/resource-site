import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionHead({ eyebrow, title, subtitle, align = "left", className }: {
  eyebrow?: string; title: string; subtitle?: string; align?: "left" | "center"; className?: string;
}) {
  return <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "mb-10 max-w-xl", className)}>
    {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p> : null}
    <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
    {subtitle ? <p className="mt-2 text-base text-muted-foreground md:text-lg">{subtitle}</p> : null}
  </div>;
}
