/**
 * pricing-page slice contract.
 *
 * Pure-UI marketing pricing section. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "pricing-page",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["PricingSection", "PricingTier", "PricingFAQ"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: ["button", "card", "accordion"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
