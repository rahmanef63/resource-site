/**
 * services slice contract.
 *
 * Backend-only. Public read + admin CRUD + internal seed.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "services",
  version: "0.1.0",
  category: "content",
  kind: "backend",
  provides: {
    components: [],
    utils: [],
    hooks: [],
    convex: {
      tables: ["services"],
      rbac: ["admin"],
    },
  },
  requires: {
    deps: [{ npm: "convex", range: "^1.16.0" }],
    shadcn: [],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1" }],
  },
  conflicts: [],
});
