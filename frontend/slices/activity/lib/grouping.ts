import type { ActivityRow } from "./types";

export function isoWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return { year: date.getUTCFullYear(), week };
}

export type WeekGroup = {
  key: string;
  label: string;
  rows: ActivityRow[];
};

export function groupByWeek(
  rows: ActivityRow[],
  weekLabelTemplate: string,
): WeekGroup[] {
  const buckets = new Map<string, ActivityRow[]>();
  for (const r of rows) {
    const { year, week } = isoWeek(new Date(r.occurredAt));
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    const arr = buckets.get(key) ?? [];
    arr.push(r);
    buckets.set(key, arr);
  }
  return Array.from(buckets.entries())
    .map(([key, rs]) => {
      const [year, w] = key.split("-W");
      const label = weekLabelTemplate
        .replace("{year}", year)
        .replace("{week}", w);
      return {
        key,
        label,
        rows: rs.sort((a, b) => b.occurredAt - a.occurredAt),
      };
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}
