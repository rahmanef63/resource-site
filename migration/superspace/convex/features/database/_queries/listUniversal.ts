/**
 * List Universal Databases Query
 * 
 * Retrieves all Universal Databases in a workspace with pagination support.
 * Returns empty array for unauthorized users (privacy protection).
 * Orders by createdAt descending (newest first).
 * 
 * @module convex/features/database/queries/listUniversal
 */

import { query } from "../../../_generated/server";
import { v } from "convex/values";
import { checkPermission } from "../../../lib/rbac/permissions";

/**
 * List Universal Databases in a workspace
 * 
 * Permission: Requires "database:read" permission for workspace
 * Privacy: Returns empty array for unauthorized users (hides existence)
 * 
 * @param workspaceId - ID of workspace to list databases from
 * @param limit - Maximum number of results (default: 50, max: 100)
 * @param cursor - Pagination cursor (database ID to start after)
 * 
 * @returns Object with:
 *  - databases: Array of database objects with computed fields
 *  - nextCursor: ID of last database for pagination (null if no more)
 *  - hasMore: Boolean indicating if more results exist
 */
export const listUniversal = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("universalDatabases")),
  },
  returns: v.object({
    databases: v.array(
      v.object({
        _id: v.id("universalDatabases"),
        _creationTime: v.number(),
        workspaceId: v.id("workspaces"),
        name: v.string(),
        universalSpec: v.any(),
        version: v.string(),
        createdById: v.id("users"),
        updatedById: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
        // Computed fields
        propertyCount: v.number(),
        viewCount: v.number(),
      })
    ),
    nextCursor: v.union(v.id("universalDatabases"), v.null()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // 1. Permission check (non-throwing - return empty for unauthorized)
    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      "database:read"
    );

    if (!hasPermission) {
      // Return empty result for unauthorized users (hide existence)
      return {
        databases: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    // 2. Validate and apply limit
    const requestedLimit = args.limit ?? 50; // Default: 50
    const effectiveLimit = Math.min(requestedLimit, 100); // Max: 100
    const queryLimit = effectiveLimit + 1; // Fetch one extra to determine hasMore

    // 3. Query databases with index
    let query = ctx.db
      .query("universalDatabases")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc"); // Order by _creationTime descending (newest first)

    // 4. Apply cursor for pagination
    if (args.cursor) {
      const cursorDatabase = await ctx.db.get(args.cursor);
      if (cursorDatabase) {
        // Start after the cursor document
        query = query.filter((q) =>
          q.lt(q.field("_creationTime"), cursorDatabase._creationTime)
        );
      }
    }

    // 5. Fetch results (one extra to check hasMore)
    const results = await query.take(queryLimit);

    // 6. Determine pagination state
    const hasMore = results.length > effectiveLimit;
    const databases = hasMore ? results.slice(0, effectiveLimit) : results;
    const nextCursor =
      hasMore && databases.length > 0
        ? databases[databases.length - 1]._id
        : null;

    // 7. Add computed fields to each database
    const databasesWithComputed = databases.map((db) => ({
      ...db,
      propertyCount: db.universalSpec.db.properties.length,
      viewCount: db.universalSpec.db.views.length,
    }));

    return {
      databases: databasesWithComputed,
      nextCursor,
      hasMore,
    };
  },
});
