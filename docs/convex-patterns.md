# Convex Patterns

Self-hosted Convex with `@convex-dev/auth`. Mandatory patterns from audit-bp.

## Schema mandates

Every workspace-scoped table:
```ts
defineTable({
  workspaceId: v.id("workspaces"),
  // ...
}).index("by_workspace", ["workspaceId"])
```

Compound indexes for common filter combinations. Schema in `convex/schema.ts` (or via `convex/slices/` rahmanef-style modular pattern).

## Public function template

```ts
export const myMutation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. authz BEFORE any DB read/write
    await requirePermission(ctx, args.workspaceId, "myFeature.create");
    // 2. workspace isolation enforced via withIndex
    const existing = await ctx.db
      .query("myTable")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .first();
    // 3. validate inputs (zod or v.* validators)
    // 4. write
    const id = await ctx.db.insert("myTable", { ... });
    // 5. audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "myFeature.entity.create",
      entityId: id,
    });
    return id;
  },
});
```

## RBAC

```ts
// convex/features/<slug>/mutations.ts
import { requirePermission } from "@/convex/shared/auth";

await requirePermission(ctx, workspaceId, "feature.entity.action");
```

Permission strings format: `<feature>.<entity>.<action>`. Defined in `convex/lib/rbac/`.

## Audit log

Every state change:
```ts
await logAuditEvent(ctx, {
  workspaceId,
  action: "feature.entity.verb",
  entityId,
  metadata: { ... },
});
```

## Auth — @convex-dev/auth

```ts
import { getAuthUserId } from "@convex-dev/auth/server";

const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
```

NEVER key authz off `identity.email` (spoofable). Use `subject` or server-minted user record.

## Forbidden

- Bare `.collect()` on user-facing tables — use `.withIndex(...).take(N)`
- `.filter()` on large tables — replace with `.withIndex(...)` range queries
- N+1 in queries — `Promise.all` over pre-fetched IDs
- `Date.now()` inside `query()` — breaks determinism / cache
- `ctx.db.*` inside `action()` — actions only for external I/O, route DB work via `ctx.runMutation(internal.*)`
- `internal as any` cron pattern WITHOUT `@ts-ignore TS2589` reasoning comment
- Mutations accepting client `storageId` without `try/catch` + `ctx.storage.delete(storageId)` on throw (orphan-blob safety)

## Migrations

Live data changes via Convex migrations component (online, resume-after-failure, dry-run). Manual bulk scripts without resume/rollback plan = audit-bp P0.

## Self-hosted observability

- `DISABLE_METRICS_ENDPOINT=false` in prod
- `REDACT_LOGS_TO_CLIENT=true` in prod (dev-only logging leaks stack traces)
- Backup-restore drill in last 30 days (`npx convex export` + `npx convex import --replace` documented)
