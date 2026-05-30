import Link from "next/link";
import { ArrowUpRight, Clock, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityCopy, ActivityRow, CategoryLabelMap } from "../lib/types";
import { fmtDate, fmtTime } from "../lib/format";

type Props = {
  row: ActivityRow;
  copy: ActivityCopy;
  categoryLabels: CategoryLabelMap;
  locale?: string;
  isLast?: boolean;
};

export function ActivityItem({
  row,
  copy,
  categoryLabels,
  locale,
  isLast,
}: Props) {
  const r = row;
  const hasTagsOrLinks =
    (r.tags && r.tags.length > 0) || (r.links && r.links.length > 0);
  return (
    <li
      className={cn(
        "p-6 lg:p-7 hover:bg-foreground hover:text-background transition-colors group/row",
        !isLast && "border-b-2",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider font-medium opacity-70 mb-2">
        <span className="border-2 border-current rounded-sm px-2 py-0.5">
          {categoryLabels[r.category] ?? r.category}
        </span>
        <time dateTime={new Date(r.occurredAt).toISOString()}>
          {fmtDate(r.occurredAt, locale)} · {fmtTime(r.occurredAt, locale)}
        </time>
        {r.project ? <span>· {r.project}</span> : null}
        {typeof r.durationMin === "number" && r.durationMin > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {r.durationMin}m
          </span>
        ) : null}
        <span className="ml-auto opacity-60">
          {copy.viaPrefix} {r.source}
        </span>
      </div>
      <h3 className="font-serif text-xl lg:text-2xl leading-tight mb-2">
        {r.title}
      </h3>
      {r.summary ? (
        <p className="text-sm opacity-85 leading-relaxed">{r.summary}</p>
      ) : null}
      {hasTagsOrLinks ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
          {r.tags?.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 border-2 border-current rounded-sm px-2 py-0.5"
            >
              <TagIcon className="w-3 h-3" /> {t}
            </span>
          ))}
          {r.links?.map((l) => (
            <Link
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 border-2 border-current rounded-sm px-2 py-0.5 hover:bg-current hover:text-background"
            >
              {l.label} <ArrowUpRight className="w-3 h-3" />
            </Link>
          ))}
        </div>
      ) : null}
    </li>
  );
}
