// Schema fragment for the subscribers slice.
//
// Compose into the consumer's root convex/schema.ts:
//
//   import { subscribersTables } from "./features/subscribers/schema";
//   export default defineSchema({ ...subscribersTables, ...others });

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const subscribersTables = {
  // Newsletter list. Email uniqueness enforced at mutation time
  // (Convex has no native unique index).
  subscribers: defineTable({
    email: v.string(),
    source: v.optional(v.string()),
    confirmed: v.boolean(),
    unsubscribeToken: v.string(),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["unsubscribeToken"])
    .index("by_createdAt", ["createdAt"]),

  // Per-email throttle for the public subscribe endpoint.
  subscriberAttempts: defineTable({
    email: v.string(),
    attemptedAt: v.number(),
  }).index("by_email_time", ["email", "attemptedAt"]),
};
