import { cn } from "@/lib/utils";

import { ChangelogEntryCard } from "../components/ChangelogEntryCard";

export type ChangelogKind = "feature" | "fix" | "improvement" | "chore" | "breaking";

/** A bullet item — plain string OR an object that points back to a
 *  catalog entry. When `slug` is set the BulletList renders the text as
 *  a clickable Link to `/slices/<slug>` (kind="slice", default) or
 *  `/layouts/<slug>` (kind="template"). */
export type ChangelogBullet =
  | string
  | {
      text: string;
      /** Catalog slug — when set, bullet becomes a link. */
      slug?: string;
      /** Catalog kind. Decides URL path. Default "slice". */
      kind?: "slice" | "template";
      /** Override generated href entirely (e.g. external link). */
      href?: string;
    };

export type ChangelogEntry = {
  id: string;
  version: string;
  date: number;
  kind: ChangelogKind;
  title: string;
  body: string;
  /** Optional bullet items rendered as a list below the body. */
  bullets?: ChangelogBullet[];
  /** Optional grouped sections within an entry. Keys become subheadings. */
  groups?: { heading: string; bullets: ChangelogBullet[] }[];
};

export type ChangelogFeedSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  entries: ChangelogEntry[];
  /** Sort newest-first by date if true. Default true. */
  sortDescending?: boolean;
  /** Cap entries shown. Useful for "Recent updates" excerpts on home pages. */
  limit?: number;
  layout?: "timeline" | "cards" | "list";
  className?: string;
};

function formatRail(ms: number): { day: string; month: string; year: string } {
  const d = new Date(ms);
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    year: d.toLocaleDateString("en-US", { year: "numeric" }),
  };
}

function TimelineRow({ entry }: { entry: ChangelogEntry }) {
  const r = formatRail(entry.date);
  return (
    <div
      id={entry.id}
      className="scroll-mt-24 grid grid-cols-[6rem_1fr] gap-6 md:grid-cols-[8rem_1fr] md:gap-10"
    >
      <div className="flex flex-col items-end pt-1 text-right">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {r.month}
        </span>
        <span className="text-2xl font-semibold tabular-nums text-foreground">{r.day}</span>
        <span className="text-xs text-muted-foreground">{r.year}</span>
      </div>
      <div className="relative border-l pl-6 md:pl-8">
        <span
          aria-hidden
          className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-foreground"
        />
        <ChangelogEntryCard entry={entry} variant="timeline" />
      </div>
    </div>
  );
}

function prepareEntries(
  entries: ChangelogEntry[],
  sortDescending: boolean,
  limit?: number,
): ChangelogEntry[] {
  const sorted = [...entries].sort((a, b) =>
    sortDescending ? b.date - a.date : a.date - b.date,
  );
  return typeof limit === "number" ? sorted.slice(0, Math.max(0, limit)) : sorted;
}

export function ChangelogFeedSection({
  eyebrow,
  title = "Changelog",
  subtitle,
  entries,
  sortDescending = true,
  limit,
  layout = "timeline",
  className,
}: ChangelogFeedSectionProps) {
  const visible = prepareEntries(entries, sortDescending, limit);
  const showHeader = Boolean(eyebrow || title || subtitle);

  return (
    <section className={cn("w-full px-6 py-16 md:py-24", className)}>
      <div className="mx-auto max-w-4xl">
        {showHeader ? (
          <header className="mb-12 flex flex-col gap-3">
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

        {layout === "timeline" ? (
          <div className="flex flex-col gap-12">
            {visible.map((entry) => (
              <TimelineRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : layout === "list" ? (
          <div className="flex flex-col divide-y">
            {visible.map((entry) => (
              <ChangelogEntryCard key={entry.id} entry={entry} variant="list" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {visible.map((entry) => (
              <ChangelogEntryCard key={entry.id} entry={entry} variant="cards" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
