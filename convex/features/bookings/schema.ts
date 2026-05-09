import { defineTable } from "convex/server";
import { v } from "convex/values";

export const bookingsTables = {
  bookings: defineTable({
    calBookingId: v.string(),
    title: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    attendeeEmail: v.string(),
    attendeeName: v.optional(v.string()),
    status: v.union(v.literal("confirmed"), v.literal("rescheduled"), v.literal("cancelled")),
    rawPayload: v.optional(v.any()),
  })
    .index("by_calBookingId", ["calBookingId"])
    .index("by_startsAt", ["startsAt"]),
};
