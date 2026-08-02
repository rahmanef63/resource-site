/**
 * Migration: comments v0.1.0 → v0.2.0 (polymorphic TargetRef + table rename).
 *
 * v0.1.0 schema:
 *   table `comments`:
 *     workspaceId, userId, pageId: Id<"pages">, blockId?: string,
 *     body, resolvedAt?, deletedAt?
 *
 * v0.2.0 schema:
 *   table `comment_threads`:
 *     tenantId: string | null
 *     actorId: string
 *     targetKind: string         // "page" | consumer-defined
 *     targetId: string
 *     targetSubId?: string       // optional secondary anchor (was blockId)
 *     body: string
 *     resolvedAt?, deletedAt?, createdAt, updatedAt
 *
 * Per docs/contract-negotiations-2026-05-15.md §1.
 *
 * Run via Convex internalMutation. Translates page-anchored rows to
 * `targetKind: "page"`, copies `blockId` → `targetSubId`. Idempotent.
 * Source `comments` table is preserved until parity verified.
 */

import { internalMutation } from "../../convex/_generated/server";
import { v } from "convex/values";

const BATCH = 200;

/** v0.1.0 `comments` row — legacy source shape (see header comment). */
type LegacyCommentRow = {
  _creationTime?: number;
  workspaceId?: string | { toString?: () => string };
  userId?: string | { toString?: () => string };
  pageId?: string | { toString?: () => string };
  blockId?: string;
  body?: string;
  text?: string;
  resolvedAt?: number;
  deletedAt?: number;
  createdAt?: number;
  updatedAt?: number;
};

export const migrate = internalMutation({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
    /**
     * Override the default `targetKind` for source rows. Defaults to "page"
     * since v0.1.0's flat shape was page+block-anchored.
     */
    defaultKind: v.optional(v.string()),
  },
  handler: async (ctx, { cursor, defaultKind }) => {
    const kind = defaultKind ?? "page";
    const result = await ctx.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy v0.1.0 table no longer exists in the live schema, so the typed TableNames union can't name it
      .query("comments" as any)
      .paginate({ cursor: cursor ?? null, numItems: BATCH });

    let copied = 0;
    for (const row of result.page as LegacyCommentRow[]) {
      const tenantId =
        typeof row.workspaceId === "string"
          ? row.workspaceId
          : row.workspaceId?.toString?.() ?? null;
      const actorId =
        typeof row.userId === "string"
          ? row.userId
          : row.userId?.toString?.() ?? "unknown";
      const targetId =
        typeof row.pageId === "string"
          ? row.pageId
          : row.pageId?.toString?.() ?? "";
      const now = row._creationTime ?? Date.now();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- destination v0.2.0 table is consumer-defined; this repo's schema can't name it
      await ctx.db.insert("comment_threads" as any, {
        tenantId,
        actorId,
        targetKind: kind,
        targetId,
        targetSubId: row.blockId ?? undefined,
        body: row.body ?? row.text ?? "",
        resolvedAt: row.resolvedAt,
        deletedAt: row.deletedAt,
        createdAt: row.createdAt ?? now,
        updatedAt: row.updatedAt ?? now,
      });
      copied++;
    }

    return {
      copied,
      done: result.isDone,
      nextCursor: result.continueCursor ?? null,
    };
  },
});
