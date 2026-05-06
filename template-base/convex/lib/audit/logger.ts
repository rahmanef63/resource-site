/**
 * Audit Logging Helper
 *
 * Provides standardized audit logging for all mutations and actions.
 * Required by project guardrails (DoD #3).
 *
 * USAGE:
 * ```typescript
 * // In your mutation, after successful operation
 * await logAudit(ctx, {
 *   action: "entity.created",
 *   entityType: "databases",
 *   entityId: databaseId,
 *   workspaceId: workspaceId,
 *   userId: user._id,
 *   metadata: { name: "My Database" },
 * });
 * ```
 *
 * @see docs/AUDIT_LOGGING_GUIDE.md for action naming conventions
 * @see .claude/CLAUDE.md for project guardrails
 */

import { MutationCtx, ActionCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Standard audit log entry
 */
export interface AuditLogEntry {
  // Action performed (e.g., "database.created", "document.updated")
  action: string;

  // Entity type (table name, e.g., "databases", "documents")
  entityType: string;

  // Entity ID that was affected
  entityId: Id<any>;

  // Workspace context
  workspaceId: Id<"workspaces">;

  // User who performed the action
  userId: string;

  // Additional metadata about the action
  metadata?: Record<string, any>;

  // Optional: IP address or client info
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
}

/**
 * Action types for common operations
 */
export const AUDIT_ACTIONS = {
  // CRUD operations
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  SOFT_DELETED: "soft_deleted",
  RESTORED: "restored",

  // Batch operations
  BATCH_CREATED: "batch_created",
  BATCH_UPDATED: "batch_updated",
  BATCH_DELETED: "batch_deleted",

  // Access operations
  VIEWED: "viewed",
  ACCESSED: "accessed",
  DOWNLOADED: "downloaded",
  EXPORTED: "exported",
  IMPORTED: "imported",

  // Permission operations
  PERMISSION_GRANTED: "permission_granted",
  PERMISSION_REVOKED: "permission_revoked",
  ROLE_ASSIGNED: "role_assigned",
  ROLE_REMOVED: "role_removed",

  // Sharing operations
  SHARED: "shared",
  UNSHARED: "unshared",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",

  // Configuration operations
  CONFIGURED: "configured",
  SETTINGS_CHANGED: "settings_changed",

  // Special operations
  DUPLICATED: "duplicated",
  MOVED: "moved",
  RENAMED: "renamed",
  ARCHIVED: "archived",
  UNARCHIVED: "unarchived",
} as const;

/**
 * Log an audit event
 *
 * This function MUST be called after every mutation that modifies data.
 * It creates an immutable audit trail for compliance and debugging.
 *
 * @param ctx - Convex mutation or action context
 * @param entry - Audit log entry details
 * @returns ID of the created audit log entry
 *
 * @example
 * ```typescript
 * export const createDatabase = mutation({
 *   handler: async (ctx, args) => {
 *     await requirePermission(ctx, args.workspaceId, "database.create");
 *
 *     const dbId = await ctx.db.insert("databases", { ... });
 *
 *     // REQUIRED: Log the audit event
 *     await logAudit(ctx, {
 *       action: "database.created",
 *       entityType: "databases",
 *       entityId: dbId,
 *       workspaceId: args.workspaceId,
 *       userId: user._id,
 *       metadata: { name: args.name },
 *     });
 *
 *     return dbId;
 *   },
 * });
 * ```
 */
export async function logAudit(
  ctx: MutationCtx,
  entry: AuditLogEntry
): Promise<Id<"activityEvents">> {
  try {
    // Validate required fields
    if (!entry.action) {
      console.error("Audit log missing action");
      throw new Error("Audit log must have an action");
    }

    if (!entry.entityType) {
      console.error("Audit log missing entityType");
      throw new Error("Audit log must have an entityType");
    }

    if (!entry.entityId) {
      console.error("Audit log missing entityId");
      throw new Error("Audit log must have an entityId");
    }

    if (!entry.workspaceId) {
      console.error("Audit log missing workspaceId");
      throw new Error("Audit log must have a workspaceId");
    }

    if (!entry.userId) {
      console.error("Audit log missing userId");
      throw new Error("Audit log must have a userId");
    }

    // Create audit log entry
    const auditLogId = await ctx.db.insert("activityEvents", {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      workspaceId: entry.workspaceId,
      actorUserId: entry.userId as Id<"users">,
      diff: entry.metadata || {},
      createdAt: Date.now(),

      // Immutability: audit logs can never be modified or deleted
      // This is enforced by NOT providing update/delete mutations for auditLogs
    });

    return auditLogId;
  } catch (error) {
    // Critical: If audit logging fails, the operation should fail
    // This ensures we never have operations without audit trail
    console.error("Failed to create audit log:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Audit logging failed: ${errorMessage}`);
  }
}

/**
 * Log multiple audit events in batch
 *
 * Use this for batch operations where multiple entities are affected
 *
 * @param ctx - Convex mutation or action context
 * @param entries - Array of audit log entries
 * @returns Array of audit log IDs
 *
 * @example
 * ```typescript
 * await logAuditBatch(ctx, [
 *   {
 *     action: "database.updated",
 *     entityType: "databases",
 *     entityId: id1,
 *     workspaceId: workspaceId,
 *     userId: user._id,
 *   },
 *   {
 *     action: "database.updated",
 *     entityType: "databases",
 *     entityId: id2,
 *     workspaceId: workspaceId,
 *     userId: user._id,
 *   },
 * ]);
 * ```
 */
export async function logAuditBatch(
  ctx: MutationCtx,
  entries: AuditLogEntry[]
): Promise<Id<"activityEvents">[]> {
  if (entries.length === 0) {
    return [];
  }

  // Log all entries in parallel for performance
  const logPromises = entries.map((entry) => logAudit(ctx, entry));
  return Promise.all(logPromises);
}

/**
 * Query audit logs for an entity
 *
 * Use this to retrieve audit history for a specific entity
 *
 * @param ctx - Convex context
 * @param entityId - Entity to get audit logs for
 * @param limit - Maximum number of logs to return (default 100)
 * @returns Array of audit log entries, most recent first
 *
 * @example
 * ```typescript
 * const history = await getAuditHistory(ctx, databaseId);
 * ```
 */
export async function getAuditHistory(
  ctx: MutationCtx,
  entityId: string,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_entity", (q: any) => q.eq("entityType", "").eq("entityId", entityId))
    .order("desc") // Most recent first
    .take(limit);

  return logs;
}

/**
 * Query audit logs for a workspace
 *
 * Use this to retrieve all audit logs in a workspace
 *
 * @param ctx - Convex context
 * @param workspaceId - Workspace to get audit logs for
 * @param limit - Maximum number of logs to return (default 100)
 * @returns Array of audit log entries, most recent first
 *
 * @example
 * ```typescript
 * const workspaceLogs = await getWorkspaceAuditLogs(ctx, workspaceId);
 * ```
 */
export async function getWorkspaceAuditLogs(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .order("desc") // Most recent first
    .take(limit);

  return logs;
}

/**
 * Query audit logs for a user
 *
 * Use this to retrieve all actions performed by a user
 *
 * @param ctx - Convex context
 * @param userId - User to get audit logs for
 * @param limit - Maximum number of logs to return (default 100)
 * @returns Array of audit log entries, most recent first
 *
 * @example
 * ```typescript
 * const userActivity = await getUserAuditLogs(ctx, userId);
 * ```
 */
export async function getUserAuditLogs(
  ctx: MutationCtx,
  userId: Id<"users">,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_actor", (q: any) => q.eq("actorUserId", userId))
    .order("desc") // Most recent first
    .take(limit);

  return logs;
}

/**
 * Query audit logs by action type
 *
 * Use this to find all instances of a specific action
 *
 * @param ctx - Convex context
 * @param workspaceId - Workspace to search in
 * @param action - Action to search for (e.g., "database.deleted")
 * @param limit - Maximum number of logs to return (default 100)
 * @returns Array of audit log entries, most recent first
 *
 * @example
 * ```typescript
 * // Find all database deletions
 * const deletions = await getAuditLogsByAction(
 *   ctx,
 *   workspaceId,
 *   "database.deleted"
 * );
 * ```
 */
export async function getAuditLogsByAction(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  action: string,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("workspaceId"), workspaceId),
        q.eq(q.field("action"), action)
      )
    )
    .order("desc") // Most recent first
    .take(limit);

  return logs;
}

/**
 * Helper: Create action string
 *
 * Standardizes action naming: "entityType.action"
 *
 * @param entityType - Type of entity (e.g., "database")
 * @param action - Action performed (e.g., "created")
 * @returns Formatted action string (e.g., "database.created")
 *
 * @example
 * ```typescript
 * const action = createActionString("database", AUDIT_ACTIONS.CREATED);
 * // Returns: "database.created"
 * ```
 */
export function createActionString(
  entityType: string,
  action: string
): string {
  return `${entityType}.${action}`;
}

/**
 * CONVEX SCHEMA REQUIREMENTS:
 *
 * Your Convex schema must have an auditLogs table with these fields:
 *
 * ```typescript
 * auditLogs: defineTable({
 *   action: v.string(),
 *   entityType: v.string(),
 *   entityId: v.string(),      // Generic ID (use v.string() not v.id())
 *   workspaceId: v.id("workspaces"),
 *   userId: v.string(),
 *   metadata: v.object({}),    // Dynamic metadata
 *   clientInfo: v.optional(v.object({
 *     ip: v.optional(v.string()),
 *     userAgent: v.optional(v.string()),
 *     location: v.optional(v.string()),
 *   })),
 *   timestamp: v.number(),
 * })
 *   .index("by_entity", ["entityId"])
 *   .index("by_workspace", ["workspaceId"])
 *   .index("by_user", ["userId"])
 *   .index("by_workspace_action", ["workspaceId", "action"])
 *   .index("by_timestamp", ["timestamp"]),
 * ```
 *
 * IMPORTANT: Do NOT create update or delete mutations for auditLogs.
 * Audit logs must be immutable for compliance.
 */

/**
 * TESTING NOTES:
 *
 * When writing tests for mutations using audit logging:
 *
 * 1. Verify audit log is created after successful operation
 * 2. Verify audit log contains correct action
 * 3. Verify audit log contains correct entity info
 * 4. Verify audit log contains user and workspace context
 * 5. Verify metadata is captured
 * 6. Verify operation fails if audit logging fails
 *
 * Example:
 * ```typescript
 * test("creates audit log after database creation", async () => {
 *   const dbId = await createDatabase(ctx, args);
 *
 *   const auditLog = await ctx.db
 *     .query("auditLogs")
 *     .withIndex("by_entity", (q) => q.eq("entityId", dbId))
 *     .first();
 *
 *   expect(auditLog).toBeDefined();
 *   expect(auditLog.action).toBe("database.created");
 *   expect(auditLog.entityId).toBe(dbId);
 * });
 * ```
 */

/**
 * CI/CD VALIDATION:
 *
 * This audit logger will be validated by:
 * - scripts/validate-audit-logs.ts (checks all mutations call logAudit)
 * - scripts/validate-dod.ts (checks audit logging in DoD)
 *
 * All mutations MUST call logAudit after successful operations.
 */
