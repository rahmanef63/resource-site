/**
 * Get Universal Database Query
 *
 * Retrieves a single Universal Database by ID with permission checks.
 * Returns null if database doesn't exist or user lacks permission.
 *
 * RBAC: Requires "database:read" permission
 * Returns: Complete database object with computed fields
 *
 * @see docs/PHASE_2_TASKS.md for specifications
 * @see docs/UNIVERSAL_DATABASE_SPEC.md for schema details
 */

import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { checkPermission } from "../../../lib/rbac/permissions";

/**
 * Get a Universal Database by ID
 *
 * Fetches a single database and performs permission checks.
 * Returns null for non-existent databases or unauthorized access.
 *
 * @param ctx - Convex query context
 * @param args - Query arguments
 * @returns The database object with computed fields or null
 *
 * @example
 * ```typescript
 * const database = await ctx.runQuery(api.features.database.queries.getUniversal, {
 *   databaseId: databaseId,
 * });
 * ```
 */
export const getUniversal = query({
  args: {
    databaseId: v.id("universalDatabases"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("universalDatabases"),
      _creationTime: v.number(),
      workspaceId: v.id("workspaces"),
      name: v.string(),
      universalSpec: v.any(),
      version: v.string(),
      createdById: v.id("users"),
      createdAt: v.number(),
      updatedById: v.id("users"),
      updatedAt: v.number(),
      // Computed fields
      propertyCount: v.number(),
      viewCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // ========================================================================
    // STEP 1: FETCH DATABASE
    // ========================================================================
    const database = await ctx.db.get(args.databaseId);

    if (!database) {
      return null;
    }

    // ========================================================================
    // STEP 2: PERMISSION CHECK
    // ========================================================================
    const hasPermission = await checkPermission(
      ctx,
      database.workspaceId,
      "database:read"
    );

    if (!hasPermission) {
      return null; // Hide from unauthorized users
    }

    // ========================================================================
    // STEP 3: COMPUTE FIELDS
    // ========================================================================
    const dbSpec = database.universalSpec.db;
    const propertyCount = dbSpec.properties?.length || 0;
    const viewCount = dbSpec.views?.length || 0;

    // ========================================================================
    // STEP 4: RETURN DATABASE WITH COMPUTED FIELDS
    // ========================================================================
    return {
      ...database,
      propertyCount,
      viewCount,
    };
  },
});
