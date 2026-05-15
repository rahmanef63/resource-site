# Contract Negotiations — 2026-05-15

> Wave N+3.2 — operator decisions resolving cross-consumer kitab slug collisions surfaced by the first KitabSync aggregate scrape.
>
> All decisions are **additive** to existing v0.1.0 contracts (no breaking changes). Affected consumer refactors land separately, each landing as a `consumerVersion` bump in the corresponding `.kitab.json`.

## Index

1. `comments` — polymorphic target shape
2. `mdx-blog` — scope is MDX-only; rich-text/plain blogs go to a sibling slug
3. `audit-log` — tenant adapter prop hoists workspace concern out of contract
4. `admin` vs `platform-admin` — slug split (per-instance vs multi-tenant control plane)
5. Stranded slugs — keep, no decision

## 1. `comments` — polymorphic target shape

**Conflict**: notion-page-clone's `comments` keys on `pageId`/`blockId` (page+block-anchored). rahmanef.com's keys on `targetType` enum + entity slug per consumer feature (`blog`/`library`/`projects`/...). Both want kitab to be the upstream but their data-shape assumptions are mutually exclusive.

**Decision**: kitab `comments@0.2.0` exposes a polymorphic target tuple the consumer fills in:

```ts
type TargetRef = {
  kind: string;          // consumer-defined enum literal — "page", "blog", "task", etc.
  id: string;            // primary entity id
  subId?: string;        // optional secondary anchor (e.g. blockId within a page)
};
```

Convex tables store `targetKind` / `targetId` / `targetSubId` (replaces both notion's `pageId`/`blockId` and rahmanef's `targetType`/`entityId`). Indexes:

- `by_target_kind_id` (kind, id) — list comments for an entity
- `by_target_kind_id_subId` (kind, id, subId) — list comments anchored to a specific sub-element
- `by_workspace` (workspaceId) — for tenant scoping (see decision §3)

Component surface:

- `useComments(bindings, opts)` — already props-driven (Wave N+1.5 fix), just typed against `TargetRef`.
- `<CommentsThread target={{ kind, id, subId? }} renderHost={...}>` — renderless thread with consumer-supplied host wrapper.
- `<CommentsAnchor target={{ kind, id, subId? }} />` — renderless anchor that exposes count + open-thread callback; consumer wraps with whatever button/popover skin matches the host UI.

Config:

- `forbiddenWords?: readonly string[]` — replaces rahmanef's hardcoded `rahmanef`/`rahmanefcom` stoplist; consumer supplies their reserved-name list.
- `pathMap?: (target: TargetRef) => string` — replaces rahmanef's hardcoded `/portfolio/work/${slug}#comments` deep links; consumer supplies the resolver.

**Required consumer refactors** (when kitab `comments@0.2.0` ships):

- notion: rename `pageId`→`targetId` (kind=`"page"`), `blockId`→`targetSubId`. Wire `pathMap` to `ROUTES.page(target.id)`. ~6 files. Owner: notion-page-clone agent.
- rahmanef: drop the `targetType` enum, set `kind` to existing literal at call site. Move `rahmanef`/`rahmanefcom` into `forbiddenWords` config. Wire `pathMap` to existing deep-link logic. ~4 files. Owner: rahmanef.com agent.

**Push order**: notion first (heavier divergence, more blockers). Rahmanef adapts after.

## 2. `mdx-blog` — scope is MDX-only

**Conflict**: rahmanef's `blog` is portable + MDX-renderer-aware (slug-mismatched). content's `mdx-blog` was needs-adapter, just refactored portable in Wave N+3.1. superspace's `blog` is consumer-locked plain-text (NOT MDX) — different content layer entirely.

**Decision**: kitab `mdx-blog` stays MDX-only. Consumers without MDX MUST use a different slug.

- rahmanef: `blog` slice keeps `kitabSlug: "mdx-blog"` (already portable). On next refactor, optionally rename local dir `blog → mdx-blog` for clarity. No urgency.
- content: `mdx-blog` is now portable + bidirectional → READY for `/rr-send mdx-blog`. Will become the canonical kitab `mdx-blog@0.2.0` content (defineMdxBlog factory pattern + 4 config props).
- superspace: `blog` slice (consumer-locked, plain-text) gets a NEW kitab slug when production-ready: `rich-text-blog` or `umkm-blog`. The current `kitabSlug: "mdx-blog"` in its `.kitab.json` is INCORRECT — operator should retag to TBD slug or `consumer-only` once a slug is decided. Park until slice exits `state: development`.

**Push order**: content first (it's portable + bidirectional now). After kitab merges, rahmanef pulls DOWN to align. superspace handled separately.

## 3. `audit-log` — tenant adapter prop

**Conflict**: superspace's `audit-log` requires workspace tenancy (`logAuditEvent(ctx, { workspaceId, actorUserId, action, entityType, entityId })`). rahmanef's `audit` is single-tenant (no workspace concern). Both want kitab to be the upstream.

**Decision**: kitab `audit-log@0.2.0` accepts a tenant adapter prop hoisting tenancy out of the contract:

```ts
type TenantAdapter = {
  resolveTenantId: (ctx: any) => string | null;  // returns workspaceId, or null for single-tenant
  resolveActorId: (ctx: any) => string;          // returns actor user/session id
};
```

Convex schema: `audit_events` table has optional `tenantId: string | null` field; index `by_tenant_id_at` (tenantId, at) replaces superspace's `by_workspace`. Single-tenant consumers (rahmanef) pass an adapter with `resolveTenantId: () => null`. Multi-tenant (superspace) returns the active workspaceId.

Action shape stays `feature.entity.verb`. RBAC strings (`audit-log.read`) become a `permission?: string` prop with default falling back to `"audit.read"`.

**Required consumer refactors**:

- superspace: extract `logAuditEvent` body to use the adapter. Replace `by_workspace` index → `by_tenant_id_at`. Workspace-isolation pattern preserved through adapter. ~6 files. Owner: superspace agent. Coordinate UP-sync with rahmanef.
- rahmanef: trivial — wire null tenant adapter in slice config. ~1 file. Owner: rahmanef agent.

**Push order**: superspace first (defines the harder shape). rahmanef confirms compatibility after.

## 4. `admin` vs `platform-admin` — slug split

**Conflict**: kitab's existing `admin` is per-instance (single superadmin, env `SUPER_ADMIN_EMAIL`). superspace's `platform-admin` is multi-tenant control plane (workspace lifecycle ops, tier presets, KPI dashboards over 30+ tables). Same name, different scope.

**Decision**: keep `admin` as-is for per-instance scope. Add a new kitab slug `platform-admin` for multi-tenant control plane.

`platform-admin` contract surface (initial draft — operator to scaffold the slice when needed):

```ts
defineSliceContract({
  id: "platform-admin",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["platform.workspace.list", "platform.workspace.delete", "platform.user.delete", "platform.tier.set"],
    env: ["PLATFORM_ADMIN_EMAILS"],
    convex: { prefix: "padmin_", tables: ["padmin_audit", "padmin_kpi_snapshot"] },
    deps: ["convex-auth", "audit-log"],
  },
  provides: {
    routes: ["/platform-admin"],
    hooks: ["usePlatformAdmin", "useTenantHealth"],
    tables: ["padmin_audit", "padmin_kpi_snapshot"],
    components: ["PlatformAdminShell", "TenantHealthCard", "TierSetGate"],
  },
  bidir: {
    syncPolicy: "manual",
    generalization: { level: "needs-adapter", requiredProps: ["tenantTablesAdapter", "tierPresets", "kpiSources"] },
  },
});
```

`needs-adapter` because the host MUST inject which tables to sweep, which tier presets exist, and which Convex queries to hit for KPI rollups. superspace's existing `platform-admin` matches this shape closely (its 30+ table cascade, 4-tier preset ladder, dashboard widget set are all consumer-injected via the adapter).

**Required consumer refactors**:

- superspace: rename local `platform-admin` slice's `kitabSlug: "admin"` → `kitabSlug: "platform-admin"`. Refactor the 6 blockers per `platform-admin` adapter shape above. ~12 files. Owner: superspace agent.
- rahmanef: no change (continues using kitab `admin`).

**Scaffold task** (kitab maintainer, ahead of superspace's refactor):
- `frontend/slices/platform-admin/slice.contract.ts` — write the contract above
- `frontend/slices/platform-admin/slice.json` — minimal manifest
- `frontend/slices/platform-admin/README.md` — adapter shape doc
- `.kitab/lineage/platform-admin.dna.json` — initial DNA file
- `lib/content/slices.ts` — register entry
- Run `node packages/cli/scripts/gen-manifest.mjs` to refresh CLI manifest
- Validate: `npm run validate:contracts && npm run contracts:drift`

## 5. Stranded slugs — keep, document

**Conflict**: 6 of 15 contracts have zero consumer adoption: `broadcast-channel-sync`, `cal-com-booking`, `doku-payment`, `full-width-toggle`, `midtrans-payment`, `vector-search`.

**Decision**: keep all 6 in kitab. Mark `bidir.syncPolicy` per-slug:

| Slug | Policy | Rationale |
|---|---|---|
| `broadcast-channel-sync` | `manual` (default) | Generic browser primitive — useful but no current adopter |
| `cal-com-booking` | `manual` | Vendor-specific; will be picked up when consumer adds booking surface |
| `doku-payment` | `manual` | Provider-specific payment; deferred until any consumer adds billing |
| `full-width-toggle` | `manual` | Layout primitive, low complexity — easy adopt later |
| `midtrans-payment` | `manual` | See doku-payment |
| `vector-search` | `manual` | Convex vector index helper — adopt when AI/search surfaces mature |

**Action**: NO contract change. Document the lack of adopters in `docs/kitabsync-aggregate.md` (already done). Re-evaluate at next aggregate scrape.

## 6. Required follow-up actions (post-decisions)

| # | Action | Owner | Blockers gated |
|---|---|---|---|
| A | Bump kitab `comments@0.2.0` contract with `TargetRef` + `forbiddenWords` + `pathMap` | kitab maintainer | unblocks notion + rahmanef coordinated UP-sync |
| B | Bump kitab `audit-log@0.2.0` contract with `TenantAdapter` | kitab maintainer | unblocks superspace + rahmanef coordinated UP-sync |
| C | Scaffold kitab `platform-admin` slice (contract + skeleton) | kitab maintainer | unblocks superspace's `platform-admin` slug retag |
| D | UP-sync `mdx-blog` from content (it's already portable + bidirectional) | kitab maintainer + content agent | landing kitab `mdx-blog@0.2.0` |
| E | Push UP `seo` + `admin` from rahmanef (flip syncDirection bidirectional first) | rahmanef agent | landing kitab `seo@0.2.0` + `admin@0.2.0` |
| F | Refactor `command-menu` from notion (5 blockers, no coordination needed) | notion agent | landing kitab `command-menu@0.2.0` |
| G | Refactor `ai` from superspace (6 seams) — too-big for one agent | operator-led, multi-session | unblocks kitab `ai-router@0.2.0` |
| H | Decide CareerPack `document-checklist` fate (single-user vs workspace) | operator | unblocks first CareerPack UP-sync |

This decision document is itself the unblocker — agents can now proceed with `/rr-prep <slug>` against the resolved contract surface and either refactor consumer-side OR park the slice (with documented reason in `.kitab.json` `generalization.blockers`).
