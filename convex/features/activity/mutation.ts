// activity slice — admin mutations.
//
// IMPORTANT: these mutations are NOT auth-gated. The slice ships
// portable CRUD primitives; the consumer MUST wrap them with an
// auth-gated public mutation (or call from an `httpAction` after
// validating the request bearer / OAuth token).
//
// Pattern in consumer code:
//
//   import { mutation } from "../_generated/server";
//   import { requireAdmin } from "@/features/convex-auth/server/admin";
//   import { create as activityCreate } from "../features/activity/mutations";
//   export const createActivity = mutation({
//     args: { token: v.string(), ...createArgs },
//     handler: async (ctx, { token, ...args }) => {
//       await requireAdmin(ctx, token);
//       return activityCreate(ctx, args);
//     },
//   });
//
// Alternatively expose the raw mutations directly if your consumer's
// auth model is httpAction-only.

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import {
  categoryUnion,
  sourceUnion,
  visibilityUnion,
} from "./_schema";

const shape = {
  title: v.string(),
  summary: v.string(),
  category: categoryUnion,
  project: v.optional(v.string()),
  links: v.optional(
    v.array(v.object({ label: v.string(), url: v.string() })),
  ),
  tags: v.optional(v.array(v.string())),
  source: sourceUnion,
  occurredAt: v.number(),
  durationMin: v.optional(v.number()),
  visibility: visibilityUnion,
};

// Public-mutation-shaped exports — caller is expected to authenticate
// BEFORE invoking these (see header doc).
export const create = internalMutation({
  args: shape,
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("activities", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = internalMutation({
  args: {
    id: v.id("activities"),
    patch: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      category: v.optional(categoryUnion),
      project: v.optional(v.string()),
      links: v.optional(
        v.array(v.object({ label: v.string(), url: v.string() })),
      ),
      tags: v.optional(v.array(v.string())),
      source: v.optional(sourceUnion),
      occurredAt: v.optional(v.number()),
      durationMin: v.optional(v.number()),
      visibility: v.optional(visibilityUnion),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
    return { success: true };
  },
});

export const remove = internalMutation({
  args: { id: v.id("activities") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

// Idempotent seed — only inserts when the table is empty. Use from a
// consumer-side admin seeder action to backfill demo data.
export const seed = internalMutation({
  args: { items: v.array(v.object(shape)) },
  handler: async (ctx, { items }) => {
    const existing = await ctx.db.query("activities").first();
    if (existing) return { success: false, message: "Already seeded" };
    const now = Date.now();
    for (const item of items) {
      await ctx.db.insert("activities", {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { success: true, count: items.length };
  },
});
