"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  changelogHref,
  formatRelative,
  getLatestUpdate,
} from "@/lib/content/changelog-helpers";

interface Props {
  slug: string;
  kind: "slice" | "template";
  /** Variant — "badge" for inline pill, "card" for catalog grid corner. */
  variant?: "badge" | "card";
  className?: string;
}

/**
 * "Updated 3d ago" pill that links into /changelog#<releaseId>. Uses
 * lib/content/changelog-helpers.ts as SSOT — single helper, every place
 * that surfaces "this is fresh" reads from there.
 *
 * Client-only: Date.now() lives here so cacheComponents server
 * prerender doesn't trip on "current time read before uncached data".
 * Renders null when the slug has no matching changelog reference, so
 * callers can drop it in unconditionally.
 */
export function RecentlyUpdatedBadge({ slug, kind, variant = "badge", className }: Props) {
  const ref = React.useMemo(() => getLatestUpdate(slug, kind), [slug, kind]);
  // Compute label on the client so Date.now() never runs during server
  // prerender. Lazy state init runs once on mount.
  const [label, setLabel] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!ref) {
      setLabel(null);
      return;
    }
    setLabel(`Updated ${formatRelative(ref.date)}`);
  }, [ref]);

  if (!ref || !label) return null;

  const inner = (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 rounded-full px-2 text-[10px] font-medium",
        "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
        variant === "card" && "shadow-sm",
        className,
      )}
      title={`${ref.bulletText} (${ref.version})`}
    >
      <Sparkles className="size-3" /> {label}
    </Badge>
  );

  // Card variant sits inside CatalogCard, whose whole body is already a
  // <Link> — nesting another anchor is invalid HTML (hydration error)
  // and the cornerBadge container is pointer-events-none anyway. Render
  // the bare pill there; only the inline "badge" variant links out.
  if (variant === "card") return inner;

  return (
    <Link href={changelogHref(ref)} className="inline-block hover:opacity-90">
      {inner}
    </Link>
  );
}
