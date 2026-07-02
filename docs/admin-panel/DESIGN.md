# admin-console — the ideal rr admin panel

> Composition slice. Slug: `admin-console`. Status: design (net-new wiring + 5 gap sections).
> Driven by `docs/admin-panel/COMPARISON.md` (47-feature harvest across 18 projects).

## 1. Approach: compose, do not rebuild

**Verdict: a thin composition slice, NOT a monolith.**

The comparison flagged ~34 "gaps," but that gap list was computed against a *partial*
inventory. The live `frontend/slices/` tree already ships real slices for almost every
CORE feature. Re-auditing the actual directory:

| Comparison "gap" | Reality in `frontend/slices/` |
|---|---|
| Blog / Posts CMS | `blog-section` (v0.1.0, public surface) |
| Services CMS | `services` (v0.1.1, Convex CRUD + admin gate) |
| Portfolio CMS | `portfolio-section` (v0.1.0) |
| Comments moderation | `comments` (v0.3.0, polymorphic threads + forbiddenWords) |
| Newsletter / subscribers | `resend-newsletter` (v0.2.0, subscribe + broadcast) |
| Command palette | `command-menu` (v0.4.0, ⌘K renderless) |
| Changelog | `changelog-feed` (v0.1.0) |
| Library (polymorphic) | `library` (v0.2.0, 6-kind single-table) |
| Content-generic (testimonials/about) | `testimonials`, `about-profile`, `faq-section` |
| Workspaces / tenants | `platform-admin` (v0.2.0, tenant lifecycle + KPI grid) |
| Settings / site config | `settings-page` (v0.3.0, adapter-driven) |
| Media library | `media-studio` (v1.0.0) covers editing; library grid via adapter |
| Audit log recorder | `audit-log` (v0.3.0) — recorder exists, **no viewer UI** |
| Analytics ingestion | `event-tracking` + admin-panel `events` sub-slice — **no charts** |

So the panel is ~90% wiring existing slices into one gated shell. Building a monolith
would duplicate `user-management` (v0.8.0, the most mature slice), `ai-admin`,
`rbac-roles`, `data-table`, and a dozen content slices — a direct violation of the
copy-first / no-reinvention mandate. **A composition slice is strictly lazier and
inherits every slice's maturity, adapter seams, and Convex gating for free.**

The outer shell already exists too: `template-base/.../admin-panel` ships
`AccessGate.tsx` + `AdminShell.tsx` + `useAdminAccess.ts` + an 18-entry `ADMIN_SECTIONS`
registry with per-tier + per-permission gating mirrored server-side. `admin-console`
**extends `admin-panel`** — it does not fork it. It reuses the gate + shell + registry
shape and adds a *section-mount adapter* that maps each registry id to a component from a
peer slice, plus the 5 genuinely-uncovered gap sections.

Why a new name (not `admin` / `admin-panel`): `admin` (v0.2.1) is the thin generic
landing factory; `admin-panel` is the template-base shell/registry. `admin-console` is
the *composed product surface* that binds shell + registry + every content/identity/ops
slice into one route tree. Three distinct layers, no collision.

## 2. Dependency graph — which slice supplies which section

```
                        admin-console  (this slice — shell wiring + registry + 5 gap sections)
                              │
        ┌─────────────┬───────┼───────────────┬──────────────┬────────────────┐
   admin-panel     rbac-roles │            data-table   notifications-center  command-menu
  (AccessGate,   (PERMS,      │           (grid prim)   (bell/inbox)         (⌘K palette)
   AdminShell,    gate,       │
   ADMIN_SECTIONS)role presets)│
                              │
   ┌──────────┬──────────┬────┴────┬───────────┬───────────┬──────────┬──────────┐
identity     ai         content                observability   commerce   config   platform
├user-mgmt   ai-admin   ├blog-section          ├audit-log*     resend-    settings- platform-
└rbac-roles             ├services              ├event-track*   newsletter page      admin
                        ├portfolio-section     └(sysmon opt.)  (subs +             (tenants,
                        ├pages-cms                             broadcast)           KPI grid)
                        ├comments
                        ├library
                        ├testimonials
                        ├changelog-feed
                        └seo*  (service only)

*  = slice exists but needs a NET-NEW thin viewer/panel (see §4 gap sections)
```

`convex-auth` is the transitive auth root under `rbac-roles` / `user-management` /
`services` etc. (`requireAdmin` / `requirePermission` + `PLATFORM_ADMIN_EMAILS`).

## 3. Section list (the ideal panel)

Grouped as admin-panel already groups: P0 instrumentation → P1 identity/content →
P2 ops. `reuse` = existing slug that renders the section; `BUILD` = net-new in this slice.

### P0 — instrumentation / observability
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| Overview / KPI dashboard | superspace, patsi-umi, CareerPack | admin-panel (AdminPanelOverview) + platform-admin (KPI grid) | — |
| Events | Instatic-convex, patsi-umi | event-tracking (+ admin-panel `events`) | — |
| Analytics dashboard (charts/funnels) | rahmanef.com, kam | event-tracking (data) | **BUILD** (charts) |
| Audit log viewer | CareerPack, Instatic-convex | audit-log (recorder) | **BUILD** (viewer) |
| Error / feedback triage | superspace, CareerPack | audit-log + notifications-center | — |

### P1 — identity
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| Users (list/role/delete) | superspace, patsi-umi | user-management | — |
| Roles / RBAC UI | superspace, gg-dashboard | rbac-roles (+ user-management RolesPanel) | — |
| Invitations | superspace, Instatic-convex | user-management | — |
| Workspaces / tenants | superspace, content-rahmanef | platform-admin | — |

### P1 — AI
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| AI config (BYOK provider/model) | CareerPack, patsi-umi | ai-admin | — |
| AI usage / cost + skills/tools/agents | CareerPack, rc-samata-dash | ai-admin | — |

### P1 — content (CMS)
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| Blog / Posts CMS | Instatic-convex, patsi-umi | blog-section (+ data-table admin) | — |
| Services CMS | rahmanef.com, kam | services (+ data-table admin) | — |
| Portfolio CMS | rahmanef.com, kam | portfolio-section (+ data-table) | — |
| Pages / landing builder | Instatic-convex, cms-rahmanef | pages-cms | — |
| Library (polymorphic) | rahmanef.com | library | — |
| Comments moderation | rahmanef.com, patsi-umi | comments | — |
| Testimonials / content-generic | rahmanef.com, patsi-umi | testimonials, about-profile, faq-section | — |
| Changelog | notion-page-clone | changelog-feed | — |
| Media library | superspace, Instatic-convex | media-studio (+ MediaLibraryAdapter) | — |
| Navigation config CRUD | rahmanef.com, homestay-zian | — | **BUILD** |
| SEO health / scoring panel | rahmanef.com | seo (generator service) | **BUILD** (panel) |

### P1 — commerce
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| Newsletter / subscribers | rahmanef.com, kam | resend-newsletter | — |
| Broadcast / mass messaging | patsi-umi | resend-newsletter (send pipeline) | — |
| Leads / CRM inbox | rahmanef.com, patsi-umi | — | **BUILD** |

### P1 — config / system
| Section | Harvested from | reuseSlice | build |
|---|---|---|---|
| Settings / site config | superspace, Instatic-convex | settings-page | — |
| Command palette (⌘K) | rahmanef.com | command-menu | — |
| Notifications inbox | (rr) | notifications-center | — |
| Data seeding / bootstrap | superspace, CareerPack | (per-slice `seed` internals) | — |

**Net-new sections = 5**: Analytics dashboard, Audit log viewer, Navigation config,
SEO health panel, Leads / CRM inbox. Everything else is a reuse mount.

## 4. Net-new file tree (minimal)

Only shell wiring + the 5 gap sections + their backend. Nothing that duplicates a peer.

```
frontend/slices/admin-console/
├── slice.json                         # pair: metadata + peers/dependsOn
├── slice.manifest.json                # file manifest
├── config.ts                          # defineFeature + ADMIN_CONSOLE_SECTIONS registry
│                                       #   (extends admin-panel ADMIN_SECTIONS, adds gap ids)
├── index.ts                           # barrel: AdminConsole + registry + hooks
├── components/
│   ├── AdminConsole.tsx               # root: AccessGate(admin-panel) → AdminShell → active section
│   └── sections/
│       ├── AnalyticsDashboard.tsx     # charts (recharts/shadcn) over event-tracking queries
│       ├── AuditLogViewer.tsx         # data-table over audit-log table (filters + diff drawer)
│       ├── NavConfigManager.tsx       # tree CRUD + reorder over ac_nav_items
│       ├── SeoHealthPanel.tsx         # scan grid + "generate" action over seo service
│       └── LeadsInbox.tsx             # CRM inbox: list + status pipeline + notes drawer
├── lib/
│   └── sectionRegistry.ts             # maps section id → { component, reuseSlice, gate }
│                                       #   reuse mounts are lazy imports of peer components
└── hooks/
    └── useAdminSection.ts             # active-section resolver (URL sync + gate filter)

convex/features/admin-console/
├── _schema.ts                         # ac_leads, ac_nav_items (net-new tables only)
├── leads.ts                           # list/get/updateStatus/addNote (requirePermission crm.manage)
└── navConfig.ts                       # list/upsert/remove/reorder (requirePermission content.manage)
```

Reuse sections carry **no files here** — `sectionRegistry.ts` lazy-imports
`@/features/user-management`, `@/features/ai-admin`, `@/features/blog-section`, etc.
Because rr forbids slice→slice imports at the *slice* layer, these resolve through the
consumer's installed `@/features/<slug>` aliases (composition happens in the host app,
registry only references them by the public barrel path — documented as a soft peer).

## 5. Convex tables (net-new only)

Prefixed `ac_` to avoid collision. Everything else reads peer tables
(`audit-log`, event-tracking's `events`, `seo`'s `seoGeneratorCalls`, `um_*`, `rbac_roles`).

| Table | Purpose | Key fields |
|---|---|---|
| `ac_leads` | Contact / CRM inbox rows | `name, email, message, source, status('new'\|'open'\|'won'\|'lost'), assignee?, notes[], createdAt` |
| `ac_nav_items` | Navigation config CRUD | `label, href, icon?, parentId?, order, visible, target?` |

Both gated by `requirePermission` from `rbac-roles` (`crm.manage`, `content.manage`) +
`PLATFORM_ADMIN_EMAILS` fallback. Leads insert is public-write (contact form) so it needs
`rate-limit` peer + forbiddenWords reuse from `comments`.

## 6. Build checklist (single implementer, ordered)

1. **Scaffold pair** — `slice.json` + `slice.manifest.json` + `config.ts` + `index.ts`.
   Declare peers: admin-panel, rbac-roles, user-management, ai-admin, data-table,
   notifications-center, command-menu, event-tracking, audit-log, settings-page,
   platform-admin, and content slices (blog-section, services, portfolio-section,
   pages-cms, comments, library, testimonials, changelog-feed, resend-newsletter, seo,
   media-studio) as `dependsOn`.
2. **Registry** — `lib/sectionRegistry.ts`: extend `ADMIN_SECTIONS` with the 5 gap ids;
   each entry `{ id, label, icon, path, required, tiers, priority, component }`.
   Reuse entries lazy-import peer barrels; gap entries import local `sections/*`.
3. **Shell root** — `components/AdminConsole.tsx`: wrap admin-panel `AccessGate` →
   `AdminShell` (pass filtered registry) → render active section via `useAdminSection`.
4. **`useAdminSection.ts`** — URL-sync (History API, per os-vps routing memory) + filter
   registry by `useAdminAccess` level + tier + permission.
5. **Backend** — `convex/features/admin-console/`: `_schema.ts` (`ac_leads`,
   `ac_nav_items`) + `leads.ts` + `navConfig.ts` with `requirePermission` gates.
6. **Gap sections** (each ~one file, reuse `data-table`):
   - `AuditLogViewer.tsx` — `data-table` over audit-log query + before/after diff drawer.
   - `LeadsInbox.tsx` — `data-table` + status Select + notes drawer over `ac_leads`.
   - `NavConfigManager.tsx` — tree list + dnd reorder over `ac_nav_items`.
   - `SeoHealthPanel.tsx` — card grid reading `seo` + "generate metadata" action button.
   - `AnalyticsDashboard.tsx` — shadcn/recharts funnels + attribution over event-tracking.
7. **Command palette wiring** — feed registry into `command-menu` groups so ⌘K jumps to
   any section.
8. **Notifications** — mount `notifications-center` bell in `AdminShell` header slot.
9. **Docs + demo** — `slice.json` example props + zero-backend mock (memory adapters from
   peers) so `admin-console` renders fully populated with no Convex.
10. **Verify** — install into a consumer, confirm gate filtering (platform_admin vs
    workspace_owner vs denied), and that reuse mounts resolve via `@/features/*`.

## 7. Open questions

- Slice→slice import ban vs. composition: registry references peer barrels by path but the
  slice can't hard-import them. Confirm the pattern = "soft peer registered in the host
  app, registry holds string ids + host provides the component map" vs. lazy dynamic import.
- Should `admin-panel` (template-base shell) be **promoted** into `frontend/slices/` so
  `admin-console` has a stable published peer, or stay template-base and get copied in?
- Media library: reuse `media-studio` (editor) or add a light `MediaLibraryAdapter` grid?
  Current plan = adapter grid, no new slice.
- Leads public-write abuse surface: reuse `comments` forbiddenWords + `rate-limit`, or
  fold a dedicated guard into `leads.ts`?
- Broadcast: is `resend-newsletter`'s send pipeline enough, or does patsi-umi's
  segmented broadcast need its own `broadcast` gap section later?
