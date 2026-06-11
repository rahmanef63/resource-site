/**
 * empty-states slice contract.
 *
 * Pure-UI slice. One configurable EmptyState (composes shadcn Empty) plus a
 * full-page ErrorPage wrapper and per-kind presets. No Convex, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "empty-states",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    tools: ["empty-states.configure"],
    components: ["EmptyState", "ErrorPage"],
    utils: ["EMPTY_STATE_PRESETS"],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [{ npm: "lucide-react", range: "^0.400.0" }],
    shadcn: ["empty", "button"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
