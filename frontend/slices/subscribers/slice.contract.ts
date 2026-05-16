/**
 * subscribers slice contract.
 *
 * Backend-only newsletter list. Public subscribe endpoint protected by
 * honeypot + per-email throttle; admin queries gated by convex-auth peer.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "subscribers",
  version: "0.1.0",
  category: "email",
  kind: "backend",
  provides: {
    components: [],
    utils: [],
    hooks: [],
    convex: {
      tables: ["subscribers", "subscriberAttempts"],
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
