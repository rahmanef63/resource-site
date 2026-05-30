/**
 * rbac-roles slice contract.
 *
 * Nav-registered user-management stub — ships `config.ts` (defineFeature)
 * only. Role/permission tables + admin UI are sourced from superspace
 * (convex/workspace/{permissions,roles.config}) on demand; until wired the
 * slice exposes no runtime surface. Contract present so audit:slices
 * boundary coverage stays complete.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "rbac-roles",
  version: "0.0.1",
  category: "auth",
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
