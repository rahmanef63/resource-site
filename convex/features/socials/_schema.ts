// Schema fragment for the socials slice.
//
// Compose into the consumer's root convex/_schema.ts:
//
//   import { socialsTables } from "./features/socials/_schema";
//   export default defineSchema({ ...socialsTables, ...others });
//
// Single source of truth for every social/profile presence. Drives:
//   - JSON-LD Person.sameAs (entity-graph seed for Google)
//   - <link rel="me"> tags (IndieWeb verification)
//   - Footer + contact + about UI surfaces
// `platform` is a canonical id (lowercased), used to pick an icon
// and to dedupe on URL. `featured` flips a row into the prominent
// hero/footer slots; non-featured rows still render in the long list.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const socialsTables = {
  socialLinks: defineTable({
    platform: v.string(),
    url: v.string(),
    handle: v.optional(v.string()),
    label: v.optional(v.string()),
    order: v.number(),
    visible: v.boolean(),
    featured: v.optional(v.boolean()),
    // Optional IndieWeb signals.
    relMe: v.optional(v.boolean()),
    sameAs: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_visible", ["visible"])
    .index("by_url", ["url"]),
};
