import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type {
  ChangelogBullet,
  ChangelogEntry,
  ChangelogKind,
} from "../views/ChangelogFeedSection";

export type ChangelogEntryCardProps = {
  entry: ChangelogEntry;
  /** Visual variant — matches ChangelogFeedSection layout. */
  variant?: "timeline" | "cards" | "list";
  className?: string;
};

const KIND_LABEL: Record<ChangelogKind, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  chore: "Chore",
  breaking: "Breaking",
};

const KIND_CLASS: Record<ChangelogKind, string> = {
  feature:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  improvement:
    "border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  fix:
    "border-transparent bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  chore:
    "border-transparent bg-muted text-muted-foreground",
  breaking:
    "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/25",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Paragraphs({ body }: { body: string }) {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function bulletText(b: ChangelogBullet): string {
  return typeof b === "string" ? b : b.text;
}

function bulletHref(b: ChangelogBullet): string | null {
  if (typeof b === "string") return null;
  if (b.href) return b.href;
  if (!b.slug) return null;
  return b.kind === "template" ? `/layouts/${b.slug}` : `/slices/${b.slug}`;
}

function BulletList({ items }: { items: ChangelogBullet[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="ml-5 flex list-disc flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/60">
      {items.map((b, i) => {
        const text = bulletText(b);
        const href = bulletHref(b);
        return (
          <li key={i}>
            {href ? (
              <Link
                href={href}
                className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
              >
                {text}
              </Link>
            ) : (
              text
            )}
          </li>
        );
      })}
    </ul>
  );
}

function GroupedSections({ groups }: { groups: NonNullable<ChangelogEntry["groups"]> }) {
  if (groups.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g, i) => (
        <div key={i} className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {g.heading}
          </h4>
          <BulletList items={g.bullets} />
        </div>
      ))}
    </div>
  );
}

function EntryHeader({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Badge className={cn(KIND_CLASS[entry.kind])}>{KIND_LABEL[entry.kind]}</Badge>
      <span className="font-mono text-sm font-semibold text-foreground">{entry.version}</span>
      <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
    </div>
  );
}

function EntryBody({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold leading-snug text-foreground">{entry.title}</h3>
      <Paragraphs body={entry.body} />
      {entry.bullets && entry.bullets.length > 0 ? <BulletList items={entry.bullets} /> : null}
      {entry.groups && entry.groups.length > 0 ? <GroupedSections groups={entry.groups} /> : null}
    </div>
  );
}

export function ChangelogEntryCard({
  entry,
  variant = "cards",
  className,
}: ChangelogEntryCardProps) {
  if (variant === "list") {
    return (
      <article className={cn("flex flex-col gap-3 py-6", className)}>
        <EntryHeader entry={entry} />
        <EntryBody entry={entry} />
      </article>
    );
  }

  if (variant === "timeline") {
    return (
      <article className={cn("flex flex-col gap-4", className)}>
        <EntryHeader entry={entry} />
        <EntryBody entry={entry} />
        <Separator className="mt-2" />
      </article>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-col gap-3">
        <EntryHeader entry={entry} />
      </CardHeader>
      <CardContent>
        <EntryBody entry={entry} />
      </CardContent>
    </Card>
  );
}
