import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Read-only KPI snapshots powering /admin/analytics. No admin CRUD in the
// reducer — these are seeded once and read by the store. `upsert`/`remove`
// exist for backup/restore symmetry but aren't wired to any UI action.
export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasAnalytics").take(50),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasAnalytics").take(50),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasAnalytics")),
    week: v.string(),
    mrrCents: v.number(),
    newCustomers: v.number(),
    churnedCustomers: v.number(),
    trials: v.number(),
    trialsConverted: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasAnalytics", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasAnalytics") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
