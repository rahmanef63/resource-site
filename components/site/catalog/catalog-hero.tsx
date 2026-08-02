import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared hero block for every catalog landing page (/slices, /templates,
 * /layouts, plus the home if it adopts the same shape). Mirrors shadcn/ui's
 * "preset pill → big title → subtitle → 2 CTAs" pattern on https://ui.shadcn.com.
 *
 * `commands` renders as inline code chips below the CTAs — used by /slices to
 * surface the install + lift commands prominently.
 */
export type CatalogHeroCta = { label: string; href: string };

export function CatalogHero({
  pill,
  pillHref,
  icon: Icon,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  commands,
}: {
  pill?: string;
  pillHref?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: React.ReactNode;
  primaryCta?: CatalogHeroCta;
  secondaryCta?: CatalogHeroCta;
  commands?: string[];
}) {
  const pillNode = pill ? (
    pillHref ? (
      <Link
        href={pillHref}
        className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
      >
        {pill} <ArrowRight className="size-3" />
      </Link>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {pill}
      </span>
    )
  ) : null;

  return (
    <div className="space-y-5">
      {pillNode}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-7 text-muted-foreground" />}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="max-w-2xl text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap items-center gap-2">
          {primaryCta && (
            <Button asChild size="sm">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          )}
          {secondaryCta && (
            <Button asChild size="sm" variant="outline">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      )}
      {commands && commands.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {commands.map((c) => (
            <code
              key={c}
              className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
            >
              {c}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}
