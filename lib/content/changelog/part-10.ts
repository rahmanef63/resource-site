import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BG",
    "version": "BG-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Admin Panel chassis + 3-group sidebar (Pages / Features / Admin Panel) on all 8 templates",
    "body": "Big foundation wave so the next batch can sync real implementations from notion-page-clone + superspace into the admin-panel blocks. Three slices land here. (1) Admin Panel chassis at _shared/admin-panel/ — FeatureBlock registry, buildAdminPanelNav helper, AdminPanelOverview grid, AdminFeatureCard placeholder, AdminFeatureStubPage shared route renderer. 6 stub blocks ship: AI Config, Analytics, User Management, Audit Log, Webhooks, Settings — each annotated with the rr slice that will power it (ai-router, event-tracking, rbac-roles, audit-log). (2) All 7 flat-nav templates migrated to grouped nav: buildAdminNav(state) returns [Overview, Pages, Features, Admin Panel] groups derived from the legacy buildAdminPrimaryNav so per-template source of truth stays in one place. saas-marketing-os Admin Panel group added too. (3) 48 admin-panel route stubs scaffolded across 8 templates (6 features × 8 templates) — each calls the shared AdminFeatureStubPage. Plus BG-D Advanced primitives chassis (workspace-switcher, secondary-sidebar, dashboard-shell-advanced — opt-in, no canary yet) and BG-E public-nav CRUD primitives (types + reducer with auto-shift orders + resolvePublicNavHref helper — per-template wiring deferred). BG-F: each template's landing page seed flagged with isLanding: true (forward-compat for landing-as-page migration). CMS vs Admin Panel architectural distinction documented in dashboard-vision.md.",
    "groups": [
      {
        "heading": "Templates touched (3-group sidebar + 48 admin-panel routes)",
        "bullets": [
          {
            "text": "saas-marketing-os — Admin Panel group added; 6 stub routes scaffolded",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "notion-page-clone-os — migrated to grouped nav; Admin Panel group + 6 stubs",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Admin Panel chassis (_shared/admin-panel/)",
        "bullets": [
          "feature-blocks.ts NEW — FeatureBlock type + ADMIN_PANEL_BLOCKS registry (6 blocks) + buildAdminPanelNav helper",
          "AdminFeatureCard.tsx NEW — placeholder card with icon + description + 'powered by <slice>' hint",
          "AdminPanelOverview.tsx NEW — grid of feature-block cards at /dashboard/admin/admin-panel",
          "AdminFeatureStubPage.tsx NEW — shared route renderer (every per-template stub calls it)"
        ]
      },
      {
        "heading": "Advanced primitives chassis (BG-D — opt-in, no canary yet)",
        "bullets": [
          "_shared/types/common.ts — WorkspaceContext + SecondaryNavItem types",
          "_shared/ui/workspace-switcher.tsx NEW — opt-in workspace-CONTEXT picker (multi-tenant). Lifted from notion-page-clone pattern. ⌘N keyboard hints not included this wave",
          "_shared/ui/secondary-sidebar.tsx NEW — narrow contextual sub-nav + SecondarySidebarLayout wrapper (three-column composition)",
          "_shared/ui/dashboard-shell-advanced.tsx NEW — composes admin-sidebar + workspaceSwitcher headerSlot + secondary-sidebar slot in main",
          "_shared/ui/admin-sidebar.tsx — headerSlot prop added so DashboardShellAdvanced can swap BrandHeader for WorkspaceSwitcher"
        ]
      },
      {
        "heading": "Public-nav CRUD chassis (BG-E — primitives only, per-template wiring deferred)",
        "bullets": [
          "_shared/public-nav/types.ts NEW — PublicNavItem (label + pageRef OR href + order + enabled), PublicNavSlice, PublicNavAction",
          "_shared/public-nav/reducer.ts NEW — publicNavReducer with auto-shift orders + resolvePublicNavHref helper (binds pageRef → page slug)"
        ]
      },
      {
        "heading": "Forward-compat (BG-F)",
        "bullets": [
          "7 templates' pages-seed.ts — landing page (slug: \"\") flagged with isLanding: true. Sets up BH landing-as-page migration without changing runtime behavior"
        ]
      },
      {
        "heading": "Docs",
        "bullets": [
          "docs/architecture/dashboard-vision.md — Three sidebar groups (Pages / Features / Admin Panel) documented; CMS vs Admin Panel best practice (siblings, not nested) explained"
        ]
      },
      {
        "heading": "Up next (BH-wave)",
        "bullets": [
          "Sync notion-page-clone + superspace slices into admin-panel blocks (replace stubs with real implementations — AI Config from ai-router, Analytics from event-tracking, Users from rbac-roles, Audit from audit-log)",
          "Wire notion-page-clone-os as DashboardShellAdvanced canary (workspace switcher + secondary sidebar live)",
          "Per-template public-nav CRUD wiring (state.publicNav + admin /navigation editor + site-nav reads from state)",
          "Landing-as-page full migration (drop state.landingSections in favor of isLanding Page.sections)",
          "Extract landing-sections as installable rr slice"
        ]
      }
    ]
  },
  {
    "id": "BF",
    "version": "BF-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Dynamic Pages sidebar — every admin-created page becomes a menu item live",
    "body": "Sidebar now reflects the Pages CRUD store directly. Operator hits 'New page' in /admin/pages, fills the form, saves — the new page appears as a Pages-group sub-item in the sidebar immediately. No manual nav wiring. Implementation: pure helper `buildCustomPageNavItems(pages, baseHref, opts)` derives AdminNavItem[] from state.pages (skips systemPages, sorts alphabetic by default, supports updated/created sort + draft filter). All 8 templates wire it — saas-marketing-os spreads it into the grouped Pages bucket; the 7 flat-nav templates spread it into the Pages parent's children[]. Re-render is free because shell-client already subscribes to useStore(). Sets up BF-B / BF-C (landing-as-page + public nav CRUD) by proving the data-driven nav pattern works.",
    "groups": [
      {
        "heading": "Templates touched (all 8 — Pages group now data-driven)",
        "bullets": [
          {
            "text": "saas-marketing-os — custom pages appended to Pages group (grouped nav)",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — custom pages appended to Pages parent children",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — custom pages appended to Pages parent children",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — custom pages appended to Pages parent children",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — custom pages appended to Pages parent children",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — custom pages appended to Pages parent children",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — custom pages appended to Pages parent children",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "notion-page-clone-os — custom pages appended to Pages parent children",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Chassis",
        "bullets": [
          "_shared/pages/nav-builder.ts NEW — buildCustomPageNavItems(pages, baseHref, opts) helper. Filters systemPages, sorts alphabetic / updated / created, supports published-only filter, default lucide FileText icon"
        ]
      },
      {
        "heading": "Per-template wiring (8 nav-config.ts files)",
        "bullets": [
          "Each nav-config imports buildCustomPageNavItems",
          "Pages group / Pages-parent children spreads the helper's output after the static items"
        ]
      },
      {
        "heading": "Up next (BF-B onwards)",
        "bullets": [
          "BF-B — Landing-as-page migration: drop state.landingSections[] in favor of the landing-flagged Page.sections[]",
          "BF-C — Public nav CRUD: admin can add / rename / reorder PUBLIC_NAV items + bind each to any page (including custom)",
          "BF-D — Propagate BE's grouped Pages/Features nav to the 7 flat-nav templates (audit-by-template — konsultan-os Projects + Contact belong under Pages)",
          "BF-E — Build Advanced primitives (workspace-switcher / secondary-sidebar / dashboard-shell-advanced) + wire notion-page-clone-os canary",
          "BF-F — Extract landing-sections as installable headless CMS slice"
        ]
      }
    ]
  },
  {
    "id": "BE",
    "version": "BE-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Grouped admin nav (Pages / Features) + position-dropdown reorder + saas-marketing catalog fix",
    "body": "Four foundation pieces landing in one wave so the next batch can build on a clean chassis. (1) AdminNavGroup type — sidebar + shell accept primaryNavGroups[] alongside legacy flat primaryNav. Templates opt into grouped Pages/Features rendering one by one. (2) Position dropdown — LandingSection.order field switches from manual number input to a sibling-aware Select; reducer auto-shifts other sections on create / move / delete so two sections can never share a position. (3) Responsive overlap fix — min-w-0 on SidebarInset + main flex child prevents wide admin pages clipping under the shadcn sidebar. (4) saas-marketing-os catalog metadata corrected — adminPreviewPath + full admin file list added; description no longer claims 'no admin' (the filesystem had it all along). (5) saas-marketing-os = canary for the new grouped nav — buildAdminNav(state) returns [Overview, Pages, Features] groups; legacy buildAdminPrimaryNav kept as flatten-wrapper for backwards compat. (6) PageEntry forward-compat — isLanding?: boolean + sections?: LandingSection[] added to the type. BF-wave does the data migration (landing-as-page).",
    "groups": [
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "saas-marketing-os — admin entry now visible in catalog; sidebar uses Pages + Features groups",
            "slug": "saas-marketing-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Chassis (_shared)",
        "bullets": [
          "_shared/types/common.ts — AdminNavGroup type + PageEntry isLanding/sections forward-compat",
          "_shared/ui/admin-sidebar.tsx — accepts primaryNavGroups optional; renders one <SidebarGroup> per group",
          "_shared/ui/dashboard-shell.tsx — primaryNavGroups prop threaded; min-w-0 on SidebarInset + main",
          "_shared/crud/types.ts — FieldDef kind \"position\" added",
          "_shared/crud/CrudFieldInput.tsx — position renders sibling-aware Select",
          "_shared/crud/CrudFormBody.tsx + CrudFormView.tsx + CrudRowDialog.tsx — ctx={ total, editing } threaded to fields",
          "_shared/landing/landing-fields.ts — order field migrated to kind: 'position'",
          "_shared/landing/reducer.ts — auto-shift sibling orders on LANDING_UPSERT + close gap on LANDING_DELETE",
          "_shared/pages/types.ts — PageEntry.isLanding + sections added (forward-compat for BF migration)"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          "lib/content/layouts.ts — saas-marketing-os entry: adminPreviewPath set, 22 admin files added to files[], description corrected, 'admin' tag added"
        ]
      },
      {
        "heading": "Docs",
        "bullets": [
          "docs/architecture/dashboard-vision.md — BE-wave delivery summary + BF-wave plan (landing-as-page migration, public nav CRUD, propagate grouped nav to other 7 templates, build Advanced primitives, extract landing-sections as headless slice)"
        ]
      },
      {
        "heading": "Up next (BF-wave)",
        "bullets": [
          "Migrate landingSections[] into the landing-flagged Page.sections[] — single source of truth",
          "Public nav CRUD — admin can add/rename/reorder nav items + bind to any page including custom",
          "Propagate Pages/Features grouped nav to other 7 templates (audit per template — konsultan-os's Projects + Contact should live under Pages)",
          "Build Advanced primitives (workspace-switcher, secondary-sidebar, dashboard-shell-advanced) + wire notion-page-clone-os as canary",
          "Extract landing-sections as installable headless CMS slice"
        ]
      }
    ]
  }
];
