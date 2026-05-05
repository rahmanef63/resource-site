"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  cta,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {cta && (
        <Button asChild variant="ghost" className="gap-1">
          <Link href={cta.href}>
            {cta.label} <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
