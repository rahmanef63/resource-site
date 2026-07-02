import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";
import { settingsObject } from "./queries";
import type { MutationCtx, Id } from "../../_generated";

const settingsArgs = {
  brandName: v.string(),
  defaultLocale: v.string(),
  heroImage: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  instagram: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
};

function buildOptionalFields(args: Record<string, string | null | undefined>) {
  const result: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

async function getWorkspaceContext(ctx: MutationCtx, adminUserId: Id<"adminUsers">) {
  const adminUser = await ctx.db.get(adminUserId);
  if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
    throw new Error("No workspace found for user");
  }
  return adminUser.workspaceIds[0];
}

export const upsertSettings = mutation({
  args: settingsArgs,
  returns: settingsObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      brandName: string;
      defaultLocale: string;
      heroImage?: string | null;
      phone?: string | null;
      email?: string | null;
      instagram?: string | null;
      whatsapp?: string | null;
      logoUrl?: string | null;
      primaryColor?: string | null;
      secondaryColor?: string | null;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    // C2 completion (2026-05-14): workspace-scoped lookup via by_workspace
    // index — settings is now multi-tenant.
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first();
    const baseFields = {
      workspaceId,
      brandName: args.brandName,
      defaultLocale: args.defaultLocale,
    };
    const optionalFields = buildOptionalFields({
      heroImage: args.heroImage,
      phone: args.phone,
      email: args.email,
      instagram: args.instagram,
      whatsapp: args.whatsapp,
      logoUrl: args.logoUrl,
      primaryColor: args.primaryColor,
      secondaryColor: args.secondaryColor,
    });

    const writePayload = {
      ...baseFields,
      ...optionalFields,
    };

    const settingsId = existing
      ? existing._id
      : await ctx.db.insert("settings", writePayload);

    if (existing) {
      await ctx.db.patch(existing._id, writePayload);
    }

    const updated = await ctx.db.get(settingsId);
    if (!updated) {
      throw new Error("Failed to load settings after update");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "settings",
      resourceId: settingsId,
      action: existing ? "settings.update" : "settings.create",
      changes: { ...args },
    });

    return updated;
  },
});


