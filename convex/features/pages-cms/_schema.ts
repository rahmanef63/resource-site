// pages-cms slice — OPTIONAL Convex backend (copy-source).
//
// The pages-cms slice ships pure-client (localStorage adapter) by
// default. This dir is COPY-SOURCE for consumers who want server-side
// persistence: spread `pagesCmsTables` into YOUR root schema —
//
//   import { pagesCmsTables } from "../features/pages-cms/_schema";
//   export default defineSchema({
//     ...pagesCmsTables,
//     // ...your other tables
//   });
//
// rr itself does NOT compose this into convex/schema.ts (CLAUDE.md Hard
// Rule 6 — the library stays modular, the site demo stays localStorage).
//
// A page is a slug + metadata + an ordered list of blocks. Blocks are
// stored as an opaque JSON array (`v.any()`) so the 11 (or more) block
// kinds don't need a Convex validator per kind — the frontend
// `PageBlock` discriminated union is the source of truth.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const statusUnion = v.union(v.literal("draft"), v.literal("published"));

// Editable page fields — shared by the table def + create mutation args.
export const pageContentShape = {
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  // Ordered block list. Opaque to Convex; validated by the frontend
  // PageBlock union. Each element is { kind, ...payload }.
  blocks: v.array(v.any()),
  status: statusUnion,
  systemPage: v.optional(v.boolean()),
  isLanding: v.optional(v.boolean()),
  duplicatedFrom: v.optional(v.string()),
};

// All-optional mirror for the update patch.
export const pagePatchShape = {
  slug: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  blocks: v.optional(v.array(v.any())),
  status: v.optional(statusUnion),
  systemPage: v.optional(v.boolean()),
  isLanding: v.optional(v.boolean()),
  duplicatedFrom: v.optional(v.string()),
};

export const pagesCmsTables = {
  cmsPages: defineTable({
    ...pageContentShape,
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_updated", ["updatedAt"]),
};
