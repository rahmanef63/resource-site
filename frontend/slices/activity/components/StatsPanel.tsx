import type { ActivityCopy, ActivityStats, CategoryLabelMap } from "../lib/types";

type Props = {
  stats: ActivityStats;
  copy: ActivityCopy;
  categoryLabels: CategoryLabelMap;
};

export function StatsPanel({ stats, copy, categoryLabels }: Props) {
  const totalHours = Math.round(stats.totalMinutes / 60);
  return (
    <div className="border-2 rounded-lg p-4 lg:p-6 mb-8 bg-background">
      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-3">
        {copy.statsHeading}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Cell label={copy.statsTotalEntries} value={String(stats.count)} />
        {stats.totalMinutes > 0 ? (
          <Cell
            label={copy.statsTotalHours}
            value={`${totalHours}${copy.statsHoursSuffix}`}
          />
        ) : null}
        {Object.entries(stats.byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, n]) => (
            <Cell
              key={cat}
              label={categoryLabels[cat] ?? cat}
              value={String(n)}
            />
          ))}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider opacity-60">
        {label}
      </div>
      <div className="font-serif text-2xl">{value}</div>
    </div>
  );
}
