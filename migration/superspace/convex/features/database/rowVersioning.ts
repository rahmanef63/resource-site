/**
 * Row Versioning & History API (Features #78, #79)
 * Record versioning, history tracking, and diff capabilities
 */
import { query, mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";
import type { Id } from "../../_generated/dataModel";

// ============ ROW VERSIONING ============

/**
 * Create a version snapshot (called internally on row updates)
 */
export const createVersion = internalMutation({
  args: {
    rowId: v.id("dbRows"),
    tableId: v.id("dbTables"),
    workspaceId: v.id("workspaces"),
    data: v.record(v.string(), v.any()),
    changedFields: v.array(v.string()),
    changedById: v.id("users"),
    changeType: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("restore")
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current max version for this row
    const latestVersion = await ctx.db
      .query("dbRowVersions")
      .withIndex("by_row", (q) => q.eq("rowId", args.rowId))
      .order("desc")
      .first();

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const versionId = await ctx.db.insert("dbRowVersions", {
      rowId: args.rowId,
      tableId: args.tableId,
      workspaceId: args.workspaceId,
      version: nextVersion,
      data: args.data,
      changedFields: args.changedFields,
      changedById: args.changedById,
      changeType: args.changeType,
      note: args.note,
      createdAt: Date.now(),
    });

    return { versionId, version: nextVersion };
  },
});

/**
 * List versions for a row
 */
export const listVersions = query({
  args: {
    rowId: v.id("dbRows"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const row = await ctx.db.get(args.rowId);
    if (!row) return [];

    const versions = await ctx.db
      .query("dbRowVersions")
      .withIndex("by_row", (q) => q.eq("rowId", args.rowId))
      .order("desc")
      .take(args.limit ?? 50);

    // Enrich with user info
    const enrichedVersions = await Promise.all(
      versions.map(async (v) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), v.changedById))
          .first();
        return {
          ...v,
          changedByName: user?.name ?? "Unknown",
          changedByEmail: user?.email,
        };
      })
    );

    return enrichedVersions;
  },
});

/**
 * Get a specific version
 */
export const getVersion = query({
  args: {
    rowId: v.id("dbRows"),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const versionRecord = await ctx.db
      .query("dbRowVersions")
      .withIndex("by_row_version", (q) =>
        q.eq("rowId", args.rowId).eq("version", args.version)
      )
      .first();

    return versionRecord;
  },
});

/**
 * Restore a row to a specific version
 */
export const restoreVersion = mutation({
  args: {
    rowId: v.id("dbRows"),
    version: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(args.rowId);
    if (!row) throw new Error("Row not found");

    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    // Get the version to restore
    const versionRecord = await ctx.db
      .query("dbRowVersions")
      .withIndex("by_row_version", (q) =>
        q.eq("rowId", args.rowId).eq("version", args.version)
      )
      .first();

    if (!versionRecord) throw new Error("Version not found");

    // Calculate changed fields
    const changedFields = Object.keys(versionRecord.data).filter(
      (key) =>
        JSON.stringify(row.data[key]) !==
        JSON.stringify(versionRecord.data[key])
    );

    // Update the row
    await ctx.db.patch(args.rowId, {
      data: versionRecord.data,
      updatedById: userId,
      updatedAt: Date.now(),
    });

    // Create a new version for the restore
    const latestVersion = await ctx.db
      .query("dbRowVersions")
      .withIndex("by_row", (q) => q.eq("rowId", args.rowId))
      .order("desc")
      .first();

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    await ctx.db.insert("dbRowVersions", {
      rowId: args.rowId,
      tableId: row.tableId,
      workspaceId: row.workspaceId,
      version: nextVersion,
      data: versionRecord.data,
      changedFields,
      changedById: userId,
      changeType: "restore",
      note: args.note ?? `Restored to version ${args.version}`,
      createdAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      action: "row.restore",
      resourceType: "dbRows",
      resourceId: args.rowId,
      workspaceId: row.workspaceId,
      userId,
      metadata: {
        restoredToVersion: args.version,
        newVersion: nextVersion,
      },
    });

    return { success: true, newVersion: nextVersion };
  },
});

/**
 * Compare two versions (diff)
 */
export const compareVersions = query({
  args: {
    rowId: v.id("dbRows"),
    versionA: v.number(),
    versionB: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const [versionARecord, versionBRecord] = await Promise.all([
      ctx.db
        .query("dbRowVersions")
        .withIndex("by_row_version", (q) =>
          q.eq("rowId", args.rowId).eq("version", args.versionA)
        )
        .first(),
      ctx.db
        .query("dbRowVersions")
        .withIndex("by_row_version", (q) =>
          q.eq("rowId", args.rowId).eq("version", args.versionB)
        )
        .first(),
    ]);

    if (!versionARecord || !versionBRecord) return null;

    // Calculate diff
    const allKeys = new Set([
      ...Object.keys(versionARecord.data),
      ...Object.keys(versionBRecord.data),
    ]);

    const diff: Array<{
      field: string;
      valueA: unknown;
      valueB: unknown;
      changed: boolean;
    }> = [];

    for (const key of allKeys) {
      const valueA = versionARecord.data[key];
      const valueB = versionBRecord.data[key];
      diff.push({
        field: key,
        valueA,
        valueB,
        changed: JSON.stringify(valueA) !== JSON.stringify(valueB),
      });
    }

    return {
      versionA: versionARecord,
      versionB: versionBRecord,
      diff: diff.filter((d) => d.changed),
      allFields: diff,
    };
  },
});

// ============ ROW HISTORY ============

/**
 * Record a field change (called internally)
 */
export const recordFieldChange = internalMutation({
  args: {
    rowId: v.id("dbRows"),
    tableId: v.id("dbTables"),
    workspaceId: v.id("workspaces"),
    fieldId: v.string(),
    fieldName: v.string(),
    previousValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    changedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("dbRowHistory", {
      rowId: args.rowId,
      tableId: args.tableId,
      workspaceId: args.workspaceId,
      fieldId: args.fieldId,
      fieldName: args.fieldName,
      previousValue: args.previousValue,
      newValue: args.newValue,
      changedById: args.changedById,
      changedAt: Date.now(),
    });
  },
});

/**
 * Get history for a row
 */
export const getRowHistory = query({
  args: {
    rowId: v.id("dbRows"),
    limit: v.optional(v.number()),
    fieldId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const fieldId = args.fieldId;
    let query;
    if (fieldId) {
      query = ctx.db
        .query("dbRowHistory")
        .withIndex("by_field", (q) =>
          q.eq("rowId", args.rowId).eq("fieldId", fieldId!)
        );
    } else {
      query = ctx.db
        .query("dbRowHistory")
        .withIndex("by_row", (q) => q.eq("rowId", args.rowId));
    }

    const history = await query.order("desc").take(args.limit ?? 100);

    // Enrich with user info
    const enrichedHistory = await Promise.all(
      history.map(async (h) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), h.changedById))
          .first();
        return {
          ...h,
          changedByName: user?.name ?? "Unknown",
          changedByEmail: user?.email,
        };
      })
    );

    return enrichedHistory;
  },
});

/**
 * Get history for a table
 */
export const getTableHistory = query({
  args: {
    tableId: v.id("dbTables"),
    limit: v.optional(v.number()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const table = await ctx.db.get(args.tableId);
    if (!table) return [];

    let query = ctx.db
      .query("dbRowHistory")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc");

    const history = await query.take(args.limit ?? 200);

    // Filter by since if provided
    const filtered = args.since
      ? history.filter((h) => h.changedAt >= args.since!)
      : history;

    // Enrich with user info
    const enrichedHistory = await Promise.all(
      filtered.map(async (h) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), h.changedById))
          .first();
        return {
          ...h,
          changedByName: user?.name ?? "Unknown",
        };
      })
    );

    return enrichedHistory;
  },
});
