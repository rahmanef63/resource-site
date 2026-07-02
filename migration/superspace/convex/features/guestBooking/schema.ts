import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Guest Booking Schema (minimum-viable)
 *
 * Hotel guest self-service lifecycle:
 *   pending → verified → checked-in → checked-out
 *   (any → cancelled)
 *
 * Syariah-compliance: `syariahVerified` flag + `mahramRelation` (spouse,
 * father, mother, n/a). Workspace-isolated per superspace RBAC rules.
 */

const bookingStatus = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("checked-in"),
  v.literal("checked-out"),
  v.literal("cancelled"),
)

export const guestBookingTables = {
  bookings: defineTable({
    workspaceId: v.id("workspaces"),
    bookingNumber: v.string(), // monotonic via nextCounterValue("guestBookings")
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
    checkInDate: v.string(), // yyyy-MM-dd
    checkOutDate: v.string(), // yyyy-MM-dd
    roomNumber: v.optional(v.string()),
    status: bookingStatus,
    syariahVerified: v.boolean(),
    mahramRelation: v.optional(v.string()), // spouse, father, mother, n/a
    totalAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_checkin", ["workspaceId", "checkInDate"]),
}

export default guestBookingTables
