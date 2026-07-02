import { mutation, type MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { assertWorkspaceAccess, nextOrderValue } from "./utils";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

export {
  create as createTable,
  update as updateTable,
  deleteTable,
  duplicate as duplicateTable,
} from "./tables";

export {
  create as createField,
  update as updateField,
  deleteField,
  reorder as reorderField,
} from "./fields";

export {
  create as createRow,
  update as updateRow,
  deleteRow,
  reorder as reorderRow,
  linkDocToRow,
  unlinkDocFromRow,
} from "./rows";

export { changeFieldType } from "./changeType";

const filterValidator = v.object({
  fieldId: v.string(),
  operator: v.union(
    v.literal("equals"),
    v.literal("contains"),
    v.literal("isEmpty"),
    v.literal("isNotEmpty"),
  ),
  value: v.optional(v.any()),
});

const sortValidator = v.object({
  fieldId: v.string(),
  direction: v.union(v.literal("asc"), v.literal("desc")),
});

const viewSettingsValidator = v.object({
  filters: v.array(filterValidator),
  sorts: v.array(sortValidator),
  visibleFields: v.array(v.id("dbFields")),
  fieldWidths: v.optional(v.record(v.string(), v.number())),
});

type ViewSettings = {
  filters: Array<{
    fieldId: string;
    operator: "equals" | "contains" | "isEmpty" | "isNotEmpty";
    value?: unknown;
  }>;
  sorts: Array<{
    fieldId: string;
    direction: "asc" | "desc";
  }>;
  visibleFields: Id<"dbFields">[];
  fieldWidths?: Record<string, number>;
};

export const createView = mutation({
  args: {
    tableId: v.id("dbTables"),
    name: v.string(),
    type: v.union(
      v.literal("table"),
      v.literal("board"),
      v.literal("calendar"),
      v.literal("gallery"),
      v.literal("list"),
      v.literal("timeline"),
    ),
    settings: v.optional(viewSettingsValidator),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before creating view
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_CREATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const existingViews = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(500);

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    const settings: ViewSettings =
      (args.settings as ViewSettings | undefined) ?? {
        filters: [],
        sorts: [],
        visibleFields: fields.map((field) => field._id),
        fieldWidths: {},
      };

    const position = nextOrderValue(existingViews);

    const viewId = await ctx.db.insert("dbViews", {
      name: args.name,
      type: args.type,
      tableId: args.tableId,
      createdById: userId,
      isDefault: args.isDefault ?? existingViews.length === 0,
      position,
      settings,
    });

    if (args.isDefault) {
      await setDefaultViewInternal(ctx, userId, viewId, table.workspaceId);
    }

    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbView.create",
      resourceType: "dbView",
      resourceId: viewId,
      metadata: { viewName: args.name, viewType: args.type, tableId: args.tableId },
      changes: args.settings,
    });

    return viewId;
  },
});

export const updateView = mutation({
  args: {
    id: v.id("dbViews"),
    name: v.optional(v.string()),
    settings: v.optional(viewSettingsValidator),
    position: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const view = await ctx.db.get(args.id);
    if (!view) {
      throw new Error("View not found");
    }

    const table = await ctx.db.get(view.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before updating view
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.settings !== undefined) updates.settings = args.settings;
    if (args.position !== undefined) updates.position = args.position;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }

    if (args.isDefault) {
      await setDefaultViewInternal(ctx, userId, args.id, table.workspaceId);
    }

    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbView.update",
      resourceType: "dbView",
      resourceId: args.id,
      metadata: { tableId: view.tableId },
      changes: updates,
    });
  },
});

export const deleteView = mutation({
  args: { id: v.id("dbViews") },
  handler: async (ctx, { id }) => {
    const userId = await ensureUser(ctx);

    const view = await ctx.db.get(id);
    if (!view) {
      throw new Error("View not found");
    }

    const table = await ctx.db.get(view.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before deleting view
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_DELETE);

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    await ctx.db.delete(id);

    if (view.isDefault) {
      // Only the next-ordered row needs to become the new default.
      const nextDefault = await ctx.db
        .query("dbViews")
        .withIndex("by_table", (q) => q.eq("tableId", view.tableId))
        .order("asc")
        .first();

      if (nextDefault) {
        await ctx.db.patch(nextDefault._id, { isDefault: true });
      }
    }

    // CRITICAL: Audit log for deletion
    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbView.delete",
      resourceType: "dbView",
      resourceId: id,
      metadata: {
        viewName: view.name,
        viewType: view.type,
        tableId: view.tableId,
        wasDefault: view.isDefault,
      },
    });
  },
});

export const setDefaultView = mutation({
  args: { id: v.id("dbViews") },
  handler: async (ctx, { id }) => {
    const userId = await ensureUser(ctx);

    const view = await ctx.db.get(id);
    if (!view) {
      throw new Error("View not found");
    }

    const table = await ctx.db.get(view.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission before setting default view
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await setDefaultViewInternal(ctx, userId, id, table.workspaceId);

    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbView.set_default",
      resourceType: "dbView",
      resourceId: id,
      metadata: { tableId: view.tableId },
    });
  },
});

async function setDefaultViewInternal(
  ctx: MutationCtx,
  userId: Id<"users">,
  viewId: Id<"dbViews">,
  workspaceId: Id<"workspaces">,
) {
  await assertWorkspaceAccess(ctx, workspaceId, userId);

  const view = await ctx.db.get(viewId);
  if (!view) {
    throw new Error("View not found");
  }

  const views = await ctx.db
    .query("dbViews")
    .withIndex("by_table", (q) => q.eq("tableId", view.tableId))
    .take(500);

  await Promise.all(
    views.map((other) =>
      ctx.db.patch(other._id, {
        isDefault: other._id === viewId,
      }),
    ),
  );
}
