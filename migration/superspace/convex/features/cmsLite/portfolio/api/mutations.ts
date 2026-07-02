import { mutation } from "../../_generated";
import type { MutationCtx } from "../../_generated";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated";
import { requireAdmin, requireEditor } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";
import { serializePortfolio } from "./queries";

type PortfolioDoc = Doc<"portfolioItems">;
type PortfolioImageDoc = Doc<"portfolioImages">;

const imageArgs = v.object({
  imageUrl: v.string(),
  altText: v.optional(v.union(v.string(), v.null())),
  displayOrder: v.number(),
});

const baseArgs = {
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  description: v.optional(v.union(v.string(), v.null())),
  tags: v.array(v.string()),
  images: v.array(imageArgs),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  category: v.optional(v.union(v.string(), v.null())),
};

async function getWorkspaceContext(ctx: MutationCtx, adminUserId: Id<"adminUsers">) {
  const adminUser = await ctx.db.get(adminUserId);
  if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
    throw new Error("No workspace found for user");
  }
  return adminUser.workspaceIds[0];
}

async function removeImages(
  ctx: MutationCtx,
  portfolioId: Id<"portfolioItems">,
): Promise<void> {
  const existing = await ctx.db
    .query("portfolioImages")
    .withIndex("by_portfolio", (q: any) => q.eq("portfolioId", portfolioId))
    .take(1000);

  for (const image of existing as PortfolioImageDoc[]) {
    await ctx.db.delete(image._id);
  }
}

async function insertImages(
  ctx: MutationCtx,
  portfolioId: Id<"portfolioItems">,
  images: Array<{ imageUrl: string; altText?: string | null; displayOrder: number }>,
): Promise<void> {
  for (const image of images) {
    await ctx.db.insert("portfolioImages", {
      portfolioId,
      imageUrl: image.imageUrl,
      altText: image.altText ?? null,
      displayOrder: image.displayOrder,
    });
  }
}

export const createPortfolio = mutation({
  args: baseArgs,
  returns: v.object({
    item: v.object({
      id: v.id("portfolioItems"),
      slug: v.string(),
      locale: v.string(),
      title: v.string(),
      description: v.optional(v.union(v.string(), v.null())),
      tags: v.array(v.string()),
      status: v.string(),
      metaTitle: v.optional(v.union(v.string(), v.null())),
      metaDescription: v.optional(v.union(v.string(), v.null())),
      metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
      category: v.optional(v.union(v.string(), v.null())),
    }),
    images: v.array(
      v.object({
        id: v.id("portfolioImages"),
        imageUrl: v.string(),
        altText: v.optional(v.union(v.string(), v.null())),
        displayOrder: v.number(),
      }),
    ),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      slug: string;
      locale: string;
      title: string;
      description?: string | null;
      tags: string[];
      images: Array<{ imageUrl: string; altText?: string | null; displayOrder: number }>;
      status: string;
      metaTitle?: string | null;
      metaDescription?: string | null;
      metaKeywords?: string[] | null;
      category?: string | null;
    },
  ) => {
    const actor = await requireEditor(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const conflict = await ctx.db
      .query("portfolioItems")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict) {
      throw new Error("Portfolio item with this slug and locale already exists");
    }

    const itemId = await ctx.db.insert("portfolioItems", {
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      description: args.description ?? null,
      tags: args.tags,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      category: args.category ?? null,
      createdBy: actor.clerkUserId,
      updatedBy: actor.clerkUserId,
    });

    await insertImages(ctx, itemId, args.images);

    const item = await ctx.db.get(itemId);
    if (!item) {
      throw new Error("Failed to load portfolio item after creation");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "portfolio",
      resourceId: itemId,
      action: "portfolio.create",
      changes: {
        slug: item.slug,
        locale: item.locale,
      },
    });

    const images = await ctx.db
      .query("portfolioImages")
      .withIndex("by_portfolio_order", (q: any) => q.eq("portfolioId", itemId))
      .order("asc")
      .take(1000);

    return {
      item: serializePortfolio(item as PortfolioDoc),
      images: (images as PortfolioImageDoc[]).map((img) => ({
        id: img._id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? null,
        displayOrder: img.displayOrder,
      })),
    };
  },
});

export const updatePortfolio = mutation({
  args: {
    id: v.id("portfolioItems"),
    ...baseArgs,
  },
  returns: v.object({
    item: v.object({
      id: v.id("portfolioItems"),
      slug: v.string(),
      locale: v.string(),
      title: v.string(),
      description: v.optional(v.union(v.string(), v.null())),
      tags: v.array(v.string()),
      status: v.string(),
      metaTitle: v.optional(v.union(v.string(), v.null())),
      metaDescription: v.optional(v.union(v.string(), v.null())),
      metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
      category: v.optional(v.union(v.string(), v.null())),
    }),
    images: v.array(
      v.object({
        id: v.id("portfolioImages"),
        imageUrl: v.string(),
        altText: v.optional(v.union(v.string(), v.null())),
        displayOrder: v.number(),
      }),
    ),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"portfolioItems">;
      slug: string;
      locale: string;
      title: string;
      description?: string | null;
      tags: string[];
      images: Array<{ imageUrl: string; altText?: string | null; displayOrder: number }>;
      status: string;
      metaTitle?: string | null;
      metaDescription?: string | null;
      metaKeywords?: string[] | null;
      category?: string | null;
    },
  ) => {
    const actor = await requireEditor(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Portfolio item not found");
    }

    const conflict = await ctx.db
      .query("portfolioItems")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict && conflict._id !== args.id) {
      throw new Error("Another portfolio item with this slug and locale already exists");
    }

    await ctx.db.patch(args.id, {
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      description: args.description ?? null,
      tags: args.tags,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      category: args.category ?? null,
      updatedBy: actor.clerkUserId,
    });

    await removeImages(ctx, args.id);
    await insertImages(ctx, args.id, args.images);

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to load portfolio item after update");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "portfolio",
      resourceId: args.id,
      action: "portfolio.update",
      changes: {
        title: updated.title,
        status: updated.status,
      },
    });

    const images = await ctx.db
      .query("portfolioImages")
      .withIndex("by_portfolio_order", (q: any) => q.eq("portfolioId", args.id))
      .order("asc")
      .take(1000);

    return {
      item: serializePortfolio(updated as PortfolioDoc),
      images: (images as PortfolioImageDoc[]).map((img) => ({
        id: img._id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? null,
        displayOrder: img.displayOrder,
      })),
    };
  },
});

export const deletePortfolio = mutation({
  args: {
    id: v.id("portfolioItems"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"portfolioItems"> }) => {
    // Destructive op — require Admin. Editor can draft + update portfolio
    // items but cannot delete them (RBAC audit 2026-04-23).
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Portfolio item not found");
    }

    await removeImages(ctx, id);
    await ctx.db.delete(id);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "portfolio",
      resourceId: id,
      action: "portfolio.delete",
    });

    return { success: true };
  },
});

export const bulkUpdatePortfolio = mutation({
  args: {
    ids: v.array(v.id("portfolioItems")),
    action: v.union(v.literal("delete"), v.literal("update_category")),
    category: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    success: v.boolean(),
    affected: v.number(),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      ids: Id<"portfolioItems">[];
      action: "delete" | "update_category";
      category?: string | null;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const workspaceId = await getWorkspaceContext(ctx, actor.adminUserId);

    if (args.ids.length === 0) {
      return { success: true, affected: 0 };
    }

    let affected = 0;

    for (const id of args.ids) {
      const item = await ctx.db.get(id);
      if (!item) {
        continue;
      }

      switch (args.action) {
        case "delete": {
          await removeImages(ctx, id);
          await ctx.db.delete(id);
          affected += 1;
          await logAuditEvent(ctx, {
            workspaceId,
            actor: actor.clerkUserId,
            resourceType: "portfolio",
            resourceId: id,
            action: "portfolio.delete",
          });
          break;
        }
        case "update_category": {
          if (!args.category) {
            continue;
          }
          await ctx.db.patch(id, {
            category: args.category,
            updatedBy: actor.clerkUserId,
          });
          affected += 1;
          await logAuditEvent(ctx, {
            workspaceId,
            actor: actor.clerkUserId,
            resourceType: "portfolio",
            resourceId: id,
            action: "portfolio.update_category",
            changes: {
              category: args.category,
            },
          });
          break;
        }
      }
    }

    return { success: true, affected };
  },
});

