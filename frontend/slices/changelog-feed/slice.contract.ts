/**
 * changelog-feed slice contract.
 *
 * Pure-UI section. Prop-driven changelog renderer composable by any template
 * for /changelog or /whats-new pages. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "changelog-feed",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["ChangelogFeedSection", "ChangelogEntryCard"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [],
    shadcn: ["badge", "card", "separator"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
