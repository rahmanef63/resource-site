import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FeatureCard } from "../components/FeatureCard";

export type FeatureItem = {
  id: string;
  title: string;
  body: string;
  /** Lucide icon component OR string name. String renders as bordered letter fallback. */
  icon?: LucideIcon | string;
  /** Optional image src; renders above title. */
  image?: { src: string; alt: string };
  /** Optional link CTA below body. */
  link?: { label: string; href: string };
};

export type FeatureGroup = {
  id: string;
  label: string;
  /** Optional secondary label rendered next to the heading (e.g. badges, city, type). */
  sublabel?: string;
  items: FeatureItem[];
};

export type FeatureGridSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
  /** When `layout="grouped"`, pass groups instead of (or alongside) `items`. */
  groups?: FeatureGroup[];
  /** Grid columns at lg breakpoint. Default 3. */
  columns?: 1 | 2 | 3 | 4;
  /** Visual layout variant. */
  layout?: "cards" | "minimal" | "alternating" | "grouped";
  /** Card alignment. */
  align?: "left" | "center";
  className?: string;
};

const COLS: Record<NonNullable<FeatureGridSectionProps["columns"]>, string> = {
  1: "lg:grid-cols-1",
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function AlternatingRow({ item, flip }: { item: FeatureItem; flip: boolean }) {
  const Icon = typeof item.icon !== "string" ? item.icon : undefined;
  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-2 lg:items-center",
        flip && "lg:[&>*:first-child]:order-2",
      )}
    >
      {item.image ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image src={item.image.src} alt={item.image.alt} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-video rounded-lg border bg-muted/40" aria-hidden />
      )}
      <div className="flex flex-col gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <h3 className="text-2xl font-semibold leading-tight">{item.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
        {item.link ? (
          <Button asChild variant="link" size="sm" className="h-auto self-start p-0">
            <Link href={item.link.href}>
              {item.link.label}
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CardsGrid({
  items,
  columns,
  align,
  variant,
}: {
  items: FeatureItem[];
  columns: NonNullable<FeatureGridSectionProps["columns"]>;
  align: NonNullable<FeatureGridSectionProps["align"]>;
  variant: "cards" | "minimal";
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", COLS[columns])}>
      {items.map((item) => (
        <FeatureCard
          key={item.id}
          title={item.title}
          body={item.body}
          icon={item.icon}
          image={item.image}
          link={item.link}
          variant={variant}
          align={align}
        />
      ))}
    </div>
  );
}

export function FeatureGridSection({
  eyebrow,
  title,
  subtitle,
  items = [],
  groups,
  columns = 3,
  layout = "cards",
  align = "left",
  className,
}: FeatureGridSectionProps) {
  const headerAlign = align === "center" ? "items-center text-center" : "items-start text-left";
  const showHeader = Boolean(eyebrow || title || subtitle);
  const effectiveGroups: FeatureGroup[] | undefined =
    layout === "grouped"
      ? groups ?? (items.length ? [{ id: "default", label: "", items }] : [])
      : undefined;
  const cardVariant = layout === "minimal" ? "minimal" : "cards";

  return (
    <section className={cn("w-full px-6 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-6xl">
        {showHeader ? (
          <header className={cn("mb-12 flex flex-col gap-3", headerAlign)}>
            {eyebrow ? (
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}

        {layout === "alternating" ? (
          <div className="flex flex-col gap-16">
            {items.map((item, i) => (
              <AlternatingRow key={item.id} item={item} flip={i % 2 === 1} />
            ))}
          </div>
        ) : effectiveGroups ? (
          <div className="flex flex-col gap-12">
            {effectiveGroups.map((g) => (
              <div key={g.id}>
                {g.label ? (
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-base font-medium">{g.label}</h3>
                    {g.sublabel ? (
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {g.sublabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <CardsGrid items={g.items} columns={columns} align={align} variant="cards" />
              </div>
            ))}
          </div>
        ) : (
          <CardsGrid items={items} columns={columns} align={align} variant={cardVariant} />
        )}
      </div>
    </section>
  );
}
