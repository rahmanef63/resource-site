import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Generic catalog card — thumbnail slot above, title + description + tags
 * below. Used by /templates, /layouts, /slices, /recipes.
 */
export function CatalogCard({
  href,
  title,
  description,
  tags = [],
  thumbnail,
  meta,
  cornerBadge,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  tags?: string[];
  thumbnail: React.ReactNode;
  /** Optional small line shown above the title (e.g., source, version). */
  meta?: React.ReactNode;
  /** Optional overlay pinned to the top-right of the thumbnail — e.g. a
   *  freshness badge. Renders null gracefully when undefined. */
  cornerBadge?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-border/70 bg-card/80 p-0 transition-[border-color,background-color,box-shadow] duration-200 hover:border-foreground/20 hover:bg-card hover:shadow-sm focus-within:ring-[3px] focus-within:ring-ring/40",
        className,
      )}
    >
      <div className="relative">
        {thumbnail}
        {cornerBadge && (
          <div className="pointer-events-none absolute right-2 top-2 z-20">
            <div className="pointer-events-auto">{cornerBadge}</div>
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-4 sm:p-5">
        {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-6 tracking-[-0.01em]">
            <Link
              href={href}
              className="rounded-sm focus-visible:outline-none after:absolute after:inset-0 after:z-0"
            >
              <span className="relative z-10">{title}</span>
            </Link>
          </h3>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
        </div>
        {description && (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full text-[10px]">
                {t}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="rounded-full text-[10px] text-muted-foreground">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
