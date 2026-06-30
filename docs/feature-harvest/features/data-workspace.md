# Data Workspace (dynamic tables/rows/publish)

> Harvest verdict: **partial** coverage in rr. The admin *grid UI* overlaps with
> existing slices (`data-table`, `notion-database`), but the **backend engine** —
> a dynamic field-schema content store with a full publish/version/redirect
> workflow — is **net-new**. That engine is the harvest gold and is described
> below in enough depth to rebuild from this file alone.

## What it does (flow)

Instatic stores *everything that looks like a row in a table* — blog posts,
custom post types, product catalogs, form submissions, pages, Visual Components,
arbitrary user collections — in **two tables**: `data_tables` (the schema) and
`data_rows` (the rows). There is no `posts` table, no `pages` table; identity is
carried by `data_tables.kind`.

End-to-end control flow:

1. **Define a table.** An operator creates a `data_tables` row in the Data
   workspace (`/admin/data`). Its `fields_json` holds a `DataField[]` — a
   discriminated union over 15 field types. `kind` (`postType | data | page |
   component | layout`) decides whether the table has built-in fields + a publish
   workflow (`postType`/`page`) or is a plain key-value grid (`data`).
2. **Add rows.** A `data_rows` row stores all cell values in `cells_json` keyed by
   field id. `slug` and `status` are denormalized to top-level indexed columns for
   route/index lookup. Rows are born `draft`.
3. **Edit.** The admin grid (`DataGrid`, read-only spreadsheet) + inspector
   (`RowDetail` cell editor / `TableSettings` schema editor) mutate cells and the
   field schema through the `useDataWorkspace` hook → Convex mutations.
4. **Publish.** `persistRowPublish` (one atomic mutation) allocates the next
   `version_number`, appends a `data_row_versions` snapshot of `cells_json`, flips
   the row to `published`, sets `active_version_id`, and — when the slug changed
   since the last published version — upserts a `data_row_redirects` row so the
   old URL 301s to the new one.
5. **Schedule.** `status='scheduled'` + `scheduled_publish_at` waits for a
   scheduler tick (`listDuePublishSchedules` → publish → flip to `published`).
6. **Serve.** Public routes resolve `routeBase + rowSlug` →
   `publishedDataRowByRoute` (joins table + author + featured-media + publisher),
   falling back through `redirectByRoute`.
7. **Transfer.** Whole-table round-trip via id-preserving import upserts
   (`importUpsert` / `importInsertIfAbsent` / `importReplace`) and export queries.

`personal-brand-os` is the **fixed-schema counterpoint**: its `convex/resources.ts`
is a hand-coded CRUD over a `resources` table with a frozen shape
(`title/description/fileLabel/gated/downloads`). No dynamic fields, no rows-in-a-
generic-store, no publish workflow. It contributes nothing to this feature beyond
showing what the "static array" baseline looks like that the dynamic engine
replaces.

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`):

Backend (the engine — harvest target):
- `convex/dataTables.ts` — `data_tables` CRUD, slug-uniqueness guard, version-number allocator (419 lines)
- `convex/dataRows.ts` — `data_rows` reads/writes, operator-DSL filter, bulk ops, roster reconcile, scheduled-publish lifecycle, import upserts (1153 lines)
- `convex/dataPublish.ts` — `persistRowPublish` / `persistSitePublish`, public-route + redirect lookups, redirect CRUD (942 lines)
- `convex/schema.ts` — `data_tables`, `data_rows`, `data_row_versions`, `data_row_redirects` (+ `site_snapshots`, `published_runtime_assets` for the site-publish half)
- `src/core/data/schemas.ts` — `DataField` TypeBox union (15 types), `DataRowStatus`, `DataTableKind`
- `src/core/data/cells.ts` — typed cell readers + `slugForTable` (slug derivation SSOT)
- `src/core/data/fields.ts` — `normalizeDataTableFields`, built-in field detection
- `src/core/data/duplicateRow.ts` — `buildDuplicateRowCells` (copy naming + slug-collision avoidance)
- `src/core/data/systemTableGuard.ts` — `isBuiltInValueLocked`, `lockedBuiltInCellKey`
- `server/repositories/data/*` — thin Bun pass-throughs to the Convex fns (NOT needed in rr)

Admin UI:
- `src/admin/pages/data/DataPage.tsx` → `components/DataCanvas.tsx` — three-pane shell
- `components/DataGrid/*` — read-only grid: toolbar, view chips, header row, group headers, bulk-action bar, per-type `cells/`, pure `dataGridRows.ts` pipeline, `useDataGridSelection.ts`
- `components/DataInspector/*` — `RowDetail` (cell editor) + `TableSettings` → `FieldsSection` (`FieldRow`, `FieldEditForm`, `fieldGuards.ts`, `fieldEditState.ts`)
- `hooks/useDataWorkspace.ts` (395 lines) — the only state owner; fetch + mutate
- Docs: `docs/features/data-workspace.md`, `docs/features/content-storage.md`

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`):
- `convex/resources.ts` — fixed-schema CRUD (the static baseline, not dynamic)
- `convex/pages.ts` — page-builder blobs keyed by string id (`{ entryId, slug, data }`)
- `convex/schema.ts:89` — `resources` table (5 frozen columns)

## Data model

`data_tables` (the schema row):

| col | type | notes |
|---|---|---|
| `id` | string PK (nanoid, `by_app_id`) | Convex `_id` never leaks |
| `name`, `slug`, `singular_label`, `plural_label` | string | `by_slug` index |
| `kind` | union `postType\|data\|page\|component\|layout` | |
| `route_base` | string | empty = not publicly routable |
| `primary_field_id` | string | display field in grids/pickers |
| `fields_json` | string (opaque `DataField[]`) | parsed in app code |
| `system` | boolean | seeded tables locked from rename/delete |
| `created/updated_by_user_id`, `created/updated_at`, `deleted_at` | | soft-delete |

`data_rows` (the content row):

| col | type | notes |
|---|---|---|
| `id` | string PK (`by_app_id`) | |
| `table_id` | string FK | |
| `cells_json` | string (opaque `Record<fieldId, cellValue>`) | |
| `slug` | string | denormalized; indexes `by_table_slug` |
| `status` | union `draft\|published\|unpublished\|scheduled` | |
| `active_version_id` | nullable string | → `data_row_versions.id` |
| `author/created_by/updated_by/published_by_user_id` | nullable string | 4 user refs |
| `published_at`, `scheduled_publish_at`, `deleted_at` | nullable string | |
| `plugin_actor_id` | nullable string | plugin-write provenance |

Indexes: `by_app_id`, `by_table_slug`, `by_table_updated`,
`by_table_status_updated`, `by_table_author_updated`, `by_scheduled_publish`,
`by_active_version`.

`data_row_versions` (publish snapshot): `id`, `row_id`, `version_number` (monotonic
per row), `cells_json`, `slug`, `published_by_user_id`, `published_at`,
`site_snapshot_id?`, `runtime_assets_json?`. Indexes `by_row_version`, `by_slug`.

`data_row_redirects` (slug-change 301): `id`, `table_id`, `from_route_base`,
`from_slug`, `target_row_id`. Indexes `by_source` (unique-ish on
`[from_route_base, from_slug]`), `by_target`, `by_table`.

**`DataField` union (15 types)** — `text`, `longText`, `richText`, `number`,
`boolean`, `date`, `dateTime`, `select`, `multiSelect`, `url`, `email`, `media`
(→ `media_assets`), `relation` (→ rows in another table, has `targetTableId`),
`pageTree` (visual `NodeTree`), `fieldSchema` (VC params). Common props:
`id`, `label`, `required?`, `description?`, `builtIn?` + per-type options
(`options` on select, `min/max/step` on number, etc.). Cell shapes are documented
inline in `schemas.ts`.

postType built-ins: `title`, `slug`, `body`, `featuredMedia`, `seoTitle`,
`seoDescription` — cannot be renamed/deleted, only enabled/disabled.

Site-publish-only tables (Instatic visual editor, **out of scope for a portable
slice**): `site_snapshots`, `published_runtime_assets`.

## Public API

`convex/dataTables.ts`: `list`, `listWithCounts`, `get`, `getBySlug` (queries);
`create`, `insertIfAbsent`, `update`, `softDelete` (mutations); `nextVersionNumber`
(query). Slug uniqueness enforced by explicit `assertSlugFree` pre-write read
(no DB unique constraint). `softDelete` refuses system tables + tables with live
rows, atomically.

`convex/dataRows.ts`:
- Reads: `list`, `listIdSlugs`, `getById`, `getMany`, `getBySlug`, `count`,
  `listAuthorOptions`, `search` (cross-table slug substring scan),
  `listWithFilter` (operator-DSL: `eq/ne/gt/gte/lt/lte/in/like` over parsed
  cells + row-level keys, JS sort, offset/limit pagination)
- Single writes: `create`, `saveDraft`, `updateDraftCells`, `softDelete`,
  `updateTable` (move row to another table w/ slug-conflict guard), `updateStatus`,
  `updateAuthor`
- Bulk (one atomic mutation each): `createMany`, `saveDraftMany`, `softDeleteMany`
- Roster reconcile: `reconcileRoster` (reap + two-phase slug-park/finalize +
  create/revive — replicates SQL statement order for within-batch slug swaps)
- Scheduled: `schedulePublish`, `cancelScheduledPublish`, `listDuePublishSchedules`
- Import: `importUpsert`, `importInsertIfAbsent`, `importReplace`

`convex/dataPublish.ts`: `persistRowPublish` (version + redirect, atomic),
`persistSitePublish` (site-publish, drop for portable), `publishedPageBySlug/ById`,
`latestPublishedSiteSnapshot`, `listPublishedPageStatus`, `publishedDataRowByRoute`,
`redirectByRoute`, `listPublishedRowRoutes`, `rowTableRouteInfo`,
`rowTableRouteBase`, `listExportableRedirects`, `deleteAllRedirects`,
`importRedirect`.

Every fn declares **both `args` and `returns`** validators, every filter goes
through `.withIndex(...)` (no bare `.collect()` on unindexed paths), every read
filters `deleted_at === null`. This is already rr-grade Convex hygiene.

## UI surface

Admin (Instatic, bespoke — heavy, tightly coupled to the status workflow):
`DataCanvas` three-pane = `DataSidebar` (table list + new-table + import/export) |
`DataGrid` (read-only spreadsheet, status group headers, view chips, bulk bar,
per-type cell renderers) | `DataInspector` (`RowDetail` cell editor switches with
`TableSettings` schema editor → `FieldsSection` drag-reorder/inline-edit/delete +
field classification tiers). Field type is immutable after creation.

Public: route resolver renders postType rows through an authored entry template;
plain `data` tables have no public surface.

## Dependencies

npm: `convex`, `nanoid` (PK generation — droppable in native rr Convex),
`typebox` (`@core/utils/typeboxHelpers` for `DataField` schemas — in rr swap to
the slice's own validators). Admin UI: `@dnd-kit/core` (field reorder), React 19 +
React Compiler, CodeMirror (not core to data-workspace).

rr-slice deps if built: `convex-auth` (for `requireUser`/`requireAdmin`),
optionally `rbac-roles` (the 4 user-ref joins → role names), and for the
**frontend** lean on `notion-database` + `notion-shell` (dynamic property/cell/view
UI) or `data-table` (read-only display) instead of porting Instatic's `DataGrid`.

## rr coverage

**partial.** Existing/related slices and exactly what they cover vs. miss:

- **`data-table`** (`frontend/slices/data-table`, kind `ui`, no convex): generic
  TanStack v8 + shadcn table — sort/search/paginate/select/column-visibility over
  *static typed columns + rows*. Covers the read-only display surface only.
  **Misses everything backend**: no dynamic field schema, no row persistence, no
  publish/versions/redirects, no status workflow. This is the "UI table only"
  gap the hint flagged.
- **`notion-database`** (`frontend/slices/notion-database` + peer `notion-shell`,
  kind `ui`, props-driven, no convex in slice): 18 dynamic property/cell types,
  per-type column-header config, filter/sort/group/calculate, 11 views, row peek,
  multi-select, CSV/JSON import-export. This is the **closest** match for the
  dynamic-schema *frontend* — it already does "user-defined columns of arbitrary
  type + edit cells per type + views". **Misses**: it is purely client-side
  (props in, no Convex backend), no draft/published/scheduled workflow, no
  versioned publish, no slug-redirect, no server-side route resolution.
- **`notion` convex feature** (`convex/features/notion`): persists the whole
  page/database as one JSON blob per slug (`kind "database" → {db, rows}`). No
  normalized rows, no publish workflow, no versions.
- **`pages-cms` convex feature** (`convex/features/pages-cms`): `cmsPages` table,
  `slug + blocks + status(draft|published)`, `by_slug`/`by_status`. Simple
  two-state publish. **Misses**: dynamic field schema, version snapshots,
  scheduled publish, redirects, the generic `data_tables`/`data_rows` store.

Net: the **engine** (dynamic field-schema tables + cells_json rows + version/redirect
publish workflow + scheduled publish + operator filter + bundle transfer) exists in
**no** rr slice. Proposed new slug: **`data-workspace`** (backend-led), reusing
`notion-database` for the grid/property UI.

## Slice plan

**Action: build-new.** Net-new backend engine; frontend reuses an existing slice.

**Laziest correct path (ponytail):**

1. **Build `convex/features/data-workspace`** = port the three Convex files
   verbatim-ish into rr's native-Convex idiom:
   - Use Convex `_id` directly. **Drop the nanoid `id` + `by_app_id` indirection** —
     that whole layer exists only because Instatic's Bun repositories needed a
     stable app PK across the SQL→Convex migration. rr is native Convex; `_id` is
     the PK. (Cuts ~30% of the boilerplate.)
   - Keep `data_tables` (`fields_json`) + `data_rows` (`cells_json`) +
     `data_row_versions` + `data_row_redirects`. **Drop `site_snapshots`,
     `published_runtime_assets`, `persistSitePublish`, the `pageTree`/`fieldSchema`
     field types, and `kind: page|component|layout`** — those are the Instatic
     visual-editor's static-HTML bake; they belong to a separate `site-publisher`
     slice, not the data store. Keep `kind: postType | data` (generic).
   - Keep `persistRowPublish` (versions + redirect + scheduled). This is the
     reusable "any-content publish workflow".
2. **Frontend = reuse `notion-database`** (+ `notion-shell`) as the admin grid +
   property editor; map `DataField[]` ↔ notion `Property[]`. Do NOT re-port the
   bespoke `DataGrid`/`DataInspector`/`FieldsSection` tree — that is 30+ files of
   Instatic-specific status-workflow UI. The `data-workspace` frontend slice ships
   only: the `DataField`/`DataRow` types, the field↔property adapter, and a thin
   `DataWorkspace` page that wires notion-database to the convex fns.

**Portability blockers to strip:**
- Hand-assembled user-ref joins to `users` + `roles` (author/createdBy/updatedBy/
  publishedBy ×4, with `_email/_display_name/_role_slug/_role_name` denorm). Make
  user hydration **injectable** (a `resolveUserRef(userId)` seam) or collapse to a
  bare `authorId: Id<"users">`. Hardcoding `users`/`roles` table names is a lift
  blocker.
- Hardcoded `table_id: 'pages'` literals in `dataPublish` (`publishedPageBySlug`,
  `listPublishedPageStatus`, `listPublishedRowRoutes` exclude/scope on `'pages'`).
  Parameterize the system-table slug.
- `plugin_actor_id` + the `content.entry.created/updated/deleted` hook bus +
  `content.entry.cells` filter — Instatic plugin-system coupling. Drop or gate
  behind an optional `onContentEvent` callback prop.
- TypeBox (`@core/utils/typeboxHelpers`) + `nanoid` deps — swap to rr's own
  `v.*` validators; Convex `_id` removes nanoid.
- `server/repositories/data/*` Bun pass-through layer — not needed; call the
  Convex fns directly from Next.
- `singular_label`/`plural_label`/`route_base` default copy — keep as data, never
  hardcode consumer strings.

**Effort: L.** Even the lazy version (drop site-publish, drop nanoid, reuse
notion-database for UI) is a Large: the row engine alone is ~2000 lines of Convex
with the version/redirect/scheduled/filter/import surfaces, plus the field↔property
adapter and auth/role hydration seam.

**Proposed `slice.json` shape:**

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "data-workspace",
  "version": "0.1.0",
  "category": "data",
  "kind": "fullstack",
  "title": "Data Workspace — dynamic tables, rows & publish",
  "description": "Define field-schema tables (15 field types), store rows in a generic cells_json store, and run a draft/published/scheduled publish workflow with version snapshots and slug-change redirects. Convex backend + thin admin UI (leans on notion-database for the grid).",
  "namespace": "@/features/data-workspace",
  "frontend": { "slicePath": "frontend/slices/data-workspace", "configExport": "dataWorkspaceFeature" },
  "convex": {
    "tablesExport": "dataWorkspaceTables",
    "schemaPath": "convex/features/data-workspace/_schema.ts",
    "rootPaths": ["dataTables", "dataRows", "dataPublish"]
  },
  "deps": {
    "npm": ["convex"],
    "shadcn": ["button", "input", "select", "switch", "dropdown-menu", "dialog"],
    "env": [],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1" },
      { "slug": "notion-database", "range": "^0.18" }
    ]
  },
  "contract": {
    "requires": { "deps": [{ "npm": "convex", "range": "^1.27" }] },
    "provides": {
      "components": ["DataWorkspace", "FieldSchemaEditor"],
      "utils": ["dataFieldToProperty", "slugForTable", "buildDuplicateRowCells"],
      "convex": {
        "tables": ["data_tables", "data_rows", "data_row_versions", "data_row_redirects"],
        "rbac": ["data.tables.manage", "data.rows.write", "data.publish"]
      }
    }
  }
}
```

Backend layout: `convex/features/data-workspace/{_schema.ts, dataTables.ts,
dataRows.ts, dataPublish.ts}` with a `dataWorkspaceTables` export. Frontend:
`frontend/slices/data-workspace/{types.ts, lib/fieldAdapter.ts, components/
DataWorkspace.tsx, config.ts}`. Every mutation gates with `requireUser`/
`requireAdmin` from `convex-auth`; every public query validates args + returns.
