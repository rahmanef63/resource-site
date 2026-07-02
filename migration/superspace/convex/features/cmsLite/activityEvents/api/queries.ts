import { query } from "../../_generated";
import { v } from "convex/values";
import { requireEditor, requireOwner } from "../../../lib/rbac";
import type { QueryCtx } from "../../_generated";

const historyEntry = v.object({
  id: v.id("activityEvents"),
  userId: v.string(),
  entity: v.string(),
  entityId: v.string(),
  action: v.string(),
  changes: v.optional(v.any()),
  createdAt: v.number(),
});

export const getContentHistory = query({
  args: {
    contentType: v.string(),
    contentId: v.string(),
  },
  returns: v.object({
    history: v.array(historyEntry),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      contentType: string;
      contentId: string;
    },
  ) => {
    await requireEditor(ctx);

    const historyDocs = await ctx.db
      .query("activityEvents")
      .withIndex(
        "by_entity",
        (q: any) => q.eq("entity", args.contentType).eq("entityId", args.contentId),
      )
      .order("desc")
      .take(2000);

    const history = historyDocs.map((event: any) => ({
      id: event._id,
      userId: event.actorId,
      entity: event.entity,
      entityId: event.entityId,
      action: event.action,
      changes: event.changes,
      createdAt: event._creationTime,
    }));

    return { history };
  },
});

export const getUserActivity = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    activity: v.array(historyEntry),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      userId: string;
      limit?: number;
    },
  ) => {
    await requireOwner(ctx);

    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_actor", (q: any) => q.eq("actorId", args.userId))
      .order("desc")
      .take(limit);

    const activity = events.map((event: any) => ({
      id: event._id,
      userId: event.actorId,
      entity: event.entity,
      entityId: event.entityId,
      action: event.action,
      changes: event.changes,
      createdAt: event._creationTime,
    }));

    return { activity };
  },
});


