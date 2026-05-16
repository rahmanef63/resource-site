/**
 * rate-limit slice contract.
 *
 * Backend-only — exposes Convex schema + mutations, no UI components.
 * Consumer wires `_pruneExpired` into convex/crons.ts on a 5-min cadence
 * and composes `rateLimitTables` into the root schema.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "rate-limit",
  version: "0.1.0",
  category: "infra",
  kind: "backend",
  provides: {
    components: [],
    utils: [],
    hooks: [],
    convex: {
      tables: ["rateLimits"],
      rbac: [],
    },
  },
  requires: {
    deps: [{ npm: "convex", range: "^1.16.0" }],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
