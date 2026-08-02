// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { query } from "./_generated/server";

// Schema fragment:
//
// publicProfiles: defineTable({
//   userId: v.id("users"),
//   slug: v.string(),
//   displayName: v.string(),
//   bio: v.optional(v.string()),
//   avatarUrl: v.optional(v.string()),
//   links: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
// }).index("by_slug", ["slug"]),

export const getPublicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db.query("publicProfiles").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    return p ?? null;
  },
});
