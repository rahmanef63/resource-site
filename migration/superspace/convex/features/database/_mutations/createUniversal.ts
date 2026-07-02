/**
 * Create Universal Database Mutation
 *
 * Creates a new Universal Database v2.0 in a workspace with full RBAC
 * and audit compliance.
 *
 * RBAC: Requires "database:create" permission
 * AUDIT: Logs "database.create" event
 * VALIDATION: Validates universalSpec with Zod
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
 * Create a new Universal Database
 *
 * @param ctx - Convex mutation context
 * @param args - Creation arguments
 * @returns The created database ID
 *
 * @throws {ConvexError} 400 - Validation errors
 * @throws {ConvexError} 403 - Permission denied
 * @throws {ConvexError} 404 - Workspace not found
 * @throws {ConvexError} 409 - Duplicate database name
 *
 * @example
 * ```typescript
 * const databaseId = await ctx.runMutation(api.features.database.mutations.createUniversal, {
 *   workspaceId: workspaceId,
 *   name: "Product Catalog",
 *   universalSpec: {
 *     properties: [...],
 *     views: [...],
 *   },
 * });
 * ```
 */
export const createUniversal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    universalSpec: v.any(), // Universal Database JSON
    version: v.optional(v.string()), // Default: "2.0"
  },
  handler: async (ctx, args) => {
    // ========================================================================
    // STEP 1: RBAC PERMISSION CHECK (DoD #2)
    // ========================================================================
    await requirePermission(ctx, args.workspaceId, "database:create");

    // ========================================================================
    // STEP 2: VERIFY WORKSPACE EXISTS
    // ========================================================================
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: `Workspace with ID '${args.workspaceId}' not found`,
      });
    }

    // ========================================================================
    // STEP 3: VALIDATE INPUT
    // ========================================================================

    // 3.1: Basic validation
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

    // 3.2: Check for duplicate database name in workspace
    const existingDatabase = await ctx.db
      .query("universalDatabases")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .first();

    if (existingDatabase) {
      throw new ConvexError({
        code: "CONFLICT",
        message: `A database with name '${args.name}' already exists in this workspace`,
      });
    }

    // 3.3: Validate universalSpec with Zod
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

    const universalSpec = validationResult.data;
    const dbSpec = universalSpec.db;

    // 3.4: Ensure at least 1 property exists (already validated by Zod, but double-check)
    if (!dbSpec.properties || dbSpec.properties.length === 0) {
      throw new ConvexError({
        code: "VALIDATION_ERROR",
        message: "Database must have at least one property",
      });
    }

    // 3.5: Ensure at least 1 view exists (already validated by Zod, but double-check)
    if (!dbSpec.views || dbSpec.views.length === 0) {
      throw new ConvexError({
        code: "VALIDATION_ERROR",
        message: "Database must have at least one view",
      });
    }

    // 3.6: Validate unique property keys
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

    // 3.7: Validate view IDs are unique
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

    // ========================================================================
    // STEP 4: GET CURRENT USER
    // ========================================================================
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated to create a database",
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
    // STEP 5: CREATE DATABASE
    // ========================================================================
    const now = Date.now();
    const version = args.version || "2.0";

    const databaseId = await ctx.db.insert("universalDatabases", {
      workspaceId: args.workspaceId,
      name: args.name,
      universalSpec,
      version,
      createdById: user._id,
      createdAt: now,
      updatedById: user._id,
      updatedAt: now,
    });

    // ========================================================================
    // STEP 6: AUDIT LOGGING (DoD #3)
    // ========================================================================
    await logAudit(ctx, {
      action: "database.create",
      entityType: "universalDatabases",
      entityId: databaseId,
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: {
        name: args.name,
        version,
        propertyCount: dbSpec.properties.length,
        viewCount: dbSpec.views.length,
        propertyTypes: Array.from(
          new Set(dbSpec.properties.map((p: any) => p.type))
        ),
        viewLayouts: Array.from(
          new Set(dbSpec.views.map((v: any) => v.layout))
        ),
      },
    });

    // ========================================================================
    // STEP 7: RETURN RESULT
    // ========================================================================
    return databaseId;
  },
});
