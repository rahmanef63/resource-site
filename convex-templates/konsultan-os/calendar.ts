import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(
  v.literal("session"),
  v.literal("deadline"),
  v.literal("workshop"),
  v.literal("internal"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanCalendarEvents").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanCalendarEvents")),
    title: v.string(),
    clientId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    kind: KIND,
    dayOfWeek: v.number(),
    hour: v.number(),
    durationHours: v.number(),
    location: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanCalendarEvents", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanCalendarEvents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
