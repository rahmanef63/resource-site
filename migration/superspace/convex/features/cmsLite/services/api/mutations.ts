import { mutation } from "../../_generated";
import { v } from "convex/values";
import { assertDocWorkspace, requireAdmin } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";
import { serviceObject } from "./queries";
import type { MutationCtx, Id } from "../../_generated";

const baseFields = {
  slug: v.string(),
  displayOrder: v.number(),
  labelId: v.string(),
  labelEn: v.string(),
  labelAr: v.string(),
  active: v.optional(v.boolean()),
};

async function getWorkspaceContext(ctx: MutationCtx, adminUserId: Id<"adminUsers">) {
  const adminUser = await ctx.db.get(adminUserId);
  if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
    throw new Error("No workspace found for user");
  }
  return adminUser.workspaceIds[0];
}

export const createService = mutation({
  args: baseFields,
  returns: serviceObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      slug: string;
      displayOrder: number;
      labelId: string;
      labelEn: string;
      labelAr: string;
      active?: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    // H1 fix — slug uniqueness must be scoped per workspace, otherwise a
    // global slug collision across tenants would leak existence of another
    // tenant's services and break per-workspace branding.
    const existing = await ctx.db
      .query("services")
      .withIndex("by_workspace_slug", (q: any) =>
        q.eq("workspaceId", workspaceId).eq("slug", args.slug),
      )
      .first();

    if (existing) {
      throw new Error("Service with this slug already exists");
    }

    const serviceId = await ctx.db.insert("services", {
      workspaceId,
      slug: args.slug,
      displayOrder: args.displayOrder,
      labelId: args.labelId,
      labelEn: args.labelEn,
      labelAr: args.labelAr,
      active: args.active ?? true,
    });

    const doc = await ctx.db.get(serviceId);
    if (!doc) {
      throw new Error("Failed to create service");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "services",
      resourceId: serviceId,
      action: "service.create",
      changes: { ...args },
    });

    return doc;
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    slug: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    labelId: v.optional(v.string()),
    labelEn: v.optional(v.string()),
    labelAr: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  returns: serviceObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"services">;
      slug?: string;
      displayOrder?: number;
      labelId?: string;
      labelEn?: string;
      labelAr?: string;
      active?: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const service = await ctx.db.get(args.id);
    assertDocWorkspace(service as unknown as { workspaceId?: string } | null, workspaceId, "service");

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (key !== "id" && value !== undefined) {
        patch[key] = value;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.id, patch);
    }

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to update service");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "services",
      resourceId: args.id,
      action: "service.update",
      changes: patch,
    });

    return updated;
  },
});

export const deleteService = mutation({
  args: {
    id: v.id("services"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"services"> }) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const svc = await ctx.db.get(id);
    assertDocWorkspace(svc as unknown as { workspaceId?: string } | null, workspaceId, "service");

    await ctx.db.delete(id);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "services",
      resourceId: id,
      action: "service.delete",
    });

    return { success: true };
  },
});


