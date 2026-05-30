/**
 * event-tracking slice contract.
 *
 * Nav-registered analytics stub — ships `config.ts` (defineFeature) only.
 * The full event SDK (emitter + Convex `events` table) is sourced from
 * template-base on demand; until wired the slice exposes no runtime surface.
 * Contract present so audit:slices boundary coverage stays complete.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "event-tracking",
  version: "0.0.1",
  category: "data",
  kind: "ui",
  provides: {
    components: [],
    utils: [],
    hooks: [],
    convex: {
      tables: [],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
