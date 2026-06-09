import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PROVIDER = v.union(
  v.literal("slack"),
  v.literal("linear"),
  v.literal("hubspot"),
  v.literal("resend"),
  v.literal("stripe"),
  v.literal("github"),
  v.literal("intercom"),
  v.literal("segment"),
);
const STATUS = v.union(
  v.literal("connected"),
  v.literal("disconnected"),
  v.literal("error"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasIntegrations").take(50),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasIntegrations").take(50),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasIntegrations")),
    provider: PROVIDER,
    label: v.string(),
    status: STATUS,
    webhookUrl: v.string(),
    scopes: v.array(v.string()),
    lastSyncAt: v.number(),
    secretHint: v.string(),
    logo: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasIntegrations", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasIntegrations") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
