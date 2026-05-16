/**
 * socials slice contract.
 *
 * Backend-only. URL-deduped social/profile rows + public read queries +
 * admin CRUD + internal items-based seed.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "socials",
  version: "0.1.0",
  category: "content",
  kind: "backend",
  provides: {
    components: [],
    utils: [],
    hooks: [],
    convex: {
      tables: ["socialLinks"],
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
