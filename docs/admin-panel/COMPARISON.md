# Admin-Panel Feature Comparison — rr Slice Harvest

Cross-project synthesis of admin-panel features across 15 projects, ranked by frequency,
categorized, and mapped against existing Rahman Resources (rr) admin slices to surface gaps.

- **Projects analyzed:** 15
- **Distinct admin features cataloged:** 48
- **Core (must-have) features:** 14
- **Features with NO rr slice coverage (gaps):** 31

Categories: `identity` · `content` · `observability` · `config` · `commerce` · `ai` · `system`

---

## 1. Per-Project Summary

| Project | Backend | Auth gate | Admin shape | Standout |
|---|---|---|---|---|
| superspace | convex-selfhosted | email allowlist (`PLATFORM_ADMIN_EMAILS`) + RBAC levels | Layered: platform super-admin console (`platform-admin`) + per-workspace CMS (`cms-lite`) | Menu/feature bundle store; access-level hierarchy; sync-from-catalog; error-report triage |
| CareerPack | convex-selfhosted | two-tier `requireAdmin`/`requireSuperAdmin` (role + `SUPER_ADMIN_EMAIL`) | Lazy tabbed panels | Hourly cron-precomputed `adminStats` singleton; admin ops withheld from AI tool catalog; BYOK AI config |
| Instatic-convex | convex cloud/self | capability RBAC + TOTP MFA + step-up | 9-workspace visual CMS engine | Plugin SDK (native admin pages/widgets, QuickJS sandbox); scheduled publish; storage migration |
| rahmanef.com (legacy) | convex-selfhosted | session-token (`requireAdmin`/`requireSession`) | Three-column shell, ~27 sections | Generic `AdminCrud<T>` + JSON round-trip; MCP/OAuth token admin; SEO productivity trio |
| tech-rahmanef-com | convex-selfhosted | session-token | Three-column shell (twin of rahmanef.com) | `AdminCrud<T>`; PWA-installable admin; WebP-only pipeline; Command Center |
| design-rahmanef-com | convex-selfhosted | session-token | Three-column shell (twin) | MCP OAuth panel; SEO Health + GSC deep-link; documented portable slices |
| content-rahmanef-com | convex-selfhosted | owner-only + per-tenant RBAC (`requireRole`) | Two-tier under one `/admin` namespace | Invisible admin gate (silent redirect + noindex); Data Studio seeding; 20-discipline template gallery |
| patsi-umi | convex cloud | positive-marker RBAC (`admins` table) + `@convex-dev/auth` | 25+ sections, grouped nav | Zero-touch admin bootstrap; dynamic custom-page nav; embedded Notion-clone DB widget |
| kam | convex cloud/self | single `SUPER_ADMIN_EMAIL` env gate | personal-brand-os template, `slice.json` packaged | Layered auth helpers; moderation-queue UI; AI-config model-router (designed, not wired) |
| homestay-zian | convex cloud | two-tier portal + per-page permission gate | Owner portal, 26-table generic CMS | `<NotionTable>` generic CRUD primitive; cross-project headless-CMS nav source; alert taxonomy |
| notion-page-clone | convex-selfhosted | role (`user`/`admin`/`superadmin`) + claim-superadmin bootstrap | Tabs-based `AdminPanel`, 7 sections | Per-tab persisted view-mode switcher; `ADMIN_SCAN_CAP`; FK-audit/GC ops scripts |
| rqa-app | localStorage (mock) | localStorage role, no real backend | Hash-routed dashboard, mock CRUD | Hash sub-routing; zero-backend role gate; hand-rolled charts (all mock) |
| rc-samata-dash | convex-selfhosted | 3-tier RBAC (super_admin/owner/staff), routes.ts allowlist | `/operation/*` route group | `NotionView` reused 24×; `ReportPage` PDF export; live Convex schema-graph flowchart |
| cms-rahmanef-com | convex-selfhosted | single-owner Convex Auth + `REQUIRE_AUTH` kill-switch | Single-screen visual page builder | BYOK client-side AI page-gen; env-flag auth kill-switch; headless read API |
| gg-dashboard | convex-selfhosted | graph-edge RBAC (member→role→permissions) | Feature-registry catch-all router | `defineFeature()` manifest + registry; **Admin Users/Roles/Audit are unbuilt stubs** |

---

## 2. Feature Matrix

Ranked by frequency (number of projects that ship the feature). `rr covered by` = existing slice or **GAP**.

| Feature | Category | Freq | Projects | rr covered by |
|---|---|---:|---|---|
| Settings / site config | config | 11 | superspace, Instatic, rahmanef, tech, design, content, patsi-umi, kam, homestay, rc-samata, cms-rahmanef | admin-panel (settings section) |
| Overview / KPI dashboard | observability | 13 | superspace, CareerPack, Instatic, rahmanef, tech, design, content, patsi-umi, kam, homestay, notion-page-clone, rqa, rc-samata | admin-panel (AdminPanelOverview) + admin (buildAdminStats) |
| Generic CRUD table primitive | system | 9 | rahmanef, tech, design, content, CareerPack, homestay, rc-samata, Instatic, superspace | data-table |
| Audit log | observability | 9 | CareerPack, Instatic, rahmanef, tech, design, content, notion-page-clone, homestay, rc-samata | **GAP** (audit section in admin-panel only; no standalone slice) |
| Users management (list/role/delete) | identity | 8 | superspace, CareerPack, Instatic, notion-page-clone, homestay, rc-samata, patsi-umi, gg(stub) | user-management |
| AI config (BYOK provider/model) | ai | 8 | CareerPack, notion-page-clone, homestay, rc-samata, Instatic, patsi-umi, content, kam | ai-admin |
| Blog / Posts CMS (SEO-rich) | content | 8 | Instatic, rahmanef, tech, design, content, patsi-umi, kam, superspace | **GAP** (pages-cms is generic blocks, not blog) |
| Services CMS | content | 7 | rahmanef, tech, design, content, patsi-umi, kam, superspace | **GAP** |
| Analytics (first-party) | observability | 7 | rahmanef, tech, design, content, patsi-umi, kam, notion-page-clone | event-tracking (SDK only; no dashboard UI) |
| Portfolio CMS | content | 6 | rahmanef, tech, design, content, patsi-umi, kam | **GAP** |
| Media library | content | 6 | superspace, Instatic, rahmanef, tech, design, patsi-umi | **GAP** |
| Comments moderation | content | 6 | rahmanef, tech, design, content, patsi-umi, kam | **GAP** |
| Newsletter / subscribers | commerce | 6 | rahmanef, tech, design, content, patsi-umi, kam | **GAP** |
| Leads / contact CRM inbox | commerce | 6 | rahmanef, tech, design, content, patsi-umi, kam | **GAP** |
| Error logs / observability panel | observability | 5 | superspace, CareerPack, rahmanef, tech, design | **GAP** (errors section in admin-panel only) |
| Feedback / support triage | observability | 5 | CareerPack, rahmanef, tech, design, notion-page-clone | **GAP** |
| Roles / RBAC management UI | identity | 5 | superspace, Instatic, rc-samata, patsi-umi, gg(stub) | user-management / rbac-roles |
| Pages / landing builder | content | 5 | Instatic, content, patsi-umi, cms-rahmanef, superspace | pages-cms |
| SEO tools / health | content | 5 | rahmanef, tech, design, content, superspace | seo (AI gen service; no scoring/health UI) |
| Navigation config CRUD | content | 5 | rahmanef, tech, design, patsi-umi, homestay | **GAP** (pages-cms buildPageNavItems is partial) |
| Data seeding / engine seed | system | 5 | superspace, CareerPack, content, rc-samata, patsi-umi | **GAP** |
| Command palette (Cmd+K) | system | 4 | rahmanef, tech, design, Instatic | **GAP** |
| Content generic (about/testimonials/projects/playground) | content | 5 | rahmanef, tech, design, patsi-umi, kam | **GAP** |
| Templates marketplace / management | content | 3 | CareerPack, notion-page-clone, content | **GAP** |
| Classroom / courses authoring | content | 3 | rahmanef, tech, design | **GAP** |
| Library (polymorphic content) | content | 3 | rahmanef, tech, design | **GAP** |
| MCP / OAuth token admin | config | 3 | rahmanef, tech, design | **GAP** (chatgpt-mcp skill, no slice) |
| Workspaces / tenants management | identity | 3 | superspace, content, gg | user-management (tenant-hierarchy) |
| Invitations | identity | 4 | superspace, Instatic, patsi-umi, gg | user-management (um_invites) |
| HR / staff management | identity | 2 | homestay, rc-samata | **GAP** |
| AI usage / cost dashboard | ai | 2 | CareerPack, Instatic | ai-admin (budgets) |
| AI skills / tools / agents | ai | 2 | CareerPack, rc-samata | ai-admin |
| Visual drag-drop site builder | content | 2 | Instatic, cms-rahmanef | **GAP** (pages-cms is block-compose, not canvas) |
| Embedded Notion-style DB widget | content | 2 | patsi-umi, homestay | **GAP** |
| Feature flags | config | 1 | (template-base only) | admin-panel (feature-flags section) |
| A/B experiments | config | 1 | (template-base only) | admin-panel (ab-tests section) |
| Feature / menu bundle store | config | 1 | superspace | app-store (OS-flavored; product bundle = **GAP**) |
| Schema graph (Convex introspection) | system | 1 | rc-samata | **GAP** |
| Plugins marketplace / host | system | 1 | Instatic | **GAP** |
| Scheduled publish | content | 1 | Instatic | **GAP** |
| MFA / step-up / session-device mgmt | identity | 1 | Instatic | **GAP** |
| Broadcast / mass messaging | commerce | 1 | patsi-umi | **GAP** |
| Reports / complaints intake | observability | 1 | patsi-umi | **GAP** |
| KPI target threshold config | config | 1 | rc-samata | **GAP** |
| Starred / bookmarks | system | 1 | rqa | **GAP** |
| Changelog management | content | 1 | notion-page-clone | **GAP** |
| Notifications inbox | system | 0 | (rr-only) | notifications-center |
| Auth gate (server-side) | identity | 15 | all | rbac-roles + admin (requireAdmin/requirePermission) |

---

## 3. Core vs Niche

### Core (must-have — high frequency, build/perfect these first)
1. **Settings / site config** (11)
2. **Overview / KPI dashboard** (13)
3. **Generic CRUD table primitive** (9) — the single most-copied building block (`AdminCrud`, `NotionView`, `NotionTable`, `DataTable`)
4. **Audit log** (9)
5. **Users management** (8)
6. **AI config (BYOK provider/model)** (8)
7. **Blog / Posts CMS** (8)
8. **Services CMS** (7)
9. **Analytics** (7)
10. **Portfolio CMS** (6)
11. **Media library** (6)
12. **Comments moderation** (6)
13. **Newsletter / subscribers** (6)
14. **Leads / CRM inbox** (6)

Plus the universal **server-side auth gate** (15/15) — already covered by rbac-roles.

### Common but not universal (mid-tier, 4–5)
Error logs · Feedback triage · Roles/RBAC UI · Pages/landing builder · SEO tools · Navigation config · Data seeding · Content-generic entities · Command palette · Invitations.

### Niche (≤3 — build only on demand)
Templates marketplace · Classroom/courses · Library polymorphic · MCP/OAuth token admin · HR/staff · Workspaces/tenants · AI usage/cost · AI skills/tools/agents · Visual site builder · Notion DB widget · Feature flags · A/B experiments · Feature bundle store · Schema graph · Plugins host · Scheduled publish · MFA/step-up · Broadcast · Reports/complaints · KPI targets · Starred · Changelog.

---

## 4. Gaps — features NO existing rr slice covers

**High-priority gaps (these are CORE features with zero rr coverage):**
- Blog / Posts CMS (SEO-rich posts) — 8 projects
- Services CMS — 7
- Portfolio CMS — 6
- Media library — 6
- Comments moderation — 6
- Newsletter / subscribers — 6
- Leads / CRM inbox — 6
- Audit log (standalone slice — currently only a section inside dev-stage admin-panel) — 9
- Error logs / observability panel — 5
- Feedback / support triage — 5

**Mid-priority gaps:**
- SEO health / scoring dashboard UI (the `seo` slice only generates metadata, no panel)
- Navigation config CRUD
- Data seeding / engine-seed idempotent bootstrap pattern
- Command palette (Cmd+K)
- Content-generic entities (about / testimonials / projects / playground)
- Templates marketplace / management
- Analytics dashboard UI (event-tracking provides ingestion SDK but no charts)

**Niche gaps:**
- Classroom / courses authoring
- Library (polymorphic single-table content)
- MCP / OAuth token admin (chatgpt-mcp skill exists but not packaged as a slice)
- HR / staff management
- Visual drag-drop site builder (pages-cms is block-compose only)
- Embedded Notion-style database widget
- Product feature/menu bundle store (app-store is OS-flavored)
- Schema graph (Convex introspection)
- Plugins marketplace / QuickJS host
- Scheduled publish
- MFA / step-up / session-device management
- Broadcast / mass messaging
- Reports / complaints intake
- KPI target threshold config
- Starred / bookmarks
- Changelog management

**Also flagged in rr notes (verify separately):** `audit-log` and `dashboard-shell` are referenced as peers of `ai-admin` / `admin-panel` but are absent from the slice inventory.

---

## 5. Notes on rr coverage quality

- **Do NOT rebuild:** `user-management` (v0.8.0) already covers members/invites/roles/teams/tenant-hierarchy/access-matrix. `rbac-roles` is the RBAC foundation. `admin-panel` (template-base) is the real 18-section RBAC-gated product-admin surface — extend it, don't fork it.
- **Two shells, don't conflate:** `admin` (v0.2.1, thin landing + nav-from-registry) vs `admin-panel` (v0.1.0, dev/not-ready, full sections).
- **Building blocks present:** `data-table` (grids), `notifications-center` (inbox), `pages-cms` (block editor), `ai-admin` (AI console), `seo` (metadata gen).
- **Instrumentation exists twice:** `event-tracking` (stub) + `admin-panel/slices/events` (full SDK). Neither ships an analytics dashboard UI.
- **Highest-value extraction target across the whole survey:** a generic inline-editable CRUD table (the `AdminCrud<T>` / `NotionView` / `<NotionTable>` pattern appears in 9+ projects). rr's `data-table` is the closest primitive but lacks the config-driven form + per-field renderers (file/gallery/richtext/links/json) that make those project versions turnkey.
