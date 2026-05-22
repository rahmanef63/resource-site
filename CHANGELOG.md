# CHANGELOG

Release history for the Rahman Resources monorepo. Tracks the rr site,
canonical slices, templates, CLI, and MCP server.

Format: keep-a-changelog-ish. Per-release sections list **CLI**, **Slices**,
**Templates**, and **Site** changes where applicable. The CLI version is
the user-facing handle (`npx rahman-resources@x.y.z`).

---

## [Unreleased]

### v0.5.2 (open-silong sync) — 2026-05-22 — PROPERTY_TYPE_META SSOT registry

Closes type-list drift discovered during cross-slice audit. Three
places hardcoded `PropertyType[]` arrays with mismatched counts
(ColumnHeaderMenu: 10, csv-mapping NEW_TYPES: 12, types.ts union: 16).
Adding a new type (v0.6 relation/rollup) would have required syncing
all 3 sites — high drift risk.

- **New** `notion-shell/property-type-meta.ts` (65 LOC) — `PropertyTypeMeta` interface + `PROPERTY_TYPE_META` registry (one entry per type with `label / category / userAddable / csvImportable / computed` flags) + derived `PROPERTY_TYPES_USER_ADDABLE` (16) + `PROPERTY_TYPES_CSV_IMPORTABLE` (12) constants.
- **Refactored** `notion-database/components/ColumnHeaderMenu.tsx` — drops local `PROPERTY_TYPES` array; reads `PROPERTY_TYPES_USER_ADDABLE` + `PROPERTY_TYPE_META[t].label` from `@/features/notion-shell`. Now exposes ALL 16 user-addable types (was 10) — users can now add files / person / formula / created_time / last_edited_time / unique_id columns via the menu.
- **Refactored** `database-io/components/csv-mapping.tsx` — `NEW_TYPES` const stays as deprecated re-export of `PROPERTY_TYPES_CSV_IMPORTABLE` (back-compat); render loop reads from canonical list + uses `PROPERTY_TYPE_META[t].label` (was raw type name).
- **Adding new type** (e.g. v0.6 relation) now requires one edit (`property-type-meta.ts`) + the cell impl — every picker auto-discovers.
- Cell editor SSOT unchanged: `notion-database/components/cells/` is still the only source. database-io re-uses via `renderPropertyCell` re-export, no duplication.
- Open-silong typecheck + rr typecheck green. All files ≤ 200 LOC (types.ts split forced a sibling file to stay under the pre-commit gate).

### CK-1D — 2026-05-20 — workspace-shell slice (NavContext primitive)

New canonical slice `frontend/slices/workspace-shell/` + `convex/features/workspaceShell/` — atomic `(workspaceId, menuSetId)` NavContext, supersedes silo'd `menu-store` + `workspace-store` editors.

- **7 Convex tables** prefixed `workspaceShell_`: `menuSets`, `menuItems`, `itemComponents`, `wsAssignments`, `userAssignments`, `rolePerms`, `navContext`.
- **Resolver chain** (server): user cache → user assignment → workspace default → system default. Single round-trip via `getNavContext`.
- **Editor** at `/dashboard/workspace-shell?tab=menus|tree|settings` — FeatureShell.tabs primitive, URL-routed.
- **WorkspaceSwitcher v2** — 2-tier dropdown (workspace × menuSet) + inline `ForkMenuSetDialog`. Mounts via `<NavContextMount>` inside `WorkspaceProvider`.
- **Sidebar dual-read** — `useNavItems` prefers NavContext via `toLegacyMenuItems` adapter; falls back to legacy when empty (zero break for consumers w/o migration).
- **Tiered RBAC** — `menus.manage` (admin set/CRUD) + `menus.fork` (user fork-from-system).
- **Idempotent migration** `migrations/menusToWorkspaceShell:up` — in-memory map to dodge Convex 4096 read-op limit. Tested: 56 menuSets + 1106 menuItems + 56 wsAssignments. Rerun = all skipped via `metadata.__legacyId` stamp.
- **30-day deprecation shims** — legacy `/dashboard/menu-store` + `/dashboard/workspace-store` wrapped w/ `DeprecationBanner` countdown. Hard-removal runbook at consumer's `docs/cleanup/2026-06-19-workspace-shell-cleanup.md`.
- Catalog: 46 → 47 slices.

**Consumer-test findings (2026-05-22, content-rahmanef-com)**:

- 🐛 **CLI install empty** — `npx rahman-resources add workspace-shell` created empty dirs because template-base mirror not yet pushed to remote rr. CLI fetches from GitHub `main`; local catalog edits don't reach `gen-manifest` until commit lands. *Fix: stage `template-base/frontend/slices/workspace-shell/` + `template-base/convex/features/workspaceShell/` then push.*
- 🐛 **8 hard SuperSpace deps** — slice imports `@/frontend/shared/{lib/features/defineFeature, foundation/provider/WorkspaceProvider, ui/components/ResponsiveDialog, ui/layout/feature-shell/FeatureShell, foundation/utils/convex/any-api, preview, settings, ai/agent}`. Consumer without a `frontend/shared/` tree = unmountable.
- ✅ **3 working deps** — `@/lib/utils` (`cn`), `@/components/ui/{dropdown-menu, button, input, label, switch}` (standard shadcn paths).
- ✅ **Migration consumer-safe** — idempotent + legacy tables untouched + shim banner preserves old URLs.

**Lift-up work pending** (P0 for portability):
1. Inline or slice-local `defineFeature` helper.
2. Replace `WorkspaceProvider` with prop `workspaceId: Id<...>`.
3. Drop `FeatureShell` wrapper — emit plain `<Tabs>` (one less primitive dep).
4. Drop `any-api` cast — consumer Convex types may differ; ship slice-local `api.d.ts` shim or accept TS2589 risk.
5. Drop `defineFeaturePreview` registration (SuperSpace-only registry).
6. Drop `subAgentRegistry` (`agent/index.ts`) — SuperSpace-only AI surface.
7. RHF + Zod check on `ForkMenuSetDialog` — currently no validator.

Status: shipped to SSOT (superspace, commits `be72cd99`…`ee7dd006`). Catalog entry shipped (`lib/content/slices.ts` + `lib/content/changelog.ts`). Template-base mirror **uncommitted** — pre-commit hook blocked by pre-existing tsc errors in `lib/shared/store/*` (`a0d1f3f` database-json sweep) referencing `@convex/_generated/*` which tsconfig excludes. **Resolve upstream before pushing mirror.**

### CK-J — 2026-05-21 — database-json standalone slice

- New peer slice `frontend/slices/database-json/` — JSON wire format v1 (schema + rows) for notion-database.
- **JsonActions** — dropdown w/ Export (Blob-URL download) + Import.
- **JsonImportDialog** — file picker → schema diff preview → submit.
- **lib/serialize.ts** — exportDatabase / parseExport / diffSchema / buildImportResult / downloadJson.
- Schema match: property name (case-insensitive) + exact type. Mismatched listed as new.
- **Result shape MIRRORS CsvImportResult** — single host onImport handler can serve both formats.
- Dropped vs upstream: AI assist (AIAssistDialog + lib/ai.ts), cover, blocks, sub-items, templates.
- Preview `/preview/slices/database-json` — 3-row demo + Export downloads .json + Import + collapsible wire-format viewer.
- Catalog: 45 → 46. JSON 0% → 100%. Database adaptation ~80% → ~82%.

### CK-1C — 2026-05-21 — notion-database FormView (11/11 views)

- **FormView** lifted — title input + per-property inputs via reused `renderPropertyCell` (no separate PropertyFormInput widget), submit → `onRowCreate({title, rowProps})` callback. Settings panel (show/required toggles + title + description + success message).
- **ViewProps** + **NotionDatabaseProps** + **DatabaseViewConfig** extended (onRowCreate / formTitle / formDescription).
- VIEW_REGISTRY now has all 11 entries.
- notion-database `0.3.0` → `0.4.0`. Coverage: views 10/11 → 11/11 (100%). Adaptation ~76% → ~80%.
- Preview /preview/slices/notion-database uses React state so Form submit actually appends a row.

### CK-4 — 2026-05-21 — database-csv standalone slice

- New peer slice `frontend/slices/database-csv/` — Notion-style CSV import + export for `notion-database`.
- **CsvActions** — dropdown w/ Export (Blob-URL download) + Import items.
- **CsvImportDialog** — file picker → auto-map columns → user re-pick (existing prop / Title / skip / + New of 12 types) → submit emits single `onImport({newProperties, rows})` callback. Host owns persistence.
- **csv.ts** — `parseCsv` / `valueFromString` / `exportDatabaseToCsv` / `downloadCsv` helpers exported standalone.
- Auto-seeds select / multi_select / status options from CSV values. Computed types (formula / created_time / last_edited_time / unique_id) recognised + never written.
- Preview `/preview/slices/database-csv` — 3-row demo w/ working in-memory Export + Import.
- Catalog: 44 → 45 slices. CSV coverage 0% → 100%. Database adaptation ~72% → ~76%.

### CK-3 — 2026-05-21 — notion-database +6 property cells

- New cells: **FilesCell** (paste-URL chips), **PersonCell** (initials avatars), **FormulaCell** (expression engine w/ live preview), **CreatedTimeCell** + **LastEditedTimeCell** (readonly system timestamps), **UniqueIdCell** (auto-derived).
- New `lib/formula.ts` — `{{title}}` / `{{prop}}` interpolation + fn(arg, …) + `=expr` math. Pure, no backend.
- PropertyType: 10 → 16 (+ person, files, formula, created_time, last_edited_time, unique_id).
- Property: + formulaExpression?, + uniqueIdPrefix?. Database: + uniqueIdCounter?.
- Existing select / multi_select extracted to dedicated cells for ≤200 LOC budget.
- notion-database `0.2.0` → `0.3.0`. Coverage: 16/17 property types (94%). Adaptation ~65% → ~72%.
- Deferred: relation + rollup (need cross-DB context — wait for upstream mega-bundle).

### CK-wave — 2026-05-21 — notion-database 10/11 views + Filter/Sort builders

- **CK-1A** (`a7532da`) — Lifted **ChartView** (recharts) + **DashboardView**. Views 6→8/11. DatabaseViewConfig extended with chart/dashboard fields. ChartKind + ChartAggregate exported.
- **CK-1B** (`e742c10`) — Lifted **MapView** (SVG world + lat/lng pins) + **TimelineView** (Gantt drag-to-shift). Views 8→10/11 (91%). New helpers: visibility / format / keyboard / timeline-helpers / map-svg.
- **CK-2** (`7b81d41`) — Lifted **FilterBuilder** + **SortBuilder** (shadcn-Select-based). ViewOptions refactored to delegate. Coverage: filter/sort UI 0→100%.
- **CK-final** — notion-database `0.1.0` → `0.2.0`. recharts npm dep added. Catalog title/description/tagline/tags refreshed.
- **Adaptation**: notion-database ~35% → ~65% upstream parity.
- **Deferred**: CK-1C (FormView), CK-3 (file/person/timestamp cells), CK-4 (database-csv standalone). All wait for upstream mega-bundle (Phase 5, ~3wk).

### CJ-wave — 2026-05-21 — Catalog cleanup

- **Deleted** `frontend/slices/pages/` — dead `defineFeature` skeleton (routes:[], zero live imports).
- **Dropped** `notion-blocks` catalog entry — pure re-export aggregator of 4 atoms (equation / code-block / notifications / database-cell-selection). Atoms remain individually catalogued; slice dir + barrel kept so consumer imports still resolve.
- **Deleted** `app/preview/slices/notion-blocks/page.tsx` preview route.
- **Retitled** `theme-presets` → "tweakcn Theme Loader (30+ presets)" — disambiguate from `theme-preset-switcher` (Convex-backed OKLch). No file moves.
- **Template** `notion-page-clone/shared/nav-config.ts` link `/slices/notion-blocks` → `/slices/notion-shell` to avoid catalog detail 404.
- Catalog count: 45 → 44 slices.
- **Deferred**: notion atom consolidation waits for upstream `notion/` mega-bundle (open-silong Phase 5, ~3wk per `docs/rr-sync/2026-05-21-notion-mega-lift-plan.md`).

---

## [1.7.0] — 2026-05-18

Live on npm: `rahman-resources@1.7.0`, `rahman-resources-mcp@1.1.0`,
`rahman-shared@0.2.0`.

### Slices — 7 new canonical UI slices

R + S + T waves added the missing marketing-page primitives so every
template consumes one SSOT per surface (pricing, features, FAQ,
testimonials, blog, changelog, portfolio).

- **`pricing-page`** — `PricingSection` + tiers + optional FAQ. Three
  `featuredVariant` styles (`ring` | `scale` | `tint`).
- **`feature-grid`** — `FeatureGridSection` with 4 layouts: `cards`,
  `minimal`, `alternating` (image+text rows), `grouped` (sub-categorized).
- **`faq-section`** — `FAQSection` accordion with `single`, `two-column`,
  `grouped` layouts + optional footer CTA.
- **`testimonials-grid`** — `TestimonialsGridSection` with `cards`,
  `quote-stack`, `masonry` layouts. Star ratings + avatars + featured ring.
- **`blog-section`** — `BlogListSection` (cards/list/featured-split) +
  `BlogPostView` (cover/meta/body/related). Routing left to consumer via
  `hrefFor`.
- **`changelog-feed`** — `ChangelogFeedSection` with timeline / cards /
  list layouts. 5 entry kinds (feature/improvement/fix/chore/breaking) +
  optional sub-grouped bullets per entry.
- **`portfolio-section`** — `PortfolioListSection` (uniform/masonry/
  asymmetric) + `PortfolioDetailView` (cover/sections/gallery/related).

### Slices — slot extensions (U-wave)

Each canonical section now accepts a render-slot to keep template-specific
customization without forking the slice:

- `PricingSection.renderTierCta(tier)` — replace default Link CTA with a
  modal trigger, custom button, etc.
- `PortfolioItem.sections[]` — structured `{ heading, body }[]`. Auto-grid
  by length (2→2col, 3→3col).
- `BlogPostView.afterContent` — comments / newsletter signup slot.
- `BlogPostView.extraMeta` — view counter / read-time next to author.
- `BlogPostView.related` + `hrefForRelated` — related-posts strip.

### Templates — full SSOT migration

All 4 marketing templates now consume the canonical slices end-to-end:

| Template | Pages migrated |
|---|---|
| `saas-marketing-os` | /pricing, /features, /blog, /blog/[slug], /changelog, home sub-sections |
| `agency-studio-os` | /services (→ pricing-page), /portfolio, /portfolio/[slug] (sections) |
| `personal-brand-os` | /services (renderTierCta), /portfolio, /portfolio/[slug] (sections), /blog, /blog/[slug] (afterContent), inline FAQ → faq-section |
| `wirausaha-os` | /services (→ feature-grid grouped) |

Templates retained as intentionally bespoke (would lose semantic
information on migration): `konsultan-os` (newsletter archive),
`kreator-studio-os` (progress-bar UI), `riset-kit` (document library).

### Layout — three-column V-wave

Ported `ThreeColumnLayoutAdvanced` updates from superspace:

- **PanelSection compound** (Header / Items / Footer) + `PanelGroup` /
  `PanelGroupLabel` / `PanelMenu` / `PanelMenuItem` / `PanelMenuButton` /
  `PanelSeparator` primitives. Models shadcn sidebar API.
- **Trigger ≠ Header rule** — collapse trigger always renders when
  enabled; `leftHeader` chrome row now renders BELOW the trigger instead
  of replacing it.
- **Footer slots** — `leftFooter`, `centerFooter`, `rightFooter` props on
  `ThreeColumnLayoutAdvanced` + `sidebarFooter` / `mainFooter` /
  `inspectorFooter` on `FeatureThreeColumnLayout`.
- **Mobile drawer** — `MobileInspectorDrawer` accepts `header` + `footer`
  slot props so mobile path mirrors desktop chrome.
- Both copies kept in sync — template-base canonical (verbatim from
  superspace) + components/previews superset (`tone="layout"|"feature"`
  blue/muted variants preserved).
- Doc: `docs/architecture/three-column-layout.md`.

### Site — live previews (W-wave)

Each of the 7 new slices now has `/preview/slices/<slug>` with a layout
toggle and realistic seed data. The catalog page `/slices/<slug>` shows
an iframe instead of metadata-only.

### CLI

- Bumped to **1.7.0**.
- Manifest regenerated — 45 slices total (up from 32).
- MCP server bumped to **1.1.0** with refreshed slice resources.

---

## [1.6.x] — Q-wave (May 2026)

### Slices — generic CRUD primitives

`<CrudListView>` + `<CrudFormView>` + typed `CrudController<T>` /
`ColumnDef<T>` / `FieldDef<T>`. Replaced per-template bespoke admin tables
with shared primitives.

### Templates — 25 entities migrated

- saas-marketing: 6 CRUD + 2 new admin views + hybrid propagation
- konsultan-os, wirausaha-os: 6 entities each
- riset-kit: 5 entities
- agency-studio: Clients + Leads
- personal-brand: Leads + Newsletter + Comments + Chatbot
- kreator-studio: Comments + Performance

---

## [1.5.x] — P + O waves (Apr 2026)

### Templates — Pages CRUD on all 7

Shared `_shared/pages/` infra + `PagesView` + `PageEditorView` propagated
to every website template. `audit-templates.mjs` hard-errors if a
website-template ships without Pages CRUD.

### Posts editor

Full route + reducer + form for `saas-marketing-os`. Background fix:
sidebar bg color loss in split preview.

---

## [1.4.x] — M + N waves (Apr 2026)

### Site — security + infra (M-A)

- Rate-limit on public mutations.
- Strict CSP / `X-Content-Type-Options` / `Referrer-Policy` /
  `Permissions-Policy` headers.
- `isHidden` admin wiring.
- Env-var hygiene (no NEXT_PUBLIC_ leak of sensitive values).

### Site — Next.js primitives (M-B)

`next/link` everywhere, `next/image`, typed `catch (e: unknown)`,
`DateField` for date inputs across template-base.

### Site — preview design-system canon (M-C)

Single SSOT for preview chrome — zero drift between `/preview/*` pages.

### Site — UI/UX overwhelm reduction (M-D)

Sidebar grouping — 38 flat slices → 11 collapsible categories.

### Convex — per-feature canonical shape (N-C)

`_schema.ts` + `query.ts` + `mutation.ts` + `action.ts` per feature.

### Templates — defaults sweep (N-A)

90% zoom + public default for 7 website templates.

---

## [1.3.x] — L + K waves (Mar 2026)

- CLI publish prep — bumped 1.5 → 1.6 with audit chain self-doc.
- Consumer install REAL test (local CLI → /tmp).
- `.env.example` per-slice augment in CLI add flow.
- Schema unification (`oneOf SchemaA SchemaB`).
- pre-commit hook expanded to run full audit chain.
- `/llms.txt` + `agentPrompt` verification + catalog completeness audit.

---

## [1.2.x] — H + I + J waves (Feb 2026)

- Modernized install snippet → `npx rr init` flow.
- Fixed `template-base/package.json` `$HOME` leak.
- Catalog drift fixes (5 ai-* + platform-admin + 2 landing).
- `sync-slice-manifests` handles both schemas.
- 75 lint warnings → 0.

---

## [1.1.x] — E + F + G waves (Feb 2026)

- **200-LOC modularity rule** + `audit-file-size.mjs` guard.
- Refactored 8 top shipped-code offenders + drove grandfather list 35 → 0.
- Expanded `audit-file-size` SCAN_ROOTS + refactored 7 newly-discovered
  offenders.
- 15 missing slice/template READMEs written.
- F4: TEMPLATE/SLICE distinction in audit guard.
- F3: backfilled validators on all public Convex fns. Bounded
  `admin/queries.ts` with `.take(LIMIT)`.

---

## [1.0.x] — D + B waves (Jan 2026)

- D-wave: site-level raw-HTML audit. Convex authn+authz audit on every
  public mutation. Server Action authn+authz audit. Schema index validity.
  Extended `audit-templates` to cookbook + convex-templates.
- B-wave: fixed title-mismatch warnings, wrapped 39 raw `<button>` →
  shadcn `Button` across block-demo templates + 8 in slices. Pre-push hook
  installed. Extracted hardcoded MCP URL → env.

---

## Pre-1.0 — Initial scaffolding

Initial wave: 30+ slices, 12+ templates, MCP server scaffold, BSDL
(removed in P+ waves), validation chain, copy-first CLI install pattern.

---

## Conventions

- Versions are CLI versions on npm (`rahman-resources@x.y.z`).
- MCP versions advance independently — see `packages/mcp/package.json`.
- Wave letters (A-Z) are internal session labels — not user-facing
  identifiers. Use the CLI version above when referencing a release.
- Auto-ship policy: main is always shippable. Tags are cut at CLI publish
  time, not per wave.
