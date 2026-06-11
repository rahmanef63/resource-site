/**
 * activity slice contract.
 *
 * Convex-backed full slice — schema + queries + mutations under
 * `convex/features/activity/`, view component under
 * `frontend/slices/activity/`. Mutations are unauthenticated
 * (`internalMutation`); the consumer is expected to wrap them with
 * their own auth model.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "activity",
  version: "0.3.0",
  category: "data",
  kind: "full",
  provides: {
    tools: ["activity.list", "activity.stats"],
    components: ["ActivityFeed", "StatsPanel", "ActivityItem"],
    utils: ["groupByWeek", "isoWeek", "fmtDate", "fmtTime", "DEFAULT_COPY"],
    hooks: [],
    convex: {
      tables: ["activities"],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "convex", range: "^1.17" },
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
