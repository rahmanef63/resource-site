/**
 * Audit Logging Helper
 *
 * Provides standardized audit logging for all mutations and actions.
 * Required by project guardrails (DoD #3).
 *
 * USAGE:
 * ```typescript
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
 * Types + action constants live in ./auditLogger-types.ts.
 * Read helpers live in ./auditLogger-queries.ts (re-exported below).
 *
 * @see docs/AUDIT_LOGGING_GUIDE.md for action naming conventions
 * @see .claude/CLAUDE.md for project guardrails
 */

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import type { AuditLogEntry } from "./auditLogger-types";

// Re-export types + constants so existing imports of `from "auditLogger"` keep working.
export type { AuditLogEntry } from "./auditLogger-types";
export { AUDIT_ACTIONS, createActionString } from "./auditLogger-types";
export {
  getAuditHistory,
  getWorkspaceAuditLogs,
  getUserAuditLogs,
  getAuditLogsByAction,
} from "./auditLogger-queries";

/**
 * Log an audit event.
 *
 * This function MUST be called after every mutation that modifies data.
 * It creates an immutable audit trail for compliance and debugging.
 *
 * @returns ID of the created audit log entry
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

    // Create audit log entry.
    // Immutability: audit logs can never be modified or deleted — enforced
    // by NOT providing update/delete mutations for activityEvents.
    const auditLogId = await ctx.db.insert("activityEvents", {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      workspaceId: entry.workspaceId,
      actorUserId: entry.userId as Id<"users">,
      diff: entry.metadata || {},
      createdAt: Date.now(),
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
 * Log multiple audit events in batch (parallel).
 */
export async function logAuditBatch(
  ctx: MutationCtx,
  entries: AuditLogEntry[]
): Promise<Id<"activityEvents">[]> {
  if (entries.length === 0) {
    return [];
  }
  const logPromises = entries.map((entry) => logAudit(ctx, entry));
  return Promise.all(logPromises);
}

/**
 * CONVEX SCHEMA: see frontend/slices/audit-log/* for the activityEvents
 * defineTable. Audit logs must remain immutable — do NOT expose update or
 * delete mutations on `activityEvents`.
 *
 * CI/CD: scripts/validate-audit-logs.ts checks all mutations call logAudit.
 */
