import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("paid"),
  v.literal("overdue"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanInvoices").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanInvoices")),
    projectId: v.string(),
    clientId: v.string(),
    number: v.string(),
    amountLabel: v.string(),
    ppnLabel: v.string(),
    totalLabel: v.string(),
    status: STATUS,
    dueAt: v.number(),
    issuedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanInvoices", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanInvoices") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
