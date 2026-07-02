/**
 * Conditional Fields API (Feature #85)
 * Field visibility and behavior based on conditions
 */
import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// Condition operators
const conditionOperators = [
  "equals",
  "notEquals",
  "contains",
  "isEmpty",
  "isNotEmpty",
  "greaterThan",
  "lessThan",
] as const;

/**
 * Create a conditional rule for a field
 */
export const createCondition = mutation({
  args: {
    fieldId: v.id("dbFields"),
    tableId: v.id("dbTables"),
    conditionType: v.union(
      v.literal("showIf"),
      v.literal("hideIf"),
      v.literal("requiredIf"),
      v.literal("readonlyIf")
    ),
    conditions: v.array(
      v.object({
        sourceFieldId: v.id("dbFields"),
        operator: v.union(
          v.literal("equals"),
          v.literal("notEquals"),
          v.literal("contains"),
          v.literal("isEmpty"),
          v.literal("isNotEmpty"),
          v.literal("greaterThan"),
          v.literal("lessThan")
        ),
        value: v.optional(v.any()),
      })
    ),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.tableId);
    if (!table) throw new Error("Table not found");

    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.tableId !== args.tableId) {
      throw new Error("Field not found in table");
    }

    // Validate source fields exist
    for (const condition of args.conditions) {
      const sourceField = await ctx.db.get(condition.sourceFieldId);
      if (!sourceField || sourceField.tableId !== args.tableId) {
        throw new Error(`Source field ${condition.sourceFieldId} not found`);
      }
    }

    const now = Date.now();

    const conditionId = await ctx.db.insert("dbFieldConditions", {
      fieldId: args.fieldId,
      tableId: args.tableId,
      conditionType: args.conditionType,
      conditions: args.conditions,
      priority: args.priority ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      action: "fieldCondition.create",
      resourceType: "dbFieldConditions",
      resourceId: conditionId,
      workspaceId: table.workspaceId,
      userId,
      metadata: {
        fieldName: field.name,
        conditionType: args.conditionType,
      },
    });

    return conditionId;
  },
});

/**
 * List conditions for a field
 */
export const listConditions = query({
  args: {
    fieldId: v.optional(v.id("dbFields")),
    tableId: v.optional(v.id("dbTables")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.fieldId) {
      return ctx.db
        .query("dbFieldConditions")
        .withIndex("by_field", (q) => q.eq("fieldId", args.fieldId!))
        .take(1000);
    }

    if (args.tableId) {
      return ctx.db
        .query("dbFieldConditions")
        .withIndex("by_table", (q) => q.eq("tableId", args.tableId!))
        .take(1000);
    }

    return [];
  },
});

/**
 * Update a condition
 */
export const updateCondition = mutation({
  args: {
    conditionId: v.id("dbFieldConditions"),
    conditionType: v.optional(
      v.union(
        v.literal("showIf"),
        v.literal("hideIf"),
        v.literal("requiredIf"),
        v.literal("readonlyIf")
      )
    ),
    conditions: v.optional(
      v.array(
        v.object({
          sourceFieldId: v.id("dbFields"),
          operator: v.union(
            v.literal("equals"),
            v.literal("notEquals"),
            v.literal("contains"),
            v.literal("isEmpty"),
            v.literal("isNotEmpty"),
            v.literal("greaterThan"),
            v.literal("lessThan")
          ),
          value: v.optional(v.any()),
        })
      )
    ),
    priority: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const condition = await ctx.db.get(args.conditionId);
    if (!condition) throw new Error("Condition not found");

    const table = await ctx.db.get(condition.tableId);
    if (!table) throw new Error("Table not found");

    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.conditionType !== undefined)
      updates.conditionType = args.conditionType;
    if (args.conditions !== undefined) updates.conditions = args.conditions;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.conditionId, updates);

    await logAuditEvent(ctx, {
      action: "fieldCondition.update",
      resourceType: "dbFieldConditions",
      resourceId: args.conditionId,
      workspaceId: table.workspaceId,
      userId,
      metadata: {},
    });

    return args.conditionId;
  },
});

/**
 * Delete a condition
 */
export const deleteCondition = mutation({
  args: {
    conditionId: v.id("dbFieldConditions"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const condition = await ctx.db.get(args.conditionId);
    if (!condition) throw new Error("Condition not found");

    const table = await ctx.db.get(condition.tableId);
    if (!table) throw new Error("Table not found");

    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    await ctx.db.delete(args.conditionId);

    await logAuditEvent(ctx, {
      action: "fieldCondition.delete",
      resourceType: "dbFieldConditions",
      resourceId: args.conditionId,
      workspaceId: table.workspaceId,
      userId,
      metadata: {},
    });

    return true;
  },
});

/**
 * Evaluate conditions for a row
 * Returns visibility/behavior state for each field
 */
export const evaluateConditions = query({
  args: {
    tableId: v.id("dbTables"),
    rowData: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    // Get all active conditions for this table
    const conditions = await ctx.db
      .query("dbFieldConditions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000);

    // Get fields for name lookup
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    const fieldMap = new Map(fields.map((f) => [f._id, f]));

    // Result: fieldId -> { visible, required, readonly }
    const result: Record<
      string,
      { visible: boolean; required: boolean; readonly: boolean }
    > = {};

    // Initialize all fields as visible, not required (unless base required), not readonly
    for (const field of fields) {
      result[field._id] = {
        visible: true,
        required: field.isRequired,
        readonly: false,
      };
    }

    // Sort by priority (lower = higher priority, evaluated first)
    const sortedConditions = conditions.sort(
      (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
    );

    // Evaluate each condition
    for (const condition of sortedConditions) {
      const allConditionsMet = condition.conditions.every((c) => {
        const sourceField = fieldMap.get(c.sourceFieldId);
        if (!sourceField) return false;

        const value = args.rowData[c.sourceFieldId];
        return evaluateOperator(c.operator, value, c.value);
      });

      if (allConditionsMet) {
        const fieldId = condition.fieldId as string;
        if (!result[fieldId]) continue;

        switch (condition.conditionType) {
          case "showIf":
            result[fieldId].visible = true;
            break;
          case "hideIf":
            result[fieldId].visible = false;
            break;
          case "requiredIf":
            result[fieldId].required = true;
            break;
          case "readonlyIf":
            result[fieldId].readonly = true;
            break;
        }
      }
    }

    return result;
  },
});

/**
 * Evaluate a single operator condition
 */
function evaluateOperator(
  operator: string,
  fieldValue: unknown,
  conditionValue: unknown
): boolean {
  switch (operator) {
    case "equals":
      return fieldValue === conditionValue;

    case "notEquals":
      return fieldValue !== conditionValue;

    case "contains":
      if (typeof fieldValue === "string" && typeof conditionValue === "string") {
        return fieldValue.toLowerCase().includes(conditionValue.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case "isEmpty":
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "isNotEmpty":
      return !(
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "greaterThan":
      if (typeof fieldValue === "number" && typeof conditionValue === "number") {
        return fieldValue > conditionValue;
      }
      return false;

    case "lessThan":
      if (typeof fieldValue === "number" && typeof conditionValue === "number") {
        return fieldValue < conditionValue;
      }
      return false;

    default:
      return false;
  }
}
