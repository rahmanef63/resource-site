import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("agencyNewsletters").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyNewsletters")),
    subject: v.string(),
    preheader: v.string(),
    body: v.string(),
    status: STATUS,
    sentAt: v.number(),
    recipients: v.number(),
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("agencyNewsletters", data);
  },
});

export const send = mutation({
  args: { id: v.id("agencyNewsletters") },
  handler: async (ctx, { id }) => {
    const subs = await ctx.db
      .query("agencySubscribers")
      .withIndex("by_email")
      .collect();
    const recipients = subs.filter((s) => s.status === "confirmed").length;
    await ctx.db.patch(id, { status: "sent", sentAt: Date.now(), recipients });
  },
});

export const remove = mutation({
  args: { id: v.id("agencyNewsletters") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
