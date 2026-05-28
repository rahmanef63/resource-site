/**
 * comments queries — v0.2.0 polymorphic TargetRef.
 *
 * `listForTarget` reads the `comment_threads` table indexed by
 * (targetKind, targetId, [targetSubId]).
 *
 * Default deny: ships as `internalQuery`. Consumers MUST wrap with a
 * public `query` that gates on their own target-visibility rule before
 * proxying through. Direct exposure would let any authenticated user
 * enumerate comments on arbitrary targets by guessing ids.
 *
 * Example consumer wrapper:
 *   export const listForDoc = query({
 *     args: { docId: v.id("docs") },
 *     handler: async (ctx, { docId }) => {
 *       const userId = await getAuthUserId(ctx);
 *       const doc = await ctx.db.get(docId);
 *       if (!doc || !canRead(doc, userId)) return [];
 *       return ctx.runQuery(internal.features.comments.query._listForTarget, {
 *         target: { kind: "doc", id: docId },
 *       });
 *     },
 *   });
 */

import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

const targetValidator = v.object({
  kind: v.string(),
  id: v.string(),
  subId: v.optional(v.string()),
});

export const _listForTarget = internalQuery({
  args: { target: targetValidator },
  handler: async (ctx, args) => {
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
