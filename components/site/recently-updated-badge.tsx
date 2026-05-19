import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelative, getLatestUpdate } from "@/lib/content/changelog-helpers";

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
 * Renders null when the slug has no matching changelog reference, so
 * callers can drop it in unconditionally.
 */
export function RecentlyUpdatedBadge({ slug, kind, variant = "badge", className }: Props) {
  const ref = getLatestUpdate(slug, kind);
  if (!ref) return null;
  const label = `Updated ${formatRelative(ref.date)}`;

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

  return (
    <Link href={`/changelog#${ref.releaseId}`} className="inline-block hover:opacity-90">
      {inner}
    </Link>
  );
}
