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
  className,
}: {
  href: string;
  title: string;
  description?: string;
  tags?: string[];
  thumbnail: React.ReactNode;
  /** Optional small line shown above the title (e.g., source, version). */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "h-full overflow-hidden p-0 transition hover:border-primary/40 hover:shadow-md",
          className,
        )}
      >
        {thumbnail}
        <CardContent className="space-y-2.5 p-4">
          {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug">{title}</h3>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
          </div>
          {description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.slice(0, 5).map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
