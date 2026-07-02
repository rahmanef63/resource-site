import { mutation } from "../../_generated";
import type { MutationCtx, Id } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

const quicklinkArgs = {
  title: v.string(),
  url: v.string(),
  icon: v.optional(v.union(v.string(), v.null())),
  displayOrder: v.number(),
  active: v.boolean(),
};

async function getWorkspaceContext(ctx: MutationCtx, adminUserId: Id<"adminUsers">) {
  const adminUser = await ctx.db.get(adminUserId);
  if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
    throw new Error("No workspace found for user");
  }
  return adminUser.workspaceIds[0];
}

export const createQuicklink = mutation({
  args: quicklinkArgs,
  returns: v.object({
    id: v.id("quicklinks"),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      title: string;
      url: string;
      icon?: string | null;
      displayOrder: number;
      active: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const id = await ctx.db.insert("quicklinks", {
      title: args.title,
      url: args.url,
      icon: args.icon ?? null,
      displayOrder: args.displayOrder,
      active: args.active,
    });

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "quicklinks",
      resourceId: id,
      action: "quicklink.create",
      changes: {
        title: args.title,
        displayOrder: args.displayOrder,
      },
    });

    return { id };
  },
});

export const updateQuicklink = mutation({
  args: {
    id: v.id("quicklinks"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    icon: v.optional(v.union(v.string(), v.null())),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"quicklinks">;
      title?: string;
      url?: string;
      icon?: string | null;
      displayOrder?: number;
      active?: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Quicklink not found");
    }

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.url !== undefined) patch.url = args.url;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.displayOrder !== undefined) patch.displayOrder = args.displayOrder;
    if (args.active !== undefined) patch.active = args.active;

    if (Object.keys(patch).length === 0) {
      return { success: true };
    }

    await ctx.db.patch(args.id, patch);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "quicklinks",
      resourceId: args.id,
      action: "quicklink.update",
      changes: patch,
    });

    return { success: true };
  },
});

export const deleteQuicklink = mutation({
  args: {
    id: v.id("quicklinks"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"quicklinks"> }) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Quicklink not found");
    }

    await ctx.db.delete(id);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "quicklinks",
      resourceId: id,
      action: "quicklink.delete",
    });

    return { success: true };
  },
});

