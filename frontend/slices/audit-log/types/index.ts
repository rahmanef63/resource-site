/**
 * audit-log slice public types — v0.2.0.
 *
 * `TenantAdapter` hoists tenancy concern out of the contract. Consumers
 * inject `resolveTenantId` (returns workspace id for multi-tenant, null for
 * single-tenant) + `resolveActorId`. Per docs/contract-negotiations-2026-05-15.md §3.
 */

export type TenantAdapter = {
  resolveTenantId: (ctx: unknown) => string | null;
  resolveActorId: (ctx: unknown) => string;
};

export type AuditEvent = {
  tenantId: string | null;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  at: number;
  diff?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export type AuditLogPermission = {
  read?: string;
  write?: string;
};

export type AuditLogBindings = {
  logEventMutation: unknown;
  listEventsQuery: unknown;
};
