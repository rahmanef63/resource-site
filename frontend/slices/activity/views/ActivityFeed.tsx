import type { ActivityFeedProps } from "../lib/types";
import { DEFAULT_COPY, DEFAULT_CATEGORY_LABELS } from "../lib/defaults";
import { groupByWeek } from "../lib/grouping";
import { StatsPanel } from "../components/StatsPanel";
import { ActivityItem } from "../components/ActivityItem";

/**
 * Public productivity log — lists user-facing activities grouped by ISO
 * week. Designed to maximise SEO so the question "what is <person>
 * working on this week?" lands here.
 *
 * All user-facing copy is prop-driven via `copy` (defaults to English).
 * Per-category labels are prop-driven via `categoryLabels`. BCP-47
 * locale for date/time via `locale` (default `"en-US"`).
 */
export default function ActivityFeed({
  rows,
  stats,
  copy: copyOverride,
  categoryLabels: categoryLabelsOverride,
  locale = "en-US",
}: ActivityFeedProps) {
  const copy = { ...DEFAULT_COPY, ...copyOverride };
  const categoryLabels = {
    ...DEFAULT_CATEGORY_LABELS,
    ...categoryLabelsOverride,
  };
  const groups = groupByWeek(rows, copy.weekLabelTemplate);

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="mb-8 space-y-4">
          <div className="text-[10px] uppercase tracking-wider opacity-60">
            {copy.eyebrow}
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl leading-tight">
            {copy.title}
          </h1>
          {copy.body ? (
            <p className="max-w-2xl text-base opacity-80 leading-relaxed">
              {copy.body}
            </p>
          ) : null}
        </div>

        {stats ? (
          <StatsPanel
            stats={stats}
            copy={copy}
            categoryLabels={categoryLabels}
          />
        ) : null}

        {groups.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <p className="font-serif text-2xl">{copy.emptyTitle}</p>
            <p className="mt-3 text-sm opacity-70">{copy.emptyBody}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.key}>
                <div className="border-b-2 pb-3 mb-6 flex items-baseline justify-between">
                  <h2 className="font-serif text-2xl lg:text-3xl">{g.label}</h2>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">
                    {g.rows.length} {copy.entriesSuffix}
                  </span>
                </div>
                <ol className="space-y-0 border-2 rounded-lg overflow-hidden">
                  {g.rows.map((r, i) => (
                    <ActivityItem
                      key={r._id}
                      row={r}
                      copy={copy}
                      categoryLabels={categoryLabels}
                      locale={locale}
                      isLast={i === g.rows.length - 1}
                    />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
