/**
 * loading-states slice contract.
 *
 * Pure-UI slice. One configurable LoadingSkeleton (composes shadcn Skeleton)
 * with per-kind presets, plus a spinner-based LoadingState for in-flight work.
 * No Convex, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "loading-states",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    tools: ["loading-states.configure"],
    components: ["LoadingSkeleton", "LoadingState"],
    utils: ["LOADING_PRESETS", "LOADING_KINDS"],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [],
    shadcn: ["skeleton", "spinner"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
