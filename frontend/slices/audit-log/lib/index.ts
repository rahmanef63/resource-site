import type { AuditEvent, TenantAdapter, AuditLogBindings } from "../types";

export type LogAuditEventInput = Omit<AuditEvent, "tenantId" | "actorId" | "at"> & {
  at?: number;
};

export function createAuditLogger(adapter: TenantAdapter, bindings: AuditLogBindings) {
  return async function logAuditEvent(ctx: unknown, input: LogAuditEventInput): Promise<void> {
    const tenantId = adapter.resolveTenantId(ctx);
    const actorId = adapter.resolveActorId(ctx);
    const event: AuditEvent = {
      tenantId,
      actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      at: input.at ?? Date.now(),
      diff: input.diff,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };
    const mutation = bindings.logEventMutation as
      | ((ctx: unknown, args: AuditEvent) => Promise<unknown>)
      | undefined;
    if (typeof mutation === "function") {
      await mutation(ctx, event);
    }
  };
}

export const NULL_TENANT_ADAPTER: TenantAdapter = {
  resolveTenantId: () => null,
  resolveActorId: () => "anonymous",
};
