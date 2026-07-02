import { defineTable } from "convex/server";
import { v } from "convex/values";
import { userFields } from "../../schema.shared";

export default {
  users: defineTable({
    ...userFields,
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    links: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          label: v.optional(v.string()),
        }),
      ),
    ),
    preferences: v.optional(v.record(v.string(), v.any())),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_user", ["userId"]),
} as const;
