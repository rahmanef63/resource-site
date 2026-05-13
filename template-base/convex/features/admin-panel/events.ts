/**
 * Event ingestion endpoint. Writes to the existing `analyticsEvents`
 * table (convex/features/analytics/schema.ts) — no new table needed.
 *
 * Bulk-insert variant for batched client flushes.
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requirePermission } from "../../lib/rbac/permissions";

export const ingest = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    events: v.array(
      v.object({
        eventType: v.string(),
        eventName: v.optional(v.string()),
        productId: v.optional(v.string()),
        properties: v.optional(v.record(v.string(), v.any())),
        ts: v.number(),
        sessionId: v.string(),
        ctx: v.optional(
          v.object({
            source: v.optional(v.string()),
            medium: v.optional(v.string()),
            campaign: v.optional(v.string()),
            term: v.optional(v.string()),
            content: v.optional(v.string()),
            referrer: v.optional(v.string()),
            landingPath: v.optional(v.string()),
            userAgent: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    // Unauthed page_view is allowed (anonymous funnel tracking). Anything
    // else requires a workspaceId so we can scope it.
    if (!userId && !args.workspaceId) {
      const anonOnly = args.events.every((e) => e.eventType === "page_view");
      if (!anonOnly) return { inserted: 0 };
    }

    for (const e of args.events) {
      await ctx.db.insert("analyticsEvents", {
        eventType: e.eventType,
        eventName: e.eventName ?? e.eventType,
        properties: { ...(e.properties ?? {}), productId: e.productId, ctx: e.ctx ?? {} },
        userId: userId ? String(userId) : undefined,
        sessionId: e.sessionId,
        workspaceId: (args.workspaceId ?? ("" as any)) as any,
        timestamp: e.ts,
        metadata: {
          userAgent: e.ctx?.userAgent,
          referrer: e.ctx?.referrer,
          path: e.ctx?.landingPath,
        },
      });
    }
    return { inserted: args.events.length };
  },
});

/** Last N events for the live stream / admin debug panel. */
export const recent = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "events.read");
    const limit = Math.min(args.limit ?? 100, 500);

    if (args.eventType) {
      const rows = await ctx.db
        .query("analyticsEvents")
        .withIndex("by_workspace_type", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("eventType", args.eventType!),
        )
        .order("desc")
        .take(limit);
      return rows;
    }

    return await ctx.db
      .query("analyticsEvents")
      .withIndex("by_workspace_timestamp", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(limit);
  },
});
