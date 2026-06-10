// Agentic tool collection (Tier A* — ADMIN, READ-ONLY). The ctx wraps the
// consumer's bound listEventsQuery (audit.read must be enforced server-side);
// no mutation surface — audit logs are written by createAuditLogger, never
// by an agent.

import { defineToolCollection, num, obj, str } from "@/shared/agentic";
import type { AuditEvent } from "../types";

export type AuditLogCtx = {
  /** Server-gated query (audit.read). */
  list: (q: { entityType?: string; action?: string; since?: number; limit?: number }) => Promise<AuditEvent[]>;
};

const render = (e: AuditEvent): string =>
  `${new Date(e.at).toISOString()} ${e.actorId} ${e.action} ${e.entityType}/${e.entityId}`;

export const auditLogTools = defineToolCollection<AuditLogCtx>({
  namespace: "audit-log",
  tools: [
    {
      name: "query",
      description: "Query audit events, newest first (filter by entityType/action/since-epoch-ms).",
      parameters: obj({
        entityType: str("filter: entity type"),
        action: str("filter: action name"),
        since: num("filter: only events at/after this epoch-ms"),
        limit: num("max rows (default 50)"),
      }),
      run: async (ctx, a) => {
        const rows = await ctx.list({
          entityType: a.entityType as string | undefined,
          action: a.action as string | undefined,
          since: a.since as number | undefined,
          limit: (a.limit as number | undefined) ?? 50,
        });
        return rows.map(render).join("\n") || "no events";
      },
    },
    {
      name: "export",
      description: "Export matching audit events as JSON.",
      parameters: obj({
        entityType: str("filter: entity type"),
        since: num("filter: only events at/after this epoch-ms"),
        limit: num("max rows (default 200)"),
      }),
      run: async (ctx, a) =>
        JSON.stringify(
          await ctx.list({
            entityType: a.entityType as string | undefined,
            since: a.since as number | undefined,
            limit: (a.limit as number | undefined) ?? 200,
          }),
        ),
    },
  ],
});
