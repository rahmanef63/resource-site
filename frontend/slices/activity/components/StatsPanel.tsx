import type { ActivityCopy, ActivityStats, CategoryLabelMap } from "../lib/types";
import { activityStatItems } from "../lib/stats";

type Props = {
  stats: ActivityStats;
  copy: ActivityCopy;
  categoryLabels: CategoryLabelMap;
};

export function StatsPanel({ stats, copy, categoryLabels }: Props) {
  return (
    <div className="border-2 rounded-lg p-4 lg:p-6 mb-8 bg-background">
      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-3">
        {copy.statsHeading}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {activityStatItems(stats, copy, categoryLabels).map((item) => (
          <Cell key={item.key} label={item.label} value={item.value} />
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
