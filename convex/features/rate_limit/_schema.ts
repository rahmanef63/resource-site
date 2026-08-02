// Schema fragment for the rate-limit slice.
//
// Compose into the consumer's root convex/_schema.ts:
//
//   import { rateLimitTables } from "./features/rate_limit/_schema";
//   export default defineSchema({ ...rateLimitTables, ...others });
//
// Per-key request counter. Keys are caller-defined namespaces like
// `csp:1.2.3.4`, `mcp:1.2.3.4`, `oauth_token:1.2.3.4`. Replaces any
// single-replica in-memory Map — moving to Convex lets the project run
// multiple Next replicas without every replica having its own bucket.
// Pruned by the `rate-limit:prune expired` cron in convex/crons.ts.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const rateLimitTables = {
  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    resetAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_resetAt", ["resetAt"]),
};
