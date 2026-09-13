export { default as ActivityFeed } from "./components/ActivityFeed.svelte";
export { default as ActivityItem } from "./components/ActivityItem.svelte";
export { default as StatsPanel } from "./components/StatsPanel.svelte";
export { activityFeature } from "../activity/config";
export { groupByWeek, isoWeek, type WeekGroup } from "../activity/lib/grouping";
export { fmtDate, fmtTime } from "../activity/lib/format";
export { activityStatItems, type ActivityStatItem } from "../activity/lib/stats";
export { DEFAULT_COPY, DEFAULT_CATEGORY_LABELS } from "../activity/lib/defaults";
export type {
  ActivityRow,
  ActivityStats,
  ActivityCopy,
  ActivityCategory,
  ActivitySource,
  ActivityFeedProps,
  CategoryLabelMap,
} from "../activity/lib/types";
export { activityTools, type ActivityToolsCtx } from "../activity/lib/tools";
