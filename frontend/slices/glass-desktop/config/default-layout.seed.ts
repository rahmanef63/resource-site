// glass-desktop — default placement seed (Build Plan §7, LOC-exempt seed).
// 21 instances across the two spaces; col/row = -1 so use-layout's packLayout
// assigns dense positions on load.
import type { LayoutStateV1, WidgetInstance } from "../types";

function seed(widgetId: string, space: 0 | 1, instanceId: string = widgetId): WidgetInstance {
  return { instanceId, widgetId, space, col: -1, row: -1 };
}

export const defaultLayout: LayoutStateV1 = {
  version: 1,
  instances: [
    // Space 0 — Today
    seed("clock-digital", 0),
    seed("date-badge", 0),
    seed("clock-world", 0),
    seed("timer-countdown", 0),
    seed("weather-now", 0),
    seed("weather-hourly", 0),
    seed("agenda-today", 0),
    seed("task-list", 0),
    // Space 1 — System & work
    seed("cpu-graph", 1),
    seed("ring-gauge", 1, "ring-gauge:battery"),
    seed("ring-gauge", 1, "ring-gauge:memory"),
    seed("ring-gauge", 1, "ring-gauge:storage"),
    seed("quick-toggles", 1),
    seed("net-throughput", 1),
    seed("watchlist", 1),
    seed("revenue-card", 1),
    seed("dot-heatmap", 1),
    seed("now-playing", 1),
    seed("audio-eq", 1),
    seed("contacts-row", 1),
    seed("inbox-count", 1),
  ],
};
