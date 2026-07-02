import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Guest Booking Queries
 *
 * Workspace-isolated via `by_workspace` / `by_workspace_status` indexes.
 * Per-call result cap = 200.
 */
const MAX_LIMIT = 200

export const listBookings = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("verified"),
        v.literal("checked-in"),
        v.literal("checked-out"),
        v.literal("cancelled"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const take = Math.min(args.limit ?? MAX_LIMIT, MAX_LIMIT)

    if (args.status) {
      return await ctx.db
        .query("bookings")
        .withIndex("by_workspace_status", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("status", args.status!),
        )
        .order("desc")
        .take(take)
    }
    return await ctx.db
      .query("bookings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(take)
  },
})

export const getBooking = query({
  args: {
    workspaceId: v.id("workspaces"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.bookingId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})
