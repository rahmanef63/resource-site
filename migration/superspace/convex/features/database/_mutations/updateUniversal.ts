/**
 * Update Universal Database Mutation
 *
 * Updates an existing Universal Database v2.0 with partial updates support.
 * Validates changes and maintains data integrity.
 *
 * RBAC: Requires "database:update" permission
 * AUDIT: Logs "database.update" event
 * VALIDATION: Validates universalSpec with Zod if provided
 *
 * @see docs/PHASE_2_TASKS.md for specifications
 * @see docs/UNIVERSAL_DATABASE_SPEC.md for schema details
 */

import { v } from "convex/values";
import { mutation } from "../../../_generated/server";
import { requirePermission } from "../../../lib/rbac/permissions";
import { logAudit } from "../../../lib/audit/logger";
import { ConvexError } from "convex/values";
import { UniversalDatabaseSchema } from "../../../../frontend/shared/foundation/schemas/universal-database";
import { Id } from "../../../_generated/dataModel";

/**
 * Update an existing Universal Database
 *
 * Supports partial updates - only provided fields will be updated.
 * Validates all changes and maintains referential integrity.
 *
 * @param ctx - Convex mutation context
 * @param args - Update arguments
 * @returns The updated database object
 *
 * @throws {ConvexError} 400 - Validation errors
 * @throws {ConvexError} 403 - Permission denied
 * @throws {ConvexError} 404 - Database not found
 * @throws {ConvexError} 409 - Duplicate database name
 *
 * @example
 * ```typescript
 * const updated = await ctx.runMutation(api.features.database.mutations.updateUniversal, {
 *   databaseId: databaseId,
 *   name: "Updated Product Catalog",
 *   universalSpec: { ... },
 * });
 * ```
 */
export const updateUniversal = mutation({
  args: {
    databaseId: v.id("universalDatabases"),
    name: v.optional(v.string()),
    universalSpec: v.optional(v.any()),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ========================================================================
    // STEP 1: FETCH EXISTING DATABASE
    // ========================================================================
    const database = await ctx.db.get(args.databaseId);
    
    if (!database) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: `Database with ID '${args.databaseId}' not found`,
      });
    }

    // ========================================================================
    // STEP 2: RBAC PERMISSION CHECK (DoD #2)
    // ========================================================================
    await requirePermission(ctx, database.workspaceId, "database:update");

    // ========================================================================
    // STEP 3: VALIDATE INPUT
    // ========================================================================

    // Track changed fields for audit log
    const changedFields: string[] = [];

    // 3.1: Validate name if provided
    if (args.name !== undefined) {
      if (!args.name || args.name.trim().length === 0) {
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: "Database name is required and cannot be empty",
        });
      }

      if (args.name.length > 100) {
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: "Database name must be 100 characters or less",
        });
      }

      // Check for duplicate name (only if changing name)
      if (args.name !== database.name) {
        const existingDatabase = await ctx.db
          .query("universalDatabases")
          .withIndex("by_workspace_name", (q) =>
            q.eq("workspaceId", database.workspaceId).eq("name", args.name!)
          )
          .first();

        if (existingDatabase && existingDatabase._id !== args.databaseId) {
          throw new ConvexError({
            code: "CONFLICT",
            message: `A database with name '${args.name}' already exists in this workspace`,
          });
        }
      }

      changedFields.push("name");
    }

    // 3.2: Validate universalSpec if provided
    let validatedSpec = database.universalSpec;
    if (args.universalSpec !== undefined) {
      const validationResult = UniversalDatabaseSchema.safeParse(
        args.universalSpec
      );

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: `Invalid universal database specification: ${firstError.path.join(".")}: ${firstError.message}`,
        });
      }

      validatedSpec = validationResult.data;
      const dbSpec = validatedSpec.db;

      // Validate at least 1 property exists
      if (!dbSpec.properties || dbSpec.properties.length === 0) {
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: "Database must have at least one property",
        });
      }

      // Validate at least 1 view exists
      if (!dbSpec.views || dbSpec.views.length === 0) {
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: "Database must have at least one view",
        });
      }

      // Validate unique property keys
      const propertyKeys = dbSpec.properties.map((p: any) => p.key);
      const uniqueKeys = new Set(propertyKeys);
      if (propertyKeys.length !== uniqueKeys.size) {
        const duplicates = propertyKeys.filter(
          (key: any, index: number) => propertyKeys.indexOf(key) !== index
        );
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: `Duplicate property keys found: ${duplicates.join(", ")}`,
        });
      }

      // Validate view IDs are unique
      const viewIds = dbSpec.views.map((v: any) => v.id);
      const uniqueViewIds = new Set(viewIds);
      if (viewIds.length !== uniqueViewIds.size) {
        const duplicates = viewIds.filter(
          (id: any, index: number) => viewIds.indexOf(id) !== index
        );
        throw new ConvexError({
          code: "VALIDATION_ERROR",
          message: `Duplicate view IDs found: ${duplicates.join(", ")}`,
        });
      }

      changedFields.push("universalSpec");
    }

    // 3.3: Track version changes
    if (args.version !== undefined && args.version !== database.version) {
      changedFields.push("version");
    }

    // If no fields are being changed, return early
    if (changedFields.length === 0) {
      return database;
    }

    // ========================================================================
    // STEP 4: GET CURRENT USER
    // ========================================================================
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to update a database",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // ========================================================================
    // STEP 5: MERGE UPDATES AND UPDATE DATABASE
    // ========================================================================
    const now = Date.now();
    
    await ctx.db.patch(args.databaseId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.universalSpec !== undefined && { universalSpec: validatedSpec }),
      ...(args.version !== undefined && { version: args.version }),
      updatedById: user._id,
      updatedAt: now,
    });

    // Fetch updated database
    const updatedDatabase = await ctx.db.get(args.databaseId);
    if (!updatedDatabase) {
      throw new ConvexError({
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve updated database",
      });
    }

    // ========================================================================
    // STEP 6: AUDIT LOGGING (DoD #3)
    // ========================================================================
    const dbSpec = validatedSpec.db;
    await logAudit(ctx, {
      action: "database.update",
      entityType: "universalDatabases",
      entityId: args.databaseId,
      workspaceId: database.workspaceId,
      userId: user._id,
      metadata: {
        changedFields,
        previousName: database.name,
        newName: args.name || database.name,
        previousVersion: database.version,
        newVersion: args.version || database.version,
        ...(args.universalSpec !== undefined && {
          propertyCount: dbSpec.properties.length,
          viewCount: dbSpec.views.length,
        }),
      },
    });

    // ========================================================================
    // STEP 7: RETURN UPDATED DATABASE
    // ========================================================================
    return updatedDatabase;
  },
});
