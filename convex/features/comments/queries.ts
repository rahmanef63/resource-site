/**
 * comments queries — v0.2.0 polymorphic TargetRef.
 *
 * `listForTarget` reads the new `comment_threads` table indexed by
 * (targetKind, targetId, [targetSubId]). Consumers wrap with their own
 * permission gate via `bindings.listEventsQuery`-style pattern (see
 * audit-log lib).
 */

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const targetValidator = v.object({
  kind: v.string(),
  id: v.string(),
  subId: v.optional(v.string()),
});

export const listForTarget = query({
  args: { target: targetValidator },
  handler: async (ctx, args) => {
    const actor = await getAuthUserId(ctx);
    if (!actor) return [];
    const { kind, id, subId } = args.target;
    if (subId) {
      return await ctx.db
        .query("comment_threads")
        .withIndex("by_target_kind_id_subId", (q) =>
          q.eq("targetKind", kind).eq("targetId", id).eq("targetSubId", subId)
        )
        .take(500);
    }
    return await ctx.db
      .query("comment_threads")
      .withIndex("by_target_kind_id", (q) =>
        q.eq("targetKind", kind).eq("targetId", id)
      )
      .take(500);
  },
});
