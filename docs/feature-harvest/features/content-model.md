# Content model (pages/posts/portfolio/landing/services/etc)

> Harvest verdict: **partial**. The five named template domains are each already covered by a
> dedicated rr slice (reuse the constellation). The *generalized* content engine — Instatic's
> unified `data_tables` + `data_rows` typed-collection store — is **net-new** and is the only
> real harvest gold here, but it cuts against rr's "compose per-domain slices, don't generalize"
> grain, so it is documented as an optional future engine, not a recommended build.

## What it does (flow)

Two completely different philosophies for the same job ("store typed content rows, publish them"):

- **personal-brand-os (template):** one Convex table *per content type*. `posts`, `portfolio`,
  `services`, `resources` are flat typed tables; `pages` and `landingSections` are blob tables
  (`data: v.any()`) keyed by a frontend string id. Public read = indexed query
  (`listPublished` / `bySlug` / `list`); admin write = `requireUser`-gated `upsert` / `remove`.
  The frontend store adapter maps 1:1 to the localStorage shape it replaced, so each rr section
  slice can render straight off the query result. Flow: admin form → `upsert` mutation
  (requireUser) → table row → public page `useQuery(bySlug)` → section component renders.

- **Instatic (engine):** ONE store for *everything that is a row in a table* — posts, pages,
  components, custom post types, product catalogs, form submissions. Two tables only:
  `data_tables` (the schema/collection definition, discriminated by `kind`) and `data_rows`
  (the rows; cells in `cells_json` keyed by field id). A row's `kind` (`postType | data | page
  | component`) decides which workspace authors it, whether it has a publish workflow, and which
  built-in fields it gets. Flow: admin Content/Data/Site workspace → handler validates cells via
  `content.entry.cells` filter → repo writes `data_rows` → publish path snapshots into
  `data_row_versions` + bakes static HTML → public router resolves `routeBase`+`slug` → entry
  template renders the row. There is **no** `pages` table, **no** `posts` table — only `kind`.

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`):
- Docs: `docs/features/content-storage.md` (the two-table store), `docs/features/content-workspace.md` (the Tiptap admin)
- Schemas: `src/core/data/schemas.ts` (`DataTableSchema`, `DataRowSchema`, `DataField` union, status enum)
- Cell helpers: `src/core/data/cells.ts` (typed readers + `slugForTable`), `src/core/data/fields.ts`
- Row↔domain: `src/core/data/pageFromRow.ts`, `src/core/data/componentFromRow.ts`
- Convex data layer: `convex/schema.ts` + `convex/*.ts` (per docs; repos are thin pass-throughs)
- Server repos: `server/repositories/data/tables.ts`, `server/repositories/data/rows/{read,mutations,bulk,filter,search,schedule,import}.ts`, `server/repositories/data/publish.ts`
- Handlers: `server/handlers/cms/data/`, `server/handlers/cms/{pages,components,publish}.ts`
- Workspace UI: `src/admin/pages/content/{ContentPage,TiptapBodyEditor}.tsx` + `hooks/{useContentWorkspace,useContentEntryDraft,useContentMediaPicker}.ts`
- Markdown round-trip: `src/core/markdown/markdownDocument.ts`
- Content events: `server/publish/contentEvents.ts`, scheduler `server/publish/publishScheduler.ts`

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`):
- `convex/schema.ts` — tables `posts`, `portfolio`, `services`, `resources`, `pages` (blob), `landingSections` (blob), plus `comments`/`leads`/`subscribers`
- `convex/posts.ts`, `convex/portfolio.ts`, `convex/services.ts`, `convex/resources.ts` — typed CRUD
- `convex/pages.ts`, `convex/landing.ts` — blob CRUD keyed by `entryId`/`sectionId`
- `convex/landingContent.ts` — SINGLE-SOURCE seed copy (HERO/STATS/FEATURES/PRICING/FAQS/TESTIMONIALS), framework-pure, imported by both `convex/seed.ts` and `frontend/slices/home/*`
- Frontend: `frontend/slices/{blog,portfolio,services,about,home}` (render off the queries)

## Data model

**personal-brand-os tables** (`convex/schema.ts`):
- `posts`: slug, title, excerpt, body, cover, tag, author, status(`draft|scheduled|published`), publishedAt, views, readMin — `by_slug`, `by_status_publishedAt`
- `portfolio`: slug, title, category, cover, blurb, problem, approach, result, publishedAt — `by_slug`, `by_publishedAt`
- `services`: slug, name, description, priceLabel, period, bullets[], featured, priceNumber? — `by_slug`
- `resources`: title, description, fileLabel, gated, downloads
- `pages`: entryId, slug, **data: v.any()** — `by_entryId`, `by_slug` (page-builder blob)
- `landingSections`: sectionId, **data: v.any()** — `by_sectionId` (landing blob)

**Instatic store** (`src/core/data/schemas.ts`; Convex `*_json` are opaque `v.string()`):
- `data_tables`: id(nanoid PK), name, slug, **kind**(`postType|data|page|component`), singular/plural label, route_base, primary_field_id, **fields_json**(`DataField[]`), system(bool), audit
- `data_rows`: id, table_id→data_tables, **cells_json**(`Record<fieldId, value>`), slug (denormalized for route lookup), status(`draft|published|unpublished|scheduled`), author/created/updated/published `*_user_id`, created_at, updated_at, published_at?, scheduled_publish_at?, deleted_at? (soft delete)
- `data_row_versions`: id, row_id, version_number(monotonic), cells_json snapshot, created_at, created_by — the *published* copy (vs the draft on the row); written on every publish, plus `site_snapshot_id` join for baked HTML
- `DataFieldType` (15): text, longText, richText, number, boolean, date, dateTime, select, multiSelect, url, email, media(→media_assets), relation(→another data_table), **pageTree**(`NodeTree<PageNode>`), **fieldSchema**(VC params). Built-in postType fields: title, slug, body(text), featuredMedia, seoTitle, seoDescription (cannot be renamed/deleted, only enabled/disabled)
- Four seeded system tables pinned at positions 0–3: `pages`(kind page), `posts`(kind postType), `components`(kind component), `layouts` — protected from rename/delete

## Public API

**personal-brand-os** (Convex queries/mutations, mutations gated `requireUser`):
- posts: `listPublished(limit?)`, `listAll()`, `bySlug(slug)`, `upsert(...)`, `remove(id)`, `incrementView(id)`
- portfolio: `list(limit?)`, `bySlug(slug)`, `upsert(...)`, `remove(id)`
- services: `list()`, `upsert(...)`, `remove(id)`
- resources: `list()`, `upsert(...)`, `remove(id)`, `incrementDownload(id)`
- pages: `list()`, `bySlug(slug)`, `upsert(entryId,slug,data)`, `remove(entryId)`
- landing: `list()`, `upsert(sectionId,data)`, `remove(sectionId)`

**Instatic** (REST handlers, generic + typed):
- `GET/POST /admin/api/cms/data/tables[/:id]`, `.../rows[/:id]` — generic data CRUD
- typed `server/handlers/cms/{pages,components}.ts` (batch tree upsert with optimistic `baselinePageIds` concurrency token)
- `PATCH .../rows/:id {status:'published'}` → `publishDataRow`: load draft → insert `data_row_versions` → flip row status → republish dependents → emit `publish.after`
- Repo filter/search surfaces: `listDataRowsWithFilter` (plugin content), `searchDataRows` (spotlight)
- Hook bus events on every write: `content.entry.created|updated|deleted` (+ `actor`), filter `content.entry.cells` (runs over cell bag pre-persist)

## UI surface

**personal-brand-os:** admin CRUD forms per type; public render via rr section slices (BlogList/Card, PortfolioList/Detail, services grid, landing sections). No bespoke editor — flat forms.

**Instatic:** three-pane `AdminWorkspaceCanvasLayout` (explorer / canvas / settings). `ContentPage` →
`TiptapBodyEditor` = ONE ProseMirror doc (NOT a block list) round-tripping markdown via
`markdownToProseMirrorDoc`/`proseMirrorDocToMarkdown`; bubble menu + slash menu (`/`) + notch
quick-actions; write/live canvas modes (live = rendered inside the entry template). `ContentSettingsPanel`
= status/slug/author/collection/SEO/featured-media. `ContentCollectionCreateDialog` spawns custom
post types. Data workspace (`/admin/data`) = raw grid for `kind:'data'` tables + field schema editor.

## Dependencies

- **personal-brand-os:** `convex`, `@convex-dev/auth` (requireUser), `next`, `lucide-react`. Section render: shadcn primitives.
- **Instatic engine:** `@tiptap/*` + ProseMirror (markdown body), `@dnd-kit/core` (data grid/explorer), TypeBox (boundary validation), DOMPurify (richText sanitize at publish), zustand+mutative (editor store), Convex self-hosted. rr-slice deps if reused: `convex-auth` (admin gate), `seo` (`_fields.ts` shared SEO override shape — already reused by `library`).

## rr coverage — partial

Each named domain already has a dedicated rr slice; map is 1:1:

| domain (PBOS) | rr slice | kind | backend packaged? |
|---|---|---|---|
| pages (blob page-builder) | **pages-cms** (`frontend/slices/pages-cms` + optional `convex/features/pages-cms`, table `cmsPages`) | ui + optional convex | yes (opt-in) |
| posts | **blog-section** (`frontend/slices/blog-section`) | ui only | **no — props-driven, consumer wires Convex** |
| portfolio | **portfolio-section** (`frontend/slices/portfolio-section`) | ui only | **no — props-driven** |
| landing/landingSections | **landing-sections** (`frontend/slices/landing-sections`, reducer + provider + section renderers) | ui only | **no — consumer wires store** |
| services | **services** (`frontend/slices/services` + `convex/features/services`, table `services`) | full-stack | yes |
| resources | **library** (`convex/features/library`, kind-union single table) | full-stack | yes |
| pricing / faq / testimonials sub-sections | **pricing-page**, **faq-section**, **testimonials-grid** | ui | n/a |

All registered in `lib/content/slices.ts`. So the *frontend* of every PBOS content type is **covered**;
`services`/`pages-cms`/`library` also ship the Convex backend. Two real gaps:

1. **Backend persistence for posts/portfolio/landing is not packaged** — those slices are intentionally
   pure props-driven server components (`"no Convex tables"` in their slice.json). A consumer who wants
   server persistence hand-writes a ~30-line Convex file (mirror `convex/features/services`). Small,
   deliberate gap.
2. **No generalized content engine.** rr has nothing equivalent to Instatic's `data_tables`+`data_rows`:
   user-defined custom post types, a `DataField[]` field-schema editor, `data_row_versions` history,
   `draft/published/unpublished/scheduled` workflow with a scheduler tick, soft delete, and the
   `content.entry.*` hook bus. The closest is `library` (single table, *fixed* kind union, *fixed*
   optional payload fields) and `pages-cms` (fixed 11-block page model) — both are special-cases of the
   Instatic engine, neither is the generic engine. This is the net-new harvest.

## Slice plan — reuse (laziest correct path)

**Action: reuse the constellation.** The feature as named ("pages/posts/portfolio/landing/services") is
already satisfied by composing `pages-cms + blog-section + portfolio-section + landing-sections + services +
library` (+ `pricing-page/faq-section/testimonials-grid` for sub-sections). Nothing to build for the
template. **Effort: S.**

**Optional enhance (skip unless asked):** add a thin `convex/features/content` backend (tables `posts`,
`portfolio` mirroring the `services` pattern: indexed `by_slug`/`by_status_publishedAt`, `requireAdmin`
mutations, `seo/_fields` reuse) so blog-section/portfolio-section get drop-in persistence. ~M effort.
Ponytail: don't — the props-driven design is the point; the consumer's 30-line Convex file is cheaper than
maintaining a half-opinionated backend slice.

**Optional net-new engine (`content-model`), L, against the grain — document only:** a portable
`data_tables`+`data_rows` typed-collection store for someone who wants WordPress-style custom post types.
Would ship `convex/features/content-model` (3 tables + field-schema validators + version-on-publish +
scheduler + content-event hook seam) and `frontend/slices/content-model` (collection list, `DataField[]`
schema editor, generic row form switching on field type, optional Tiptap markdown body). This generalizes
five existing slices into one engine — high value but high blast radius and explicitly *not* how rr
decomposes content today, so it stays a proposal, not a default.

**Portability blockers (must strip if any backend is lifted from PBOS):**
- Hardcoded Indonesian seed copy + `/contact` hrefs in `convex/landingContent.ts` → props/seed-injection, never baked in.
- `requireUser` auth gate (any authed user can write) → rr standard is `requireAdmin(ctx)` from `convex-auth`/`rbac-roles`.
- `data: v.any()` untyped page/landing blobs → either a validated shape or the documented opaque-blob contract (Instatic does this deliberately for `cells_json`; PBOS does it without the discipline).
- `comments.postId: v.id("posts")` cross-table FK → couples comments to the posts table; a portable content slice must not hard-reference a sibling table's `_id`.
- 1:1 localStorage-shape coupling in the store adapter — fine for the template, must become an injected adapter for a slice.

### Proposed slice.json (only if the net-new engine is ever built)

```jsonc
// frontend/slices/content-model/slice.json
{
  "slug": "content-model",
  "version": "0.1.0",
  "category": "content",
  "kind": "fullstack",
  "title": "Content Model — typed custom collections",
  "description": "Generic data_tables + data_rows store: user-defined collections (kind postType|data|page|component), a DataField[] schema editor (15 field types incl media/relation/pageTree), draft/published/scheduled/unpublished workflow with version history + scheduler, soft delete, and a content.entry.* hook seam. Generalizes blog/portfolio/services/pages into one engine. Backend packaged; admin field-schema + row editor UI; markdown Tiptap body optional.",
  "namespace": "@/features/content-model",
  "frontend": { "slicePath": "frontend/slices/content-model", "configExport": "contentModelFeature" },
  "convex": {
    "tablesExport": "contentModelTables",
    "schemaPath": "convex/features/content-model/_schema.ts",
    "rootPaths": ["convex/features/content-model"]
  },
  "deps": {
    "npm": ["convex@^1.16.0", "@tiptap/react", "@tiptap/starter-kit"],
    "shadcn": ["table", "input", "textarea", "select", "switch", "dialog", "badge", "button"],
    "env": [{ "name": "SUPER_ADMIN_EMAIL", "scope": "convex", "required": false }],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1", "reason": "requireAdmin gate on every mutation." },
      { "slug": "seo", "range": "^0.1", "reason": "Reuse seoFieldsShape for built-in SEO override fields." }
    ]
  },
  "contract": {
    "provides": {
      "convex": { "tables": ["dataTables", "dataRows", "dataRowVersions"], "rbac": ["admin"] },
      "components": ["CollectionsView", "FieldSchemaEditor", "RowForm", "RowBodyEditor"],
      "utils": ["readCell", "slugForTable", "normalizeFields"],
      "hooks": ["useCollection", "useRowDraft"]
    }
  }
}
```

Convex backend would live at `convex/features/content-model/` with `_schema.ts` (3 tables, opaque
`*_json` strings), `query.ts` (`listTables`, `listRows withIndex.take/paginate`, `rowBySlug`),
`mutation.ts` (`createTable`/`createRow`/`saveDraft`/`publish` [writes `dataRowVersions`]/`schedule`/
`softDelete` — all `requireAdmin`, all args validated `v.*`, every filter indexed), and a `events.ts`
seam for the `content.entry.*` hooks.
