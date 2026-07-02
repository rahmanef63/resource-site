/**
 * Schema Versioning API
 * Features #101, #102 - Schema version control and migrations
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { requirePermission } from "../../shared/auth";
import { PERMS } from "../../workspace/permissions";

type MigrationStepType =
  | "rename_field"
  | "change_type"
  | "merge_fields"
  | "split_field"
  | "compute_values"
  | "delete_field";

interface MigrationStep {
  type: MigrationStepType;
  config: Record<string, any>;
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Get all schema versions for a table
 */
export const getVersions = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbSchemaVersions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .take(1000);
  },
});

/**
 * Get a specific schema version
 */
export const getVersion = query({
  args: {
    versionId: v.id("dbSchemaVersions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.versionId);
  },
});

/**
 * Get the latest schema version for a table
 */
export const getLatestVersion = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("dbSchemaVersions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .first();

    return versions;
  },
});

/**
 * Get all migrations for a table
 */
export const getMigrations = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbSchemaMigrations")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .take(1000);
  },
});

/**
 * Get pending migrations
 */
export const getPendingMigrations = query({
  args: {
    tableId: v.optional(v.id("dbTables")),
  },
  handler: async (ctx, args) => {
    let migrations = await ctx.db
      .query("dbSchemaMigrations")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(1000);

    if (args.tableId) {
      migrations = migrations.filter((m) => m.tableId === args.tableId);
    }

    return migrations;
  },
});

/**
 * Compare two schema versions
 */
export const compareVersions = query({
  args: {
    versionId1: v.id("dbSchemaVersions"),
    versionId2: v.id("dbSchemaVersions"),
  },
  handler: async (ctx, args) => {
    const version1 = await ctx.db.get(args.versionId1);
    const version2 = await ctx.db.get(args.versionId2);

    if (!version1 || !version2) {
      throw new Error("Version not found");
    }

    const fields1 = new Map(version1.fieldsSnapshot.map((f) => [f.fieldId, f]));
    const fields2 = new Map(version2.fieldsSnapshot.map((f) => [f.fieldId, f]));

    const added: typeof version1.fieldsSnapshot = [];
    const removed: typeof version1.fieldsSnapshot = [];
    const modified: Array<{
      fieldId: string;
      before: (typeof version1.fieldsSnapshot)[0];
      after: (typeof version1.fieldsSnapshot)[0];
    }> = [];

    // Find added and modified fields
    for (const [fieldId, field] of fields2) {
      if (!fields1.has(fieldId)) {
        added.push(field);
      } else {
        const oldField = fields1.get(fieldId)!;
        if (
          oldField.name !== field.name ||
          oldField.type !== field.type ||
          JSON.stringify(oldField.options) !== JSON.stringify(field.options)
        ) {
          modified.push({ fieldId, before: oldField, after: field });
        }
      }
    }

    // Find removed fields
    for (const [fieldId, field] of fields1) {
      if (!fields2.has(fieldId)) {
        removed.push(field);
      }
    }

    return {
      version1: version1.version,
      version2: version2.version,
      added,
      removed,
      modified,
    };
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new schema version snapshot
 */
export const createVersion = mutation({
  args: {
    tableId: v.id("dbTables"),
    changeType: v.union(
      v.literal("field_added"),
      v.literal("field_removed"),
      v.literal("field_modified"),
      v.literal("field_reordered"),
      v.literal("table_created"),
      v.literal("batch_changes")
    ),
    changes: v.optional(
      v.array(
        v.object({
          fieldId: v.optional(v.string()),
          action: v.string(),
          before: v.optional(v.any()),
          after: v.optional(v.any()),
        })
      )
    ),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get current fields
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    // Create fields snapshot
    const fieldsSnapshot = fields.map((f) => ({
      fieldId: f._id,
      name: f.name,
      type: f.type,
      options: f.options,
      order: f.position,
    }));

    // Get latest version number
    const latestVersion = await ctx.db
      .query("dbSchemaVersions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .first();

    const newVersion = (latestVersion?.version || 0) + 1;

    const versionId = await ctx.db.insert("dbSchemaVersions", {
      tableId: args.tableId,
      version: newVersion,
      fieldsSnapshot,
      changeType: args.changeType,
      changes: args.changes,
      comment: args.comment,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return { versionId, version: newVersion };
  },
});

/**
 * Create a migration between versions
 */
export const createMigration = mutation({
  args: {
    tableId: v.id("dbTables"),
    fromVersion: v.number(),
    toVersion: v.number(),
    migrationSteps: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("rename_field"),
            v.literal("change_type"),
            v.literal("merge_fields"),
            v.literal("split_field"),
            v.literal("compute_values"),
            v.literal("delete_field")
          ),
          config: v.any(),
        })
      )
    ),
    migrationScript: v.optional(v.string()),
    isReversible: v.optional(v.boolean()),
    rollbackScript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const migrationId = await ctx.db.insert("dbSchemaMigrations", {
      tableId: args.tableId,
      fromVersion: args.fromVersion,
      toVersion: args.toVersion,
      migrationSteps: args.migrationSteps,
      migrationScript: args.migrationScript,
      status: "pending",
      isReversible: args.isReversible,
      rollbackScript: args.rollbackScript,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return migrationId;
  },
});

/**
 * Execute a migration
 */
export const executeMigration = mutation({
  args: {
    migrationId: v.id("dbSchemaMigrations"),
  },
  handler: async (ctx, args) => {
    const migration = await ctx.db.get(args.migrationId);
    if (!migration) {
      throw new Error("Migration not found");
    }

    const table = await ctx.db.get(migration.tableId);
    if (!table) {
      throw new Error("Table not found");
    }
    await requirePermission(ctx, table.workspaceId, PERMS.DATABASE_MANAGE);

    if (migration.status !== "pending") {
      throw new Error(`Migration is ${migration.status}, cannot execute`);
    }

    // Mark as running
    await ctx.db.patch(args.migrationId, {
      status: "running",
      executedAt: Date.now(),
    });

    try {
      // Get all rows for the table
      const rows = await ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", migration.tableId))
        .take(1000);

      let processedCount = 0;
      let failedCount = 0;
      const errorLog: string[] = [];

      // Process migration steps
      const migrationSteps = (migration.migrationSteps ?? []) as MigrationStep[];
      if (migrationSteps.length > 0) {
        for (const row of rows) {
          try {
            let updatedData = { ...row.data };

            for (const step of migrationSteps) {
              switch (step.type) {
                case "rename_field":
                  if (step.config.oldName in updatedData) {
                    updatedData[step.config.newName] =
                      updatedData[step.config.oldName];
                    delete updatedData[step.config.oldName];
                  }
                  break;

                case "change_type":
                  if (step.config.fieldName in updatedData) {
                    const value = updatedData[step.config.fieldName];
                    // Type conversion logic
                    if (step.config.toType === "string") {
                      updatedData[step.config.fieldName] = String(value);
                    } else if (step.config.toType === "number") {
                      updatedData[step.config.fieldName] = Number(value) || 0;
                    } else if (step.config.toType === "boolean") {
                      updatedData[step.config.fieldName] = Boolean(value);
                    }
                  }
                  break;

                case "delete_field":
                  delete updatedData[step.config.fieldName];
                  break;

                case "compute_values":
                  // Simple computed value support
                  if (step.config.formula && step.config.targetField) {
                    // For now, just set a default value
                    updatedData[step.config.targetField] =
                      step.config.defaultValue;
                  }
                  break;
              }
            }

            // Update the row
            await ctx.db.patch(row._id, { data: updatedData });
            processedCount++;
          } catch (error) {
            failedCount++;
            errorLog.push(
              `Row ${row._id}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      }

      // Mark as completed
      await ctx.db.patch(args.migrationId, {
        status: failedCount > 0 && processedCount === 0 ? "failed" : "completed",
        completedAt: Date.now(),
        rowsProcessed: processedCount,
        rowsFailed: failedCount,
        errorLog: errorLog.length > 0 ? errorLog : undefined,
      });

      return {
        success: true,
        processedCount,
        failedCount,
        errorLog,
      };
    } catch (error) {
      await ctx.db.patch(args.migrationId, {
        status: "failed",
        completedAt: Date.now(),
        errorLog: [error instanceof Error ? error.message : "Unknown error"],
      });

      throw error;
    }
  },
});

/**
 * Rollback a migration
 */
export const rollbackMigration = mutation({
  args: {
    migrationId: v.id("dbSchemaMigrations"),
  },
  handler: async (ctx, args) => {
    const migration = await ctx.db.get(args.migrationId);
    if (!migration) {
      throw new Error("Migration not found");
    }

    if (migration.status !== "completed") {
      throw new Error("Only completed migrations can be rolled back");
    }

    if (!migration.isReversible) {
      throw new Error("This migration is not reversible");
    }

    // Mark as rolling back
    await ctx.db.patch(args.migrationId, {
      status: "running",
    });

    try {
      // If there's a rollback script, we would execute it here
      // For now, we just mark it as rolled back

      await ctx.db.patch(args.migrationId, {
        status: "rolled_back",
        completedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      await ctx.db.patch(args.migrationId, {
        status: "failed",
        errorLog: [
          ...(migration.errorLog || []),
          `Rollback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      });

      throw error;
    }
  },
});

/**
 * Restore table to a previous schema version
 */
export const restoreVersion = mutation({
  args: {
    tableId: v.id("dbTables"),
    versionId: v.id("dbSchemaVersions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new Error("Version not found");
    }

    // Get current fields
    const currentFields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .take(1000);

    // Delete all current fields
    for (const field of currentFields) {
      await ctx.db.delete(field._id);
    }

    // Recreate fields from snapshot
    for (const snapshot of version.fieldsSnapshot) {
      await ctx.db.insert("dbFields", {
        tableId: args.tableId,
        name: snapshot.name,
        type: snapshot.type as any,
        options: snapshot.options,
        position: snapshot.order,
        isRequired: false,
        createdAt: Date.now(),
      });
    }

    // Create a new version to record this restore
    await ctx.db.insert("dbSchemaVersions", {
      tableId: args.tableId,
      version: version.version,
      fieldsSnapshot: version.fieldsSnapshot,
      changeType: "batch_changes",
      changes: [
        {
          action: "restore",
          before: { version: "current" },
          after: { version: version.version },
        },
      ],
      comment: `Restored to version ${version.version}`,
      createdById: user._id,
      createdAt: Date.now(),
    });

    return { success: true, restoredVersion: version.version };
  },
});
