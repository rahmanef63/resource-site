// Schema fragment for the telemetry slice.
//
// Composed into the consumer's root convex/schema.ts via:
//
//   import { telemetryTables } from "./features/telemetry/schema";
//   export default defineSchema({ ...telemetryTables, ...others });
//
// Privacy model:
//   - `consumer_hash` is sha256(consumerName + UTC day). It rotates daily so
//     even a single consumer cannot be re-identified across days from their
//     hash alone.
//   - No PII fields, no IP/UA, no slice payload over 1 KB.
//   - Retention: 30 days enforced by a cron-style cleanup mutation (not
//     included in this slice — wire up to the consumer's scheduled jobs).

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const telemetryTables = {
  telemetry_events: defineTable({
    slug: v.string(),
    event_type: v.union(
      v.literal("adopt"),
      v.literal("audit_pass"),
      v.literal("audit_fail"),
      v.literal("remove"),
      v.literal("drift"),
    ),
    consumer_hash: v.string(),
    payload: v.optional(v.string()),
    received_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_consumer_hour", ["consumer_hash", "received_at"]),

  telemetry_aggregates: defineTable({
    slug: v.string(),
    date: v.string(), // YYYY-MM-DD
    adopt_count: v.number(),
    audit_pass_count: v.number(),
    audit_fail_count: v.number(),
    consumer_count: v.number(),
  }).index("by_slug_date", ["slug", "date"]),
};
