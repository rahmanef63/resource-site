import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"
import { nextCounterValue } from "../../shared/counters"

/**
 * Guest Booking Mutations
 *
 * RBAC: every mutation calls `requirePermission`.
 * Audit: every mutation emits an `guestBooking.*` audit event.
 * Workspace isolation: each booking is cross-checked
 * (row.workspaceId === args.workspaceId) before any mutation.
 */

function pad(n: number, width: number) {
  return String(n).padStart(width, "0")
}

export const createBooking = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
    checkInDate: v.string(), // yyyy-MM-dd
    checkOutDate: v.string(), // yyyy-MM-dd
    roomNumber: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "guest-booking.create")
    const userId = await ensureUser(ctx)

    if (!args.guestName.trim()) throw new Error("guestName required")
    if (!args.guestEmail.trim()) throw new Error("guestEmail required")
    if (args.checkOutDate <= args.checkInDate) {
      throw new Error("checkOutDate must be after checkInDate")
    }

    const counter = await nextCounterValue(ctx, args.workspaceId, "guestBookings")
    const bookingNumber = `BK-${pad(counter, 6)}`

    const now = Date.now()
    const id = await ctx.db.insert("bookings", {
      workspaceId: args.workspaceId,
      bookingNumber,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
      checkInDate: args.checkInDate,
      checkOutDate: args.checkOutDate,
      roomNumber: args.roomNumber,
      status: "pending",
      syariahVerified: false,
      mahramRelation: undefined,
      totalAmount: args.totalAmount,
      currency: args.currency,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "guestBooking.created",
      resourceType: "bookings",
      resourceId: id,
      changes: { bookingNumber, guestEmail: args.guestEmail },
    })

    return { id, bookingNumber, success: true }
  },
})

export const updateBooking = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    bookingId: v.id("bookings"),
    guestName: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    checkInDate: v.optional(v.string()),
    checkOutDate: v.optional(v.string()),
    roomNumber: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "guest-booking.update")
    const userId = await ensureUser(ctx)

    const row = await ctx.db.get(args.bookingId)
    if (!row || row.workspaceId !== args.workspaceId) {
      throw new Error("Booking not found")
    }
    if (row.status === "cancelled" || row.status === "checked-out") {
      throw new Error(`Cannot update booking in status ${row.status}`)
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now(), updatedBy: userId }
    if (args.guestName !== undefined) patch.guestName = args.guestName
    if (args.guestEmail !== undefined) patch.guestEmail = args.guestEmail
    if (args.guestPhone !== undefined) patch.guestPhone = args.guestPhone
    if (args.checkInDate !== undefined) patch.checkInDate = args.checkInDate
    if (args.checkOutDate !== undefined) patch.checkOutDate = args.checkOutDate
    if (args.roomNumber !== undefined) patch.roomNumber = args.roomNumber
    if (args.totalAmount !== undefined) patch.totalAmount = args.totalAmount
    if (args.currency !== undefined) patch.currency = args.currency
    if (args.notes !== undefined) patch.notes = args.notes

    await ctx.db.patch(args.bookingId, patch)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "guestBooking.updated",
      resourceType: "bookings",
      resourceId: args.bookingId,
      changes: patch,
    })

    return { success: true }
  },
})

export const verifyBooking = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    bookingId: v.id("bookings"),
    mahramRelation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "guest-booking.verify")
    const userId = await ensureUser(ctx)

    const row = await ctx.db.get(args.bookingId)
    if (!row || row.workspaceId !== args.workspaceId) {
      throw new Error("Booking not found")
    }
    if (row.status !== "pending") {
      throw new Error(`Cannot verify booking in status ${row.status}`)
    }

    await ctx.db.patch(args.bookingId, {
      status: "verified",
      syariahVerified: true,
      mahramRelation: args.mahramRelation,
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "guestBooking.verified",
      resourceType: "bookings",
      resourceId: args.bookingId,
      changes: { mahramRelation: args.mahramRelation },
    })

    return { success: true }
  },
})

export const cancelBooking = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "guest-booking.cancel")
    const userId = await ensureUser(ctx)

    const row = await ctx.db.get(args.bookingId)
    if (!row || row.workspaceId !== args.workspaceId) {
      throw new Error("Booking not found")
    }
    if (row.status === "cancelled" || row.status === "checked-out") {
      throw new Error(`Cannot cancel booking in status ${row.status}`)
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      notes: args.reason ? `${row.notes ?? ""}\n[cancelled] ${args.reason}`.trim() : row.notes,
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "guestBooking.cancelled",
      resourceType: "bookings",
      resourceId: args.bookingId,
      changes: { reason: args.reason },
    })

    return { success: true }
  },
})

export const checkInBooking = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    bookingId: v.id("bookings"),
    roomNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "guest-booking.update")
    const userId = await ensureUser(ctx)

    const row = await ctx.db.get(args.bookingId)
    if (!row || row.workspaceId !== args.workspaceId) {
      throw new Error("Booking not found")
    }
    if (row.status !== "verified") {
      throw new Error(`Cannot check-in booking in status ${row.status}`)
    }
    if (!args.roomNumber.trim()) throw new Error("roomNumber required")

    await ctx.db.patch(args.bookingId, {
      status: "checked-in",
      roomNumber: args.roomNumber,
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "guestBooking.checked_in",
      resourceType: "bookings",
      resourceId: args.bookingId,
      changes: { roomNumber: args.roomNumber },
    })

    return { success: true }
  },
})
