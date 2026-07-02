import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Calendar Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    color: v.optional(v.string()),
    type: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CALENDAR_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    if (args.endsAt !== undefined && args.endsAt < args.startsAt) {
      throw new Error("Event end time must be after start time")
    }

    const doc: any = {
      workspaceId: args.workspaceId,
      title: args.title,
      startsAt: args.startsAt,
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
    }

    if (args.description !== undefined) doc.description = args.description
    if (args.location !== undefined) doc.location = args.location
    if (args.allDay !== undefined) doc.allDay = args.allDay
    if (args.endsAt !== undefined) doc.endsAt = args.endsAt
    if (args.type !== undefined) doc.type = args.type
    if (args.color !== undefined) doc.color = args.color

    const itemId = await ctx.db.insert("calendar", doc)

    await logAuditEvent(ctx, {
      action: "calendar.create",
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: itemId,
      changes: { title: args.title, startsAt: args.startsAt },
    })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("calendar"),
    patch: v.object({
      title: v.optional(v.string()),
      startsAt: v.optional(v.number()),
      endsAt: v.optional(v.union(v.number(), v.null())),
      description: v.optional(v.union(v.string(), v.null())),
      location: v.optional(v.union(v.string(), v.null())),
      color: v.optional(v.union(v.string(), v.null())),
      type: v.optional(v.union(v.string(), v.null())),
      allDay: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requirePermission(ctx, item.workspaceId, PERMS.CALENDAR_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const { patch } = args

    const nextStartsAt: number = patch.startsAt ?? item.startsAt
    const nextEndsAt: number | null =
      patch.endsAt === undefined ? item.endsAt ?? null : patch.endsAt

    if (nextEndsAt !== null && nextEndsAt < nextStartsAt) {
      throw new Error("Event end time must be after start time")
    }

    const updates: any = {
      updatedAt: now,
      updatedBy: actorId,
    }

    if (patch.title !== undefined) updates.title = patch.title
    if (patch.startsAt !== undefined) updates.startsAt = patch.startsAt
    if (patch.endsAt !== undefined) updates.endsAt = patch.endsAt === null ? undefined : patch.endsAt
    if (patch.description !== undefined) updates.description = patch.description === null ? undefined : patch.description
    if (patch.location !== undefined) updates.location = patch.location === null ? undefined : patch.location
    if (patch.type !== undefined) updates.type = patch.type === null ? undefined : patch.type
    if (patch.color !== undefined) updates.color = patch.color === null ? undefined : patch.color
    if (patch.allDay !== undefined) updates.allDay = patch.allDay

    await ctx.db.patch(args.id, updates)

    await logAuditEvent(ctx, {
      action: "calendar.update",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: args.id,
      changes: patch,
    })

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("calendar"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requirePermission(ctx, item.workspaceId, PERMS.CALENDAR_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))

    await ctx.db.delete(args.id)

    await logAuditEvent(ctx, {
      action: "calendar.delete",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: args.id,
    })

    return args.id
  },
})

/**
 * Initialize Calendar Database
 * Creates a feature-specific database table for calendar with predefined fields.
 * This enables calendar data to be viewed/edited through the Database feature.
 */
export const initializeDatabase = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CALENDAR_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    // Check if calendar database already exists
    const existing = await ctx.db
      .query("dbTables")
      .withIndex("by_feature", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("featureType", "calendar")
      )
      .first()

    if (existing) {
      return existing._id
    }

    // Create calendar database table
    const tableId = await ctx.db.insert("dbTables", {
      workspaceId: args.workspaceId,
      name: "Calendar Events",
      description: "Calendar events database",
      icon: "📅",
      featureType: "calendar",
      createdById: actorId,
      updatedById: actorId,
      isTemplate: false,
      settings: {
        showProperties: true,
        wrapCells: false,
        showCalculations: false,
      },
      createdAt: now,
      updatedAt: now,
    })

    // Create predefined fields for calendar
    const fields = [
      { name: "Title", type: "text" as const, isPrimary: true, position: 0 },
      { name: "Start Date", type: "date" as const, isPrimary: false, position: 1 },
      { name: "End Date", type: "date" as const, isPrimary: false, position: 2 },
      { name: "Description", type: "text" as const, isPrimary: false, position: 3 },
      { name: "Location", type: "text" as const, isPrimary: false, position: 4 },
      { name: "Color", type: "select" as const, isPrimary: false, position: 5 },
      { name: "All Day", type: "checkbox" as const, isPrimary: false, position: 6 },
    ]

    const fieldIds: string[] = []
    for (const field of fields) {
      const fieldId = await ctx.db.insert("dbFields", {
        tableId,
        name: field.name,
        type: field.type,
        isRequired: field.name === "Title",
        isPrimary: field.isPrimary,
        position: field.position,
        options: field.type === "select" ? {
          selectOptions: [
            { id: "blue", name: "Blue", color: "#3b82f6" },
            { id: "green", name: "Green", color: "#22c55e" },
            { id: "red", name: "Red", color: "#ef4444" },
            { id: "purple", name: "Purple", color: "#a855f7" },
            { id: "orange", name: "Orange", color: "#f97316" },
          ],
        } : undefined,
        createdAt: now,
        updatedAt: now,
      })
      fieldIds.push(fieldId)
    }

    // Create default calendar view
    await ctx.db.insert("dbViews", {
      tableId,
      name: "Calendar",
      type: "calendar",
      createdById: actorId,
      isDefault: true,
      position: 0,
      settings: {
        filters: [],
        sorts: [],
        visibleFields: fieldIds as any,
        fieldWidths: {},
      },
      createdAt: now,
      updatedAt: now,
    })

    // Also create table view
    await ctx.db.insert("dbViews", {
      tableId,
      name: "All Events",
      type: "table",
      createdById: actorId,
      isDefault: false,
      position: 1,
      settings: {
        filters: [],
        sorts: [],
        visibleFields: fieldIds as any,
        fieldWidths: {},
      },
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      action: "calendar.database_initialized",
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: "dbTable",
      resourceId: tableId,
    })

    return tableId
  },
})

