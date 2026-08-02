import type { ActionCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

type ActionCtxWithDb = ActionCtx & { db: MutationCtx["db"] };
type WriteCtx = MutationCtx | ActionCtxWithDb;

export type AuditEventInput = {
  actorId: string;
  actorUserId?: Id<"users">;
  workspaceId?: Id<"workspaces"> | string;
  entity: string;
  entityId: string;
  action: string;
  changes?: unknown;
};

export type ActivityLogInput = {
  workspaceId: Id<"workspaces"> | string;
  userId?: string;
  actor?: string;
  actorUserId?: Id<"users">;
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  target?: {
    type: string;
    id: string | number;
    workspaceId?: string;
  };
};

export async function recordAuditEvent(
  ctx: WriteCtx,
  input: AuditEventInput,
): Promise<Id<"activityEvents"> | null> {
  const actorUserId = input.actorUserId;
  let workspaceId: Id<"workspaces"> | undefined;
  if (typeof input.workspaceId === "string") {
    workspaceId =
      ctx.db.normalizeId?.("workspaces", input.workspaceId) ?? undefined;
  } else {
    workspaceId = input.workspaceId;
  }

  if (!actorUserId || !workspaceId) {
    return null;
  }

  return ctx.db.insert("activityEvents", {
    actorId: input.actorId,
    actorUserId,
    workspaceId,
    entityType: input.entity,
    entity: input.entity,
    entityId: input.entityId,
    action: input.action,
    changes: input.changes ?? null,
    diff: input.changes ?? null,
    createdAt: Date.now(),
  });
}

export async function logAuditEvent(
  ctx: WriteCtx,
  input: ActivityLogInput,
): Promise<Id<"activityEvents"> | null> {
  const actorId = input.userId ?? input.actor ?? "system";
  const actorUserId =
    input.actorUserId ?? (input.userId as Id<"users"> | undefined);
  const entity =
    input.resourceType ??
    input.target?.type ??
    "activity";
  const entityId =
    input.resourceId ??
    (input.target ? String(input.target.id) : input.action);

  const payload: Record<string, unknown> = {};

  if (input.metadata) {
    payload.metadata = input.metadata;
  }

  if (input.changes) {
    payload.changes = input.changes;
  }

  if (input.target) {
    payload.target = input.target;
  }

  let workspaceId: Id<"workspaces"> | undefined;
  if (typeof input.workspaceId === "string") {
    workspaceId =
      ctx.db.normalizeId?.("workspaces", input.workspaceId) ?? undefined;
  } else {
    workspaceId = input.workspaceId;
  }

  if (!workspaceId || !actorUserId) {
    return null;
  }

  payload.workspaceId = workspaceId;

  return recordAuditEvent(ctx, {
    actorId,
    actorUserId,
    workspaceId,
    entity,
    entityId,
    action: input.action,
    changes: payload,
  });
}
