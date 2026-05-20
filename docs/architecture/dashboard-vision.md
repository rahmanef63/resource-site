# Dashboard architecture — two archetypes

**Status:** Direction set 2026-05-20 after the BB / BC / BD waves. This
doc supersedes the earlier "single dashboard with workspace switcher"
direction. The corrective insight: most templates only need a simple
admin; only a few need the workspace chassis. Forcing every template
through the same shell creates menu noise for the simple case and a
weak abstraction for the complex case.

## TL;DR — pick one of two

| Archetype | Sidebar shape | Switcher | Secondary sidebar | When to use |
|---|---|---|---|---|
| **Simple** (default) | Single sidebar, BrandHeader at top, admin nav with collapsible sub-menus | none | none | Template's dashboard is just CMS work (Pages / Posts / Leads / …) |
| **Advanced** (opt-in) | Three-column layout — primary nav, **secondary sidebar** for active section's sub-items, main content | **Workspace switcher** in primary header (only when multi-tenant) | yes | Template has many non-CMS features (notion editor, calendar, command menu, database views) **and/or** multi-tenant workspace context |

The rule: **simple is the default**. Advanced is an opt-in for a small
set of templates whose dashboard is meaningfully more complex than
"manage public content".

## Why this split

- **Simple keeps simple.** A solo creator marketing site has one
  context, ~10 admin pages, no productivity surface. Bolt-on workspace
  switcher + section toggle creates UI noise without value.
- **Advanced needs space.** Notion / Linear / Slack patterns earn the
  three-column layout because they juggle workspace context + many
  sections + per-section sub-nav. A single sidebar can't carry that.
- **No "two sections" toggle.** BB-wave's section dropdown (Admin Panel
  ↔ Workspace) treated admin and workspace as equals. Wrong primitive:
  in the simple case workspace doesn't exist; in the advanced case
  admin is a privileged sub-link inside workspace, not a peer.

## Per-template decision matrix

| Template | Archetype | Reason |
|---|---|---|
| `saas-marketing-os` | Simple | Public-only marketing template; admin is just Pages + Posts + Pricing |
| `personal-brand-os` | Simple | Solo creator; one context; admin owns Posts / Portfolio / Services / Leads |
| `agency-studio-os` | Simple (advanced later?) | Per-client work could justify advanced if projects-as-workspaces lands |
| `konsultan-os` | Simple | Solo consultant CMS |
| `kreator-studio-os` | Simple | Solo creator CMS |
| `riset-kit` | Simple | Researcher's review kit, single context |
| `wirausaha-os` | Simple | Solo entrepreneur business CMS |
| `notion-page-clone-os` | **Advanced** | Notion = workspace tool; native fit for multi-workspace + many non-CMS surfaces |

Today (post-BD): all 8 templates use Simple. Advanced primitives land
in BE-wave with `notion-page-clone-os` as the canary.

## Simple archetype — what exists today

```
DashboardShell (single sidebar, SidebarProvider + SidebarInset)
└── AdminSidebar
    ├── BrandHeader (logo + template name; static)
    ├── NavGroup "Workspace" — primaryNav from buildAdminPrimaryNav(state)
    │   └── ParentNavItem with collapsible children (shadcn NavMain idiom)
    │       └── e.g. Pages parent → All pages / Landing / Blog / Portfolio …
    ├── NavGroup "Settings" — settingsNav (optional)
    └── UserFooter
```

Files:
- `components/templates/_shared/ui/dashboard-shell.tsx`
- `components/templates/_shared/ui/admin-sidebar.tsx`
- `components/templates/_shared/ui/admin-nav-items.tsx` (LeafNavItem +
  ParentNavItem with `Collapsible` group/state animation)
- Per-template `shared/nav-config.ts` exports `buildAdminPrimaryNav(state)`
- Per-template `app/preview/<slug>/dashboard/dashboard-shell-client.tsx`
  wires it up

## Advanced archetype — BE-wave plan

Three new primitives, all in `components/templates/_shared/ui/`:

### 1. `workspace-switcher.tsx`

Standalone, opt-in. Mounted in the primary sidebar header **only when
the template has multiple workspaces**. Swaps `activeWorkspaceId` in
the store. NOT a section toggle — sections are handled by the primary
nav itself.

Pattern: shadcn TeamSwitcher (SidebarMenuButton size="lg" +
DropdownMenu) — but the dropdown items are real workspaces from store,
not abstract "sections". Add: "New workspace" / "Manage workspaces"
footer actions. Inspired by notion-page-clone WorkspaceSwitcher.

### 2. `secondary-sidebar.tsx`

A narrow contextual sidebar that lives BETWEEN the primary sidebar and
the main content. Holds the active section's sub-nav (e.g. for a
"Database Views" section: list of views → click → main shows the view).

Pattern: lifted from superspace's `FeatureThreeColumnLayout`
(`/frontend/shared/ui/layout/container/three-column/`). Persistent
collapse via cookie like the primary sidebar.

### 3. `dashboard-shell-advanced.tsx`

Three-column composition:

```
DashboardShellAdvanced
├── AdminSidebar (icon-rail mode collapsible="icon")
│   ├── WorkspaceSwitcher (header)
│   ├── Top-level surfaces (icons only when collapsed)
│   └── User footer
├── SecondarySidebar (contextual sub-nav for active surface)
└── <main> (content)
```

The primary sidebar carries top-level surface icons (Workspace,
Calendar, Database, Admin Panel — the last is just a role-gated link).
Clicking a surface populates the SecondarySidebar with that surface's
own nav (e.g. clicking Database → secondary shows view list).

This matches Linear / Slack idiom while preserving the shadcn Sidebar
primitive for the icon rail.

## What BD-wave (today) actually delivered

A clean revert + corrected docs. Specifically:

- All 8 templates back to Simple archetype
- DashboardSwitcher dropdown (BB-wave) deleted — it was a wrong
  primitive (TeamSwitcher pattern applied to section toggle)
- `WorkspacePlaceholder` deleted — Simple templates don't have a
  workspace surface
- `personal-brand-os` workspace surface (BC-wave) fully reverted —
  workspace state / reducer / views / seed / nav builder all removed.
  storageKey bumped pbos:state:v6 → v7-simple to invalidate stale
  localStorage payloads
- `DashboardShell` simplified back to single-mode (no
  `dashboardSections` / `activeSectionId` props)
- `AdminSidebar` reverted to always-BrandHeader
- `DashboardSection` type deleted (no longer used)
- `_shared/dashboard/sections.ts` helper deleted
- `_shared/ui/dashboard-switcher.tsx` deleted

Per-template `DASHBOARD_BASE` / `ADMIN_PANEL_BASE` / `WORKSPACE_BASE`
constants are **kept**. They cost nothing and the advanced archetype
needs them.

## BE-wave to-do (when ready)

1. Build the three primitives above (workspace-switcher,
   secondary-sidebar, dashboard-shell-advanced)
2. Wire `notion-page-clone-os` to use the advanced shell as canary
3. Real Workspace CRUD inside the advanced shell (using the same
   workspaceId-scoped pattern BC-wave proved out — but only on
   templates that opt in)
4. Surface secondary-sidebar example on at least one admin page that
   benefits (e.g. RBAC config, CRM list-detail)

## Source map (where to pull primitives from)

```
superspace/
├── frontend/slices/platform-admin/views/PlatformAdminPageNew.tsx     ← three-column page
├── frontend/slices/platform-admin/components/navigation/AdminNavigation.tsx  ← left nav
├── frontend/shared/ui/layout/container/three-column/                 ← FeatureThreeColumnLayout (lift target)
├── frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx          ← workspace shell
└── frontend/shared/ui/layout/sidebar/primary/NavSystem.tsx           ← "System" group with admin link

notion-page-clone/
├── frontend/slices/workspace-sidebar/components/WorkspaceSwitcher.tsx ← workspace picker pattern
└── frontend/slices/workspace-sidebar/                                 ← page-tree DnD primary sidebar
```

## How to resume

Next session:

```
You: read docs/architecture/dashboard-vision.md and continue with BE-wave
Claude: <reads, builds workspace-switcher + secondary-sidebar + dashboard-shell-advanced, wires notion-page-clone-os as canary>
```
