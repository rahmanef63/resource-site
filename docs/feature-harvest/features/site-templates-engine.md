# Site templates engine

> **slug:** `site-templates-engine` · **rr coverage:** net-new (engine) · **action:** build-new · **effort:** M
>
> **Terminology guard (read first).** This feature is Instatic's *runtime
> page-template composition engine* — pages that wrap other pages (site-wide
> layouts, per-post-type entry templates, the 404 page) and splice content
> through an outlet. It is **NOT** the rr `TEMPLATE` *distribution kind*
> (`frontend/slices/_templates/`, `template-base/`, `personal-brand-os` — those
> are full-app scaffolds). The coverage hint "partial" conflates these two
> meanings of "template". The runtime engine has **zero** existing rr slice.

## What it does (flow)

A *template* is an ordinary `Page` (a flat node-tree) that carries a
`template: { enabled, target, priority }` config instead of being served at its
own slug. Templates wrap content. Three target kinds:

- `{ kind: 'everywhere' }` — the outermost site layout (header / footer chrome)
  that wraps **every** page and every entry detail.
- `{ kind: 'postTypes'; tableSlugs: string[] }` — an entry/detail template for
  one or more collections; the row body flows into its outlet.
- `{ kind: 'notFound' }` — the designed public 404 page (real content, no
  outlet needed; itself wrapped by the `everywhere` layout).

End-to-end on a public request:

1. The public router resolves the URL to a *route kind*: `{ kind: 'page' }` or
   `{ kind: 'entry'; tableSlug }`.
2. **Resolve** — `resolveTemplateChain(site, ctx)` walks fixed breadth levels
   `['everywhere','postTypes']` outer→inner and picks **at most one** template
   per level (highest `priority`, document order breaks ties). Returns
   `Page[]` ordered outer→inner.
3. **Compose** — `composeTemplateChain(chain, terminal)` merges the chain plus a
   terminal (`{ kind:'page', page }` or `{ kind:'entry' }`) into **one** merged
   `Page`. Each template's first `base.outlet` node is the splice point; the
   inner tree replaces it. Inner node ids are re-keyed with a prefix so merged
   trees never collide; the inner `base.body` wrapper is dropped (the outermost
   template owns `<body>`), its styling migrated onto a `base.container` so it
   is not lost. `reindexNodeParents` rebuilds parent links on the merged tree.
4. **Bind** — the merged tree is a plain page tree. The publisher walks it and
   for every node calls `resolveDynamicProps(props, effectiveNodeBindings(node),
   ctx)`: structured whole-prop bindings (`node.dynamicBindings[propKey] →
   {source, field, format}`) overlay static props, then inline
   `{source.field|fallback}` tokens in every string prop are interpolated.
   Sources read from `ctx`: `currentEntry`/`parentEntry` (top / 2nd-from-top of
   an immutable `entryStack`), and always-present `page`/`site`/`route` frames.
   `base.outlet` carries an implicit `html ← currentEntry.body` binding (markdown
   → HTML) so an entry's body flows in with no authored binding.
5. The merged tree feeds the existing `publishPage` pipeline **unchanged** — one
   CSS pass, one HTML emit. 404s: `resolveNotFoundTemplate(site)` picks the
   highest-priority `notFound` page, composed under the `everywhere` chain,
   baked to `404.html`, served with status 404.

The editor mirrors all of this: the canvas renders the active document **inside
its matching template chain** read-only (`CanvasComposedTree` +
`ReadOnlyNodeTree`), previews entry templates against live (or synthetic) row
data, and offers a `{}` binding picker on every prop control.

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`) — the portable engine
core is `src/core/templates/` (pure, no editor/Convex imports, constraint #269):

| File | Exports |
|---|---|
| `src/core/templates/templateMatching.ts` | `resolveTemplateChain`, `resolveNotFoundTemplate`, `isTemplatePage`, `primaryTemplateTableSlug`, `templateTargetLabel`, `normalizeRouteBase`, `RouteResolutionContext` |
| `src/core/templates/templateCompose.ts` | `composeTemplateChain` (+ internal `rekey`/`locate`/`spliceIntoOutlet`/`contentRootIds`) |
| `src/core/templates/outlet.ts` | `firstOutletId`, `treeHasOutlet`, `subtreeHasOutlet` |
| `src/core/templates/tokenInterpolation.ts` | `parseTokenString`, `interpolateTokens`, `containsTokens`, `bindingToToken`, `readFrame`, `walkFieldPath` |
| `src/core/templates/dynamicBindings.ts` | `resolveDynamicProps`, `effectiveNodeBindings`, `OUTLET_BODY_BINDING` |
| `src/core/templates/contextFrames.ts` | `PageFrame`/`SiteFrame`/`RouteFrame` + `buildPageFrame`/`buildSiteFrame`/`buildRouteFrame` |
| `src/core/templates/renderDataContext.ts` | `TemplateRenderDataContext` |
| `src/core/templates/templatePreviewData.ts` | `buildPreviewCells`, `dataTablePreviewToLoopItem` (synthetic preview) |
| `src/core/templates/__tests__/` | `templateMatching.test.ts`, `templateCompose.test.ts` |

Schema types the engine consumes (`src/core/page-tree/`):
`pageTemplate.ts` (`TemplateTarget`, `PageTemplateConfig`, `parsePageTemplate`),
`dynamicBinding.ts` (`DynamicPropBinding`, `parseDynamicBindings`),
`pageNode.ts` (`PageNode` = BaseNode + optional `dynamicBindings`),
`page.ts` (`Page` = flat `nodes` + `rootNodeId` + optional `template`).

The `base.outlet` module: `src/modules/base/outlet/`.

Editor surface (NOT portable — coupled to the visual canvas + Zustand store):
`src/admin/pages/site/panels/SiteExplorerPanel/` (Pages / Templates sections),
the Template-settings dialog + store actions `convertPageToTemplate` /
`convertTemplateToPage` in `store/slices/site/siteSlice` + `nodeActions.ts`
outlet backstop, `canvas/CanvasComposedTree.tsx`,
`canvas/DocumentSwitcher.tsx`, `OutletEditor`,
`hooks/useTemplatePreviewContext.ts`, `hooks/useActiveLivePath.ts`,
`property-controls/DynamicBindingControl/`, the
`TemplateModeControl`/`VisualComponentModeControl` floating controls.
`src/modules/base/utils/ReadOnlyNodeTree.tsx` (shared non-interactive renderer).
Server render paths: `server/publish/publicRenderer.ts`
(`renderPublishedSnapshot`, `renderPublishedDataRowTemplate`,
`renderPublishedNotFound`), `server/publish/publicRouter.ts`
(`isTemplatePage` guard), `server/publish/publishSite.ts` (bake skips templates).
Full spec: `docs/features/templates.md`.

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`) —
has **no** equivalent engine. Its "pages" are flat `blocks[]` arrays:
`app/(public)/[...slug]/page.tsx` + `catch-all-renderer.tsx`
(`BlocksRenderer` from `@/features/_shared/pages`), a static
`app/not-found.tsx`, `convex/pages.ts` (`pages.bySlug`). No layout inheritance,
no outlet, no entry templates, no dynamic bindings. This project is the
*whole-app TEMPLATE scaffold* axis, not the runtime engine.

## Data model

Instatic stores pages as `data_rows` rows (the `pages` system `data_tables`
row, `kind: 'page'`) — `convex/schema.ts` `data_rows.cells_json` holds the
serialized page tree, with the template config living **inside** that JSON as
`page.template` (NOT as separate Convex columns; `docs/features/templates.md`'s
`templateEnabled`/`templateTarget`/`templatePriority` "columns" are the logical
row-adapter shape). `convex/setup.ts` is the first-run wizard that seeds the
`site` singleton + default page — tangential, not part of the engine.

Engine-relevant shapes (all pure TS, no DB type):

```ts
// pageTemplate.ts
type TemplateTarget =
  | { kind: 'everywhere' }
  | { kind: 'postTypes'; tableSlugs: string[] }   // ≥1 slug
  | { kind: 'notFound' }
interface PageTemplateConfig { enabled: true; target: TemplateTarget; priority: number }

// dynamicBinding.ts
interface DynamicPropBinding {
  source: 'currentEntry' | 'parentEntry' | 'page' | 'site' | 'route'
  field: string                         // dotted path: "author.name"
  format?: 'plain' | 'html' | 'url' | 'media'
  fallback?: 'static' | 'empty'
}

// page-tree (generic node-tree the engine walks)
interface PageNode {                     // BaseNode + overlay
  id: string; moduleId: string; children: string[]
  props: Record<string, unknown>
  breakpointOverrides?: Record<string, unknown>; classIds?: string[]; inlineStyles?: unknown
  dynamicBindings?: Record<string, DynamicPropBinding>   // template overlay
}
interface Page { id; slug; title; rootNodeId: string; nodes: Record<string, PageNode>; template?: PageTemplateConfig }
type SiteDocument = { id; name; pages: Page[]; ... }

// renderDataContext.ts
interface TemplateRenderDataContext {
  readonly entryStack: readonly LoopItem[]   // LoopItem = { fields: Record<string,unknown> }
  readonly page?: PageFrame; readonly site?: SiteFrame; readonly route?: RouteFrame
}
```

Parsing is tolerant everywhere (`parsePageTemplate`, `parseDynamicBindings`):
invalid optional fields silently become absent; never throws on template data.

## Public API

The engine exposes **no** queries/mutations/REST — it is pure functions over
in-memory documents, run by both the publisher (server) and the editor canvas
(client). The callable surface (barrel `@core/templates`):

- `resolveTemplateChain(site, ctx): Page[]` — outer→inner matched templates.
- `resolveNotFoundTemplate(site): Page | null`.
- `composeTemplateChain(chain, terminal): Page` — one merged page.
- `isTemplatePage(page)`, `primaryTemplateTableSlug(page)`, `templateTargetLabel(page)`.
- `firstOutletId(nodes)`, `treeHasOutlet(tree)`, `subtreeHasOutlet(nodes, rootId)`.
- `resolveDynamicProps(staticProps, bindings, ctx)`, `effectiveNodeBindings(node)`.
- `parseTokenString(s)`, `interpolateTokens(s, ctx)`, `containsTokens(s)`, `bindingToToken(source, field)`.
- frame builders `buildPageFrame`/`buildSiteFrame`/`buildRouteFrame`.

Persistence is the host's: the AI-agent tool surface (`docs/features/agent.md`)
shows the natural mutation contract a consumer wires — `setPageTemplate(pageId,
target, priority?)` / `clearPageTemplate(pageId)`, mirrored by store actions
`convertPageToTemplate` / `convertTemplateToPage` (the latter also strips
`dynamicBindings` from every node).

## UI surface

- **Admin / editor (Instatic-coupled):** Site Explorer panel with separate
  **Pages** / **Templates** lists; right-click **Use as template** → Template
  settings dialog (Applies-to: Everywhere / Post types + checkbox table list /
  Not found; Priority); **Convert to page**. Canvas previews the document inside
  its template chain read-only (`CanvasComposedTree`), with `OutletEditor`
  rendering what flows into the outlet, a `DocumentSwitcher` (grouped Pages /
  Templates / Components), a `TemplateModeControl` **Previewing** dropdown
  (session-only `templatePreviewSelection`, never persisted), and the
  `DynamicBindingControl` `{}` picker on every bindable prop (insert-token mode
  for strings, bind mode for media). One-outlet-per-document is enforced at the
  module picker (disabled tile) + store chokepoints (`insertNode`,
  `duplicate*`, `pasteNode` toasts).
- **Public:** none of its own — templates are never served at their slug; the
  composed merged tree renders through the normal page publisher / static bake.

## Dependencies

**Engine (portable) internal couplings to strip/inject:**
- `@core/markdown/renderMarkdownToHtml` + `@core/sanitize` `isRichtextPropKey`
  — the markdown→HTML shim in `dynamicBindings.ts` (body/richtext bindings).
- `@core/loops/types` `LoopItem` — entry-stack item shape (`{ fields }`).
- `@core/page-tree` `Page`/`PageNode`/`SiteDocument`/`DynamicPropBinding`/
  `reindexNodeParents` — the generic node-tree model + parent reindex helper.
- `@core/data/schemas` (`templatePreviewData.ts` only) — synthetic preview;
  optional, can be dropped from the core slice.
- npm: none beyond a markdown renderer (the shim). TypeBox is used for the
  schema validators (`@core/utils/typeboxHelpers`) but can be swapped for `v.*`
  / plain guards.

**rr-slice deps (if built):** optional `markdown` (for the body→HTML shim,
else inject a `formatHtml` prop); companion `content-loops` /`loops` (shares the
`entryStack` / `LoopItem` model); pairs with `pages-cms` or a future page-tree
slice as the host content model.

## rr coverage

**net-new.** Grepping the rr catalog for `outlet|resolveTemplateChain|
composeTemplateChain|TemplateTarget|templateTarget` across `frontend/slices/`
and `convex/features/` returns **zero** hits. Adjacent slices and why they do
**not** cover it:

- `pages-cms` (`frontend/slices/pages-cms`) — closest content slice, but a flat
  `blocks[]` model (11 block kinds, localStorage adapter, read-only
  `BlockRenderer`). **No** node-tree, **no** outlet, **no** layout inheritance,
  **no** entry templates, **no** dynamic bindings / token interpolation. It is
  the *host content surface*, not the composition engine.
- `marketing-chrome` — fixed header+footer chrome; expresses the *goal* of an
  `everywhere` layout but as hardcoded components, not a data-driven
  resolve→compose→outlet engine.
- `landing-sections`, `blog-section`, etc. — section/content presenters; no
  composition engine.
- `_templates/` (`example-feature`), `template-base/`, `personal-brand-os` — the
  rr **TEMPLATE distribution kind** (full-app scaffolds, no slice trio). This is
  the naming collision the task flags; orthogonal to the runtime engine.

Proposed slug if built: **`site-templates-engine`** (matches the harvest slug;
disambiguates from rr's TEMPLATE kind).

## Slice plan

**Action: build-new.** A pure-logic slice — the laziest correct path lifts the
8-file engine core verbatim and parameterizes its 4 host couplings; it leaves
the visual-canvas editor UI behind (that belongs to a future page-tree/visual
canvas slice, far bigger). No Convex feature — persistence is the host's
(template config is just a field on a page document).

**Ponytail (laziest correct path):**
1. Copy `src/core/templates/{templateMatching,templateCompose,outlet,
   tokenInterpolation,dynamicBindings,contextFrames,renderDataContext}.ts`
   into `frontend/slices/site-templates-engine/lib/` + the two `__tests__`.
2. Move the schema types `pageTemplate.ts` + `dynamicBinding.ts` into
   `types.ts`; define a **minimal generic node contract** in the slice
   (`TemplateNode { id; moduleId; props; children; dynamicBindings? }`,
   `TemplateTree { nodes; rootNodeId }`, `TemplateSite { id; name; pages }`)
   so it never imports a host `@core/page-tree`.
3. Make the three magic module-ids **config**, not literals:
   `createTemplateEngine({ outletModuleId='base.outlet', bodyModuleId='base.body',
   containerModuleId='base.container', formatHtml?, isRichtextKey? })`.
4. Inline the tiny `reindexNodeParents` helper. Default `formatHtml` = identity
   (no markdown), `isRichtextKey` = `/html$|^richtext$/i` — markdown shim
   becomes opt-in via the `markdown` slice.
5. Drop `templatePreviewData.ts` from the core (or ship as an optional submodule)
   — it pulls `@core/data/schemas`, which is host-specific.

**Portability blockers to strip (hardcode = lift blocker):**
- Literal module ids `'base.outlet'` / `'base.body'` / `'base.container'` in
  `outlet.ts`, `templateCompose.ts`, `dynamicBindings.ts` → engine config.
- `@core/markdown/renderMarkdownToHtml` + `@core/sanitize` import in
  `dynamicBindings.ts` → injected `formatHtml`/`isRichtextKey`.
- `@core/loops/types` `LoopItem` → local `EntryItem { fields }`.
- `@core/page-tree` model + `reindexNodeParents` → slice-owned generic contract
  + inlined helper.
- `@core/data/schemas` in `templatePreviewData.ts` → excluded / adapter.

**Effort: M.** ~8 self-contained pure files (~1k LOC) lift cleanly; the work is
generalizing the node model + injecting 4 seams + porting the 2 test files. The
editor UI is explicitly out of scope (L+ on its own, needs the canvas/store).

**Proposed `slice.json` (frontend only; no convex/features):**

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "site-templates-engine",
  "version": "0.1.0",
  "category": "content",
  "kind": "logic",
  "title": "Site Templates Engine — layout/entry/404 template composition",
  "description": "Pure-functional runtime engine for page templates: site-wide (everywhere) layouts, per-post-type entry templates, and a notFound 404 page, composed through a single outlet. resolveTemplateChain → composeTemplateChain splices inner trees into each template's outlet (id re-keying, body-drop, parent reindex) producing one merged tree; resolveDynamicProps overlays {source.field|fallback} token + structured bindings against page/site/route/currentEntry frames. Backend-agnostic, props-driven (configurable module ids + injected html formatter). No Convex; persistence is the host's.",
  "namespace": "@/features/site-templates-engine",
  "frontend": { "slicePath": "frontend/slices/site-templates-engine", "configExport": "siteTemplatesEngineConfig" },
  "convex": { "tablesExport": "", "schemaPath": "", "rootPaths": [] },
  "deps": {
    "npm": [],
    "shadcn": [],
    "env": [],
    "peers": ["markdown"]        // optional, only for the body→HTML shim
  },
  "registers": [],
  "audit": [],
  "license": "MIT",
  "tags": ["content", "cms", "templates", "layout", "outlet", "engine", "page-tree", "bindings"],
  "contract": {
    "requires": { "deps": [] },
    "provides": {
      "utils": [
        "createTemplateEngine", "resolveTemplateChain", "resolveNotFoundTemplate",
        "composeTemplateChain", "isTemplatePage", "templateTargetLabel",
        "firstOutletId", "treeHasOutlet", "subtreeHasOutlet",
        "resolveDynamicProps", "effectiveNodeBindings",
        "parseTokenString", "interpolateTokens", "containsTokens", "bindingToToken",
        "buildPageFrame", "buildSiteFrame", "buildRouteFrame",
        "parsePageTemplate", "parseDynamicBindings"
      ],
      "convex": { "tables": [], "rbac": [] }
    }
  }
}
```

Trio: add `slice.contract.ts` (typed `requires`/`provides` mirror — note rr's
existing slices ship slice.json + slice.manifest.json today; `slice.contract.ts`
is the documented-but-not-yet-present third file) + `slice.manifest.json`
(`{ deps: { shared: [], slices: ["markdown"], convex: [] } }`) + a
`lib/content/slices.ts` catalog entry.
