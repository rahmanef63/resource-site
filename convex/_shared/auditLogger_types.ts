/**
 * Audit logging types + action constants.
 *
 * @see ./auditLogger.ts for the writer
 * @see ./auditLogger_queries.ts for read helpers
 */

import { Id } from "../_generated/dataModel";

/**
 * Standard audit log entry
 */
export interface AuditLogEntry {
  // Action performed (e.g., "database.created", "document.updated")
  action: string;

  // Entity type (table name, e.g., "databases", "documents")
  entityType: string;

  // Entity ID that was affected. Convex Ids of ANY table are accepted —
  // they're branded strings, so `string` is the honest cross-table type.
  entityId: string;

  // Workspace context
  workspaceId: Id<"workspaces">;

  // User who performed the action
  userId: string;

  // Additional metadata about the action
  metadata?: Record<string, unknown>;

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
 * Helper: Create action string. Standardizes action naming: "entityType.action"
 *
 * @example createActionString("database", AUDIT_ACTIONS.CREATED) // "database.created"
 */
export function createActionString(
  entityType: string,
  action: string
): string {
  return `${entityType}.${action}`;
}
