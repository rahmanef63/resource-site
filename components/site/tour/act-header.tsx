import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import type { Act } from "@/lib/content/tour";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";

/**
 * Shared Act chrome — the header + cross-Act nav reused by every Act page
 * (P1–P3). The page owns its own id (the literal route segment), derives
 * prev/next from the `acts` array, and hands them here. A layout under the
 * static `(act)` route group can't read which child it wraps, so the header
 * lives in a component the page invokes, not in the layout.
 */
export function ActHeader({
  act,
  prev,
  next,
}: {
  act: Act;
  prev: Act | null;
  next: Act | null;
}) {
  return (
    <div className="space-y-5">
      <Link
        href="/tour"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All acts
      </Link>
      <CatalogHero
        icon={Compass}
        title={act.title}
        subtitle={act.blurb}
        commands={["npx rahman-resources add <slug>"]}
      />
      <ActNav prev={prev} next={next} />
    </div>
  );
}

/** Bottom prev/next-Act row — also reused as the top mini-nav. */
export function ActNav({ prev, next }: { prev: Act | null; next: Act | null }) {
  if (!prev && !next) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      {prev ? (
        <Link
          href={`/tour/${prev.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/tour/${next.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition hover:gap-2"
        >
          {next.title} <ArrowRight className="size-3.5" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
