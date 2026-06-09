import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(
  v.literal("sponsor"),
  v.literal("affiliate"),
  v.literal("product"),
  v.literal("course"),
  v.literal("subscription"),
);

// --- sources ---
export const listSources = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorMonetizationSources").take(100),
});

export const upsertSource = mutation({
  args: {
    id: v.optional(v.id("kreatorMonetizationSources")),
    kind: KIND,
    label: v.string(),
    amountIdr: v.number(),
    share: v.number(),
    growth: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorMonetizationSources", data);
  },
});

export const removeSource = mutation({
  args: { id: v.id("kreatorMonetizationSources") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// --- months ---
export const listMonths = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorMonetizationMonths").take(100),
});

export const upsertMonth = mutation({
  args: {
    id: v.optional(v.id("kreatorMonetizationMonths")),
    period: v.string(),
    amountIdr: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorMonetizationMonths", data);
  },
});

export const removeMonth = mutation({
  args: { id: v.id("kreatorMonetizationMonths") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// --- payouts ---
export const listPayouts = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorPayouts").take(100),
});

export const upsertPayout = mutation({
  args: {
    id: v.optional(v.id("kreatorPayouts")),
    source: v.string(),
    kind: KIND,
    amountIdr: v.number(),
    status: v.union(v.literal("scheduled"), v.literal("in-review"), v.literal("paid")),
    dueAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorPayouts", data);
  },
});

export const removePayout = mutation({
  args: { id: v.id("kreatorPayouts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
