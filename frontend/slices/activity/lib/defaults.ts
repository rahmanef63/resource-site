import type { ActivityCopy, CategoryLabelMap } from "./types";

export const DEFAULT_COPY: ActivityCopy = {
  eyebrow: "Activity Log",
  title: "What I'm working on this week.",
  body:
    "Public productivity log — code shipped, experiments, client work, learning sessions. Updated in real time from the MCP + GPT/Claude workflow.",
  statsHeading: "Last 7 days",
  statsTotalEntries: "Total entries",
  statsTotalHours: "Total duration",
  statsHoursSuffix: "h",
  emptyTitle: "No activity logged yet.",
  emptyBody:
    "This page will populate automatically as activities flow in.",
  weekLabelTemplate: "{year} · Week {week}",
  entriesSuffix: "entries",
  viaPrefix: "via",
};

export const DEFAULT_CATEGORY_LABELS: CategoryLabelMap = {
  code: "Code",
  ship: "Ship",
  learn: "Learn",
  design: "Design",
  ops: "Ops",
  personal: "Personal",
};
