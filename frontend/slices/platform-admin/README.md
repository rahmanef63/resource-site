# platform-admin

> Multi-tenant SaaS control plane. Distinct from kitab `admin` (per-instance
> superadmin gated by `SUPER_ADMIN_EMAIL`).

## Status

**Contract-only scaffold** as of 2026-05-15. No implementation files yet.
Canonical reference is superspace's local `platform-admin` slice
(`/home/rahman/projects/superspace/frontend/slices/platform-admin/` +
`convex/features/platform-admin/`).

Implementation lands in kitab when superspace promotes the structural
patterns (top bar + drawer + RBAC matrix + KPI widget grid) into a portable
subset via `/rr-send platform-admin`. See operator decision in
[`docs/contract-negotiations-2026-05-15.md` §4](../../../docs/contract-negotiations-2026-05-15.md).

## Required adapter props

The contract declares `bidir.generalization.requiredProps` so any consumer
adopting the slug MUST inject these — otherwise the audit-bp generalisation
gate blocks UP-sync:

| Prop | Shape | Why |
|---|---|---|
| `tenantTablesAdapter` | `{ sweep: Id<any>[]; kpiSources: Record<string, FunctionReference>; }` | Which Convex tables hard-delete cascade walks + which KPI queries to call per tenant. Consumer-domain specific (superspace sweeps 30+ tables; smaller SaaS might sweep 5). |
| `tierPresets` | `Record<string, TierConfig>` | Tier ladder. superspace uses `free` / `startup` / `business-pro` / `scale`. Other SaaS may use 2-tier or unlimited. |
| `kpiSources` | `Record<string, FunctionReference>` | Per-tenant KPI snapshot queries (members, billing, audit cadence). |

## Convex schema (preview — scaffold only)

```ts
// convex/features/platform-admin/schema.ts (when promoted)
export const platformAdminTables = {
  padmin_audit: defineTable({
    tenantId: v.optional(v.string()), // null for single-tenant overrides
    actorId: v.string(),
    action: v.string(),               // "platform.workspace.delete", etc.
    targetType: v.string(),
    targetId: v.string(),
    at: v.number(),
    payload: v.optional(v.any()),
  }).index("by_tenant_at", ["tenantId", "at"]),

  padmin_kpi_snapshot: defineTable({
    tenantId: v.string(),
    capturedAt: v.number(),
    members: v.number(),
    billingStatus: v.string(),
    auditEvents24h: v.number(),
    customMetrics: v.optional(v.record(v.string(), v.number())),
  }).index("by_tenant_at", ["tenantId", "capturedAt"]),
};
```

## RBAC permissions

- `platform.workspace.list`
- `platform.workspace.delete` (cascades through `tenantTablesAdapter.sweep`)
- `platform.user.delete` (also cascades)
- `platform.tier.set`

Audit log entries route through the shared `audit-log` slice's
`TenantAdapter` — `tenantId` set to the *target* workspace id (not the
acting operator's home workspace).

## Adoption flow

1. Consumer ensures `convex-auth` + `audit-log@^0.2` already adopted.
2. `npx rahman-resources@latest add platform-admin` (when implementation
   lands).
3. Write `.kitab.json` setting `generalization.status: "needs-adapter"` +
   blockers listing the three required adapter props until they're wired.
4. Wire the three required props at the slice mount point.
5. Set `PLATFORM_ADMIN_EMAILS` env (comma-separated list).
6. Add to admin nav as a separate route — DO NOT rename `admin` to
   `platform-admin`. They're distinct slices serving distinct scopes.

## superspace migration

superspace's current local `platform-admin` slice declares
`kitabSlug: "admin"` — that's incorrect post-Wave-N+3.2. Operator todo:

```bash
# in /home/rahman/projects/superspace
# 1. Edit frontend/slices/platform-admin/.kitab.json → kitabSlug: "platform-admin"
# 2. Refactor the 6 blockers per the platform-admin adapter shape above
# 3. /rr-prep platform-admin --fix && /rr-send platform-admin
```

## See also

- [`docs/contract-negotiations-2026-05-15.md`](../../../docs/contract-negotiations-2026-05-15.md) — operator decision rationale
- [`docs/kitabsync-aggregate.md`](../../../docs/kitabsync-aggregate.md) — superspace's `platform-admin` divergence detail
- `frontend/slices/admin/` — sibling kitab slice for per-instance scope
