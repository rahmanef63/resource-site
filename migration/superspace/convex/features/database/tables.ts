import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import type { Id } from "../../_generated/dataModel";
import { assertWorkspaceAccess, hasWorkspaceAccess } from "./utils";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, args.workspaceId, userId);
    if (!allowed) {
      return [];
    }

    return ctx.db
      .query("dbTables")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000);
  },
});

export const get = query({
  args: { id: v.id("dbTables") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const table = await ctx.db.get(args.id);
    if (!table) {
      return null;
    }

    const allowed = await hasWorkspaceAccess(ctx, table.workspaceId, userId);
    if (!allowed) {
      return null;
    }

    return table;
  },
});

/**
 * Get database table by feature type
 * Used by feature modules (Calendar, CRM, etc.) to find their associated database
 */
export const getByFeature = query({
  args: {
    workspaceId: v.id("workspaces"),
    featureType: v.union(
      v.literal("calendar"),
      v.literal("crm"),
      v.literal("tasks"),
      v.literal("projects"),
      v.literal("inventory"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const allowed = await hasWorkspaceAccess(ctx, args.workspaceId, userId);
    if (!allowed) {
      return null;
    }

    const table = await ctx.db
      .query("dbTables")
      .withIndex("by_feature", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("featureType", args.featureType)
      )
      .first();

    return table;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    icon: v.optional(v.string()),
    featureType: v.optional(v.union(
      v.literal("calendar"),
      v.literal("crm"),
      v.literal("tasks"),
      v.literal("projects"),
      v.literal("inventory"),
    )),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // RBAC: Check permission before creating
    await requirePermission(ctx, args.workspaceId, PERMISSIONS.DATABASE_CREATE);

    await assertWorkspaceAccess(ctx, args.workspaceId, userId);

    const tableId = await ctx.db.insert("dbTables", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      workspaceId: args.workspaceId,
      featureType: args.featureType,
      createdById: userId,
      updatedById: userId,
      isTemplate: false,
      settings: {
        showProperties: true,
        wrapCells: false,
        showCalculations: false,
      },
    });

    await ctx.db.insert("dbFields", {
      name: "Name",
      type: "text",
      tableId,
      isRequired: true,
      position: 0,
    });

    const defaultFields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .take(1000);

    await ctx.db.insert("dbViews", {
      name: "All",
      type: "table",
      tableId,
      createdById: userId,
      isDefault: true,
      settings: {
        filters: [],
        sorts: [],
        visibleFields: defaultFields.map((f) => f._id),
        fieldWidths: {},
      },
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dbTable.created",
      resourceType: "dbTable",
      resourceId: tableId,
      metadata: { name: args.name, icon: args.icon },
    });

    return tableId;
  },
});

export const update = mutation({
  args: {
    id: v.id("dbTables"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    settings: v.optional(
      v.object({
        showProperties: v.boolean(),
        wrapCells: v.boolean(),
        showCalculations: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before updating
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.settings !== undefined) updates.settings = args.settings;
    updates.updatedById = userId;

    await ctx.db.patch(args.id, updates);

    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbTable.updated",
      resourceType: "dbTable",
      resourceId: args.id,
      metadata: { changes: Object.keys(updates) },
    });
  },
});

export const deleteTable = mutation({
  args: { id: v.id("dbTables") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before deleting
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_DELETE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const [fields, rows, views] = await Promise.all([
      ctx.db
        .query("dbFields")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
      ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
      ctx.db
        .query("dbViews")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
    ]);

    await Promise.all([
      ...fields.map((field) => ctx.db.delete(field._id)),
      ...rows.map((row) => ctx.db.delete(row._id)),
      ...views.map((view) => ctx.db.delete(view._id)),
    ]);

    await ctx.db.delete(args.id);

    // CRITICAL: Audit log for deletion
    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbTable.deleted",
      resourceType: "dbTable",
      resourceId: args.id,
      metadata: {
        name: table.name,
        fieldsDeleted: fields.length,
        rowsDeleted: rows.length,
        viewsDeleted: views.length,
      },
    });
  },
});

export const duplicate = mutation({
  args: { id: v.id("dbTables"), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before duplicating (requires manage permission)
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_MANAGE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const [fields, rows, views] = await Promise.all([
      ctx.db
        .query("dbFields")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
      ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
      ctx.db
        .query("dbViews")
        .withIndex("by_table", (q) => q.eq("tableId", args.id))
        .take(1000),
    ]);

    const now = Date.now();

    const newTableId = await ctx.db.insert("dbTables", {
      name: args.name ?? `${table.name} Copy`,
      description: table.description,
      icon: table.icon,
      workspaceId: table.workspaceId,
      createdById: userId,
      updatedById: userId,
      isTemplate: table.isTemplate ?? false,
      settings: table.settings ?? {
        showProperties: true,
        wrapCells: false,
        showCalculations: false,
      },
      createdAt: now,
      updatedAt: now,
    });

    const fieldIdMap = new Map<string, Id<"dbFields">>();

    for (const field of fields) {
      const newFieldId = await ctx.db.insert("dbFields", {
        tableId: newTableId,
        name: field.name,
        type: field.type,
        options: field.options,
        isRequired: field.isRequired,
        isPrimary: field.isPrimary,
        position: field.position,
        createdAt: now,
        updatedAt: now,
      });

      fieldIdMap.set(String(field._id), newFieldId);
    }

    const remapFieldId = (fieldId: string | null | undefined): string | null => {
      if (!fieldId) return null;
      const mapped = fieldIdMap.get(fieldId);
      return mapped ? String(mapped) : null;
    };

    const remapRecordKeys = <T>(record: Record<string, T> | undefined | null) => {
      if (!record) return undefined;
      const next: Record<string, T> = {};
      Object.entries(record).forEach(([key, value]) => {
        const mapped = remapFieldId(key);
        if (mapped) {
          next[mapped] = value;
        }
      });
      return next;
    };

    for (const view of views) {
      const remappedFilters = view.settings.filters.map((filter) => ({
        ...filter,
        fieldId: remapFieldId(filter.fieldId) ?? filter.fieldId,
      }));

      const remappedSorts = view.settings.sorts.map((sort) => ({
        ...sort,
        fieldId: remapFieldId(sort.fieldId) ?? sort.fieldId,
      }));

      const remappedVisibleFields = view.settings.visibleFields
        .map((fieldId) => {
          const mapped = fieldIdMap.get(String(fieldId));
          return mapped ?? null;
        })
        .filter((value): value is Id<"dbFields"> => value !== null);

      const remappedFieldWidths = remapRecordKeys(view.settings.fieldWidths);

      await ctx.db.insert("dbViews", {
        tableId: newTableId,
        name: view.name,
        type: view.type,
        settings: {
          filters: remappedFilters,
          sorts: remappedSorts,
          visibleFields: remappedVisibleFields,
          fieldWidths: remappedFieldWidths,
        },
        createdById: userId,
        isDefault: view.isDefault ?? false,
        position: view.position,
        createdAt: now,
        updatedAt: now,
      });
    }

    const remapDataObject = (data: Record<string, unknown> | undefined | null) => {
      if (!data) return {};
      const next: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        const mapped = remapFieldId(key);
        if (mapped) {
          next[mapped] = value;
        }
      });
      return next;
    };

    let fallbackPosition = 0;
    for (const row of rows) {
      const position =
        typeof row.position === "number" ? row.position : fallbackPosition++;

      await ctx.db.insert("dbRows", {
        tableId: newTableId,
        workspaceId: table.workspaceId,
        data: remapDataObject(row.data),
        computed: remapDataObject(row.computed),
        docId: undefined,
        createdById: userId,
        updatedById: userId,
        position,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Ensure at least one view exists on duplicate
    const existingViews = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", newTableId))
      .take(1000);

    if (existingViews.length === 0) {
      await ctx.db.insert("dbViews", {
        tableId: newTableId,
        name: "All",
        type: "table",
        createdById: userId,
        isDefault: true,
        position: 0,
        settings: {
          filters: [],
          sorts: [],
          visibleFields: Array.from(fieldIdMap.values()),
          fieldWidths: {},
        },
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const firstView = existingViews[0];
      if (!existingViews.some((view) => view.isDefault)) {
        await ctx.db.patch(firstView._id, { isDefault: true });
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbTable.duplicated",
      resourceType: "dbTable",
      resourceId: newTableId,
      metadata: {
        originalId: args.id,
        originalName: table.name,
        newName: args.name ?? `${table.name} Copy`,
        fieldsCopied: fields.length,
        rowsCopied: rows.length,
      },
    });

    return newTableId;
  },
});
