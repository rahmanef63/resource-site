/**
 * feature-grid slice contract.
 *
 * Pure-UI marketing section. Prop-driven feature grid composable by any
 * template. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "feature-grid",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["FeatureGridSection", "FeatureCard"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: ["button", "card"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
