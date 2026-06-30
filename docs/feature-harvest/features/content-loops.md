# Content Loops / repeaters

> Harvest target slug: `content-loops` · Coverage verdict: **net-new** (harvest gold — Instatic engine feature)

The `base.loop` engine in Instatic: a pluggable **repeater** that iterates a
data source and renders a child template (a "variant") per item. Powers post
listings, product grids, related-articles sections, media galleries, nav menus,
sitemaps — anything that displays a collection. The genuinely portable nugget is
the **loop-source registry + LoopItem contract + round-robin variant render +
prefetch + injectable data adapter + infinite-load runtime**. The publisher
coupling (HTML-marker import, layered render cache, clean-HTML emit) is
Instatic-internal and should be left behind as a host seam.

## What it does (flow)

End to end, publish-time deterministic:

1. **Author** drops a `base.loop` node into a page on the visual canvas (or the
   AI agent inserts an `<instatic-loop>` HTML marker that the importer maps to a
   `base.loop` node). They pick a `sourceId` (`data.rows` / `site.pages` /
   `site.media` / `plugin.foo`), set filters + orderBy + direction + limit +
   pagination mode in the Properties panel, and drop **N child subtrees** inside
   the loop — each child is a **variant** (e.g. "Featured", "Standard").
2. **Prefetch (server, publish time)** — `prefetchLoopData()`
   (`server/publish/loopPrefetch.ts`) walks the page tree (descending into
   Visual-Component definition trees too), collects every `base.loop` node,
   looks up its registered `LoopEntitySource` in `loopSourceRegistry`, and calls
   `source.fetch(ctx)` for each — **in parallel**. Results are stored in a
   `Map<loopNodeId, ResolvedLoopData>` (items + totalItems + pageNumber +
   hasMore). Errors per loop are swallowed (one bad loop never crashes the page).
3. **Render (server, synchronous)** — the publisher's `renderLoop()`
   (`src/core/publisher/renderLoop.ts`) reads the prefetched data for the loop
   node (no I/O at render time). For each item `i` it picks variant
   `children[i % children.length]` and renders that subtree against a **fresh
   per-iteration `entryStack` snapshot** `[...baseStack, item]`. Dynamic bindings
   inside the body (`{currentEntry.title}`, `currentEntry.featuredMedia`, …)
   resolve against the top of that stack. The stack is never mutated in place, so
   nested loops / VC refs see a stable per-item snapshot. Output is joined HTML
   wrapped in an author-selectable tag (`div`/`ul`/`nav`/…) carrying the loop's
   classIds + inline styles.
4. **Pagination** — `pagination: 'none'` emits up to `limit` items, no JS.
   `pagination: 'infinite'` emits `pageSize` items + a `data-instatic-loop`
   sentinel, registers the loop id in `acc.infiniteLoopIds` so the publisher
   injects a <2 KB ES-module runtime (`loopRuntime.ts`). On "Load more" click the
   runtime fetches `/_instatic/loop/<loopId>?page=N`
   (`server/handlers/cms/loop.ts`), which re-runs `source.fetch()` for that slice,
   renders just the variants, and returns `{ html, hasMore, pageNumber }`; the
   runtime appends the HTML before the button.
5. **Editor canvas preview** — `useLoopPreviewItems`
   (`src/admin/pages/site/canvas/useLoopPreviewItems.ts`) mirrors the same
   filter→orderBy→direction→offset→limit pipeline so the canvas previews REAL
   entries (capped at 6, `CANVAS_MAX_ITEMS`). `site.pages` shares the exact
   `pageToLoopItem` + `filterPagesForLoop` projection with the publisher via the
   `@core/loops` barrel — parity is test-gated.

The decisive design move: **sources are stateless** and receive everything via
`ctx`; **data access is an injected port** (`@core/loops/dataAdapter`), so the
source files live in `src/core` free of server-only/Convex imports and the same
`fetch()` runs in both publisher and editor.

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`):

```text
src/core/loops/
├── index.ts            — public barrel: LoopItem type + pageToLoopItem + filterPagesForLoop
├── types.ts            — LoopEntitySource, LoopItem(Schema), LoopSourceField, LoopFetchResult,
│                          SourceFetchContext, SourceRequestContext, ILoopSourceRegistry
├── registry.ts         — LoopSourceRegistry singleton (`loopSourceRegistry`), namespaced-id guard
├── dataAdapter.ts      — INJECTED PORT: LoopDataAdapter (dataRowLoop / resolveMediaPaths /
│                          mediaItems) + setLoopDataAdapter/getLoopDataAdapter; record types
└── sources/
    ├── index.ts        — registerOrReplace the three built-ins at import
    ├── dataRows.ts     — `data.rows` source (post-type active-version OR data-kind rows)
    ├── sitePages.ts    — `site.pages` source (in-memory SiteDocument; exports pageToLoopItem)
    └── siteMedia.ts    — `site.media` source (media_assets, mime-prefix filter)

src/modules/base/loop/
├── index.ts            — base.loop ModuleDefinition (LoopPropsSchema, publishBehavior:'special')
└── LoopEditor.tsx      — canvas preview component (emits same data-instatic-loop attrs)

src/core/publisher/renderLoop.ts   — render-time walker (round-robin variants, per-iter snapshot)
server/publish/loopPrefetch.ts     — collectLoopNodes + prefetchLoopData + readLoopProps +
                                      publishedDataRowToLoopItem + canonicalRenderQuery
server/publish/loopRuntime.ts      — LOOP_RUNTIME_JS browser ES module for infinite load
server/handlers/cms/loop.ts        — GET /_instatic/loop/<id> live-fetch endpoint + runtime asset
server/loops/adapter.ts            — registerLoopDataAdapter() wires the port to convex/loops.ts
convex/loops.ts                    — queries: dataRowLoop, mediaPaths, mediaItems
src/admin/pages/site/canvas/useLoopPreviewItems.ts — editor canvas preview hook
docs/features/loops.md             — authoritative 600-line feature doc (read it)
Gate tests: src/__tests__/loops/{sitePagesLoopItemParity,loopPreviewItemStability}.test.ts
            src/__tests__/architecture/{loop-source-id-format,loop-source-sql-safety}.test.ts
```

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`):
no loop engine. Only hardcoded static list components — `components/blocks/FeatureGrid.tsx`,
`frontend/slices/blog/BlogList.tsx`, `frontend/slices/portfolio/PortfolioListPage.tsx`,
`frontend/slices/_shared/crud/CrudListView.tsx`, the `notion-database` views
(ListView/BoardCard/FeedView). These `.map()` over a fixed prop array — no source
registry, no pluggable backend, no variants. Not a source for this harvest beyond
confirming the gap.

## Data model

The loop engine owns **no tables** — it reads through the injected
`LoopDataAdapter`. In Instatic the adapter is backed by these existing Convex
tables (`convex/schema.ts`), via `convex/loops.ts`:

- **`data_tables`** (`by_app_id` on `id`) — `id, slug, route_base, kind` (`'data'`
  vs post-type), `deleted_at`. Picks the dispatch path.
- **`data_rows`** (`by_app_id`, `by_table_updated`, `by_table_status_updated` =
  `[table_id, status, updated_at]`, `by_active_version`) — `id, table_id,
  cells_json (string), slug, status, active_version_id, author_user_id,
  created_at, updated_at, published_at, deleted_at`.
- **`data_row_versions`** (`by_app_id`) — `id, row_id, version_number,
  cells_json, slug, published_by_user_id, published_at, created_at`. The post-type
  path joins each published row to its ACTIVE version (drops rows whose active
  version is missing — SQL inner-join parity).
- **`media_assets`** (`by_app_id`, `by_deleted` on `deleted_at`) — `id, filename,
  mime_type, size_bytes, public_path, uploaded_by_user_id, created_at`.
- **`users` / `roles`** (`by_app_id`) — joined for author/publisher display name +
  role (`userCols` cache to avoid N+1).

The **portable contract** (what a slice should own) is just three shapes
(`src/core/loops/types.ts`):

```ts
interface LoopItem { id: string; fields: Record<string, unknown> } // resolved values, never raw ids
interface LoopFetchResult { items: LoopItem[]; totalItems: number } // total across all pages
interface LoopSourceField { id: string; label: string; format?: 'plain'|'html'|'url'|'media' }
```

`base.loop` node props (`LoopPropsSchema`, `src/modules/base/loop/index.ts`):
`{ sourceId, filters: Record<string,unknown>, orderBy, direction:'asc'|'desc',
limit, offset, pagination:'none'|'infinite', pageSize, tag, customTag }`.

## Public API

- **Registry**: `loopSourceRegistry` — `register / registerOrReplace /
  unregister / get / getOrThrow / has / list`. Namespaced-id guard
  (`id.includes('.')`) blocks plugins shadowing built-ins.
- **Source contract**: `LoopEntitySource = { id, label, description?, fields[],
  filterSchema (PropertySchema), orderByOptions[{id,label}], fetch(ctx) =>
  Promise<LoopFetchResult>, preview(ctx) => LoopItem[], requestDependent?,
  perVisitor? }`.
- **Convex queries** (`convex/loops.ts`, all `v.*`-validated, indexed,
  `.withIndex` not bare collect on the hot path):
  - `dataRowLoop({ tableId, orderBy, direction, limit, offset })` →
    `{ kind, postRows[], dataRows[], total }` (dispatch by table kind).
  - `mediaPaths({ ids: string[] })` → `Record<id, public_path>` (batch media
    resolution — one round trip regardless of row count).
  - `mediaItems({ mimePrefix, orderBy, direction, limit, offset })` →
    `{ rows[], total }`.
- **Adapter port**: `setLoopDataAdapter(impl)` / `getLoopDataAdapter()` —
  `{ dataRowLoop, resolveMediaPaths, mediaItems }`.
- **HTTP**: `GET /_instatic/loop/<loopId>?page=N` → `{ html, hasMore, pageNumber }`
  (infinite load); `GET /_instatic/assets/loop-runtime.js` (the runtime).
- **Barrel** `@core/loops`: `LoopItem`, `pageToLoopItem`, `filterPagesForLoop`.

## UI surface

**Admin / editor**: `LoopEditor.tsx` (canvas preview — empty placeholder vs.
render children in the author-selected tag, emitting the same
`data-instatic-loop` attrs the publisher writes so user CSS like
`[data-instatic-loop] > article` matches in-editor); the Properties panel
branches on `moduleId === 'base.loop'` to render source picker + the source's
`filterSchema` controls + `orderByOptions` + pagination + shared `htmlTag`
controls; `useLoopPreviewItems` feeds real preview entries.

**Public**: server-rendered HTML (`renderLoop()` output) — no client framework.
The only client JS is the optional `loopRuntime.ts` ES module for `infinite`
loops (Load-more button).

## Dependencies

- **npm**: none external for the engine core — `@sinclair/typebox` (via
  `@core/utils/typeboxHelpers`) for the prop/item schemas; `pixel-art-icons` for
  the module icon (cosmetic). Everything else is internal `@core/*`.
- **Instatic internal coupling** (the lift blockers): `@core/page-tree`
  (PageNode/Page/SiteDocument), `@core/module-engine` (ModuleDefinition,
  PropertySchema, registry), `@core/publisher` (renderNode walker, RenderConfig),
  `@core/templates/dynamicBindings` (entryStack resolution),
  `@core/markdown/renderMarkdown`, `@core/data/*` (cells, publicDataUser,
  schemas), `@core/templates/templateMatching`.
- **rr-slice deps** (if built in rr): pairs naturally with `data-table` (render a
  source as a table), `pages-cms` (loops inside CMS pages), `media-viewer`
  (`site.media` items), `markdown` (post body rendering). None are hard deps.

## rr coverage

**net-new.** Confirmed against the full rr catalog:

- `data-table` (`frontend/slices/data-table`) — a TanStack render of typed
  columns/rows. It DISPLAYS a collection but has **no source registry, no
  pluggable backend, no variants, no prefetch/pagination-fetch contract**. You
  hand it rows; it can't fetch them. Complementary, not overlapping.
- `pages-cms` (`frontend/slices/pages-cms` + `convex/features/pages-cms`) —
  block-composed multi-page CMS with 11 fixed block kinds and a `BlockRenderer`.
  No repeater that iterates an arbitrary data source per item.
- `library`, `notion-database`, `blog-section`, `portfolio-section`,
  `testimonials-grid` — each is a SINGLE-purpose list bound to one fixed shape.
  None expose a registry where new sources self-register, nor round-robin
  variants, nor a `LoopItem.fields` field-bag with `{currentEntry.x}` bindings.

No existing slice provides the "pick a source + filters + variants → repeat"
abstraction. Proposed new slug: **`content-loops`**.

## Slice plan

**Action: build-new.** Frontend slice `frontend/slices/content-loops` + optional
`convex/features/content-loops`.

**Ponytail (laziest correct path).** Do NOT lift Instatic's publisher. rr is a
React/Next + Convex world, not a custom HTML-string publisher with a layered
render cache. Lift only the framework-agnostic core and re-express the renderer
as a React component:

1. **Copy verbatim** (zero Instatic coupling): `types.ts` (LoopItem,
   LoopFetchResult, LoopSourceField, LoopEntitySource, SourceFetchContext),
   `registry.ts` (singleton + namespaced-id guard), `dataAdapter.ts` (the
   injected port pattern). These four files are already clean — strip the
   `@core/*` type imports (`PropertySchema`, `SiteDocument`) for a local
   `FilterSchema` type + a generic `source` context object.
2. **Re-express the renderer** as `<ContentLoop sourceId filters orderBy
   direction limit variants={[VariantA, VariantB]} />` — a client component that
   resolves items via the configured adapter and round-robins
   `variants[i % variants.length]`, passing each `LoopItem` to the variant as a
   prop (`item`/`currentEntry`). This is the `renderLoop` round-robin logic
   (~30 lines) minus the HTML-string emit and entryStack plumbing.
3. **Pagination** as a `useLoopPagination(sourceId, filters, pageSize)` hook
   (none / infinite / load-more) calling the adapter's paginated fetch — replaces
   `loopPrefetch.ts` + `loopRuntime.ts` + the `/_instatic/loop` endpoint.
4. **Ship two built-in sources mock-first**: a `mock` source (synthetic items, so
   the slice runs env-free like every rr slice) + a `convex.dataRows` source
   wired through `configureLoopAdapter()`. Port `convex/loops.ts` queries into
   `convex/features/content-loops/` as the optional backend, parameterized by
   table/index names (no hardcoded `data_rows` snake_case).

**Portability blockers to strip:**
- Hardcoded endpoint paths `/_instatic/loop/<id>` + `/_instatic/assets/loop-runtime.js`
  (in `loopRuntime.ts` `endpointBase` default, `loop.ts`, `loopPrefetch.ts`
  `loop_<id>_page` query keys) → replace with adapter-driven fetch (no URLs).
- Coupling to `@core/page-tree` / `@core/module-engine` / `@core/publisher` /
  `@core/templates/dynamicBindings` — the whole visual-canvas + page-tree +
  entryStack machinery. Drop it; variants become React components, bindings
  become props.
- Convex queries assume Instatic tables (`data_tables/data_rows/data_row_versions/
  media_assets/users/roles`), snake_case columns, nanoid `id` + `by_app_id`
  index, `cells_json` as JSON string, the post-type active-version workflow, and
  `@core/data/cells` / `publicDataUser` / `firstImagePathFromMarkdown`
  projection helpers → keep these behind the adapter, ship a generic example.
- Layer A/B/C render-cache + `requestDependent`/`perVisitor` hole machinery is
  publisher-specific → omit from the slice (note it as an advanced host concern).
- `pixel-art-icons` module icon, `@sinclair/typebox` prop schema → swap for
  `lucide-react` + a plain TS interface (rr convention).

**Effort: L.** Core contract (types + registry + adapter) is trivial copy. The
React repeater + pagination hook + mock source + a Convex example source + the
trio metadata + catalog entry is real surface, and faithfully harvesting the
"pluggable source + variants + paginated fetch" idea (the harvest value) is more
than a one-component drop.

**Proposed `frontend/slices/content-loops/slice.json`:**

```json
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "content-loops",
  "version": "0.1.0",
  "category": "content",
  "kind": "ui",
  "title": "Content Loops — pluggable repeater with sources + variants",
  "description": "A data-source-driven repeater: register pluggable LoopEntitySource backends (each declares fields + filterSchema + orderByOptions + an async fetch), then drop <ContentLoop sourceId filters orderBy variants={[A,B]} /> to render a child template per item, round-robining across variants. Ships a registry, an injectable LoopDataAdapter seam, a mock source so it runs env-free, none/infinite pagination via useLoopPagination, and a generic LoopItem field-bag. Wire your own Convex/REST source through configureLoopAdapter().",
  "namespace": "@/features/content-loops",
  "frontend": { "slicePath": "frontend/slices/content-loops", "configExport": "contentLoopsFeature" },
  "convex": { "tablesExport": "", "schemaPath": "", "rootPaths": ["features/content-loops"] },
  "deps": {
    "npm": ["lucide-react@^0.400.0"],
    "shadcn": ["button", "select", "input", "switch", "skeleton"],
    "env": [],
    "peers": []
  },
  "registers": [],
  "license": "MIT",
  "tags": ["content", "loop", "repeater", "list", "data-source", "pagination", "variants"],
  "previews": [
    { "component": "ContentLoop", "kind": "variants",
      "axes": [{ "prop": "pagination", "values": ["none", "infinite"], "default": "none", "description": "Load-more behavior" }],
      "seed": "mock source: 12 synthetic posts (title, excerpt, image, author)" }
  ],
  "contract": {
    "requires": { "deps": [{ "npm": "lucide-react", "range": "^0.400.0" }] },
    "provides": {
      "components": ["ContentLoop", "LoopVariant"],
      "utils": ["loopSourceRegistry", "configureLoopAdapter", "createMockLoopSource"],
      "hooks": ["useLoopPagination", "useLoopItems"],
      "convex": { "tables": [], "rbac": [] }
    }
  }
}
```

Backend (optional) `convex/features/content-loops/` mirrors `convex/loops.ts`:
`queries.ts` with `dataRowLoop` / `mediaItems` (args fully `v.*`-validated,
`.withIndex(...).collect()` then in-memory slice as Instatic does, or
`.paginate()` for large tables; index every order/filter field; no auth needed —
read-only public content), parameterized table/index names so it's not bolted to
Instatic's snake_case schema.
