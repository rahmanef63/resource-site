/**
 * Change Property Type Mutation
 * 
 * Handles changing a database field's type AND intelligently transforming all existing data.
 * Uses comprehensive transformation rules to preserve data when possible.
 * 
 * Examples:
 * - text → number: Extracts numeric values
 * - text → select: Splits by comma to create options
 * - select → checkbox: Maps true/false values
 * - number → text: Converts to string
 */

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { transformValue } from "./transformations";
import { logAuditEvent } from "../../shared/audit";

export const changeFieldType = mutation({
  args: {
    fieldId: v.id("dbFields"),
    newType: v.string(),
    transformData: v.optional(v.boolean()), // Whether to transform existing data
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Get the field
    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    // Get the table to check workspace permission
    const table = await ctx.db.get(field.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission  
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    const oldType = field.type;
    
    // Collect new options generated during transformation
    const allNewOptions = new Map<string, { id: string; name: string; color: string }>();
    let transformStats = {
      total: 0,
      success: 0,
      failed: 0,
      withWarnings: 0,
    };

    // Transform existing data if requested (default: true)
    if (args.transformData !== false) {
      // Get all rows for this table
      const rows = await ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
        .take(1000);

      transformStats.total = rows.length;

      // Get current field options (for select types)
      const currentOptions = field.options?.selectOptions;

      // Transform each row's value for this field
      for (const row of rows) {
        const data = row.data as Record<string, any>;
        const fieldKey = String(args.fieldId);
        
        if (data && fieldKey in data) {
          const oldValue = data[fieldKey];
          
          // Apply transformation
          const result = transformValue(oldType, args.newType, oldValue, currentOptions);
          
          // Track statistics
          if (result.success) {
            transformStats.success++;
          } else {
            transformStats.failed++;
          }
          if (result.warning) {
            transformStats.withWarnings++;
          }
          
          // Collect new options
          if (result.newOptions) {
            result.newOptions.forEach(option => {
              allNewOptions.set(option.id, option);
            });
          }
          
          // Update row value (even if transformation failed, to preserve behavior)
          await ctx.db.patch(row._id, {
            data: {
              ...data,
              [fieldKey]: result.value,
            },
          });
        }
      }
    }

    // Prepare field update
    const fieldUpdate: any = {
      type: args.newType,
    };

    // If new options were generated, update field options
    if (allNewOptions.size > 0) {
      fieldUpdate.options = {
        ...field.options,
        selectOptions: Array.from(allNewOptions.values()),
      };
    }

    // Update the field type and options
    await ctx.db.patch(args.fieldId, fieldUpdate);

    // Create audit log
    await logAuditEvent(ctx, {
      workspaceId: table.workspaceId,
      actorUserId: userId,
      action: "dbField.type_changed",
      resourceType: "dbField",
      resourceId: args.fieldId,
      metadata: {
        fieldName: field.name,
        oldType,
        newType: args.newType,
        transformStats,
        generatedOptions: allNewOptions.size,
      },
    });

    return {
      success: true,
      field: await ctx.db.get(args.fieldId),
      transformStats,
      generatedOptions: allNewOptions.size > 0 ? Array.from(allNewOptions.values()) : undefined,
    };
  },
});

