export { default as ActivityFeed } from "./views/ActivityFeed";
export { StatsPanel } from "./components/StatsPanel";
export { ActivityItem } from "./components/ActivityItem";
export { groupByWeek, isoWeek } from "./lib/grouping";
export { fmtDate, fmtTime } from "./lib/format";
export { DEFAULT_COPY, DEFAULT_CATEGORY_LABELS } from "./lib/defaults";
export type {
  ActivityRow,
  ActivityStats,
  ActivityCopy,
  ActivityCategory,
  ActivitySource,
  ActivityFeedProps,
  CategoryLabelMap,
} from "./lib/types";
export { activityTools, type ActivityToolsCtx } from "./lib/tools";
