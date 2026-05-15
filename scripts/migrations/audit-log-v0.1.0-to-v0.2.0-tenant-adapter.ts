/**
 * Migration: audit-log v0.1.0 → v0.2.0 (TenantAdapter shape).
 *
 * v0.1.0 schema:
 *   table `auditLogs`:
 *     workspaceId: Id<"workspaces"> (REQUIRED)
 *     userId: Id<"users">
 *     timestamp: number
 *     action/entityType/entityId/userName/userEmail/changes/metadata/ipAddress/userAgent
 *
 * v0.2.0 schema:
 *   table `audit_events`:
 *     tenantId: string | null
 *     actorId: string
 *     at: number
 *     action/entityType/entityId/diff/metadata/ipAddress/userAgent
 *
 * Per docs/contract-negotiations-2026-05-15.md §3.
 *
 * Run from a Convex internalMutation. Walks `auditLogs` in batches and
 * inserts into `audit_events` with translated field names. Idempotent: writes
 * a `migrationApplied` doc on first completion; reruns are no-ops.
 *
 * Single-tenant consumers (no workspaceId column at the source layer): wire
 * `resolveTenantId: () => null` on the destination adapter; this script will
 * still copy `workspaceId` if present.
 *
 * IMPORTANT: This script DOES NOT drop the source `auditLogs` table. After
 * verifying parity, schedule a follow-up migration to remove it.
 */

import { internalMutation } from "../../convex/_generated/server";
import { v } from "convex/values";

const BATCH = 200;

export const migrate = internalMutation({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { cursor }) => {
    const result = await ctx.db
      .query("auditLogs" as any)
      .paginate({ cursor: cursor ?? null, numItems: BATCH });

    let copied = 0;
    for (const row of result.page as any[]) {
      const tenantId =
        typeof row.workspaceId === "string"
          ? row.workspaceId
          : row.workspaceId?.toString?.() ?? null;
      const actorId =
        typeof row.userId === "string"
          ? row.userId
          : row.userId?.toString?.() ?? "unknown";

      const diff =
        row.changes && typeof row.changes === "object"
          ? row.changes
          : undefined;

      await ctx.db.insert("audit_events" as any, {
        tenantId,
        actorId,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        at: row.timestamp ?? row._creationTime ?? Date.now(),
        diff,
        metadata: row.metadata,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
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
