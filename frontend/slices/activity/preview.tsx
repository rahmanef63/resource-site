"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import ActivityFeed from "./views/ActivityFeed";
import type { ActivityRow, ActivityStats } from "./lib/types";

const DAY = 86_400_000;
const base = Date.parse("2026-06-01");

const ROWS: ActivityRow[] = [
  { _id: "1", title: "Shipped variant previews", summary: "Backfilled VP widgets across the catalog.", category: "ship", project: "resources", source: "claude", occurredAt: base, durationMin: 90 },
  { _id: "2", title: "Wired comment adapters", summary: "Props-driven bindings, no convex coupling.", category: "code", project: "resources", source: "manual", occurredAt: base - DAY, durationMin: 45 },
  { _id: "3", title: "Read OKLch color theory", summary: "Perceptual ramps for theme presets.", category: "learn", source: "gpt", occurredAt: base - 9 * DAY, durationMin: 30 },
  { _id: "4", title: "Refined sidebar density", summary: "Compact vs comfortable spacing pass.", category: "design", project: "resources", source: "manual", occurredAt: base - 10 * DAY, durationMin: 60 },
];

const STATS: ActivityStats = {
  count: 4,
  totalMinutes: 225,
  byCategory: { ship: 1, code: 1, learn: 1, design: 1 },
};

const preview: SlicePreviewModule = {
  ActivityFeed: ({ variant }) => {
    const scenario = variant.scenario ?? "with-stats";
    const rows = scenario === "empty" ? [] : ROWS;
    const stats = scenario === "with-stats" ? STATS : null;
    return (
      <div className="p-4">
        <ActivityFeed
          rows={rows}
          stats={stats}
          copy={{ eyebrow: "Log", title: "This week", body: "What I'm working on." }}
        />
      </div>
    );
  },
};
export default preview;
