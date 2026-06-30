# Audit log

Append-only "who did what when" trail. Both reference projects implement the
exact same shape (one immutable events table, written by a shared `logAudit`
helper called from inside admin mutations, read newest-first into an admin
widget/table). This is a **template-grade feature** — rr already ships an
`audit-log` slice that generalizes both. Doc is kept short and focused on the
mapping + the concrete gaps in the existing slice.

## What it does (flow)

1. An admin mutation runs its own auth guard, mutates state, then calls a shared
   `logAudit(ctx, { action, entityType/targetType, entityId/targetId, … })`.
2. `logAudit` resolves the actor from the auth identity, then **inserts** one row
   into the events table (`metadata`/`diff` stored alongside). Never updates,
   never deletes — append-only is the whole contract.
3. A `get`/`listEvents` query returns the newest N rows (index-ordered `created_at`/`at`
   desc), joining actor/role label tables in JS so `_id` never leaks.
4. UI renders the feed: a Dashboard "Activity" widget (latest ~10) and a full
   Audit admin page/table.

Fail-mode differs across the two and is the one real design knob:
- **Instatic** = fire-and-forget (audit write must never block/break the user's action).
- **personal-brand-os** = belt-and-suspenders no-op when signed out; write is awaited inline.
- **rr `_shared/auditLogger.ts`** = fail-CLOSED — throws if the audit insert fails ("never an operation without an audit trail").

## Where it lives

Instatic (`/home/rahman/projects/Instatic-convex`):
- `convex/audit.ts` — `create` mutation (nanoid id + `created_at`, stringifies `metadata_json`), `listEvents` query (`by_created` index `.order('desc').take(limit)`, plus full `users`/`roles` label scans).
- `convex/schema.ts:142` — `audit_events` table.
- `server/repositories/audit.ts` — thin adapter: `AuditActionSchema` (closed TypeBox literal union), `createAuditEvent`, `listAuditEvents`.
- `server/handlers/cms/audit.ts` — `GET /admin/api/cms/audit` (gated by `audit.read`).
- `src/admin/pages/dashboard/widgets/ActivityWidget.tsx` — feed display (collapses repeated actions).
- `src/admin/pages/users/utils/audit.ts` — title/detail formatting + future-action humanization.
- `docs/features/audit-log.md` — full feature doc.

personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`):
- `convex/adminPanel_auditLog.ts` — `logAudit()` helper (resolves actor via `getAuthUserId`, earliest user = "owner"), `get` query (`by_at` desc take 200, maps to `AuditEventRow[]`), `logEvent` mutation, `clear` mutation ("Clear log" control).
- `convex/schema.ts:281` — `adminAuditEvents` table.

rr (`/home/rahman/projects/resources`) — **existing slice**:
- `frontend/slices/audit-log/` — trio (`slice.json`, `slice.manifest.json`, no `slice.contract.ts` — folded into slice.json), `index.ts`, `types/index.ts` (`TenantAdapter`, `AuditEvent`, `AuditLogBindings`), `lib/index.ts` (`createAuditLogger`, `NULL_TENANT_ADAPTER`), `lib/tools.ts` (agentic `query`/`export` read-only tools), `config.ts`.
- `convex/_shared/auditLogger.ts` (+ `_types.ts`, `_queries.ts`) — `logAudit`/`logAuditBatch`, `AUDIT_ACTIONS`, `createActionString`, and read helpers (`getAuditHistory`/`getWorkspaceAuditLogs`/`getUserAuditLogs`/`getAuditLogsByAction`).

## Data model

Instatic `audit_events` (nanoid PK as `v.string()`, not `_id`):
`id, actor_user_id (null|str), action (str), target_type (null|str), target_id (null|str), metadata_json (str), ip_address (null|str), user_agent (null|str), created_at (str ISO)`.
Indexes: `by_app_id ['id']`, `by_created ['created_at']`. (Doc also mentions planned `(action, created_at)` / `(actor_user_id, created_at)`.)

personal-brand-os `adminAuditEvents`:
`evId, at (ISO), actorId, actorName, actorInitials, actorRole (owner|admin|editor|viewer|system literal union), action (create|update|delete|publish|unpublish|invite|revoke|login|logout|export literal union), entityType, entityId, entityLabel, severity (info|warn|alert), diffSummary?`. Index `by_at`.

rr slice shapes:
- Frontend `AuditEvent` type: `tenantId (str|null), actorId, action, entityType, entityId, at (number), diff?, metadata?, ipAddress?, userAgent?`.
- `_shared/auditLogger.ts` inserts into table **`activityEvents`**: `{ action, entityType, entityId, workspaceId, actorUserId (Id<"users">), diff, createdAt }` — workspace-scoped, expects indexes `by_workspace`, `by_entity (entityType,entityId)`, `by_actor`.

## Public API

- Instatic: Convex `audit.create` (mutation, all args validated, `returns: v.null()`), `audit.listEvents` (query, `args:{limit}`, validated `returns`). REST: `GET /admin/api/cms/audit?limit&action` gated `audit.read`.
- personal-brand-os: `adminPanel_auditLog.get` (query, admin-only, returns `[]` signed out), `.logEvent` (mutation, throws if not admin), `.clear` (mutation, admin-only), `logAudit` (internal helper).
- rr slice: `createAuditLogger(adapter, bindings)` → `logAuditEvent(ctx, input)` (binding-injected — consumer supplies the real `logEventMutation`/`listEventsQuery`); agentic `audit-log.query` + `audit-log.export` tools; `_shared` helpers `logAudit`/`logAuditBatch` + 4 read queries.

## UI surface

- Instatic: Dashboard Activity widget (latest 10, actor monogram, action-collapse) + `/admin/audit` table (filters planned). Admin-only.
- personal-brand-os: Admin-panel "Audit log" block rendering `AuditEventRow[]` (actor initials monogram, severity, `diffSummary`) with a "Clear log" control.
- rr slice: **none shipped** — `contract.provides.components: []`. Manifest lists `@/components/ui/{card,badge,table}` as intended imports but no component file exists.

## Dependencies

- npm: none runtime (rr slice declares `npm: []`; uses `react`, `lucide-react` per manifest if a UI is added).
- rr-slice deps: peer `convex-auth` (actor resolved via authenticated user). Conceptually pairs with `activity`, `rbac-roles` (`audit.read`/`audit.write` scopes), `user-management`.

## rr coverage

**covered** — existing slice `audit-log` (`frontend/slices/audit-log` + `convex/_shared/auditLogger*.ts`). The slice already generalizes both harvested features: `TenantAdapter.resolveTenantId` returns `null` for single-tenant (= personal-brand-os / Instatic self-hosted) or a workspace id for multi-tenant; `AuditEvent` carries `metadata` (Instatic flat record), `diff` (personal-brand-os `diffSummary` richer form), and `ipAddress`/`userAgent` (Instatic). Append-only immutability is the shared invariant, enforced by simply not shipping update/delete mutations (rr matches; personal-brand-os adds an explicit `clear`, which is the only deviation from strict append-only). Nothing net-new in either reference to harvest.

But the slice's **backend half is incoherent today** (real gaps, not portability nits):
1. `slice.json`/`slice.manifest.json` point `schemaPath` → `convex/features/audit-log/_schema.ts` and `rootPaths` → `convex/features/audit-log` — **that directory does not exist**. Export `auditLogTables` is dangling.
2. The actual writer `convex/_shared/auditLogger.ts` inserts into table **`activityEvents`** using indexes `by_workspace`/`by_entity`/`by_actor` — **none are defined anywhere** in rr's schema (the `activity` feature owns `activities`, a different table/shape). So the helper would fail at deploy.
3. `createAuditLogger` is binding-injected — it ships **no concrete Convex mutation/query** with `v.*` arg validators + `requireUser`/`requireAdmin` gate. Not actually drop-in.

## Slice plan

**enhance** (not build-new, not skip) — the concept is covered, but make the backend trio real and coherent.

Laziest correct path (ponytail):
1. Create `convex/features/audit-log/_schema.ts` exporting `auditLogTables` with **one** table `audit_events` (rename `activityEvents` → `audit_events` for consistency; reconcile with `_shared/auditLogger.ts` in the same move) shaped as the union of both refs:
   `{ tenantId: v.union(v.null(),v.string()), actorId, action, entityType, entityId, at: v.number(), diff?: v.any(), metadata?: v.any(), ipAddress?, userAgent?, severity?: v.optional(v.string()) }`.
   Indexes: `by_at ['at']`, `by_tenant_at ['tenantId','at']`, `by_entity ['entityType','entityId']`, `by_actor ['actorId','at']`, `by_action ['action','at']`.
2. Add `convex/features/audit-log/mutation.ts` (`logEvent` — `args` validated, `requireUser`/`requireAdmin` gate, append-only insert) and `query.ts` (`list` — `args:{ tenantId?, entityType?, action?, since?, limit }`, `withIndex(...).order('desc').take(limit)`, no bare `.collect()`). These become the consumer's `bindings.logEventMutation`/`listEventsQuery`.
3. Move `_shared/auditLogger*.ts` logic into the feature dir (or have it import the new schema); kill the `activityEvents` table-name + `workspaceId`-required coupling — make tenant optional via the adapter.
4. Optional (M, only if a consumer wants UI): ship one `AuditTable` component (shadcn `table` + `badge`) reading `list`, mirroring personal-brand-os `AuditEventRow[]` (actor initials monogram, severity badge, `diffSummary`). Currently `components: []`.
5. Expose the fail-mode as an option (`failClosed?: boolean`) so Instatic's fire-and-forget and rr's fail-closed both work from one helper.

Portability blockers to strip in the existing code:
- `_shared/auditLogger.ts`: hardcoded `workspaceId` **required** + `Id<"users">`/`Id<"workspaces">` branded ids + `activityEvents` table name → must go through `TenantAdapter` and `v.string()` ids.
- `forbiddenTerms` already flag `workspaceId` and `auditLogs` in the contract — the `_shared` helper currently violates `workspaceId`.

Effort: **S** (schema + two Convex fns + path fix; the frontend trio, types, helper, and agentic tools already exist and are correct). UI table is the only M add-on, optional.

Proposed `slice.json` shape (correction of current): keep `kind: backend`, but fix `convex.schemaPath` → `convex/features/audit-log/_schema.ts` (now real), `tablesExport: "auditLogTables"`, table `audit_events`; keep peers `[convex-auth]`; keep `provides.tools [audit-log.query, audit-log.export]`, `hooks [createAuditLogger]`; add `provides.components ["AuditTable"]` only if step 4 is done.
