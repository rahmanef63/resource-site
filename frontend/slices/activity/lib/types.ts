export type ActivityCategory =
  | "code"
  | "ship"
  | "learn"
  | "design"
  | "ops"
  | "personal";

export type ActivitySource = "manual" | "mcp" | "gpt" | "claude";

export type ActivityRow = {
  _id: string;
  title: string;
  summary: string;
  category: string;
  project?: string;
  links?: { label: string; url: string }[];
  tags?: string[];
  source: string;
  occurredAt: number;
  durationMin?: number;
};

export type ActivityStats = {
  count: number;
  totalMinutes: number;
  byCategory: Record<string, number>;
  windowStart?: number;
  windowEnd?: number;
};

export type ActivityCopy = {
  eyebrow: string;
  title: string;
  body?: string;
  statsHeading: string;
  statsTotalEntries: string;
  statsTotalHours: string;
  statsHoursSuffix: string;
  emptyTitle: string;
  emptyBody: string;
  weekLabelTemplate: string; // e.g. "{year} · Week {week}"
  entriesSuffix: string;
  viaPrefix: string;
};

export type CategoryLabelMap = Partial<Record<string, string>>;

export type ActivityFeedProps = {
  rows: ActivityRow[];
  stats?: ActivityStats | null;
  /** All user-facing copy. Defaults to English. */
  copy?: Partial<ActivityCopy>;
  /** Per-category display labels. Defaults to title-case of the enum key. */
  categoryLabels?: CategoryLabelMap;
  /** BCP-47 locale for date/time formatting. Default `"en-US"`. */
  locale?: string;
};
