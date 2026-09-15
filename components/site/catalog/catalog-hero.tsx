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
        className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {pill} <ArrowRight className="size-3" />
      </Link>
    ) : (
      <span className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
          <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {subtitle}
          </p>
        )}
      </div>
      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap items-center gap-2">
          {primaryCta && (
            <Button asChild size="lg" className="min-h-10">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          )}
          {secondaryCta && (
            <Button asChild size="lg" variant="outline" className="min-h-10">
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
              className="max-w-full overflow-x-auto whitespace-nowrap rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
            >
              {c}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}
