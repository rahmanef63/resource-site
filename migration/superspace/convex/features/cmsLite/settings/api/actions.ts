import { query, mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdminForWorkspace } from "../../../lib/rbac";

// Export current settings document for a workspace.
//
// C2 fix completed (2026-05-14): the `settings` table now has a workspaceId
// field + by_workspace index, so the lookup is properly tenant-scoped.
// NOTE: query/mutation (not action) — these read/write ctx.db directly, which
// is only available in the query/mutation runtime, never in an action.
export const exportSettings = query({
	args: { workspaceId: v.string() },
	returns: v.any(),
	handler: async (ctx: any, args: any) => {
		await requireAdminForWorkspace(ctx, args.workspaceId);
		const settings = await ctx.db
			.query("settings")
			.withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
			.first();
		return settings ?? null;
	},
});

// Import settings (overwrite current) for a workspace.
//
// C2 fix completed (2026-05-14): workspace-scoped lookup via by_workspace
// index. New rows always carry workspaceId so legacy singleton drift is
// impossible going forward.
export const importSettings = mutation({
	args: {
		workspaceId: v.string(),
		settings: v.any(),
	},
	returns: v.null(),
	handler: async (ctx: any, args: any) => {
		await requireAdminForWorkspace(ctx, args.workspaceId);
		const existing = await ctx.db
			.query("settings")
			.withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
			.first();

		const payload = { ...args.settings, workspaceId: args.workspaceId };

		if (existing) {
			await ctx.db.patch(existing._id, payload);
		} else {
			await ctx.db.insert("settings", payload);
		}

		// record audit via settings mutation already exists; here we just return
		return null;
	},
});

