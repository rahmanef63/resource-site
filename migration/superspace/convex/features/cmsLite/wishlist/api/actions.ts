import { action } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { logAuditEvent } from "../../../../shared/audit";
import type { ActionCtxWithDb } from "../../../../auth/helpers";
import type { Id } from "../../_generated";

// Generate or refresh a share token for a wishlist
export const shareWishlist = action({
	args: {
		workspaceId: v.string(),
		wishlistId: v.string(),
	},
	returns: v.union(v.string(), v.null()),
	handler: async (ctx, args) => {
		const actionCtx = ctx as ActionCtxWithDb;
		const membership = await requirePermission(actionCtx, args.workspaceId, "wishlist.manage");

		const wishlist = await actionCtx.db.get(args.wishlistId as Id<"wishlists">);
		if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
			return null;
		}

		const token = crypto.randomUUID();

		await actionCtx.db.patch(args.wishlistId as Id<"wishlists">, { shareToken: token });

		await logAuditEvent(actionCtx, {
			workspaceId: args.workspaceId,
			action: "wishlist.share",
			actor: membership.userId,
			actorUserId: membership.userDocId,
			target: { type: "wishlist", id: args.wishlistId, workspaceId: args.workspaceId },
		});

		return token;
	},
});

// Archive a wishlist
export const archiveWishlist = action({
	args: {
		workspaceId: v.string(),
		wishlistId: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const actionCtx = ctx as ActionCtxWithDb;
		const membership = await requirePermission(actionCtx, args.workspaceId, "wishlist.manage");

		const wishlist = await actionCtx.db.get(args.wishlistId as Id<"wishlists">);
		if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
			return null;
		}

		await actionCtx.db.patch(args.wishlistId as Id<"wishlists">, { status: "archived" });

		await logAuditEvent(actionCtx, {
			workspaceId: args.workspaceId,
			action: "wishlist.archive",
			actor: membership.userId,
			actorUserId: membership.userDocId,
			target: { type: "wishlist", id: args.wishlistId, workspaceId: args.workspaceId },
		});

		return null;
	},
});

// Export wishlist contents as JSON
export const exportWishlist = action({
	args: {
		workspaceId: v.string(),
		wishlistId: v.string(),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		const actionCtx = ctx as ActionCtxWithDb;
		// Require manage permission to export
		const membership = await requirePermission(actionCtx, args.workspaceId, "wishlist.manage");

		const wishlist = await actionCtx.db.get(args.wishlistId as Id<"wishlists">);
		if (!wishlist || wishlist.workspaceId !== args.workspaceId) {
			return null;
		}

		const items = await actionCtx.db
			.query("wishlistItems")
			.withIndex("by_wishlist", (q: any) => q.eq("wishlistId", args.wishlistId))
			.take(1000);

		return { wishlist, items };
	},
});

