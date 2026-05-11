# Admin Panel — Feature Spec

Unified product admin surface. One panel, many products. Tier-aware:
**solo** (personal brand / indie) → **influencer** (creator + 1 VA) →
**organization** (team / institution / agency).

> P0 instrumentation **blocks** all P1/P2 work. Acceptance criteria in
> the spec below are enforced before any P1 feature ships.

## Access model

| Level | Source | Power |
|---|---|---|
| `platform_admin` | env `PLATFORM_ADMIN_EMAILS` | Wildcard `*`, every workspace |
| `workspace_owner` | `workspaces.userId` / `.createdBy` | Wildcard `*`, owned workspace |
| `workspace_admin` | role slug `owner` / `admin`, or perm `*` | All non-system actions |
| `delegated_admin` | `workspaceMemberships.additionalPermissions ⊇ PLATFORM_ADMIN` | Custom |
| `denied` | — | Panel hidden from sidebar |

Resolution order — first match wins. Frontend (`useAdminAccess`) +
backend (`convex/features/admin/access.ts`) share the same logic so a
client can never see UI it can't action.

### Personal-brand-os flow

1. First sign-in → user is workspace owner → automatic admin access.
2. Optional: add the user's email to `PLATFORM_ADMIN_EMAILS` for cross-
   workspace superadmin.
3. No need to seed roles for a solo workspace; owner bypass handles it.

### Influencer flow

1. Owner seeds workspace with **influencer** tier
   (`seedWorkspaceRoles(ctx, wsId, "influencer")`).
2. Invite VA → role `manager` → sees Email + CMS + Users sections,
   does not see Pricing / Exports / Errors.

### Organization flow

1. Owner seeds workspace with **organization** tier — all 6 system roles
   created.
2. Invite team members at appropriate levels.
3. Owner can grant individual `additionalPermissions` for one-off access.

## Tier presets (canonical)

```ts
// convex/lib/rbac/role-templates.ts
RBAC_TIER_PRESETS = {
  solo:         ["owner", "admin"],
  influencer:   ["owner", "admin", "manager"],
  organization: ["owner", "admin", "manager", "staff", "client", "guest"],
}
```

Levels (lower = more power): owner 0, admin 10, manager 30, staff 50,
client 70, guest 90.

## Sections (P0/P1/P2)

See `config.ts → ADMIN_SECTIONS` for the live registry — each entry has
`required` (permission token), `tiers` (which tiers surface it), and
`priority` (P0/P1/P2). The shell auto-filters by both.

### P0 — Instrumentation (blocking)

1. **Events** — schema `{userId, productId, eventType, properties, timestamp, sessionId, source}`. Ingest via `convex/features/admin/events.ts:ingest`. Client SDK `trackEvent()` in `slices/events/lib/track-event.ts`. Reactive last-100 stream via `recent` query.
2. **Funnels** — ordered steps per product. <2s render on 30d / <100k events. Drill-down per step.
3. **Attribution** — UTM auto-capture, first-touch + last-touch on user record. Source breakdown table.
4. **Activation** — per-product "value moment" event. Activation rate metric, time-to-activation histogram, stuck-users list.

### P1 — Users + experiments

5. **Users** — list virtualized at >10k. Filters: status, source, plan, date. Bulk: tag, segment, export.
6. **Cohorts** — date-range + behavior filter. Retention chart D1/D7/D30.
7. **A/B Tests** — sticky variant assignment, chi-square significance, auto-stop on significance OR max duration.
8. **Feature Flags** — per-user / cohort / percentage targeting + kill switch.
9. **Pricing** — tier CRUD, discount codes, A/B-linked price experiment hook.
10. **Landing CMS** — testimonials, case studies, hero blocks. Editable without redeploy.
11. **Email** — template builder, event-triggered sends, sequences, broadcast, waitlist.

### P2 — Ops

12. **Activity feed** — live stream of significant events. Convex reactive query.
13. **Errors** — client error capture endpoint, slow-query detection, threshold alerts.
14. **Marketing data** — CSV import for IG / Threads / LinkedIn / GA. content_id ↔ UTM mapping.
15. **Exports** — CSV / JSON, scheduled, outbound webhooks.
16. **Audit log** — every admin action, before/after state, 1yr retention min.

## Performance budgets

| Surface | Budget |
|---|---|
| Funnel dashboard | <2s @ 30d / <100k events |
| User list first page | <1s, virtualized after |
| Event ingestion p99 | <100ms |

## Data model — `analyticsEvents`

Already in `convex/features/analytics/schema.ts`. Reuse this — no new
table. Indexes: `by_workspace`, `by_workspace_type`, `by_workspace_timestamp`,
`by_user`. Plan archive job at 90d (P2).

## Wiring checklist

- [ ] Schema: confirm `analyticsEvents` indexed (already is).
- [ ] Seed: call `seedWorkspaceRoles(ctx, wsId, tier)` in your workspace-create mutation.
- [ ] Backend: `convex/features/admin/{access,events}.ts` registered.
- [ ] Frontend: mount `<AdminPage workspaceId={ws.id} tier={ws.tier} />` at `app/admin/page.tsx`.
- [ ] Client SDK: call `initEventTracking(convex)` once in `app/layout.tsx`.
- [ ] Env: set `PLATFORM_ADMIN_EMAILS` via `npx convex env set`.
- [ ] Test: rejected user, member without perm, member with perm, owner, platform admin.

## Out of scope (v1)

- Multi-tenant admin org
- Mobile admin app (responsive web only)
- Custom RBAC roles UI (use seeded system roles + additionalPermissions)
