import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BD",
    "version": "BD-wave",
    "date": 1779235200000,
    "kind": "improvement",
    "title": "Two-archetype dashboard direction — revert switcher; simple is the default",
    "body": "Corrective wave after BB / BC. BB-wave's DashboardSwitcher dropdown was the wrong primitive (shadcn TeamSwitcher applied to section toggle); BC-wave bolted multi-tenant workspaces onto personal-brand-os which doesn't need them. New direction: two opt-in archetypes. **Simple** (default) — single sidebar, BrandHeader, admin nav with collapsible sub-menus. **Advanced** (opt-in) — three-column layout with workspace switcher in the primary header and a secondary sidebar for active-section sub-nav. Simple is what 7 of 8 templates need; advanced is reserved for notion-page-clone-os and any future template with multi-tenant context + many non-CMS surfaces. The advanced primitives (WorkspaceSwitcher, SecondarySidebar, DashboardShellAdvanced) ship in BE-wave when notion-page-clone-os is wired as the canary.",
    "groups": [
      {
        "heading": "Templates reverted to Simple archetype",
        "bullets": [
          {
            "text": "saas-marketing-os — DashboardSwitcher removed, workspace route deleted",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — workspace surface fully reverted (state + reducer + views + seed); storageKey pbos:state:v6 → v7-simple",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — DashboardSwitcher removed, workspace route deleted",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — DashboardSwitcher removed, workspace route deleted",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — DashboardSwitcher removed, workspace route deleted",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — DashboardSwitcher removed, workspace route deleted",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — DashboardSwitcher removed, workspace route deleted",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "notion-page-clone-os — DashboardSwitcher removed; flagged as the BE-wave canary for the Advanced archetype",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Removed (dead chassis)",
        "bullets": [
          "_shared/ui/dashboard-switcher.tsx — wrong primitive (TeamSwitcher pattern for section toggle)",
          "_shared/ui/workspace-placeholder.tsx — Simple templates don't have a workspace surface",
          "_shared/dashboard/sections.ts — buildDashboardSections + activeSectionFromPathname helpers",
          "_shared/types/common.ts → DashboardSection type",
          "_shared/ui/dashboard-shell.tsx — dashboardSections + activeSectionId props",
          "_shared/ui/admin-sidebar.tsx — DashboardSwitcher conditional in SidebarHeader",
          "personal-brand/shared/{workspace-types.ts,workspace-reducer.ts} + slices/workspace/*",
          "Per-template DASHBOARD_SECTIONS export + workspace route directories (8 templates)"
        ]
      },
      {
        "heading": "Kept",
        "bullets": [
          "Per-template DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE constants — zero cost and needed by the Advanced archetype",
          "AZ-wave URL shift (/admin → /dashboard/admin) and permanent redirect",
          "Simple shell + admin-sidebar + admin-nav-items (the canonical archetype)"
        ]
      },
      {
        "heading": "Docs",
        "bullets": [
          "docs/architecture/dashboard-vision.md REWRITTEN — two-archetype model, decision matrix per template, BE-wave plan, source map for primitive lifts from superspace + notion-page-clone"
        ]
      },
      {
        "heading": "Up next (BE-wave)",
        "bullets": [
          "Build _shared/ui/workspace-switcher.tsx (opt-in workspace-context picker, not a section toggle)",
          "Build _shared/ui/secondary-sidebar.tsx (three-column layout primitive lifted from superspace FeatureThreeColumnLayout)",
          "Build _shared/ui/dashboard-shell-advanced.tsx (composes the two)",
          "Wire notion-page-clone-os as canary for the Advanced archetype"
        ]
      }
    ]
  },
  {
    "id": "BC",
    "version": "BC-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "personal-brand-os workspace surface — Workspace CRUD + Notes + Tasks (live)",
    "body": "BB-wave delivered the DashboardSwitcher chassis. BC-wave proves it end-to-end on one template: personal-brand-os now has a fully working Workspace surface. Multi-tenant workspaces (Personal / Side Project / …) with CRUD + active switching. Per-workspace Notes (full editor, search) and Tasks (inline checklist with overdue badge + open/done/all filter). All persisted via the existing localStorage store + BroadcastChannel cross-tab sync. Sidebar nav swaps between admin and workspace primary nav based on pathname; switcher header shows the active workspace icon + name. Old `/dashboard/workspace` placeholder replaced by a real dashboard with stat cards and recent-notes list. The other 7 OS templates keep the placeholder; their workspace surfaces lift the same pattern in subsequent waves.",
    "groups": [
      {
        "heading": "Template touched",
        "bullets": [
          {
            "text": "personal-brand-os — Workspace dashboard + Notes (CRUD with editor) + Tasks (inline checklist) + Workspaces (CRUD over the workspace entities themselves)",
            "slug": "personal-brand-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Data model (personal-brand/shared)",
        "bullets": [
          "types.ts — added Workspace + Note + Task types, State fields (workspaces, activeWorkspaceId, notes, tasks), Action union extensions (workspace.create/update/delete/switch, note.upsert/delete, task.upsert/toggle/delete)",
          "workspace-reducer.ts NEW — isolated workspace surface transitions; cascade-delete notes + tasks on workspace.delete; keep ≥1 workspace alive; activeWorkspaceId falls back when active is removed",
          "store-reducer.ts — delegates workspace/note/task actions via isWorkspaceAction guard",
          "seed.ts — 2 workspaces (Personal 🧠, Side project 🚀) + 3 notes + 4 tasks; storageKey bumped pbos:state:v5 → v6-workspaces"
        ]
      },
      {
        "heading": "Surfaces",
        "bullets": [
          "WorkspaceDashboardView — stat cards (Notes / Open tasks / Workspaces) + recent-notes list scoped to active workspace",
          "NotesView + NoteEditor — list with search, inline create-then-redirect, full-page editor with dirty-state Save",
          "TasksView — quick-add input, open/done/all filter, checkbox toggle, overdue badge, delete",
          "WorkspaceManageView — list with inline rename (icon + name), switch, delete (cascade-aware, disabled when only one remains), create form with icon input"
        ]
      },
      {
        "heading": "Routing + nav",
        "bullets": [
          "app/preview/personal-brand-os/dashboard/workspace/{page,notes/page,notes/[id]/page,tasks/page,manage/page}.tsx NEW",
          "personal-brand/shared/nav-config.ts — buildWorkspaceNav(state) returns Dashboard / Notes / Tasks / Workspaces with live counts",
          "personal-brand/dashboard-shell-client.tsx — section-aware primaryNav (admin vs workspace), appLabel shows active workspace icon + name, homeHref + searchPlaceholder swap by section"
        ]
      },
      {
        "heading": "Up next",
        "bullets": [
          "Propagate workspace surface to remaining 7 OS templates (likely lifted as a distributable rr slice once the pattern stabilizes)",
          "BD — feature harvest from superspace + notion-page-clone via /rr lift (RBAC / CRM / Analytics / CMS-menu inside Admin Panel)",
          "BE — replace placeholder Tasks with notion-style block editor for richer Note bodies"
        ]
      }
    ]
  },
  {
    "id": "BB",
    "version": "BB-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "DashboardSwitcher — shadcn sidebar-07 team-switcher adapted for /dashboard/{admin,workspace}",
    "body": "Top of every template sidebar now hosts an improved adaptation of the shadcn sidebar-07 TeamSwitcher pattern. Click → dropdown reveals Admin Panel + Workspace sections with icon, label, one-line description, active checkmark, and ⌘1/⌘2 keyboard shortcuts. Footer link jumps to /templates so operators can hop to another template without leaving the dashboard. Inspired by notion-page-clone WorkspaceSwitcher (role-gated items, composable trigger) and superspace EnhancedWorkspaceSwitcher (hierarchical context, descriptions). The dashboard/admin and dashboard/workspace surfaces now share a single dashboard/layout.tsx — the switcher and store provider live one level up so the chassis stays consistent across both surfaces. Workspace placeholder updated to point at the new ⌘1/⌘2 shortcuts.",
    "groups": [
      {
        "heading": "Templates touched (DashboardSwitcher mounted; layout lifted)",
        "bullets": [
          {
            "text": "saas-marketing-os — switcher in sidebar header; workspace inherits shell",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — switcher in sidebar header; workspace inherits shell",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — switcher in sidebar header; workspace inherits shell",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — switcher in sidebar header; workspace inherits shell",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — switcher in sidebar header; workspace inherits shell",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — switcher in sidebar header; workspace inherits shell",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — switcher in sidebar header; workspace inherits shell",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "notion-page-clone-os — switcher in sidebar header; workspace inherits shell",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          "_shared/ui/dashboard-switcher.tsx NEW — SidebarMenuButton + DropdownMenu + ⌘N shortcuts + active checkmark + Switch-template footer",
          "_shared/dashboard/sections.ts NEW — buildDashboardSections() + activeSectionFromPathname() helpers",
          "_shared/types/common.ts — added DashboardSection type",
          "_shared/ui/admin-sidebar.tsx — renders DashboardSwitcher when sections prop provided (BrandHeader fallback preserved)",
          "_shared/ui/dashboard-shell.tsx — accepts dashboardSections + activeSectionId props",
          "Per-template nav-config.ts — DASHBOARD_SECTIONS export (8 templates)",
          "Per-template dashboard/layout.tsx NEW — lifted from admin/layout.tsx so workspace inherits StoreProvider + DashboardShell",
          "Per-template dashboard/dashboard-shell-client.tsx NEW — derives activeSection from usePathname"
        ]
      },
      {
        "heading": "Up next (see docs/architecture/dashboard-vision.md)",
        "bullets": [
          "BC-wave — Workspace bootstrap (notion editor at MAX, calendar, command-menu, database views) — replaces current placeholder",
          "BD-wave — feature harvest from superspace + notion-page-clone via /rr lift (RBAC / CRM / Analytics / CMS-menu siblings inside Admin Panel)"
        ]
      }
    ]
  },
  {
    "id": "BA",
    "version": "BA-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "notion-shell slice + Notion Page Clone OS = real Notion-clone template (not marketing landing)",
    "body": "Before: /preview/notion-page-clone-os/public showed a marketing landing page jualan notion-blocks slice. After: it IS a Notion clone — left sidebar with tree-nav (page CRUD inline), main panel with page editor (rich blocks via notion-blocks primitive registry) or database table (per-cell + property CRUD). Built by lifting the six props-driven Notion wrappers from nosion's shared/components/notion (NotionPage / NotionHeader / NotionSidebar / NotionBlock / NotionDatabase / NotionProperty) to a new rr slice `notion-shell`. Zero-peer-dep design — icon-picker dropped in favor of `renderIcon` + `renderIconPicker` props so host wires any icon library (we wire @/features/icon-picker at the template layer). NotionBlock dispatches via a `blockRenderers` prop — the template registers equation/code/divider from notion-blocks, falls back to contentEditable for text-shape blocks. Template store extended with `docs` + `databases` slices alongside existing pages/snippets/landingSections; storageKey bumped v2-landing → v3-docs. Reducer split into `notion-reducer.ts` to stay under the 200-LOC cap.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-shell — NEW: six portable Notion wrappers + types subset",
            "slug": "notion-shell"
          },
          {
            "text": "notion-blocks — registered as block renderers inside notion-shell's NotionBlock",
            "slug": "notion-blocks"
          }
        ]
      },
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "notion-page-clone-os — public surface = full Notion-clone dashboard (replaces marketing landing)",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "frontend/slices/notion-shell/ NEW — 6 wrapper components + types subset + slice metadata trio + /preview demo",
          "components/templates/notion-page-clone/slices/notion-app/ NEW — Dashboard / DocView / DatabaseView + block-renderers registry + sidebar hooks",
          "components/templates/notion-page-clone/shared/types.ts — added docs/databases + 14 action types (doc.*, db.*, db.row.*)",
          "components/templates/notion-page-clone/shared/store.tsx — wired notion-reducer; storageKey v2-landing → v3-docs",
          "components/templates/notion-page-clone/shared/notion-reducer.ts NEW — pulled out for 200-LOC cap",
          "components/templates/notion-page-clone/shared/seed.ts — seeded 3 docs + 1 Roadmap database (3 rows)",
          "app/preview/notion-page-clone-os/public/page.tsx — opens to dashboard@doc-welcome",
          "app/preview/notion-page-clone-os/public/d/[id]/ + db/[id]/ NEW — dynamic dashboard surfaces",
          "lib/content/slices.ts + layouts.ts — added notion-shell entry; template pullPaths cascade notion-shell + icon-picker; stale notion-page-clone-os dir refs renamed to notion-page-clone"
        ]
      }
    ]
  }
];
