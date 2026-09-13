import type { ActivityCopy, ActivityStats, CategoryLabelMap } from "./types";

export type ActivityStatItem = {
  key: string;
  label: string;
  value: string;
};

export function activityStatItems(
  stats: ActivityStats,
  copy: ActivityCopy,
  categoryLabels: CategoryLabelMap,
): ActivityStatItem[] {
  const items: ActivityStatItem[] = [
    { key: "entries", label: copy.statsTotalEntries, value: String(stats.count) },
  ];

  if (stats.totalMinutes > 0) {
    items.push({
      key: "duration",
      label: copy.statsTotalHours,
      value: `${Math.round(stats.totalMinutes / 60)}${copy.statsHoursSuffix}`,
    });
  }

  items.push(
    ...Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([category, count]) => ({
        key: `category:${category}`,
        label: categoryLabels[category] ?? category,
        value: String(count),
      })),
  );

  return items;
}
