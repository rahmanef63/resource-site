# Dashboard architecture vision

**Status:** Direction set 2026-05-19. Implementation queued for AZ-wave
onward. This doc is the single source of truth for the next session —
point Claude at it (`cat docs/architecture/dashboard-vision.md`) and
the full vision lands without retracing the conversation.

## TL;DR

Replace the current flat `admin/` per-template surface with a unified
**Dashboard** that has two top-level sections:

```
/preview/<template>/dashboard/
├── admin/        ← current headless CMS lives here (was /admin/...)
└── workspace/    ← new — productivity / app-mode surface
```

The dashboard is the operator's home. Admin = the WHAT-CUSTOMERS-SEE
side (CMS, public-page content). Workspace = the WHAT-OPERATOR-USES
side (apps, tools, productivity slices).

## Why

1. **Conflation.** Today "admin" mixes content management (landing
   sections, blog posts) with operator productivity (notion-style
   editing, CRM, analytics). Two distinct mental modes glued together.
2. **Composability.** Workspace becomes the natural home for
   notion-page-clone's editor, command-menu, calendar, etc. — slices
   that have nothing to do with the public site.
3. **Sourceable.** Many workspace features already exist in
   superspace + notion-page-clone + others. The dashboard split makes
   it obvious where they should land.

## Target nav structure

```
Dashboard (root, was /admin)
├── Admin Panel  (sub-parent)
│   ├── Pages          ← existing — landing-sections, all-pages, blog, etc.
│   ├── RBAC           ← NEW (from superspace rbac-roles slice)
│   ├── CMS menu       ← NEW (public-frontend nav editor)
│   ├── Analytics      ← NEW (event-tracking slice already exists)
│   ├── CRM            ← NEW (customer-relations — from superspace)
│   ├── Audit log      ← (existing slice, surface here)
│   └── … per-template entities (Leads, Subscriptions, Customers)
└── Workspace   (sub-parent)
    ├── Editor         ← notion-page-clone editor at MAX (block editor +
    │                    slash menu + page tree)
    ├── Calendar       ← cal-com-booking slice
    ├── Command menu   ← existing slice
    ├── Database       ← notion-clone database-views slice
    ├── Comments       ← threaded comments slice
    └── … other productivity tools
```

## Renames

| Old | New | Why |
|---|---|---|
| `/admin/...` | `/dashboard/admin/...` | Dashboard becomes root |
| (none) | `/dashboard/workspace/...` | Workspace is new |
| `AdminShell` | `DashboardShell` | Wraps everything; embeds AdminPanelNav + WorkspaceNav as collapsible groups |
| `AdminSidebar` | `DashboardSidebar` | Routes by /admin or /workspace segment to highlight correct group |
| `AdminNavItem` | `DashboardNavItem` (alias OK for migration) | |
| `ADMIN_BASE` | `DASHBOARD_BASE` + nested constants | Per-template `DASHBOARD_BASE`, `ADMIN_PANEL_BASE = DASHBOARD_BASE + "/admin"`, `WORKSPACE_BASE = DASHBOARD_BASE + "/workspace"` |
| `buildAdminPrimaryNav(state)` | `buildAdminPanelNav(state)` + `buildWorkspaceNav(state)` | Two builders, one per top-level section |

## Migration plan (AZ → BC wave estimate)

### AZ-wave — foundation rename (low-risk, mechanical)

- Rename `admin-shell.tsx` → `dashboard-shell.tsx`, keep file structure
- Add `DashboardShell` that wraps `AdminPanelShell` + `WorkspaceShell`
  (or routes by segment)
- Per-template constants: split `ADMIN_BASE` into
  `DASHBOARD_BASE`, `ADMIN_PANEL_BASE`, `WORKSPACE_BASE`
- Redirect `/admin/*` → `/dashboard/admin/*` in next.config (no breaking
  consumer links)
- Keep all existing admin routes inside `/dashboard/admin/...` — only
  the URL prefix shifts

### BA-wave — Pages restructure inside Admin Panel

- Current "Pages" parent (AV/AX-wave) becomes the first item under
  Admin Panel
- Same children: All pages / Landing page / Blog / Portfolio / etc.
- Subsequent sub-items: RBAC, CMS menu, Analytics, CRM, Audit log

### BB-wave — Workspace bootstrap

- Scaffold `/dashboard/workspace/` route per template
- Wire notion-page-clone editor here for templates that want it
  (notion-page-clone-os obviously; others optional)
- Sub-items: Editor, Calendar, Command menu

### BC-wave — feature harvesting

Slices to lift from other projects (use `/rr lift` flow):

| Feature | Source | Lands at |
|---|---|---|
| RBAC config | `superspace/convex/workspace/permissions` + `roles.config.ts` | `frontend/slices/rbac-roles/` (slice already exists, needs admin UI) |
| CRM | `superspace/frontend/slices/crm/` (if exists) — else build from CareerPack | `frontend/slices/crm/` (NEW) |
| Analytics dashboard | `superspace/frontend/slices/analytics/` | `frontend/slices/analytics-dashboard/` (NEW; complements existing event-tracking slice) |
| CMS menu | `superspace/frontend/slices/cms-menu-builder/` or build new | `frontend/slices/cms-menu/` (NEW) |
| Notion editor (workspace mode) | `notion-page-clone/frontend/slices/editor/` | already lifted as `notion-blocks` slice — needs workspace mounting |
| Database views | `notion-page-clone/frontend/slices/databases/` | `frontend/slices/database-views/` (NEW — 11 view types) |
| Calendar | `cescadesigns` + `cal-com-booking` slice | already exists; wire workspace mount |
| Command menu | already exists | wire workspace mount |

## What stays the same

- `_shared/landing/`, `_shared/pages/`, `_shared/crud/`, `_shared/ui/`
  primitives — these are template-agnostic foundations and don't move
- `landingSections` schema (kind, title, subtitle, imageUrl,
  imageRatio, bgImageUrl, className, config, order, enabled)
- `LandingSectionShell` wrapper, `LandingRenderer` per template
- Shadcn Sidebar primitives (`SidebarMenuButton` /
  `SidebarMenuSub` / `SidebarProvider`) — extend, never replace
- `RecentlyUpdatedBadge` + changelog discipline
- VersionWatcher, FeatureBar, buildPreviewManifest SSOT

## Open questions for next session

1. **Per-template opt-in?** Should every template ship a Workspace, or
   only those that actually have ops/productivity features
   (notion-page-clone-os yes, saas-marketing-os maybe just stubbed)?
2. **Shared workspace primitives?** `_shared/workspace/` mirroring
   `_shared/pages/` + `_shared/landing/`?
3. **Auth model.** Admin panel = workspace-admin role only. Workspace
   = any signed-in user. RBAC slice gates the split.
4. **Public vs operator nav.** Should the public site link to
   `/login` → `/dashboard/...` based on role? Or two distinct
   subdomains?

## Source map (where to read existing implementations)

```
superspace/
├── convex/workspace/permissions.ts            ← RBAC core
├── convex/workspace/roles.config.ts           ← Role tiers
├── frontend/slices/platform-admin/            ← Admin-panel shell pattern
├── frontend/slices/admin-panel/               ← 17-section shell
├── frontend/shared/ui/layout/                 ← Three-column + sidebar layouts
└── frontend/shared/lib/features/              ← Feature registry pattern

notion-page-clone/
├── frontend/slices/editor/                    ← Block editor (lifted as notion-blocks)
├── frontend/slices/workspace-sidebar/         ← Page tree DnD sidebar
├── frontend/slices/databases/                 ← 11 view types
├── frontend/slices/comments/                  ← Threaded
└── frontend/slices/block-selection/           ← Multi-block selection

rahmanef.com/
└── frontend/shared/ui/                        ← Motion primitives + theme presets
```

## End-of-session-2026-05-19 progress

See `docs/sessions/2026-05-19-session.md` for the wave-by-wave log of
what shipped this session. The Dashboard vision above is the
direction for AZ→BC waves.

## How to resume

Next session:

```
You: read docs/architecture/dashboard-vision.md and continue from AZ-wave.
Claude: <reads, picks up context, executes AZ-A foundation rename>
```
