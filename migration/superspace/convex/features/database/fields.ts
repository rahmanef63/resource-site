import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertWorkspaceAccess, hasWorkspaceAccess, nextOrderValue } from "./utils";
import { ensureUser, requirePermission } from "../../auth/helpers";
import type { Id } from "../../_generated/dataModel";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

const sortByPosition = <T extends { position?: number }>(a: T, b: T) =>
  (a.position ?? 0) - (b.position ?? 0);

export const list = query({
  args: { tableId: v.id("dbTables") },
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

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    return fields.sort(sortByPosition);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("select"),
      v.literal("multiSelect"),
      v.literal("date"),
      v.literal("person"),
      v.literal("files"),
      v.literal("checkbox"),
      v.literal("url"),
      v.literal("email"),
      v.literal("phone"),
      v.literal("formula"),
      v.literal("relation"),
      v.literal("rollup"),
    ),
    tableId: v.id("dbTables"),
    options: v.optional(
      v.object({
        selectOptions: v.optional(
          v.array(
            v.object({
              id: v.string(),
              name: v.string(),
              color: v.string(),
            }),
          ),
        ),
        dateFormat: v.optional(v.string()),
        timeFormat: v.optional(v.string()),
        numberFormat: v.optional(v.string()),
        formula: v.optional(v.string()),
      }),
    ),
    isRequired: v.optional(v.boolean()),
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

    const existingFields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    const nextPosition = nextOrderValue(existingFields);

    const fieldId = await ctx.db.insert("dbFields", {
      name: args.name,
      type: args.type,
      tableId: args.tableId,
      options: args.options,
      isRequired: args.isRequired ?? false,
      position: nextPosition,
    });

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    await Promise.all(
      views.map(async (view) => {
        const visibleFields = view.settings.visibleFields ?? [];
        const exists = visibleFields.some(
          (id) => String(id) === String(fieldId),
        );

        if (!exists) {
          await ctx.db.patch(view._id, {
            settings: {
              ...view.settings,
              visibleFields: [...visibleFields, fieldId],
            },
          });
        }
      }),
    );

    return fieldId;
  },
});

export const update = mutation({
  args: {
    id: v.id("dbFields"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("text"),
        v.literal("number"),
        v.literal("select"),
        v.literal("multiSelect"),
        v.literal("date"),
        v.literal("person"),
        v.literal("files"),
        v.literal("checkbox"),
        v.literal("url"),
        v.literal("email"),
        v.literal("phone"),
        v.literal("formula"),
        v.literal("relation"),
        v.literal("rollup"),
      ),
    ),
    options: v.optional(
      v.object({
        selectOptions: v.optional(
          v.array(
            v.object({
              id: v.string(),
              name: v.string(),
              color: v.string(),
            }),
          ),
        ),
        dateFormat: v.optional(v.string()),
        timeFormat: v.optional(v.string()),
        numberFormat: v.optional(v.string()),
        formula: v.optional(v.string()),
      }),
    ),
    isRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const field = await ctx.db.get(args.id);
    if (!field) {
      throw new Error("Field not found");
    }

    const table = await ctx.db.get(field.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before updating
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.options !== undefined) updates.options = args.options;
    if (args.isRequired !== undefined) updates.isRequired = args.isRequired;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }
  },
});

export const reorder = mutation({
  args: {
    fieldId: v.id("dbFields"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    const table = await ctx.db.get(field.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before reordering
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
      .take(1000);

    const ordered = fields.sort(sortByPosition);
    const withoutTarget = ordered.filter((item) => item._id !== args.fieldId);
    const targetIndex = Math.max(0, Math.min(Math.floor(args.newPosition), withoutTarget.length));
    const reordered = [
      ...withoutTarget.slice(0, targetIndex),
      field,
      ...withoutTarget.slice(targetIndex),
    ];

    await Promise.all(
      reordered.map((current, index) =>
        (current.position ?? 0) === index
          ? Promise.resolve()
          : ctx.db.patch(current._id, { position: index }),
      ),
    );

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
      .take(1000);

    await Promise.all(
      views.map(async (view) => {
        const visibleFields = view.settings.visibleFields ?? [];
        if (visibleFields.length === 0) {
          return;
        }

        const orderMap = new Map<string, number>();
        reordered.forEach((item, index) => {
          orderMap.set(String(item._id), index);
        });

        const sortedVisibleFields = [...visibleFields].sort((a, b) => {
          const aOrder = orderMap.get(String(a)) ?? Number.MAX_SAFE_INTEGER;
          const bOrder = orderMap.get(String(b)) ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder;
        });

        const hasChanged = sortedVisibleFields.some(
          (id, index) => String(id) !== String(visibleFields[index]),
        );

        if (hasChanged) {
          await ctx.db.patch(view._id, {
            settings: {
              ...view.settings,
              visibleFields: sortedVisibleFields,
            },
          });
        }
      }),
    );
  },
});

export const deleteField = mutation({
  args: { id: v.id("dbFields") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const field = await ctx.db.get(args.id);
    if (!field) {
      throw new Error("Field not found");
    }

    const table = await ctx.db.get(field.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before deleting
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_DELETE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
      .take(1000);

    await Promise.all(
      rows.map(async (row) => {
        if (row.data && Object.prototype.hasOwnProperty.call(row.data, args.id)) {
          const nextData = { ...row.data };
          delete nextData[args.id];
          await ctx.db.patch(row._id, { data: nextData });
        }
      }),
    );

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
      .take(1000);

    await Promise.all(
      views.map(async (view) => {
        const nextVisibleFields = view.settings.visibleFields.filter(
          (id) => String(id) !== String(args.id),
        );

        let widthsChanged = false;
        let nextFieldWidths: Record<string, number> | undefined;
        if (view.settings.fieldWidths) {
          const entries = Object.entries(view.settings.fieldWidths).filter(
            ([key]) => key !== String(args.id),
          );
          widthsChanged = entries.length !== Object.keys(view.settings.fieldWidths).length;
          if (entries.length > 0) {
            nextFieldWidths = Object.fromEntries(entries);
          }
        }

        const visibilityChanged =
          nextVisibleFields.length !== view.settings.visibleFields.length;

        if (visibilityChanged || widthsChanged) {
          const { fieldWidths: _existingWidths, ...settingsWithoutWidths } = view.settings;

          let settingsPayload = {
            ...settingsWithoutWidths,
            visibleFields: nextVisibleFields as Id<"dbFields">[],
          } as typeof view.settings;

          if (nextFieldWidths) {
            settingsPayload = {
              ...settingsPayload,
              fieldWidths: nextFieldWidths,
            };
          }

          await ctx.db.patch(view._id, {
            settings: settingsPayload,
          });
        }
      }),
    );

    await ctx.db.delete(args.id);

    // CRITICAL: Audit log for deletion
    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbField.deleted",
      resourceType: "dbField",
      resourceId: args.id,
      metadata: {
        fieldName: field.name,
        fieldType: field.type,
        tableId: field.tableId,
        rowsAffected: rows.length,
      },
    });
  },
});
