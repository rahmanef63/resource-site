/**
 * hero slice contract.
 *
 * Pure-UI editorial landing hero. Props-driven — no Convex tables,
 * no env, no shadcn deps.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "hero",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["HeroView"],
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
