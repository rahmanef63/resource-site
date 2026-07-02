import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin, requireEditor } from "../../../lib/rbac";
import type { ActionCtxWithDb } from "../../../../auth/helpers";

// Export history for a specific content entity
export const exportEntityHistory = action({
	args: {
		contentType: v.string(),
		contentId: v.string(),
	},
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		const ctxWithDb = ctx as ActionCtxWithDb;
		await requireEditor(ctxWithDb);

		const docs = await ctxWithDb.db
			.query("activityEvents")
			.withIndex("by_entity", (q: any) => q.eq("entity", args.contentType).eq("entityId", args.contentId))
			.order("asc")
			.take(1000);

		return docs.map((d: any) => ({
			id: d._id,
			actorId: d.actorId,
			entity: d.entity,
			entityId: d.entityId,
			action: d.action,
			changes: d.changes,
			createdAt: d._creationTime,
		}));
	},
});

// Purge activity events older than a timestamp (admin only)
export const purgeOldEvents = action({
	args: {
		olderThan: v.number(),
	},
	returns: v.number(), // number deleted
	handler: async (ctx, args) => {
		const ctxWithDb = ctx as ActionCtxWithDb;
		await requireAdmin(ctxWithDb);

		// Admin purge — batched scan, oldest first
		const all = await ctxWithDb.db.query("activityEvents").order("asc").take(10000);
		let deleted = 0;

		for (const d of all) {
			if (d._creationTime < args.olderThan) {
				await ctxWithDb.db.delete(d._id);
				deleted++;
			}
		}

		return deleted;
	},
});

