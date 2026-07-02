import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { logAuditEvent } from "../../../../shared/audit";
import { Id } from "../../_generated";

// Create a new wishlist
export const createWishlist = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, "wishlist.manage");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const wishlistId = await ctx.db.insert("wishlists", {
      workspaceId: args.workspaceId,
      userId: identity.subject,
      name: args.name,
      description: args.description,
      isPublic: args.isPublic ?? false,
      status: "active",
      shareToken: args.isPublic ? crypto.randomUUID() : undefined,
      metadata: args.metadata,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "wishlist.create",
      actor: identity.subject,
      target: {
        type: "wishlist",
        id: wishlistId,
        workspaceId: args.workspaceId,
      },
    });

    return wishlistId;
  },
});

// Add item to wishlist
export const addItem = mutation({
  args: {
    workspaceId: v.string(),
    wishlistId: v.string(),
    itemType: v.union(
      v.literal("product"),
      v.literal("service"),
      v.literal("post"),
      v.literal("portfolio")
    ),
    itemId: v.string(),
    notes: v.optional(v.string()),
    quantity: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, "wishlist.manage");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check wishlist exists and user has access
    const wishlist = await ctx.db.get(args.wishlistId as Id<"wishlists">);
    if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
      throw new Error("Wishlist not found");
    }

    if (wishlist.userId !== identity.subject) {
      throw new Error("Not authorized to modify this wishlist");
    }

    // Check if item already exists
    const existing = await ctx.db
      .query("wishlistItems")
      .withIndex("by_wishlist_item", (q) =>
        q
          .eq("wishlistId", args.wishlistId)
          .eq("itemType", args.itemType)
          .eq("itemId", args.itemId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (existing) {
      throw new Error("Item already in wishlist");
    }

    const itemId = await ctx.db.insert("wishlistItems", {
      workspaceId: args.workspaceId,
      wishlistId: args.wishlistId,
      itemType: args.itemType,
      itemId: args.itemId,
      addedBy: identity.subject,
      notes: args.notes,
      quantity: args.quantity,
      priority: args.priority,
      status: "active",
      metadata: args.metadata,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "wishlist.item.add",
      actor: identity.subject,
      target: {
        type: "wishlist_item",
        id: itemId,
        workspaceId: args.workspaceId,
      },
    });

    return itemId;
  },
});

// Remove item from wishlist
export const removeItem = mutation({
  args: {
    workspaceId: v.string(),
    wishlistId: v.string(),
    itemId: v.string(),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, "wishlist.manage");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }


    // Check wishlist exists and user has access
    const wishlist = await ctx.db.get(args.wishlistId as Id<"wishlists">);
    if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
      throw new Error("Wishlist not found");
    }

    if (wishlist.userId !== identity.subject) {
      throw new Error("Not authorized to modify this wishlist");
    }

    // Get the item
    const item = await ctx.db.get(args.itemId as Id<"wishlistItems">);
    if (!item || item.wishlistId !== args.wishlistId) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.itemId as Id<"wishlistItems">, {
      status: "removed",
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "wishlist.item.remove",
      actor: identity.subject,
      target: {
        type: "wishlist_item",
        id: args.itemId,
        workspaceId: args.workspaceId,
      },
    });
  },
});

