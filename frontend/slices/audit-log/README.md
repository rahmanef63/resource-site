# audit-log

**Audit Log — Workspace Events**

Backend-only, framework-neutral audit event recorder. It captures tenant/actor identity, entity/action evidence, before/after diffs, metadata, IP and user-agent fields while leaving persistence and authorization to host bindings.

## Install

React/Next remains the default distribution contract:

```bash
npx rr add audit-log
```

Svelte/SvelteKit uses the exact same framework-neutral TypeScript source—there is no UI to duplicate and no Svelte runtime dependency:

```bash
npx rr add audit-log --framework sveltekit
```

## Wire the logger

```ts
import { createAuditLogger } from "@/features/audit-log";

const logAuditEvent = createAuditLogger(tenantAdapter, {
  logEventMutation,
  listEventsQuery,
});

await logAuditEvent(ctx, {
  action: "project.update",
  entityType: "project",
  entityId: projectId,
  diff: { name: { before: oldName, after: nextName } },
});
```

`TenantAdapter` owns tenant + actor resolution. `NULL_TENANT_ADAPTER` supports single-tenant/offline hosts. If `logEventMutation` is not wired, the logger is intentionally a no-op.

## Agent tools and authorization

`audit-log.query` and `audit-log.export` are read-only tool surfaces. The consumer-supplied `AuditLogCtx.list` must enforce `audit.read` server-side. Agents never write audit rows; mutations/actions call `createAuditLogger` through a server-checked `audit.write` path.

Convex schema/query/mutation source lives under `convex/features/audit-log/`. The slice peers with `convex-auth` for actor identity but does not require React, Svelte, Lucide, or shadcn UI dependencies.
