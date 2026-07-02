import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { assertWorkspaceAccess, hasWorkspaceAccess, nextOrderValue } from "./utils";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";
import { checkRowQuota } from "../../lib/quota";

interface ViewSettings {
  filters?: Array<{
    fieldId: string;
    operator: "equals" | "contains" | "isEmpty" | "isNotEmpty";
    value?: unknown;
  }>;
  sorts?: Array<{
    fieldId: string;
    direction: "asc" | "desc";
  }>;
}

export const list = query({
  args: {
    tableId: v.id("dbTables"),
    viewId: v.optional(v.id("dbViews")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, table.workspaceId, userId);
    if (!allowed) {
      return [];
    }

    let rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    if (args.viewId) {
      const view = await ctx.db.get(args.viewId);
      const settings = (view?.settings as ViewSettings | undefined) ?? {};

      const filters = settings.filters ?? [];
      const sorts = settings.sorts ?? [];

      for (const filter of filters) {
        rows = rows.filter((row) => {
          const value = row.data?.[filter.fieldId];
          switch (filter.operator) {
            case "equals":
              return value === filter.value;
            case "contains":
              return typeof value === "string" && typeof filter.value === "string"
                ? value.toLowerCase().includes(filter.value.toLowerCase())
                : false;
            case "isEmpty":
              return value === undefined || value === null || value === "";
            case "isNotEmpty":
              return value !== undefined && value !== null && value !== "";
            default:
              return true;
          }
        });
      }

      if (sorts.length > 0) {
        rows.sort((a, b) => {
          for (const sort of sorts) {
            const aVal = a.data?.[sort.fieldId];
            const bVal = b.data?.[sort.fieldId];

            if (aVal === bVal) {
              continue;
            }

            const comparison = aVal === undefined || aVal === null
              ? -1
              : bVal === undefined || bVal === null
              ? 1
              : aVal < bVal
              ? -1
              : 1;

            return sort.direction === "desc" ? -comparison : comparison;
          }
          return 0;
        });
      }
    }

    return rows.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  },
});

export const get = query({
  args: { id: v.id("dbRows") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const row = await ctx.db.get(args.id);
    if (!row) {
      return null;
    }

    const allowed = await hasWorkspaceAccess(ctx, row.workspaceId, userId);
    if (!allowed) {
      return null;
    }

    return row;
  },
});

export const create = mutation({
  args: {
    tableId: v.id("dbTables"),
    data: v.record(v.string(), v.any()),
    docId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before creating
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_CREATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    // Enforce row quota before inserting
    await checkRowQuota(ctx, args.tableId);

    const existingRows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    const nextPosition = nextOrderValue(existingRows);

    return ctx.db.insert("dbRows", {
      tableId: args.tableId,
      workspaceId: table.workspaceId,
      docId: args.docId,
      data: args.data,
      createdById: userId,
      updatedById: userId,
      position: nextPosition,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dbRows"),
    data: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(args.id);
    if (!row) {
      throw new Error("Row not found");
    }

    // RBAC: Check permission before updating
    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    await ctx.db.patch(args.id, {
      data: { ...row.data, ...args.data },
      updatedById: userId,
    });
  },
});

export const deleteRow = mutation({
  args: { id: v.id("dbRows") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(args.id);
    if (!row) {
      throw new Error("Row not found");
    }

    // RBAC: Check permission before deleting
    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_DELETE);

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    if (row.docId) {
      // Swallow missing docs gracefully.
      const doc = await ctx.db.get(row.docId);
      if (doc) {
        await ctx.db.delete(row.docId);
      }
    }

    await ctx.db.delete(args.id);

    // CRITICAL: Audit log for deletion
    await logAuditEvent(ctx, {
      workspaceId: row.workspaceId,
      actorUserId: userId,
      action: "dbRow.deleted",
      resourceType: "dbRow",
      resourceId: args.id,
      metadata: { tableId: row.tableId, linkedDocDeleted: !!row.docId },
    });
  },
});

export const reorder = mutation({
  args: {
    rowId: v.id("dbRows"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(args.rowId);
    if (!row) {
      throw new Error("Row not found");
    }

    // RBAC: Check permission before reordering
    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", row.tableId))
      .take(1000);

    const sortByPosition = <T extends { position?: number }>(a: T, b: T) =>
      (a.position ?? 0) - (b.position ?? 0);

    const ordered = rows.sort(sortByPosition);
    const withoutTarget = ordered.filter((item) => item._id !== args.rowId);
    const targetIndex = Math.max(0, Math.min(Math.floor(args.newPosition), withoutTarget.length));
    const reordered = [
      ...withoutTarget.slice(0, targetIndex),
      row,
      ...withoutTarget.slice(targetIndex),
    ];

    await Promise.all(
      reordered.map((current, index) =>
        (current.position ?? 0) === index
          ? Promise.resolve()
          : ctx.db.patch(current._id, { position: index }),
      ),
    );
  },
});

export const linkDocToRow = mutation({
  args: {
    rowId: v.id("dbRows"),
    docId: v.id("documents"),
  },
  handler: async (ctx, { rowId, docId }) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(rowId);
    if (!row) {
      throw new Error("Row not found");
    }

    // RBAC: Check permission before linking
    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    const doc = await ctx.db.get(docId);
    if (!doc) {
      throw new Error("Document not found");
    }

    if (doc.workspaceId !== row.workspaceId) {
      throw new Error("Document must belong to the same workspace as the row");
    }

    const canSeeDoc = doc.isPublic || doc.createdBy === userId;
    if (!canSeeDoc) {
      throw new Error("Unauthorized to link this document");
    }

    if (row.docId && row.docId !== docId) {
      throw new Error("Row is already linked to a different document");
    }

    await ctx.db.patch(rowId, {
      docId,
      updatedById: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: row.workspaceId,
      actorUserId: userId,
      action: "dbRow.docLinked",
      resourceType: "dbRow",
      resourceId: rowId,
      metadata: { tableId: row.tableId, docId },
      changes: { docId },
    });

    return { rowId, docId };
  },
});

export const unlinkDocFromRow = mutation({
  args: {
    rowId: v.id("dbRows"),
    docId: v.id("documents"),
  },
  handler: async (ctx, { rowId, docId }) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(rowId);
    if (!row) {
      throw new Error("Row not found");
    }

    // RBAC: Check permission before unlinking
    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    if (!row.docId) {
      return { rowId, docId: null };
    }

    if (row.docId !== docId) {
      throw new Error("Row is linked to a different document");
    }

    await ctx.db.patch(rowId, {
      docId: undefined,
      updatedById: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: row.workspaceId,
      actorUserId: userId,
      action: "dbRow.docUnlinked",
      resourceType: "dbRow",
      resourceId: rowId,
      metadata: { tableId: row.tableId, docId },
      changes: { docId: null },
    });

    return { rowId, docId: null };
  },
});
