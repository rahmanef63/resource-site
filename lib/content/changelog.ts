import type { ChangelogEntry } from "@/features/changelog-feed";

/**
 * Public release history for the Rahman Resources monorepo. Surfaced on
 * `/changelog` via the canonical `changelog-feed` slice — same component
 * every template ships via `npx rr add changelog-feed`.
 *
 * Source of truth is CHANGELOG.md (human-readable wave history). This
 * file lists the user-facing CLI release dates only.
 */
export const releases: ChangelogEntry[] = [
  {
    id: "BJ",
    version: "BJ-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "notion-shell polish — DnD-kit drag handle, cover image, image/embed renderers, page actions menu",
    body:
      "Final wave on the notion-shell Notion-clone surface. (1) SortableBlockList — @dnd-kit/core + sortable + utilities render-prop wrapper for block reorder. Pointer + keyboard sensors; emits (fromIndex, toIndex) via onReorder. (2) NotionBlock gains optional dragHandle slot — caller mounts a grip button wired to SortableBlockList's dragProps; renders next to the hover \"⋯\" actions handle. (3) NotionPage gains optional cover prop — 200px image band above header; X button on hover triggers onCoverRemove. (4) ImageRenderer + EmbedRenderer specialised block renderers — Image: URL + caption + preview, click to edit. Embed: URL detection for YouTube/Vimeo/Loom/Figma/CodePen/Spotify with provider-specific rewrites + sandboxed iframe fallback. (5) PageActionsMenu — header dropdown for page-level actions: add cover, favorite toggle, duplicate, export, move to trash. (6) Template wired — DocView wraps blocks in SortableBlockList + passes a GripVertical drag handle button per block; NotionPage receives doc.cover + actions=<PageActionsMenu>; block-renderers maps image/embed to the new shell renderers; types.ts gains doc.block.reorder + doc.duplicate actions; notion-reducer.ts handles them. (7) Inline slash-key trigger (`/` in block → menu opens at caret) intentionally deferred — current ergonomics ride on InsertBlockButton + hover \"⋯\" menu which already cover the new-block + turn-into flows. Bumps notion-shell to v0.4.0. npm deps added: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities.",
    groups: [
      {
        heading: "notion-shell (NEW components)",
        bullets: [
          { text: "components/SortableBlockList.tsx — @dnd-kit render-prop wrapper for block reorder", slug: "notion-shell", kind: "slice" },
          { text: "components/PageActionsMenu.tsx — header dropdown (add cover / favorite / duplicate / export / trash)", slug: "notion-shell", kind: "slice" },
          { text: "components/blocks/ImageRenderer.tsx — URL + caption + preview, click to edit", slug: "notion-shell", kind: "slice" },
          { text: "components/blocks/EmbedRenderer.tsx — YouTube/Vimeo/Loom/Figma/CodePen/Spotify auto-detect + iframe fallback", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "notion-shell (extended)",
        bullets: [
          { text: "components/NotionPage.tsx — optional `cover` prop (200px image band w/ hover X button via onCoverRemove)", slug: "notion-shell", kind: "slice" },
          { text: "components/NotionBlock.tsx — optional `dragHandle` slot prop, mounts next to actions handle", slug: "notion-shell", kind: "slice" },
          { text: "types.ts — Page gains optional `cover` field", slug: "notion-shell", kind: "slice" },
          { text: "index.ts + slice.contract + slice.json + slice.manifest — bump v0.4.0; export 4 new components + 3 new types; @dnd-kit npm deps declared", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "Template touched — notion-page-clone-os",
        bullets: [
          { text: "slices/notion-app/DocView.tsx — SortableBlockList + per-block GripVertical drag handle; PageActionsMenu in header; cover prompt + remove", slug: "notion-page-clone-os", kind: "template" },
          { text: "slices/notion-app/block-renderers.tsx — image + embed renderers mapped to ImageRenderer + EmbedRenderer", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/types.ts — Action gains doc.block.reorder + doc.duplicate variants", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/notion-reducer.ts — reorder splice + duplicate (clone w/ fresh ids)", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "npm deps",
        bullets: [
          "@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities — sortable block list, pointer + keyboard sensors",
        ],
      },
      {
        heading: "Catalog",
        bullets: [
          "lib/content/slices.ts — notion-shell v0.4.0 description + tags (drag/cover/embed)",
          "lib/content/layouts.ts — notion-page-clone-os deps + shadcnComponents already cover dnd-kit usage",
        ],
      },
      {
        heading: "Notion-clone parity status (post-BJ)",
        bullets: [
          "Page editor: slash menu ✓ · actions menu (turn-into/duplicate/delete) ✓ · inline-markdown decorator ✓ · drag-handle reorder ✓ · cover image ✓ · page actions ✓",
          "Database: 6 views (Table/Board/List/Gallery/Calendar/Feed) ✓ · sort/filter/search ✓ · column header menu ✓ · 10 property cells ✓",
          "Block renderers: equation ✓ · code ✓ · divider ✓ · toggle ✓ · callout ✓ · image ✓ · embed ✓",
          "Deferred (next): inline `/` slash-key trigger in caret-position popover, drag-fill selection grid, comments/mentions/snapshots (covered by separate slices in nosion — lift if needed)",
        ],
      },
    ],
  },
  {
    id: "BI",
    version: "BI-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "notion-shell database depth — 6 views (Table/Board/List/Gallery/Calendar/Feed) + view tabs + sort/filter/search + column header menu + 10 property cells",
    body:
      "notion-shell databases level up from a single-table surface to a 6-view dispatcher matching Notion's view canon. (1) ViewTabs — horizontal tab strip + add-view dropdown (Table/Board/List/Gallery/Calendar/Feed), double-click tab to remove. (2) ViewOptions — popover with sort (multi-prop, asc/desc), filter (contains/equals/empty/checked + 6 ops), search (any-prop substring). (3) ColumnHeaderMenu — per-column dropdown: rename + change type + sort asc/desc + hide + delete. (4) 6 view components — TableView (Notion-canonical), BoardView (kanban grouped by select/status), ListView (compact), GalleryView (3-up card grid), CalendarView (month grid bucketed by date prop), FeedView (chronological by updatedAt). All views share the ViewProps contract; host can override via VIEW_REGISTRY. (5) property-cells.tsx — 10 cell renderers extracted into a single switch helper: text/number/checkbox/select/status/multi_select/date/url/email/phone. NotionProperty delegates rendering to it. (6) lib/viewData.ts — pure applyView() (filter + sort + search), groupBy() (board), bucketByDate() (calendar). (7) NotionDatabase rewritten as orchestrator — owns header + ViewTabs + ViewOptions + ColumnHeaderMenu wiring; dispatches the active view via VIEW_REGISTRY. (8) Template wired — DatabaseView passes the 4 new onView* callbacks; seed.ts gains 3 default views on the Roadmap DB (All table / Board / Feed); reducer gains db.view.activate/add/remove/config split into notion-db-reducer.ts to stay under the 200-LOC cap. Bumps notion-shell to v0.3.0.",
    groups: [
      {
        heading: "notion-shell (NEW components)",
        bullets: [
          { text: "components/ViewTabs.tsx — horizontal tab strip + add-view dropdown", slug: "notion-shell", kind: "slice" },
          { text: "components/ViewOptions.tsx — sort + filter + search popover", slug: "notion-shell", kind: "slice" },
          { text: "components/ColumnHeaderMenu.tsx — per-column dropdown (rename/type/sort/hide/delete)", slug: "notion-shell", kind: "slice" },
          { text: "components/property-cells.tsx — 10 per-type cell renderers", slug: "notion-shell", kind: "slice" },
          { text: "components/views/{Table,Board,List,Gallery,Calendar,Feed}View.tsx — 6 view components", slug: "notion-shell", kind: "slice" },
          { text: "components/views/index.ts — VIEW_REGISTRY default map + barrel", slug: "notion-shell", kind: "slice" },
          { text: "components/views/types.ts — shared ViewProps contract", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "notion-shell (NEW lib)",
        bullets: [
          { text: "lib/viewData.ts — applyView (filter + sort + search) + groupBy + bucketByDate", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "notion-shell (rewritten)",
        bullets: [
          { text: "components/NotionDatabase.tsx — orchestrator: header + ViewTabs + ViewOptions + active view dispatch via VIEW_REGISTRY; 4 new onView* callbacks (activate/add/remove/configChange) + onPropertyUpdate", slug: "notion-shell", kind: "slice" },
          { text: "components/NotionProperty.tsx — delegates value rendering to renderPropertyCell (10 types)", slug: "notion-shell", kind: "slice" },
          { text: "index.ts + slice.contract + slice.json + slice.manifest — bump v0.3.0; export 9 new components + 7 new utils + 5 new types", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "Template touched — notion-page-clone-os",
        bullets: [
          { text: "slices/notion-app/DatabaseView.tsx — wire onViewActivate/Add/Remove/ConfigChange + onPropertyUpdate", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/seed.ts — Roadmap DB ships 3 default views (All/Board/Feed)", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/types.ts — Action gains db.view.activate/add/remove/config variants", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/notion-reducer.ts — refactored; db.* cases moved to notion-db-reducer.ts to stay under 200-LOC cap", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/notion-db-reducer.ts — NEW; all db.* reducer cases (property/row/view CRUD)", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Catalog",
        bullets: [
          "lib/content/slices.ts — notion-shell v0.3.0 (6 views + 10 cells + view tabs/options/column menu)",
          "lib/content/layouts.ts — files list adds shared/notion-db-reducer.ts",
        ],
      },
      {
        heading: "Up next (BJ)",
        bullets: [
          "BJ-wave — polish: DnD-kit drag handle, cover image revive, image/embed block renderers, page actions menu, slash-key trigger inline",
        ],
      },
    ],
  },
  {
    id: "BH",
    version: "BH-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "notion-shell page-editor depth — slash menu, actions menu, live inline-markdown decorator, toggle + callout renderers",
    body:
      "notion-shell wrappers level up from barebones contentEditable to a Notion-grade editing surface. (1) <SlashMenu> — searchable block-type picker with keyboard nav (↑↓ Enter Esc), 18-spec baseline (text / h1-h3 / todo / bullet / numbered / toggle / quote / callout / code / equation / image / divider / page / database / table / embed). (2) <BlockActionsMenu> — popover with turn-into submenu + duplicate + delete, current type marker. (3) <InsertBlockButton> — \"+ Add block\" trigger wrapping SlashMenu in a popover with search input. (4) Live inline-markdown decorator — caret-preserving, IME-safe DOM pass that wraps **bold** _italic_ ~~strike~~ `code` $math$ [label](url) markers in semantic tags inside the contentEditable. Source-of-truth stays plain text (innerText round-trips verbatim) so the host store reads source markers, not decorated HTML. Headings hide markers visually via zero-size span. (5) NotionBlock extended — hover reveals \"⋯\" actions handle when onTurnInto provided; runs decorator on mount + every input (skipping composition); composition-end handler for IME. (6) Template wired — DocView's fixed +paragraph/+h2/+list buttons replaced with one InsertBlockButton; toggle + callout block-renderers added (ChevronRight expand + Lightbulb callout); notion-reducer gains doc.block.duplicate + doc.block.turnInto actions; types.ts adds matching Action variants. Slash-key trigger (`/` in block → menu opens at caret) deferred to BJ-wave alongside drag handle + cover + image/embed renderers. Bumps notion-shell to v0.2.0.",
    groups: [
      {
        heading: "notion-shell (NEW components)",
        bullets: [
          { text: "components/SlashMenu.tsx — searchable block-type picker w/ keyboard nav", slug: "notion-shell", kind: "slice" },
          { text: "components/BlockActionsMenu.tsx — turn-into / duplicate / delete popover", slug: "notion-shell", kind: "slice" },
          { text: "components/InsertBlockButton.tsx — `+` trigger w/ SlashMenu + search input", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "notion-shell (NEW lib)",
        bullets: [
          { text: "lib/blockSpecs.ts — 18-spec BLOCK_SPECS registry + specFor() lookup", slug: "notion-shell", kind: "slice" },
          { text: "lib/inlineMd.ts — pure tokenizer (Slack model: **bold** _it_ ~~s~~ `code` $math$ links)", slug: "notion-shell", kind: "slice" },
          { text: "lib/inline-decorator/caret.ts — getCaretOffset / setCaretAtOffset (DOM-walk, BR-aware)", slug: "notion-shell", kind: "slice" },
          { text: "lib/inline-decorator/decorate.ts — decorateLineToFragment (pure DOM construction)", slug: "notion-shell", kind: "slice" },
          { text: "lib/inlineDecorator.ts — decorateInPlace facade (caret save → mutate → restore)", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "notion-shell (extended)",
        bullets: [
          { text: "components/NotionBlock.tsx — decorator pass on mount + input, IME-safe, hover \"⋯\" actions handle", slug: "notion-shell", kind: "slice" },
          { text: "index.ts + slice.contract + slice.json + slice.manifest — bump v0.2.0, export 3 new components + 8 new utils + 2 new types", slug: "notion-shell", kind: "slice" },
        ],
      },
      {
        heading: "Template touched — notion-page-clone-os",
        bullets: [
          { text: "slices/notion-app/DocView.tsx — InsertBlockButton replaces fixed +block bar; NotionBlock wired with onTurnInto + onDuplicate", slug: "notion-page-clone-os", kind: "template" },
          { text: "slices/notion-app/block-renderers.tsx — toggle + callout specialised renderers added", slug: "notion-page-clone-os", kind: "template" },
          { text: "shared/types.ts + shared/notion-reducer.ts — doc.block.duplicate + doc.block.turnInto actions", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Catalog",
        bullets: [
          "lib/content/slices.ts — notion-shell v0.2.0 description + tags + recipe (slash-menu / decorator / wysiwyg)",
          "lib/content/layouts.ts — notion-page-clone-os files list adds shared/notion-reducer.ts",
        ],
      },
      {
        heading: "Up next (BI + BJ)",
        bullets: [
          "BI-wave — database depth: view tabs + Board/List/Gallery/Calendar/Feed + sort/filter/search + column-header menu + multi-select/date/status/url/email/phone cells",
          "BJ-wave — polish: DnD-kit drag handle, cover image revive, image/embed block renderers, page actions menu, slash-key trigger in NotionBlock",
        ],
      },
    ],
  },
  {
    id: "BG",
    version: "BG-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "Admin Panel chassis + 3-group sidebar (Pages / Features / Admin Panel) on all 8 templates",
    body:
      "Big foundation wave so the next batch can sync real implementations from notion-page-clone + superspace into the admin-panel blocks. Three slices land here. (1) Admin Panel chassis at _shared/admin-panel/ — FeatureBlock registry, buildAdminPanelNav helper, AdminPanelOverview grid, AdminFeatureCard placeholder, AdminFeatureStubPage shared route renderer. 6 stub blocks ship: AI Config, Analytics, User Management, Audit Log, Webhooks, Settings — each annotated with the rr slice that will power it (ai-router, event-tracking, rbac-roles, audit-log). (2) All 7 flat-nav templates migrated to grouped nav: buildAdminNav(state) returns [Overview, Pages, Features, Admin Panel] groups derived from the legacy buildAdminPrimaryNav so per-template source of truth stays in one place. saas-marketing-os Admin Panel group added too. (3) 48 admin-panel route stubs scaffolded across 8 templates (6 features × 8 templates) — each calls the shared AdminFeatureStubPage. Plus BG-D Advanced primitives chassis (workspace-switcher, secondary-sidebar, dashboard-shell-advanced — opt-in, no canary yet) and BG-E public-nav CRUD primitives (types + reducer with auto-shift orders + resolvePublicNavHref helper — per-template wiring deferred). BG-F: each template's landing page seed flagged with isLanding: true (forward-compat for landing-as-page migration). CMS vs Admin Panel architectural distinction documented in dashboard-vision.md.",
    groups: [
      {
        heading: "Templates touched (3-group sidebar + 48 admin-panel routes)",
        bullets: [
          { text: "saas-marketing-os — Admin Panel group added; 6 stub routes scaffolded", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "wirausaha-os", kind: "template" },
          { text: "notion-page-clone-os — migrated to grouped nav; Admin Panel group + 6 stubs", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Admin Panel chassis (_shared/admin-panel/)",
        bullets: [
          "feature-blocks.ts NEW — FeatureBlock type + ADMIN_PANEL_BLOCKS registry (6 blocks) + buildAdminPanelNav helper",
          "AdminFeatureCard.tsx NEW — placeholder card with icon + description + 'powered by <slice>' hint",
          "AdminPanelOverview.tsx NEW — grid of feature-block cards at /dashboard/admin/admin-panel",
          "AdminFeatureStubPage.tsx NEW — shared route renderer (every per-template stub calls it)",
        ],
      },
      {
        heading: "Advanced primitives chassis (BG-D — opt-in, no canary yet)",
        bullets: [
          "_shared/types/common.ts — WorkspaceContext + SecondaryNavItem types",
          "_shared/ui/workspace-switcher.tsx NEW — opt-in workspace-CONTEXT picker (multi-tenant). Lifted from notion-page-clone pattern. ⌘N keyboard hints not included this wave",
          "_shared/ui/secondary-sidebar.tsx NEW — narrow contextual sub-nav + SecondarySidebarLayout wrapper (three-column composition)",
          "_shared/ui/dashboard-shell-advanced.tsx NEW — composes admin-sidebar + workspaceSwitcher headerSlot + secondary-sidebar slot in main",
          "_shared/ui/admin-sidebar.tsx — headerSlot prop added so DashboardShellAdvanced can swap BrandHeader for WorkspaceSwitcher",
        ],
      },
      {
        heading: "Public-nav CRUD chassis (BG-E — primitives only, per-template wiring deferred)",
        bullets: [
          "_shared/public-nav/types.ts NEW — PublicNavItem (label + pageRef OR href + order + enabled), PublicNavSlice, PublicNavAction",
          "_shared/public-nav/reducer.ts NEW — publicNavReducer with auto-shift orders + resolvePublicNavHref helper (binds pageRef → page slug)",
        ],
      },
      {
        heading: "Forward-compat (BG-F)",
        bullets: [
          "7 templates' pages-seed.ts — landing page (slug: \"\") flagged with isLanding: true. Sets up BH landing-as-page migration without changing runtime behavior",
        ],
      },
      {
        heading: "Docs",
        bullets: [
          "docs/architecture/dashboard-vision.md — Three sidebar groups (Pages / Features / Admin Panel) documented; CMS vs Admin Panel best practice (siblings, not nested) explained",
        ],
      },
      {
        heading: "Up next (BH-wave)",
        bullets: [
          "Sync notion-page-clone + superspace slices into admin-panel blocks (replace stubs with real implementations — AI Config from ai-router, Analytics from event-tracking, Users from rbac-roles, Audit from audit-log)",
          "Wire notion-page-clone-os as DashboardShellAdvanced canary (workspace switcher + secondary sidebar live)",
          "Per-template public-nav CRUD wiring (state.publicNav + admin /navigation editor + site-nav reads from state)",
          "Landing-as-page full migration (drop state.landingSections in favor of isLanding Page.sections)",
          "Extract landing-sections as installable rr slice",
        ],
      },
    ],
  },
  {
    id: "BF",
    version: "BF-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "Dynamic Pages sidebar — every admin-created page becomes a menu item live",
    body:
      "Sidebar now reflects the Pages CRUD store directly. Operator hits 'New page' in /admin/pages, fills the form, saves — the new page appears as a Pages-group sub-item in the sidebar immediately. No manual nav wiring. Implementation: pure helper `buildCustomPageNavItems(pages, baseHref, opts)` derives AdminNavItem[] from state.pages (skips systemPages, sorts alphabetic by default, supports updated/created sort + draft filter). All 8 templates wire it — saas-marketing-os spreads it into the grouped Pages bucket; the 7 flat-nav templates spread it into the Pages parent's children[]. Re-render is free because shell-client already subscribes to useStore(). Sets up BF-B / BF-C (landing-as-page + public nav CRUD) by proving the data-driven nav pattern works.",
    groups: [
      {
        heading: "Templates touched (all 8 — Pages group now data-driven)",
        bullets: [
          { text: "saas-marketing-os — custom pages appended to Pages group (grouped nav)", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — custom pages appended to Pages parent children", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — custom pages appended to Pages parent children", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — custom pages appended to Pages parent children", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — custom pages appended to Pages parent children", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — custom pages appended to Pages parent children", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — custom pages appended to Pages parent children", slug: "wirausaha-os", kind: "template" },
          { text: "notion-page-clone-os — custom pages appended to Pages parent children", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Chassis",
        bullets: [
          "_shared/pages/nav-builder.ts NEW — buildCustomPageNavItems(pages, baseHref, opts) helper. Filters systemPages, sorts alphabetic / updated / created, supports published-only filter, default lucide FileText icon",
        ],
      },
      {
        heading: "Per-template wiring (8 nav-config.ts files)",
        bullets: [
          "Each nav-config imports buildCustomPageNavItems",
          "Pages group / Pages-parent children spreads the helper's output after the static items",
        ],
      },
      {
        heading: "Up next (BF-B onwards)",
        bullets: [
          "BF-B — Landing-as-page migration: drop state.landingSections[] in favor of the landing-flagged Page.sections[]",
          "BF-C — Public nav CRUD: admin can add / rename / reorder PUBLIC_NAV items + bind each to any page (including custom)",
          "BF-D — Propagate BE's grouped Pages/Features nav to the 7 flat-nav templates (audit-by-template — konsultan-os Projects + Contact belong under Pages)",
          "BF-E — Build Advanced primitives (workspace-switcher / secondary-sidebar / dashboard-shell-advanced) + wire notion-page-clone-os canary",
          "BF-F — Extract landing-sections as installable headless CMS slice",
        ],
      },
    ],
  },
  {
    id: "BE",
    version: "BE-wave",
    date: Date.parse("2026-05-20"),
    kind: "feature",
    title: "Grouped admin nav (Pages / Features) + position-dropdown reorder + saas-marketing catalog fix",
    body:
      "Four foundation pieces landing in one wave so the next batch can build on a clean chassis. (1) AdminNavGroup type — sidebar + shell accept primaryNavGroups[] alongside legacy flat primaryNav. Templates opt into grouped Pages/Features rendering one by one. (2) Position dropdown — LandingSection.order field switches from manual number input to a sibling-aware Select; reducer auto-shifts other sections on create / move / delete so two sections can never share a position. (3) Responsive overlap fix — min-w-0 on SidebarInset + main flex child prevents wide admin pages clipping under the shadcn sidebar. (4) saas-marketing-os catalog metadata corrected — adminPreviewPath + full admin file list added; description no longer claims 'no admin' (the filesystem had it all along). (5) saas-marketing-os = canary for the new grouped nav — buildAdminNav(state) returns [Overview, Pages, Features] groups; legacy buildAdminPrimaryNav kept as flatten-wrapper for backwards compat. (6) PageEntry forward-compat — isLanding?: boolean + sections?: LandingSection[] added to the type. BF-wave does the data migration (landing-as-page).",
    groups: [
      {
        heading: "Templates touched",
        bullets: [
          { text: "saas-marketing-os — admin entry now visible in catalog; sidebar uses Pages + Features groups", slug: "saas-marketing-os", kind: "template" },
        ],
      },
      {
        heading: "Chassis (_shared)",
        bullets: [
          "_shared/types/common.ts — AdminNavGroup type + PageEntry isLanding/sections forward-compat",
          "_shared/ui/admin-sidebar.tsx — accepts primaryNavGroups optional; renders one <SidebarGroup> per group",
          "_shared/ui/dashboard-shell.tsx — primaryNavGroups prop threaded; min-w-0 on SidebarInset + main",
          "_shared/crud/types.ts — FieldDef kind \"position\" added",
          "_shared/crud/CrudFieldInput.tsx — position renders sibling-aware Select",
          "_shared/crud/CrudFormBody.tsx + CrudFormView.tsx + CrudRowDialog.tsx — ctx={ total, editing } threaded to fields",
          "_shared/landing/landing-fields.ts — order field migrated to kind: 'position'",
          "_shared/landing/reducer.ts — auto-shift sibling orders on LANDING_UPSERT + close gap on LANDING_DELETE",
          "_shared/pages/types.ts — PageEntry.isLanding + sections added (forward-compat for BF migration)",
        ],
      },
      {
        heading: "Catalog",
        bullets: [
          "lib/content/layouts.ts — saas-marketing-os entry: adminPreviewPath set, 22 admin files added to files[], description corrected, 'admin' tag added",
        ],
      },
      {
        heading: "Docs",
        bullets: [
          "docs/architecture/dashboard-vision.md — BE-wave delivery summary + BF-wave plan (landing-as-page migration, public nav CRUD, propagate grouped nav to other 7 templates, build Advanced primitives, extract landing-sections as headless slice)",
        ],
      },
      {
        heading: "Up next (BF-wave)",
        bullets: [
          "Migrate landingSections[] into the landing-flagged Page.sections[] — single source of truth",
          "Public nav CRUD — admin can add/rename/reorder nav items + bind to any page including custom",
          "Propagate Pages/Features grouped nav to other 7 templates (audit per template — konsultan-os's Projects + Contact should live under Pages)",
          "Build Advanced primitives (workspace-switcher, secondary-sidebar, dashboard-shell-advanced) + wire notion-page-clone-os as canary",
          "Extract landing-sections as installable headless CMS slice",
        ],
      },
    ],
  },
  {
    id: "BD",
    version: "BD-wave",
    date: Date.parse("2026-05-20"),
    kind: "improvement",
    title: "Two-archetype dashboard direction — revert switcher; simple is the default",
    body:
      "Corrective wave after BB / BC. BB-wave's DashboardSwitcher dropdown was the wrong primitive (shadcn TeamSwitcher applied to section toggle); BC-wave bolted multi-tenant workspaces onto personal-brand-os which doesn't need them. New direction: two opt-in archetypes. **Simple** (default) — single sidebar, BrandHeader, admin nav with collapsible sub-menus. **Advanced** (opt-in) — three-column layout with workspace switcher in the primary header and a secondary sidebar for active-section sub-nav. Simple is what 7 of 8 templates need; advanced is reserved for notion-page-clone-os and any future template with multi-tenant context + many non-CMS surfaces. The advanced primitives (WorkspaceSwitcher, SecondarySidebar, DashboardShellAdvanced) ship in BE-wave when notion-page-clone-os is wired as the canary.",
    groups: [
      {
        heading: "Templates reverted to Simple archetype",
        bullets: [
          { text: "saas-marketing-os — DashboardSwitcher removed, workspace route deleted", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — workspace surface fully reverted (state + reducer + views + seed); storageKey pbos:state:v6 → v7-simple", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — DashboardSwitcher removed, workspace route deleted", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — DashboardSwitcher removed, workspace route deleted", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — DashboardSwitcher removed, workspace route deleted", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — DashboardSwitcher removed, workspace route deleted", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — DashboardSwitcher removed, workspace route deleted", slug: "wirausaha-os", kind: "template" },
          { text: "notion-page-clone-os — DashboardSwitcher removed; flagged as the BE-wave canary for the Advanced archetype", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Removed (dead chassis)",
        bullets: [
          "_shared/ui/dashboard-switcher.tsx — wrong primitive (TeamSwitcher pattern for section toggle)",
          "_shared/ui/workspace-placeholder.tsx — Simple templates don't have a workspace surface",
          "_shared/dashboard/sections.ts — buildDashboardSections + activeSectionFromPathname helpers",
          "_shared/types/common.ts → DashboardSection type",
          "_shared/ui/dashboard-shell.tsx — dashboardSections + activeSectionId props",
          "_shared/ui/admin-sidebar.tsx — DashboardSwitcher conditional in SidebarHeader",
          "personal-brand/shared/{workspace-types.ts,workspace-reducer.ts} + slices/workspace/*",
          "Per-template DASHBOARD_SECTIONS export + workspace route directories (8 templates)",
        ],
      },
      {
        heading: "Kept",
        bullets: [
          "Per-template DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE constants — zero cost and needed by the Advanced archetype",
          "AZ-wave URL shift (/admin → /dashboard/admin) and permanent redirect",
          "Simple shell + admin-sidebar + admin-nav-items (the canonical archetype)",
        ],
      },
      {
        heading: "Docs",
        bullets: [
          "docs/architecture/dashboard-vision.md REWRITTEN — two-archetype model, decision matrix per template, BE-wave plan, source map for primitive lifts from superspace + notion-page-clone",
        ],
      },
      {
        heading: "Up next (BE-wave)",
        bullets: [
          "Build _shared/ui/workspace-switcher.tsx (opt-in workspace-context picker, not a section toggle)",
          "Build _shared/ui/secondary-sidebar.tsx (three-column layout primitive lifted from superspace FeatureThreeColumnLayout)",
          "Build _shared/ui/dashboard-shell-advanced.tsx (composes the two)",
          "Wire notion-page-clone-os as canary for the Advanced archetype",
        ],
      },
    ],
  },
  {
    id: "BC",
    version: "BC-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "personal-brand-os workspace surface — Workspace CRUD + Notes + Tasks (live)",
    body:
      "BB-wave delivered the DashboardSwitcher chassis. BC-wave proves it end-to-end on one template: personal-brand-os now has a fully working Workspace surface. Multi-tenant workspaces (Personal / Side Project / …) with CRUD + active switching. Per-workspace Notes (full editor, search) and Tasks (inline checklist with overdue badge + open/done/all filter). All persisted via the existing localStorage store + BroadcastChannel cross-tab sync. Sidebar nav swaps between admin and workspace primary nav based on pathname; switcher header shows the active workspace icon + name. Old `/dashboard/workspace` placeholder replaced by a real dashboard with stat cards and recent-notes list. The other 7 OS templates keep the placeholder; their workspace surfaces lift the same pattern in subsequent waves.",
    groups: [
      {
        heading: "Template touched",
        bullets: [
          { text: "personal-brand-os — Workspace dashboard + Notes (CRUD with editor) + Tasks (inline checklist) + Workspaces (CRUD over the workspace entities themselves)", slug: "personal-brand-os", kind: "template" },
        ],
      },
      {
        heading: "Data model (personal-brand/shared)",
        bullets: [
          "types.ts — added Workspace + Note + Task types, State fields (workspaces, activeWorkspaceId, notes, tasks), Action union extensions (workspace.create/update/delete/switch, note.upsert/delete, task.upsert/toggle/delete)",
          "workspace-reducer.ts NEW — isolated workspace surface transitions; cascade-delete notes + tasks on workspace.delete; keep ≥1 workspace alive; activeWorkspaceId falls back when active is removed",
          "store-reducer.ts — delegates workspace/note/task actions via isWorkspaceAction guard",
          "seed.ts — 2 workspaces (Personal 🧠, Side project 🚀) + 3 notes + 4 tasks; storageKey bumped pbos:state:v5 → v6-workspaces",
        ],
      },
      {
        heading: "Surfaces",
        bullets: [
          "WorkspaceDashboardView — stat cards (Notes / Open tasks / Workspaces) + recent-notes list scoped to active workspace",
          "NotesView + NoteEditor — list with search, inline create-then-redirect, full-page editor with dirty-state Save",
          "TasksView — quick-add input, open/done/all filter, checkbox toggle, overdue badge, delete",
          "WorkspaceManageView — list with inline rename (icon + name), switch, delete (cascade-aware, disabled when only one remains), create form with icon input",
        ],
      },
      {
        heading: "Routing + nav",
        bullets: [
          "app/preview/personal-brand-os/dashboard/workspace/{page,notes/page,notes/[id]/page,tasks/page,manage/page}.tsx NEW",
          "personal-brand/shared/nav-config.ts — buildWorkspaceNav(state) returns Dashboard / Notes / Tasks / Workspaces with live counts",
          "personal-brand/dashboard-shell-client.tsx — section-aware primaryNav (admin vs workspace), appLabel shows active workspace icon + name, homeHref + searchPlaceholder swap by section",
        ],
      },
      {
        heading: "Up next",
        bullets: [
          "Propagate workspace surface to remaining 7 OS templates (likely lifted as a distributable rr slice once the pattern stabilizes)",
          "BD — feature harvest from superspace + notion-page-clone via /rr lift (RBAC / CRM / Analytics / CMS-menu inside Admin Panel)",
          "BE — replace placeholder Tasks with notion-style block editor for richer Note bodies",
        ],
      },
    ],
  },
  {
    id: "BB",
    version: "BB-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "DashboardSwitcher — shadcn sidebar-07 team-switcher adapted for /dashboard/{admin,workspace}",
    body:
      "Top of every template sidebar now hosts an improved adaptation of the shadcn sidebar-07 TeamSwitcher pattern. Click → dropdown reveals Admin Panel + Workspace sections with icon, label, one-line description, active checkmark, and ⌘1/⌘2 keyboard shortcuts. Footer link jumps to /templates so operators can hop to another template without leaving the dashboard. Inspired by notion-page-clone WorkspaceSwitcher (role-gated items, composable trigger) and superspace EnhancedWorkspaceSwitcher (hierarchical context, descriptions). The dashboard/admin and dashboard/workspace surfaces now share a single dashboard/layout.tsx — the switcher and store provider live one level up so the chassis stays consistent across both surfaces. Workspace placeholder updated to point at the new ⌘1/⌘2 shortcuts.",
    groups: [
      {
        heading: "Templates touched (DashboardSwitcher mounted; layout lifted)",
        bullets: [
          { text: "saas-marketing-os — switcher in sidebar header; workspace inherits shell", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — switcher in sidebar header; workspace inherits shell", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — switcher in sidebar header; workspace inherits shell", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — switcher in sidebar header; workspace inherits shell", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — switcher in sidebar header; workspace inherits shell", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — switcher in sidebar header; workspace inherits shell", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — switcher in sidebar header; workspace inherits shell", slug: "wirausaha-os", kind: "template" },
          { text: "notion-page-clone-os — switcher in sidebar header; workspace inherits shell", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Infra",
        bullets: [
          "_shared/ui/dashboard-switcher.tsx NEW — SidebarMenuButton + DropdownMenu + ⌘N shortcuts + active checkmark + Switch-template footer",
          "_shared/dashboard/sections.ts NEW — buildDashboardSections() + activeSectionFromPathname() helpers",
          "_shared/types/common.ts — added DashboardSection type",
          "_shared/ui/admin-sidebar.tsx — renders DashboardSwitcher when sections prop provided (BrandHeader fallback preserved)",
          "_shared/ui/dashboard-shell.tsx — accepts dashboardSections + activeSectionId props",
          "Per-template nav-config.ts — DASHBOARD_SECTIONS export (8 templates)",
          "Per-template dashboard/layout.tsx NEW — lifted from admin/layout.tsx so workspace inherits StoreProvider + DashboardShell",
          "Per-template dashboard/dashboard-shell-client.tsx NEW — derives activeSection from usePathname",
        ],
      },
      {
        heading: "Up next (see docs/architecture/dashboard-vision.md)",
        bullets: [
          "BC-wave — Workspace bootstrap (notion editor at MAX, calendar, command-menu, database views) — replaces current placeholder",
          "BD-wave — feature harvest from superspace + notion-page-clone via /rr lift (RBAC / CRM / Analytics / CMS-menu siblings inside Admin Panel)",
        ],
      },
    ],
  },
  {
    id: "BA",
    version: "BA-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "notion-shell slice + Notion Page Clone OS = real Notion-clone template (not marketing landing)",
    body:
      "Before: /preview/notion-page-clone-os/public showed a marketing landing page jualan notion-blocks slice. After: it IS a Notion clone — left sidebar with tree-nav (page CRUD inline), main panel with page editor (rich blocks via notion-blocks primitive registry) or database table (per-cell + property CRUD). Built by lifting the six props-driven Notion wrappers from nosion's shared/components/notion (NotionPage / NotionHeader / NotionSidebar / NotionBlock / NotionDatabase / NotionProperty) to a new rr slice `notion-shell`. Zero-peer-dep design — icon-picker dropped in favor of `renderIcon` + `renderIconPicker` props so host wires any icon library (we wire @/features/icon-picker at the template layer). NotionBlock dispatches via a `blockRenderers` prop — the template registers equation/code/divider from notion-blocks, falls back to contentEditable for text-shape blocks. Template store extended with `docs` + `databases` slices alongside existing pages/snippets/landingSections; storageKey bumped v2-landing → v3-docs. Reducer split into `notion-reducer.ts` to stay under the 200-LOC cap.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "notion-shell — NEW: six portable Notion wrappers + types subset", slug: "notion-shell" },
          { text: "notion-blocks — registered as block renderers inside notion-shell's NotionBlock", slug: "notion-blocks" },
        ],
      },
      {
        heading: "Templates touched",
        bullets: [
          { text: "notion-page-clone-os — public surface = full Notion-clone dashboard (replaces marketing landing)", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "frontend/slices/notion-shell/ NEW — 6 wrapper components + types subset + slice metadata trio + /preview demo",
          "components/templates/notion-page-clone/slices/notion-app/ NEW — Dashboard / DocView / DatabaseView + block-renderers registry + sidebar hooks",
          "components/templates/notion-page-clone/shared/types.ts — added docs/databases + 14 action types (doc.*, db.*, db.row.*)",
          "components/templates/notion-page-clone/shared/store.tsx — wired notion-reducer; storageKey v2-landing → v3-docs",
          "components/templates/notion-page-clone/shared/notion-reducer.ts NEW — pulled out for 200-LOC cap",
          "components/templates/notion-page-clone/shared/seed.ts — seeded 3 docs + 1 Roadmap database (3 rows)",
          "app/preview/notion-page-clone-os/public/page.tsx — opens to dashboard@doc-welcome",
          "app/preview/notion-page-clone-os/public/d/[id]/ + db/[id]/ NEW — dynamic dashboard surfaces",
          "lib/content/slices.ts + layouts.ts — added notion-shell entry; template pullPaths cascade notion-shell + icon-picker; stale notion-page-clone-os dir refs renamed to notion-page-clone",
        ],
      },
    ],
  },
  {
    id: "AZ",
    version: "AZ-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Dashboard foundation rename — /admin → /dashboard/admin + workspace stubs",
    body:
      "AZ-wave foundation only (mechanical URL prefix shift). Every `/preview/<template>/admin/...` route moves under `/preview/<template>/dashboard/admin/...`, freeing `dashboard/workspace/` as the new productivity surface. Permanent redirect from old URLs preserves every external link. Per-template constants split: DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE introduced; ADMIN_BASE kept as alias for backwards compat. _shared/ui/admin-shell.tsx renamed to dashboard-shell.tsx with AdminShell as deprecated alias. Workspace landing pages now render a placeholder pointing to docs/architecture/dashboard-vision.md — BA/BB waves will populate it with notion editor + calendar + command-menu + database views. No URL breaking change; no consumer-side action needed.",
    groups: [
      {
        heading: "Templates touched (admin → dashboard/admin + workspace stub)",
        bullets: [
          { text: "saas-marketing-os — admin moved to dashboard/admin; workspace stub added", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — admin moved to dashboard/admin; workspace stub added", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — admin moved to dashboard/admin; workspace stub added", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — admin moved to dashboard/admin; workspace stub added", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — admin moved to dashboard/admin; workspace stub added", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — admin moved to dashboard/admin; workspace stub added", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — admin moved to dashboard/admin; workspace stub added", slug: "wirausaha-os", kind: "template" },
          { text: "notion-page-clone-os — admin moved to dashboard/admin; workspace stub added", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Infra",
        bullets: [
          "next.config.mjs — permanent redirect /preview/:tpl/admin/:path* → /preview/:tpl/dashboard/admin/:path*",
          "_shared/ui/dashboard-shell.tsx — canonical export DashboardShell + deprecated AdminShell alias (drop-in for existing layouts)",
          "_shared/ui/workspace-placeholder.tsx NEW — minimal coming-soon card for /dashboard/workspace until BB-wave",
          "lib/content/layouts.ts — adminPreviewPath + filePaths updated for all 8 OS templates (81 path replacements)",
          "Per-template nav-config.ts — DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE constants (8 templates)",
        ],
      },
      {
        heading: "Up next (see docs/architecture/dashboard-vision.md)",
        bullets: [
          "BA-wave — Pages restructure inside Admin Panel + RBAC / CMS-menu / Analytics / CRM / Audit-log siblings",
          "BB-wave — Workspace bootstrap (notion editor at MAX, calendar, command-menu, database views)",
          "BC-wave — feature harvest from superspace + notion-page-clone via /rr lift",
        ],
      },
    ],
  },
  {
    id: "AY",
    version: "AY-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Session close-out — All Pages first sub-item + Dashboard vision docs",
    body:
      "Tiny nav UX fix + comprehensive close-out docs so the next session resumes without retracing today's conversation. Reorder Pages sub-items so All Pages comes first (the listing surface a user opens before drilling into a specific page editor like Landing). Capture the Dashboard architectural direction (Admin Panel + Workspace split, RBAC/CRM/Analytics harvest from superspace) at docs/architecture/dashboard-vision.md, and a wave-by-wave log at docs/sessions/2026-05-19-session.md. Memory entries written so /rr in the next session auto-loads the vision + open items.",
    groups: [
      {
        heading: "Templates touched (Pages children re-ordered)",
        bullets: [
          { text: "saas-marketing-os — All pages first, Landing second", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — All pages first", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — All pages first", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — All pages first", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — All pages first", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — All pages first", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — All pages first", slug: "wirausaha-os", kind: "template" },
        ],
      },
      {
        heading: "Docs",
        bullets: [
          "docs/architecture/dashboard-vision.md NEW — Dashboard > Admin Panel + Workspace split direction; AZ→BC wave roadmap; source map for RBAC/CRM/Analytics from superspace + notion-page-clone",
          "docs/sessions/2026-05-19-session.md NEW — wave-by-wave commit log AK→AY; flagged items for next session; process notes (200-LOC cap, pre-push build hook, wave-letter collisions)",
          "Memory entries — dashboard-vision + session-2026-05-19 + feedback-wave-letters + feedback-changelog-discipline written to /home/rahman/.claude/projects/-home-rahman-projects-resources/memory/ for cross-session auto-load",
        ],
      },
    ],
  },
  {
    id: "AX",
    version: "AX-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Nested Pages nav across all 7 templates + Open-full-page button",
    body:
      "Closes the AV-deferred propagation: every website template now has the Pages parent + collapsible sub-items (Landing / All pages / blog / portfolio / services where applicable). ParentNavItem rewired to the canonical shadcn NavMain idiom (group/collapsible + group-data-[state=open]/collapsible:rotate-90) — same pattern shadcn ships in its docs. FeatureBar gets a new ExternalLink button: when the active docs tab is a preview surface, the button pops the iframed content out into a real browser tab at native size.",
    groups: [
      {
        heading: "Templates touched (Pages parent + nested sub-items)",
        bullets: [
          { text: "personal-brand-os — Landing, All pages, Blog, Portfolio, Services, Resources", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — Landing, All pages, Work, Services", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — Landing, All pages", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — Landing, All pages", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — Landing, All pages", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — Landing, All pages", slug: "wirausaha-os", kind: "template" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "components/templates/_shared/ui/admin-nav-items.tsx — ParentNavItem refactored to canonical shadcn NavMain idiom (group/collapsible class + CSS-driven chevron rotation, no per-item useState)",
          "components/site/feature-context.tsx — FeatureManifest.previewUrls?: { public?, admin? } so FeatureBar can resolve the surface URL without a fresh ref",
          "components/site/preview/manifest-builder.tsx — buildPreviewManifest emits previewUrls from publicPath/adminPath",
          "components/site/feature-bar.tsx — new ExternalLink button (right-side cluster) opens the active preview surface in a new tab; auto-hides on split tab and when manifest has no URL for the current surface",
        ],
      },
    ],
  },
  {
    id: "AW",
    version: "AW-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion Page Clone OS — nested Pages nav + landing-renderer composition",
    body:
      "Applies the AV nested-nav pattern to notion-page-clone-os and rewires the public homepage to compose existing rr slices instead of a bespoke React tree. Admin sidebar now groups Landing / Snippets / All-pages under a single \"Pages\" parent (Collapsible + SidebarMenuSub). Public homepage reads admin-editable LandingSection rows from the template store and renders each via the canonical HeroBlock / FeatureGridSection / CtaBand slices, plus a custom snippets gallery section for the notion-blocks demo. Store schema bumped to v2-landing — landing-sections now first-class state managed via LANDING_UPSERT / LANDING_DELETE alongside pages + snippets.",
    groups: [
      {
        heading: "Templates touched",
        bullets: [
          { text: "notion-page-clone-os — nested Pages nav + LandingRenderer composition", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Slices reused (no change)",
        bullets: [
          { text: "hero-block — landing hero rendered via canonical HeroBlock", slug: "hero-block" },
          { text: "feature-grid — primitive showcase via FeatureGridSection", slug: "feature-grid" },
          { text: "cta-band — landing CTA rendered via canonical CtaBand", slug: "cta-band" },
          { text: "notion-blocks — snippet gallery embeds EquationBlock + CodeBlock + NotifyMePopover", slug: "notion-blocks" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "components/templates/notion-page-clone/shared/nav-config.ts — buildAdminPrimaryNav now emits nested Pages parent with landing/snippets/all-pages children",
          "components/templates/notion-page-clone/shared/store.tsx — landingSections added to State; storageKey bumped to v2-landing; LANDING_UPSERT / LANDING_DELETE reducer",
          "components/templates/notion-page-clone/slices/home/LandingRenderer.tsx NEW — switch on section.kind → HeroBlock / FeatureGridSection / CtaBand / custom SnippetsGallery",
          "components/templates/notion-page-clone/slices/home/HomePage.tsx — reads useLandingSections() filter+sort, renders via LandingRenderer",
        ],
      },
    ],
  },
  {
    id: "AV",
    version: "AV-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Admin sidebar: nested Pages parent + sub-items (POC on saas-marketing-os)",
    body:
      "Admin nav was a flat list per template — every content surface (landing, blog, pricing, features, changelog) sat as a sibling top-level menu item. With more entities being added the sidebar started feeling crowded. AV adds optional `children` to AdminNavItem and renders nested entries via shadcn's `Collapsible` + `SidebarMenuSub` + `SidebarMenuSubButton`. POC on saas-marketing-os groups all page-driving CRUDs (landing, all pages, blog, pricing, features, changelog) under a single \"Pages\" parent. Top-level keeps Dashboard / Pages / Customers / Subscriptions / Leads. Other 6 templates queued for AW. Dynamic per-page section composition (using existing hero / feature-grid / pricing-page / blog-section / changelog-feed / faq-section / portfolio-section / cta / services / testimonials-grid slices) deferred to a separate AW-B sub-wave.",
    groups: [
      {
        heading: "Templates touched",
        bullets: [
          { text: "saas-marketing-os — Pages parent with 6 sub-items (POC)", slug: "saas-marketing-os", kind: "template" },
        ],
      },
      {
        heading: "Templates queued for AW (same restructure)",
        bullets: [
          { text: "personal-brand-os", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os", slug: "wirausaha-os", kind: "template" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "components/templates/_shared/types/common.ts: AdminNavItem.children?: AdminNavItem[]",
          "components/templates/_shared/ui/admin-nav-items.tsx NEW — ParentNavItem + LeafNavItem + isPathActive helper",
          "components/templates/_shared/ui/admin-sidebar.tsx — NavGroup routes child-having items through ParentNavItem (Collapsible + SidebarMenuSub)",
          "Existing flat nav items keep rendering as before (LeafNavItem)",
        ],
      },
    ],
  },
  {
    id: "AU",
    version: "AU-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion Page Clone OS — full website template using notion-blocks",
    body:
      "First end-to-end website template built on the notion-blocks bundle. Notion Page Clone OS = block-based notes-app starter with admin CRUD + public landing. Snippets entity (kind: equation/code/text/grid) renders live on the public landing via the four bundled primitives (EquationBlock / CodeBlock / NotifyMePopover / SelectableCell). Pure-localStorage state, zero convex required — drop-in for anyone shipping a writing surface or doc site. Wires the same _shared/{pages,landing,crud,ui} primitives the other 7 templates use so consistency holds across the OS family.",
    groups: [
      {
        heading: "Templates touched",
        bullets: [
          { text: "notion-page-clone-os — NEW website template (admin + public)", slug: "notion-page-clone-os", kind: "template" },
        ],
      },
      {
        heading: "Slices touched",
        bullets: [
          { text: "notion-blocks — first downstream consumer (template usedBy)", slug: "notion-blocks" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "/preview/notion-page-clone-os/public — homepage renders snippets via notion-blocks primitives (equations, code, NotifyMe bell)",
          "/preview/notion-page-clone-os/admin — dashboard + /snippets CrudListView for managing the public content",
          "lib/content/layouts.ts — new SliceEntry for notion-page-clone-os, with pullPaths cascading notion-blocks + 4 peer slices",
        ],
      },
    ],
  },
  {
    id: "AT",
    version: "AT-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Docs catalog sidebar now uses shadcn Sidebar primitives",
    body:
      "User principle: rr is an extension of shadcn, not a replacement. The website-template ADMIN sidebars already used shadcn Sidebar primitives (Sidebar / SidebarMenuButton / SidebarMenuSub / SidebarMenuBadge wrapped in SidebarProvider) — but the rr docs CATALOG sidebar (the left nav on /slices /layouts /templates /changelog etc.) was still a hand-rolled <nav> with custom buttons + chevrons. AT refactors it to shadcn primitives so collapse tooltips, mobile drawer, and persistent state inherit from the same canon as the admin shells. We extend shadcn — we don't fight it.",
    groups: [
      {
        heading: "Site",
        bullets: [
          "components/site/docs-sidebar/nav-parts.tsx: SectionGroup → SidebarGroup + Collapsible + SidebarGroupLabel; BranchItem → SidebarMenuItem + SidebarMenuButton + SidebarMenuSub; leaf links → SidebarMenuButton / SidebarMenuSubButton",
          "components/site/docs-sidebar.tsx: wrapped in SidebarProvider so SidebarMenuButton has its useSidebar() context — overrides flex / min-h-svh classes so the provider stays flush inside ThreeColumnLayoutAdvanced's left column",
          "Visual hierarchy preserved (3-tier: section / branch / leaf) — chevron rotation, active badge, count pill all carry over via shadcn data-state",
        ],
      },
      {
        heading: "Templates touched (no change — already on shadcn)",
        bullets: [
          { text: "saas-marketing-os — admin sidebar already shadcn-based (AdminShell)", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os — admin sidebar already shadcn-based", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os — admin sidebar already shadcn-based", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os — admin sidebar already shadcn-based", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os — admin sidebar already shadcn-based", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit — admin sidebar already shadcn-based", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os — admin sidebar already shadcn-based", slug: "wirausaha-os", kind: "template" },
        ],
      },
    ],
  },
  {
    id: "AS",
    version: "AS-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Consolidate notion editor primitives into single bundle",
    body:
      "Four tiny notion-lifted primitives (equation, code-block, notifications, database-cell-selection) collapsed into one catalog entry: notion-blocks. Each was ~5 files / one component — splitting them four ways cluttered the catalog without giving consumers narrower install ergonomics. notion-blocks is a peer-bundle: re-exports the four slices' public API behind one import path. Per-block narrow imports still work (the peer slices stay registered + lifted). Updated equation + code-block index.ts to also re-export their Props types for ergonomic typing.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "notion-blocks — NEW peer-bundle. Catalog entry replaces 4 sub-entries", slug: "notion-blocks" },
          { text: "equation — added EquationBlockProps to barrel exports", slug: "equation" },
          { text: "code-block — added CodeBlockProps to barrel exports", slug: "code-block" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "/preview/slices/notion-blocks — single page demos all 4 primitives (KaTeX formulas, TS/Bash code samples, NotifyMe bells, drag-fill table)",
          "Removed /preview/slices/{equation,notifications,code-block,database-cell-selection} — bundle is canonical surface",
          "Removed 4 individual SliceEntry rows from lib/content/slices.ts",
        ],
      },
    ],
  },
  {
    id: "AR",
    version: "AR-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Skeleton fallbacks + cacheComponents-friendly slice file I/O",
    body:
      "After AP killed the client-side reset churn, server-side nav still felt heavy because cacheComponents: true treats async server components as dynamic by default — every navigation re-ran readSliceFiles on the filesystem. AR adds Next 16 `use cache` directives to the file readers and per-route loading.tsx skeletons that stream instantly on click. /slices/[slug] now reports as Partial Prerender with 15m revalidate; nav between detail pages feels app-router-fast.",
    groups: [
      {
        heading: "Site",
        bullets: [
          "lib/slice-files.ts: \"use cache\" on readSliceFiles + readPathsFiles — cross-nav cache, not just intra-render dedupe",
          "components/site/docs-loading-skeleton.tsx NEW — shared title-strip / tabs / preview-iframe skeleton",
          "app/(docs)/loading.tsx — catch-all skeleton for plain docs routes",
          "app/(docs)/slices/[slug]/loading.tsx — tab + iframe skeleton",
          "app/(docs)/layouts/[slug]/loading.tsx — tab + iframe skeleton",
          "RecentlyUpdatedBadge → \"use client\" so Date.now() runs in the browser (cacheComponents blocked the previous server read)",
        ],
      },
    ],
  },
  {
    id: "AQ",
    version: "AQ-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion editor primitives lifted via new rr-sync pipeline",
    body:
      "Four pure-UI primitives lifted from notion-page-clone using a new hash-based, idempotent sync pipeline. The pipeline auto-derives import rewrites from both repos' tsconfigs, follows transitive shared-dep graphs, cross-checks npm packages against rr's package.json, and ships a registry (rr-sync.json) so subsequent updates to the same slice in nosion can re-propagate with one command. Each lifted slice has an interactive preview at /preview/slices/<slug>.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "equation — KaTeX-rendered LaTeX block, click-pencil to edit", slug: "equation" },
          { text: "notifications — per-page subscription toggle (localStorage-backed NotifyMePopover)", slug: "notifications" },
          { text: "code-block — highlight.js syntax block with language picker + copy", slug: "code-block" },
          { text: "database-cell-selection — drag-fill + SelectableCell primitives for grid UIs", slug: "database-cell-selection" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "rr-sync pipeline in notion-page-clone: pathMap registry + tsconfig alias auto-derivation + transitive-import follower + sibling-barrel resolver + npm-deps cross-check + skipFiles wildcards + per-file hash drift detection",
          "Pre-push hook adds `npm run build` to catch Next-only errors (cacheComponents conflicts, Turbopack loader issues) that tsc misses",
          "next.config: transpilePackages: [\"rahman-shared\"] added — required for slices using rewritten @/shared/lib/utils → rahman-shared/lib/utils imports",
        ],
      },
    ],
  },
  {
    id: "AP",
    version: "AP-wave",
    date: Date.parse("2026-05-19"),
    kind: "fix",
    title: "Stop full preview reset on every sidebar/layout nav",
    body:
      "Regression from AM-wave: /slices/[slug] started registering a FeatureManifest to share the docs-shell tabs with /layouts/[slug]. Two long-standing rough edges in feature-context surfaced — useFeatureManifest's unmount cleanup flashed null on every nav (firing the provider's effect twice), and the effect reset activeTab / previewView / previewZoom on every manifest object identity change. Result: clicking any sidebar link rebuilt the iframe, dropped the user's tab choice, and felt like a fresh fetch. AP threads a stable manifest.id (slug-based) through buildPreviewManifest, gates the reset on id change via a ref, preserves activeTab across slugs when the id exists in the new tabs, drops the unmount cleanup, and React.cache-wraps readSliceFiles.",
    groups: [
      {
        heading: "Site",
        bullets: [
          "FeatureManifest gained `id` field; buildPreviewManifest derives from slug",
          "feature-context useEffect is now id-gated — same-id re-renders don't reset state",
          "useFeatureManifest cleanup dropped — no more null-flash between transitions",
          "lib/slice-files: readSliceFiles wrapped with React.cache for intra-render dedupe",
          "components/site/feature-context-effect.ts NEW — extracted manifest-effect helper to keep feature-context.tsx under 200 LOC",
        ],
      },
    ],
  },
  {
    id: "AO",
    version: "AO-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion editor primitives lifted via new rr-sync pipeline",
    body:
      "Four pure-UI primitives lifted from notion-page-clone using a new hash-based, idempotent sync pipeline. The pipeline auto-derives import rewrites from both repos' tsconfigs, follows transitive shared-dep graphs, cross-checks npm packages against rr's package.json, and ships a registry (rr-sync.json) so subsequent updates to the same slice in nosion can re-propagate with one command. Each lifted slice has an interactive preview at /preview/slices/<slug>.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "equation — KaTeX-rendered LaTeX block, click-pencil to edit", slug: "equation" },
          { text: "notifications — per-page subscription toggle (localStorage-backed NotifyMePopover)", slug: "notifications" },
          { text: "code-block — highlight.js syntax block with language picker + copy", slug: "code-block" },
          { text: "database-cell-selection — drag-fill + SelectableCell primitives for grid UIs", slug: "database-cell-selection" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "rr-sync pipeline in notion-page-clone: pathMap registry + tsconfig alias auto-derivation + transitive-import follower + sibling-barrel resolver + npm-deps cross-check + skipFiles wildcards + per-file hash drift detection",
          "Pre-push hook adds `npm run build` to catch Next-only errors (cacheComponents conflicts, Turbopack loader issues) that tsc misses",
          "next.config: transpilePackages: [\"rahman-shared\"] added — required for slices using rewritten @/shared/lib/utils → rahman-shared/lib/utils imports",
        ],
      },
    ],
  },
  {
    id: "AN",
    version: "AN-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Changelog clickable + live-preview SSOT + landing editor polish",
    body:
      "AM-wave unified the docs-shell tabs for /slices and /layouts behind a single buildPreviewManifest helper. AL-wave fixed admin landing editor: bgImage scrim, fg image inside Hero with aspect-ratio dropdown, 1-based reorder arrows. AK-E published landing-sections as installable slice. AN-wave: changelog bullets now link back to the slice/template they reference.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "landing-sections — promoted to distributable slice", slug: "landing-sections" },
          { text: "changelog-feed — bullets now accept { text, slug, kind } for back-links", slug: "changelog-feed" },
        ],
      },
      {
        heading: "Templates touched (admin landing editor)",
        bullets: [
          { text: "saas-marketing-os", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os", slug: "wirausaha-os", kind: "template" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "VersionWatcher toasts when a redeploy lands (rc-samata-dash pattern)",
          "/slices/<slug> + /layouts/<slug> share the same Code/Public/Split/Admin tabs",
        ],
      },
    ],
  },
  {
    id: "1.7.0",
    version: "1.7.0",
    date: Date.parse("2026-05-18"),
    kind: "feature",
    title: "Seven canonical UI slices + V-wave three-column",
    body:
      "R + S + T waves shipped the missing marketing-page primitives so every template consumes one SSOT per surface. V-wave ported superspace's PanelSection compound. W-wave wired live previews. CLI 1.7.0 + MCP 1.1.0 on npm.",
    groups: [
      {
        heading: "New slices",
        bullets: [
          { text: "pricing-page · PricingSection with renderTierCta slot", slug: "pricing-page" },
          { text: "feature-grid · cards / minimal / alternating / grouped layouts", slug: "feature-grid" },
          { text: "faq-section · single / two-column / grouped + footer CTA", slug: "faq-section" },
          { text: "testimonials-grid · cards / quote-stack / masonry", slug: "testimonials-grid" },
          { text: "blog-section · BlogListSection + BlogPostView (afterContent / extraMeta / related slots)", slug: "blog-section" },
          { text: "changelog-feed · timeline / cards / list", slug: "changelog-feed" },
          { text: "portfolio-section · PortfolioListSection + PortfolioDetailView with sections[]", slug: "portfolio-section" },
        ],
      },
      {
        heading: "Layout — V-wave",
        bullets: [
          "PanelSection compound (Header / Items / Footer)",
          "PanelGroup / PanelMenu / PanelSeparator primitives",
          "leftFooter / centerFooter / rightFooter slots on ThreeColumnLayoutAdvanced",
          "Trigger ≠ Header separation rule",
          "Mobile drawer header + footer slot props",
        ],
      },
      {
        heading: "Site",
        bullets: [
          "/preview/slices/<slug> for all 7 new slices",
          "/preview/three-column-trio V-wave demo",
          "rr site dogfood — FeaturesGrid + /stack + /changelog use canonical slices",
        ],
      },
    ],
  },
  {
    id: "1.6.0",
    version: "1.6.0",
    date: Date.parse("2026-05-10"),
    kind: "feature",
    title: "Generic CRUD primitives + 25 entities migrated",
    body:
      "<CrudListView> + <CrudFormView> + typed CrudController<T>. Replaced per-template bespoke admin tables. Every website template now has Pages CRUD with audit-templates hard-error gate.",
  },
  {
    id: "1.5.0",
    version: "1.5.0",
    date: Date.parse("2026-04-22"),
    kind: "feature",
    title: "Page CRUD on all 7 website templates",
    body:
      "Shared _shared/pages/ infra. PagesView + PageEditorView propagated to every website template. Hybrid client-wrap pattern: server chrome + client data section.",
  },
  {
    id: "1.4.0",
    version: "1.4.0",
    date: Date.parse("2026-04-10"),
    kind: "improvement",
    title: "Security + infra + Next.js primitive sweep",
    body:
      "Rate-limit, strict headers, isHidden wiring, env hygiene. next/link + next/image + typed catch across template-base. Sidebar grouping: 38 flat slices → 11 collapsible categories.",
  },
  {
    id: "1.3.0",
    version: "1.3.0",
    date: Date.parse("2026-03-25"),
    kind: "improvement",
    title: "CLI publish prep + audit chain self-doc",
    body:
      "Consumer install REAL test. .env.example per-slice augment. Schema unification. pre-commit hook expanded to run full audit chain. /llms.txt + catalog completeness.",
  },
  {
    id: "1.2.0",
    version: "1.2.0",
    date: Date.parse("2026-02-28"),
    kind: "improvement",
    title: "Install snippet modernization + lint zero",
    body:
      "Install snippets → npx rr init flow. 75 lint warnings → 0. Catalog drift fixes (5 ai-* + platform-admin + 2 landing). sync-slice-manifests handles both schemas.",
  },
  {
    id: "1.1.0",
    version: "1.1.0",
    date: Date.parse("2026-02-14"),
    kind: "feature",
    title: "200-LOC modularity rule + audit-file-size guard",
    body:
      "New audit-file-size.mjs gates file length. 8 top offenders refactored. Grandfather list driven 35 → 0. F4: TEMPLATE/SLICE distinction in audit guard.",
  },
  {
    id: "1.0.0",
    version: "1.0.0",
    date: Date.parse("2026-01-30"),
    kind: "feature",
    title: "Audit chain comprehensive — D + B waves",
    body:
      "Site-level raw-HTML audit. Convex authn+authz on every public mutation. Schema index validity. 39 raw <button> wrapped in shadcn Button. Pre-push hook installed. Hardcoded MCP URL extracted to env.",
  },
];
