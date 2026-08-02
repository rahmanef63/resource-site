/**
 * Workspace Quota Enforcement
 *
 * Provides server-side (Convex mutation) quota checks for plan limits.
 * Currently contains stub limits that enforce hard caps; replace with
 * plan-table lookups once a billing/subscription system is wired up.
 *
 * Usage:
 *   await checkMemberQuota(ctx, workspaceId);
 *   await checkRowQuota(ctx, workspaceId);
 *   await checkStorageQuota(ctx, workspaceId);
 */

import type { Id } from "../_generated/dataModel";

// ---------------------------------------------------------------------------
// Stub plan limits
// TODO: Replace these constants with a lookup against a `workspacePlans` table
//       once Stripe billing / subscription data is available.
// ---------------------------------------------------------------------------

/** Maximum active workspace members on the default (free) plan. */
const FREE_PLAN_MAX_MEMBERS = 10;

/** Maximum database rows per table on the default (free) plan. */
const FREE_PLAN_MAX_ROWS_PER_TABLE = 1_000;

/** Maximum total storage bytes per workspace on the default (free) plan (100 MB). */
const FREE_PLAN_MAX_STORAGE_BYTES = 100 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Quota check helpers
// ---------------------------------------------------------------------------

/**
 * Throws if the workspace has reached its member limit.
 * Call this before inserting a new workspaceMembership record.
 */
export async function checkMemberQuota(
  ctx: any,
  workspaceId: Id<"workspaces">,
): Promise<void> {
  const activeMembers = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .take(FREE_PLAN_MAX_MEMBERS + 1);

  if (activeMembers.length >= FREE_PLAN_MAX_MEMBERS) {
    throw new Error(
      `Member limit reached (${FREE_PLAN_MAX_MEMBERS} members on free plan). ` +
        "Upgrade your plan to invite more members.",
    );
  }
}

/**
 * Throws if the table has reached its row limit.
 * Call this before inserting a new dbRow record.
 */
export async function checkRowQuota(
  ctx: any,
  tableId: Id<"dbTables">,
): Promise<void> {
  const existingRows = await ctx.db
    .query("dbRows")
    .withIndex("by_table", (q: any) => q.eq("tableId", tableId))
    .take(FREE_PLAN_MAX_ROWS_PER_TABLE + 1);

  if (existingRows.length >= FREE_PLAN_MAX_ROWS_PER_TABLE) {
    throw new Error(
      `Row limit reached (${FREE_PLAN_MAX_ROWS_PER_TABLE} rows per table on free plan). ` +
        "Upgrade your plan to add more rows.",
    );
  }
}

/**
 * Throws if the workspace has reached its total storage limit.
 * Call this before accepting a new file upload.
 */
export async function checkStorageQuota(
  ctx: any,
  workspaceId: Id<"workspaces">,
): Promise<void> {
  // Sum the size of all storage entries for this workspace.
  const storageEntries = await ctx.db
    .query("storageEntries")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .take(10000)
    .catch(() => [] as any[]);  // table may not exist in all deployments

  const totalBytes: number = storageEntries.reduce(
    (sum: number, entry: any) => sum + (entry.size ?? 0),
    0,
  );

  if (totalBytes >= FREE_PLAN_MAX_STORAGE_BYTES) {
    const limitMb = FREE_PLAN_MAX_STORAGE_BYTES / (1024 * 1024);
    throw new Error(
      `Storage limit reached (${limitMb} MB on free plan). ` +
        "Upgrade your plan to upload more files.",
    );
  }
}
