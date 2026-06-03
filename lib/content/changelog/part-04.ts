import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "CJ",
    "version": "CJ-wave",
    "date": 1779321600000,
    "kind": "chore",
    "title": "catalog cleanup — drop dead `pages` skeleton + redundant `notion-blocks` aggregator",
    "body": "User report: 'aku rasa banyak sampah, mari bersihkan module yang menurutmu tidak terlalu penting, atau bisa di gabung'. Cross-referenced docs/rr-sync/2026-05-21-notion-mega-lift-plan.md (upstream open-silong's incoming `notion/` mega-bundle, Phase 5 ~3wk out) — that plan will subsume the 4 notion atoms (equation, code-block, notifications, database-cell-selection) + notion-shell + notion-database behind one adapter. NOT consolidating those now — premature merge before the adapter contract lands = refactor twice. INSTEAD: tightened scope to two no-brainer cuts + one disambiguation. (1) DELETED frontend/slices/pages/ — dead `defineFeature` skeleton, routes:[], zero live imports (the `pages` ids in templates' nav-config are sidebar group keys, NOT slice refs). (2) DROPPED `notion-blocks` catalog entry — pure aggregator that re-exported the 4 atoms; atoms remain individually accessible in catalog. Slice dir + barrel KEPT so notion-page-clone template's `import { EquationBlock, CodeBlock } from \"@/features/notion-blocks\"` keeps resolving. (3) DELETED app/preview/slices/notion-blocks/page.tsx. (4) UPDATED notion-page-clone template nav link `/slices/notion-blocks` → `/slices/notion-shell` (avoids catalog detail 404). (5) RETITLED `theme-presets` catalog entry → 'tweakcn Theme Loader (30+ presets)' for unambiguous distinction from `theme-preset-switcher` (Convex-backed OKLch — different slice entirely). NO file moves on theme-presets (would cascade through CLAUDE.md + 5 docs + cookbook for marginal gain). Catalog: 45 → 44 slices. Backend slices spot-checked — rate-limit/subscribers/testimonials/services/socials all already `previewPath: undefined`, no janitor work needed.",
    "groups": [
      {
        "heading": "Deleted",
        "bullets": [
          "frontend/slices/pages/ — dead skeleton, only ref was in this changelog's history",
          "app/preview/slices/notion-blocks/ — preview route paired with catalog drop"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "DROPPED notion-blocks — aggregator redundant, atoms individually listed",
            "slug": "notion-blocks",
            "kind": "slice"
          },
          {
            "text": "RETITLED theme-presets → tweakcn Theme Loader for clarity vs theme-preset-switcher",
            "slug": "theme-presets",
            "kind": "slice"
          },
          "Catalog count: 45 → 44 slices"
        ]
      },
      {
        "heading": "Template touch-ups",
        "bullets": [
          "notion-page-clone/shared/nav-config.ts — link now points to notion-shell slice page (notion-blocks catalog no longer exists)"
        ]
      },
      {
        "heading": "Deferred to upstream mega-bundle",
        "bullets": [
          "notion atom consolidation (equation/code-block/notifications/database-cell-selection) — wait for docs/rr-sync/2026-05-21-notion-mega-lift-plan.md Phase 5 from open-silong (~3wk). Their adapter contract is the single converge point; pre-staging here would refactor twice."
        ]
      }
    ]
  },
  {
    "id": "CI",
    "version": "CI-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "split notion-database out of notion-shell — database is now an optional module",
    "body": "User report after deep-comparing rr's notion-shell with the full notion-page-clone upstream: 'copy semua dari notion clone kecuali database sebagai opsional, karena bisa saja butuh database inline, bisa saja tidak, notion database akan menjadi features module sendiri tapi di gabung di website template'. EXECUTED: extracted the database surface from notion-shell into a NEW dedicated `notion-database` slice. Consumers can now install notion-shell ALONE for pages + sidebar + block editor without the database weight, OR add notion-database when they want embedded DBs. Both compose in the notion-page-clone-os website template (DocView imports from notion-shell, DatabaseView imports from notion-database). FILES MOVED from notion-shell → notion-database: components/{NotionDatabase, NotionProperty, ViewOptions, ViewTabs, ColumnHeaderMenu, property-cells}, components/views/* (TableView/BoardView/ListView/GalleryView/CalendarView/FeedView + types + registry), lib/viewData.ts. DOMAIN TYPES (Database, Property, PropertyValue, DbView, DatabaseViewConfig, DatabaseFilter, DatabaseSort, SelectOption, NumberFormat, PropertyType) STAY IN notion-shell — they're the single source of truth (Page.rowOfDatabaseId + rowProps reference them) — notion-database re-exports them as a convenience. Avoids circular shell↔database imports. PEER DECLARED: notion-database lists notion-shell as a peer (^0.4); npx rr add notion-database cascades the shell. SCHEMA CHANGES: notion-shell slice.json + slice.contract.ts + slice.manifest.json updated (no longer claims database components). NEW slice files for notion-database. CATALOG: new notion-database entry with notion-like tag set + tagline + agentRecipe + previewPath. /preview/slices/notion-database route built — minimal real DB demo with 3 views (Table / Board grouping by status / List), 6 property types (text/status/select/multi_select/date/checkbox), 5 seed rows. Audit chain green: 45 slices (was 44), all ≤200 LOC.",
    "groups": [
      {
        "heading": "Files moved (notion-shell → notion-database)",
        "bullets": [
          "components/NotionDatabase.tsx + NotionProperty.tsx + ViewOptions.tsx + ViewTabs.tsx + ColumnHeaderMenu.tsx + property-cells.tsx",
          "components/views/ — TableView / BoardView / ListView / GalleryView / CalendarView / FeedView + types + index registry",
          "lib/viewData.ts (applyView + groupBy + bucketByDate)"
        ]
      },
      {
        "heading": "Domain types — stay in notion-shell (single source)",
        "bullets": [
          "Database, Property, PropertyValue, DbView, DatabaseViewConfig, DatabaseFilter, DatabaseSort, SelectOption, NumberFormat, PropertyType",
          "Page references these via rowOfDatabaseId + rowProps — moving them to notion-database would create circular shell↔database imports",
          "notion-database/types.ts re-exports them as a convenience for downstream consumers"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          {
            "text": "NEW notion-database — optional embeddable DB surface",
            "slug": "notion-database",
            "kind": "slice"
          },
          {
            "text": "notion-shell description + tagline updated — split is documented",
            "slug": "notion-shell",
            "kind": "slice"
          },
          "Slice count: 44 → 45. Audit green."
        ]
      },
      {
        "heading": "Consumer wiring",
        "bullets": [
          "DatabaseView.tsx (notion-page-clone-os template) — import path moved from notion-shell → notion-database",
          "preview/slices/notion-shell/page.tsx — NotionDatabase imported from notion-database instead of notion-shell",
          "/preview/slices/notion-database — NEW route, 5 seed rows × 6 property types × 3 views (Table/Board-by-status/List)"
        ]
      },
      {
        "heading": "Followup (deferred)",
        "bullets": [
          "CJ-wave (next) — lift more from upstream into notion-shell: editor depth (ColumnLayoutGroup, MentionTypeahead, SelectionToolbar, ColumnBlockEditor, RowPropertiesPanel), sidebar depth (WorkspaceSwitcher, NavUser, DragGhost, PagesPanel, SortablePageRow), provided they're pure-UI and not convex-coupled",
          "CK-wave (later) — lift more database views from upstream into notion-database: ChartView, DashboardView, FormView, MapView, TimelineView (currently rr has 6 of 11)"
        ]
      }
    ]
  },
  {
    "id": "CH",
    "version": "CH-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "slice catalog polish — 6 NEW preview routes (404 fix) + tagline field for compact cards",
    "body": "User report: '/preview/slices/<slug>' returned 404 for 6 slices (the 4 CF-wave additions + 2 pre-existing — equation / code-block / notifications / database-cell-selection / theme-presets / files). All had `previewPath` in the catalog but no actual route file → clicking 'Try it' from the catalog card hit a 404. ALSO USER: 'descripsinya terlalu panjang dan user mungkin tidak perlu baca juga, kalau perlu pindahkan ke bagian detail' — descriptions too long, move long-form to detail tabs. TWO FIXES IN ONE WAVE. (1) Built 6 missing preview routes — each is a minimal interactive demo of the slice. equation: 4 LaTeX sample switcher + KaTeX live. code-block: editable TS snippet with language picker + copy. notifications: bell + popover demo. database-cell-selection: 5×3 grid with click-select + drag-fill. theme-presets: ThemePicker swatch grid (30+ presets, click swaps CSS vars live). files: localStorage adapter demo with upload + chip list. Each ≤60 LOC. (2) Added optional `tagline?: string` field to SliceEntry — short 1-sentence hook (≤ ~140 chars) shown in catalog cards + related-slice cards + detail-page subtitle. Full `description` preserved (canonical reference, shown on detail page only). Catalog card + detail subtitle + related-slices now read `tagline ?? description` with fallback. 10 entries got taglines this wave — the 4 CF additions (notion-style primitives) + theme-presets, files, notion-shell, notion-blocks, icon-picker, command-menu, convex-auth, ai-chat, landing-sections. Remaining 45 entries fall back to the old description (still works, just not yet shortened). Backfill is an opt-in chore — entries without tagline keep behaving as before.",
    "groups": [
      {
        "heading": "NEW preview routes (6, fixes 404)",
        "bullets": [
          "/preview/slices/equation — LaTeX sample switcher + KaTeX live",
          "/preview/slices/code-block — editable TS + language picker + copy",
          "/preview/slices/notifications — bell + frequency popover",
          "/preview/slices/database-cell-selection — 5×3 grid + drag-fill",
          "/preview/slices/theme-presets — ThemePicker swatch grid (30+ presets)",
          "/preview/slices/files — localStorage adapter demo (upload + chip list)"
        ]
      },
      {
        "heading": "Schema change",
        "bullets": [
          "SliceEntry: NEW optional `tagline?: string` (≤ ~140 chars, 1 sentence). When set, catalog cards + related-slice cards + detail-page subtitle render tagline instead of description. Full description preserved + shown in detail page body.",
          "catalog page (/slices) + slice-detail-client + use-related-groups all use `tagline ?? description` fallback — entries without tagline behave exactly as before"
        ]
      },
      {
        "heading": "Taglines added (10 entries)",
        "bullets": [
          "equation, code-block, notifications, database-cell-selection (the 4 CF-wave Notion peers)",
          "theme-presets, files, notion-shell, notion-blocks, icon-picker, command-menu",
          "convex-auth, ai-chat, landing-sections"
        ]
      },
      {
        "heading": "Followup",
        "bullets": [
          "Tagline backfill for remaining ~42 entries — opt-in chore. Worst remaining offenders: subscribers (447), hero (433), portfolio-section (414)."
        ]
      }
    ]
  },
  {
    "id": "CG",
    "version": "CG-wave",
    "date": 1779321600000,
    "kind": "fix",
    "title": "subdomain 404 fix — proxy passes through already-prefixed /preview/<slug>/ URLs",
    "body": "User report: 'banyak module features yang 404' (many module/features 404 on subdomains). ROOT CAUSE: every template's nav-config.ts uses ADMIN_PANEL_BASE = `/preview/<slug>/dashboard/admin` as the href root for sidebar links — those URLs are correct on the canonical resource.rahmanef.com but DOUBLE-NEST when clicked on a demo subdomain (proxy.ts re-rewrites `/preview/konsultan-os/dashboard/admin/clients` → `/preview/konsultan-os/public/preview/konsultan-os/dashboard/admin/clients`, the catch-all renders notFound() = page-not-found inside the template chrome with HTTP 200, looks like a broken endpoint). VERIFIED: every internal sidebar click on every demo subdomain was affected — admin/clients, admin/proposals, admin/contracts, admin/projects, admin/billing, admin/documents, admin/pages, admin/landing, admin/settings (~9 routes per template × 8 templates = ~72 broken links). FIX: 7-line proxy guard — if request path is already correctly nested under /preview/<slug>/ for this subdomain's resolved slug, pass through unchanged. canonical resource.rahmanef.com still works (different subdomain → falls through to default route). Subdomain root URL (demo-X.rahmanef.com/) still rewrites to /preview/<slug>/public. /admin shortcut still rewrites to /preview/<slug>/dashboard/admin. Single-file fix in proxy.ts (~7 LOC + comment). Aesthetic follow-up (clean URLs via short forms in nav-config) deferred to a future wave — current fix restores function without changing what's in the URL bar.",
    "groups": [
      {
        "heading": "Behavior before / after",
        "bullets": [
          "BEFORE: demo-konsultan.rahmanef.com/preview/konsultan-os/dashboard/admin/clients → notFound() rendered (header shows '404')",
          "AFTER: same URL passes through, renders the real Clients admin page",
          "Unchanged: /admin/clients shortcut still rewrites; / still rewrites to public; /contact still rewrites to public/contact"
        ]
      },
      {
        "heading": "Audit",
        "bullets": [
          "Slice catalog: 55/55 endpoints already returned 200 on canonical site (pre-fix scan)",
          "Layout catalog: 36/36 endpoints 200",
          "Docs section: 15/15 endpoints 200",
          "Subdomain admin sidebar nav: ~72 broken links across 8 templates pre-fix — all unblocked post-fix"
        ]
      },
      {
        "heading": "Followup (deferred)",
        "bullets": [
          "Nav-config could emit subdomain-short URLs (/admin/clients) when running under a demo subdomain — would give cleaner URL bar. Requires context-aware Link wrapper. Defer to CH-wave."
        ]
      }
    ]
  },
  {
    "id": "CF",
    "version": "CF-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "notion peer slices surfaced — 4 NEW catalog entries + adaptation audit",
    "body": "User asked: 'berapa persen pengadaptasian notion clone? berapa slices notion yang sudah terdaftar? tolong update slices features yang notion related, jadi search notion akan muncul list slicesnya.' Audit + fix landed in one wave. AUDIT: upstream notion-page-clone has 37 slices on disk; rr previously had 6 catalog entries tagged `notion-like` (command-menu, icon-picker, notion-blocks, notion-shell, theme-presets, files) — but notion-blocks is a BUNDLE that wraps 4 peer slices (equation, code-block, notifications, database-cell-selection) which existed on disk but had ZERO standalone catalog entries. Search for `notion` / `katex` / `highlight.js` did NOT surface them. ADAPTATION %: catalog entries 6/37 = 16% → 10/37 = 27%; lifted concepts 12/37 = 32%; UI-shareable surface coverage 12/15 = 80% (22 convex-coupled upstream slices remain blocked-pending-adapter per BS-wave audit). FIX: 4 standalone catalog entries added — equation (Notion-style KaTeX block), code-block (Notion-style syntax-highlighted code), notifications (Notion-style per-page Notify Me), database-cell-selection (Notion-style drag-fill + multi-select). Each entry: notion-inspired description, full `notion` + `notion-like` tag set, agentRecipe for AI installers, previewPath, npm + shadcn deps, source pointed at notion-page-clone. Total: 4 new entries × ~22 LOC = 88 LOC. Search now surfaces 10 notion-related slices when typing `notion`.",
    "groups": [
      {
        "heading": "NEW catalog entries (4)",
        "bullets": [
          {
            "text": "equation — Notion-style KaTeX block primitive",
            "slug": "equation",
            "kind": "slice"
          },
          {
            "text": "code-block — Notion-style syntax-highlighted code primitive",
            "slug": "code-block",
            "kind": "slice"
          },
          {
            "text": "notifications — Notion-style per-page Notify Me popover",
            "slug": "notifications",
            "kind": "slice"
          },
          {
            "text": "database-cell-selection — Notion-style drag-fill + multi-select",
            "slug": "database-cell-selection",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Search 'notion' now returns 10 slices",
        "bullets": [
          "command-menu, icon-picker, notion-blocks, notion-shell, theme-presets, files (existing 6)",
          "equation, code-block, notifications, database-cell-selection (NEW 4)"
        ]
      },
      {
        "heading": "Adaptation % — three framings",
        "bullets": [
          "Catalog entries: 10 / 37 upstream slices = 27%",
          "Lifted concepts: 12 / 37 = 32% (treating bundles as multi-concept; notion-shell wraps editor + workspace-sidebar + databases + cover)",
          "UI-shareable coverage: 12 / 15 = 80% (22 upstream slices are convex-coupled and remain blocked-pending-adapter)"
        ]
      },
      {
        "heading": "Remaining blocked (per BS-wave audit, future waves)",
        "bullets": [
          "Convex-coupled (need adapter pattern): admin-panel, ai-agent, analytics, backlinks, comments (rr has own different impl), dashboard, database-csv/json/presets/templates, databases, editor, feedback, inbox, library, snapshots, templates, trash, wiki, workspace-io, workspace-members, workspace-sidebar",
          "Missing shared primitives in rr: responsive-dialog, responsive-alert-dialog (block several lifts)",
          "lucide-react version drift (rr ^1.16 vs notion-page-clone ^0.462) — affects icon-picker variants"
        ]
      }
    ]
  },
  {
    "id": "CE",
    "version": "CE-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "audit-log diff tree — expandable event rows showing before/after JSON",
    "body": "Second per-block depth feature. Audit events that carry a `diff` field (Record<key, {before, after}>) are now CLICKABLE — the row becomes a button, hover-highlights, and on click expands an inline diff tree showing each changed field as a key + before / after pair side-by-side (rose for before, emerald for after, monospace, JSON-stringified for objects / arrays / nulls / numbers / booleans, quoted for strings). Type update: AuditEventRow gains optional `diff?: Record<string, { before: unknown; after: unknown }>` field — mirrors frontend/slices/audit-log AuditEvent shape. Seed update: 4 update events (role editor permissions, page pricing tiers, brand colors, owner transfer) now carry real diff data alongside their diffSummary preview line. Events without diff render as before (no chevron, not interactive). a11y: aria-expanded on the row button, aria-label describes the toggle target. Animation: chevron rotates 180° when expanded via CSS transform transition. Pattern: this is the per-block-depth shape every block can follow — keep the row compact, surface the depth via expansion. Aligns with what a 'real' audit-log impl always has: nobody just wants 'X changed Y'; they want to see what changed.",
    "groups": [
      {
        "heading": "NEW + MODIFIED",
        "bullets": [
          "_shared/admin-panel/blocks/audit-log/diff-tree.tsx — NEW (62 LOC). DiffTree + DiffValue tone-rendered key/before/after grid",
          "_shared/admin-panel/blocks/audit-log/event-row.tsx — row becomes button when diff present; rotates chevron; expands DiffTree below",
          "_shared/admin-panel/blocks/audit-log/types.ts — adds optional diff field to AuditEventRow",
          "_shared/admin-panel/blocks/audit-log/seed.ts — 4 events gain real diff data (role permissions, pricing tiers, brand colors, ownership transfer)",
          "_shared/admin-panel/blocks/audit-log/AuditLogBlockView.tsx — tracks expandedId state, passes expand handlers to EventRow"
        ]
      },
      {
        "heading": "Demo events with diff (clickable)",
        "bullets": [
          "ev_13 — Editor role permissions: +manage:workflows",
          "ev_10 — Pricing tier 2: $99 → $129 + label change",
          "ev_7  — Brand colors: primary + primaryForeground hex swap",
          "ev_2  — Owner role transfer: u_old → u_1 + transferredAt timestamp"
        ]
      },
      {
        "heading": "Pattern lesson",
        "bullets": [
          "Per-block depth: compact row + expandable detail. Replicable for webhooks (full request/response inspect), settings (audit log of own changes), users (per-user role history).",
          "Real impl will reuse DiffTree as-is — the component takes `Record<key, {before, after}>` which matches the audit-log slice's contract."
        ]
      }
    ]
  }
];
