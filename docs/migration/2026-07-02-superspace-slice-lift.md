# SuperSpace → rr — full slice lift migration

> Started 2026-07-02. Branch `migration/ss-slice-lift` (off `origin/main`).
> Goal: make **rr (resource-site) the SSOT** for every SuperSpace feature, so
> future projects compose from the rr catalog instead of forking SS.

## Strategy — two tiers

Lifting 66 SS slices "properly" (props-driven, rr-alias, no `@/frontend/shared`
coupling, catalog + trio + preview) is per-slice surgery — most SS slices are
business-locked verticals or shared-coupled modules (see `docs/rr-slices.md`
history: `forms` alone took a full session; `documents`/`knowledge` are
cascade-blocked). So the migration is split:

1. **SYNC (done) — lossless mirror.** Every SS slice + convex feature copied
   verbatim into `migration/superspace/` — git-tracked but **tsc/eslint/build
   excluded** (see `tsconfig.json` + `eslint.config.mjs` `migration/**`). Nothing
   in the public catalog is clobbered, rr's build stays green, and 100% of SS
   features now live in this repo. This is the "terkirim ke resource/" milestone.
2. **IMPROVE (incremental) — promote per wave.** Move a slice from
   `migration/superspace/frontend/slices/<slug>` → real `frontend/slices/<slug>`
   (+ `convex/features/<slug>`), sanitize to rr conventions, register in
   `lib/content/slices.ts`, verify (`tsc` + `npm run slices:check`), commit.
   Easiest-first (LEAF → SHARED-COUPLED → BUSINESS). OVERLAP slices are
   reconciled against rr's existing (usually cleaner) copy, not overwritten.

### Sanitize checklist (per slice, IMPROVE phase)

- Alias: `@/frontend/slices/*` → `@/features/*`; drop `@/frontend/shared/*`
  (inline the primitive or swap FeatureShell→`<div>`, ResponsiveDialog→raw
  shadcn Dialog, SmartLink→`next/link`, any-api→typed `@convex/_generated`).
- Frontend must not import `convex/react` / `_generated` directly — consumer
  injects bindings (see the `forms` lift pattern in `docs/rr-slices.md`).
- Convex: strip hardcoded `requirePermission`/`logAuditEvent`; generic table
  names (`<slug>_records`); `by_tenant_id` index; consumer wraps authz.
- Ship the trio (`slice.json` + `slice.contract.ts` + `slice.manifest.json`)
  and a `/preview/slices/<slug>` route.

## Status legend

`mirrored` = in `migration/superspace/` (sync done) · `promoted` = real
`frontend/slices/` + sanitized · `catalog` = registered in `lib/content/slices.ts`
+ verified · `skip` = deprecated/superseded.

## Classification — all 66 SS slices

Columns: **inRr** (slug already exists in rr `frontend/slices/`) · **trio** (SS
metadata trio present) · **shared** (# files importing `@/frontend/shared`) ·
**cvxReact** (# frontend files touching `convex/react`/`_generated`) · **rbac**
(# convex files with `requirePermission`/`logAuditEvent`/`ensureUser`) · **loc**.

### OVERLAP (12) — already in rr; reconcile, do not overwrite

| slug | rr has | notes |
|---|---|---|
| ai-admin | ✅ | rr scaffold vs SS scaffold — diff, keep rr |
| ai-agents | ✅ | same |
| ai-chat | ✅ | rr clean (ai@4) vs SS wired-to-engine (ai@5) — SS version is functional; candidate to upstream |
| ai-router | ✅ | rr proxy vs SS stub |
| ai-studio | ✅ | scaffold both |
| audit-log | ✅ trio | already lifted w/ TenantAdapter |
| command-menu | ✅ trio | pulled rr→SS; in sync |
| create-your-mcp | ✅ | rr canonical MCP OAuth |
| notion | ✅ | rr block editor (adopted rr→SS 2026-07-02) |
| platform-admin | ✅ trio | lifted Wave N+3.2 |
| rate-limit | ✅ trio | pulled rr→SS, hardened |
| user-management | ✅ | reconcile |

### LEAF (2) — low coupling; promote first

| slug | shared | cvxReact | rbac | loc |
|---|---|---|---|---|
| datasets | 3 | 1 | 6 | 175 |
| notifications | 3 | 0 | 1 | 395 |

### SHARED-COUPLED (24) — need `@/frontend/shared` decoupling

ai(6551), approvals, bi, blog, calendar(2586), communications(10253),
contacts, content(5342), crm, database(37610 — huge), documents(2063),
example, forms(1399 — lift 90% done in a prior session), i18n-translate,
import-export(5553), integrations, knowledge(2854 — blocked on documents),
marketing, overview, projects, status, store(8162), support, tasks(2293).

### BUSINESS (26) — consumer-locked verticals; mirror-only, low priority

accounting, analytics, asset-management, branch-health-scoring,
cash-flow-forecast, customer-loyalty, daily-closing, damage-reports,
guest-booking, hr, inventory, kpi-thresholds, maintenance-scheduling,
operational-checklist, owner-analytics, owner-transfers, petty-cash, pos,
qsr-allowances, qsr-dashboard, qsr-master-data, qsr-payables, qsr-petty-cash,
qsr-product-changes, reports, sales, staff-operations.

### DEPRECATED (1) — skip

cms-lite (19652 loc, 30 tables) — deprecated in SS; do not lift.

## Wave plan (IMPROVE)

- **Wave 1** — LEAF: `datasets`, `notifications`. Proof-of-pipeline.
- **Wave 2** — low-coupling SHARED (shared ≤ 8, no cascade): approvals, bi,
  blog, forms (resume prior lift), integrations, marketing, projects, status,
  support, i18n-translate, example.
- **Wave 3** — mid SHARED: crm, contacts, tasks, content, calendar, overview,
  import-export, communications.
- **Wave 4** — heavy/cascade: database, store, ai, documents→knowledge
  (documents must be decoupled first — see rr-slices.md blocker).
- **Wave 5** — BUSINESS verticals (generic-ize to `<slug>_records` + props).
- **Reconcile** — OVERLAP 12: diff SS vs rr, upstream SS improvements (esp.
  ai-chat functional wiring).

## Resume

`git checkout migration/ss-slice-lift`. This doc is the SSOT — pick the next
`mirrored` slice in wave order, run the sanitize checklist, verify, flip its
status to `promoted`/`catalog`. The parked os-apps-port WIP is in
`git stash` ("os-apps-port WIP: cli manifest").
</content>
</invoke>
