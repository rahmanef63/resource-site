/**
 * Public read wrapper for the comments slice.
 *
 * The slice ships `_listForTarget` as an internalQuery (default-deny). For the
 * agency public site, journal + portfolio detail pages are publicly readable,
 * so we expose a thin public query that proxies the internal one and maps the
 * raw `comment_threads` docs into the slice's `Comment` DTO shape consumed by
 * <CommentsThread> / useComments.
 */

import { query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import { v } from "convex/values";

const targetValidator = v.object({
  kind: v.string(),
  id: v.string(),
  subId: v.optional(v.string()),
});

export const listForTarget = query({
  args: { target: targetValidator },
  handler: async (ctx, { target }) => {
    const rows: Doc<"comment_threads">[] = await ctx.runQuery(
      internal.features.comments.query._listForTarget,
      { target },
    );
    return rows
      .filter((r) => !r.deletedAt)
      .map((r) => ({
        id: r._id as string,
        target: {
          kind: r.targetKind,
          id: r.targetId,
          subId: r.targetSubId,
        },
        text: r.body,
        authorName: "Member",
        authorIcon: "",
        resolved: Boolean(r.resolvedAt),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        parentId: r.parentId as string | undefined,
        authorId: r.actorId,
      }));
  },
});
