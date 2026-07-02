import { mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";
import { requireAdmin, requireAdminForWorkspace, assertDocWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Create or update a copy entry
 */
export const upsertCopy = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    group: v.string(),
    status: v.string(),
    translations: v.record(v.string(), v.object({
      content: v.string(),
      description: v.optional(v.string()),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    })),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("copies")
      .withIndex("by_workspace_key", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("key", args.key)
      )
      .unique();

    let id: Id<"copies">;
    let action = "copies.update";

    if (existing) {
      // Create history entry for tracking changes
      await ctx.db.insert("copyHistory", {
        copyId: existing._id,
        locale: Object.keys(args.translations)[0], // Track the changed locale
        previousContent: existing.translations[Object.keys(args.translations)[0]]?.content || "",
        changeNote: "Updated via API",
        createdBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy || actor.clerkUserId,
      });

      // Update existing copy
      await ctx.db.patch(existing._id, {
        translations: {
          ...existing.translations,
          ...args.translations,
        },
        status: args.status,
        tags: args.tags,
        notes: args.notes,
        lastReviewedAt: Date.now(),
        lastReviewedBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy || actor.clerkUserId,
      });
      id = existing._id;
    } else {
      // Create new copy
      id = await ctx.db.insert("copies", {
        workspaceId: args.workspaceId,
        key: args.key,
        group: args.group,
        status: args.status,
        translations: args.translations,
        tags: args.tags,
        notes: args.notes,
        lastReviewedAt: Date.now(),
        lastReviewedBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy || actor.clerkUserId,
      });
      action = "copies.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "copy",
      resourceId: id,
      action,
      changes: { key: args.key, status: args.status },
    });

    return id;
  },
});

/**
 * Create or update a copy group
 */
export const upsertGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    displayNames: v.record(v.string(), v.string()),
    description: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("copyGroups")
      .withIndex("by_name", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    let id: Id<"copyGroups">;
    let action = "copies.group.update";

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayNames: args.displayNames,
        description: args.description,
        status: args.status,
      });
      id = existing._id;
    } else {
      // Get count of copies in this group
      const copyCount = (await ctx.db
        .query("copies")
        .withIndex("by_group", (q: any) =>
          q.eq("workspaceId", args.workspaceId).eq("group", args.name)
        )
        .take(1000)).length;

      id = await ctx.db.insert("copyGroups", {
        workspaceId: args.workspaceId,
        name: args.name,
        displayNames: args.displayNames,
        description: args.description,
        status: args.status,
        copyCount: copyCount,
      });
      action = "copies.group.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "copyGroup",
      resourceId: id,
      action,
      changes: { name: args.name },
    });

    return id;
  },
});

/**
 * Delete a copy entry
 */
export const deleteCopy = mutation({
  args: {
    workspaceId: v.string(),
    copyId: v.id("copies"),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const copy = await ctx.db.get(args.copyId);
    assertDocWorkspace(copy, args.workspaceId, "copy");

    await ctx.db.delete(args.copyId);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "copy",
      resourceId: args.copyId,
      action: "copies.delete",
      changes: {},
    });

    return true;
  },
});

/**
 * Delete a copy group and all associated copies
 */
export const deleteGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    // First delete the group
    const group = await ctx.db
      .query("copyGroups")
      .withIndex("by_name", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (group) {
      await ctx.db.delete(group._id);
    }

    // Then delete all copies in this group
    const copies = await ctx.db
      .query("copies")
      .withIndex("by_group", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("group", args.name)
      )
      .take(1000);

    await Promise.all(copies.map((copy) => ctx.db.delete(copy._id)));

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "copyGroup",
      resourceId: group?._id ?? "unknown",
      action: "copies.group.delete",
      changes: { name: args.name, copyCount: copies.length },
    });

    return true;
  },
});

