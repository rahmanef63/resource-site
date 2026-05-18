import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

export const upsertFromWebhook = internalMutation({
  args: {
    calBookingId: v.string(),
    title: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    attendeeEmail: v.string(),
    attendeeName: v.optional(v.string()),
    status: v.union(v.literal("confirmed"), v.literal("rescheduled"), v.literal("cancelled")),
    rawPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_calBookingId", (q) => q.eq("calBookingId", args.calBookingId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return ctx.db.insert("bookings", args);
  },
});
