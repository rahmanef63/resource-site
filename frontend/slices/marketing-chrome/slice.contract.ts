/**
 * marketing-chrome slice contract.
 *
 * Pure-UI marketing site header + footer. Config-driven, prop-only.
 * No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "marketing-chrome",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    tools: ["marketing-chrome.configure"],
    components: ["MarketingHeader", "MarketingFooter"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [{ npm: "lucide-react", range: "^0.400.0" }],
    shadcn: ["button", "sheet", "separator"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
