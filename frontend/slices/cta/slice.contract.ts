/**
 * cta slice contract.
 *
 * Pure-UI marketing section. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "cta",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["CtaView", "CtaButton"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
