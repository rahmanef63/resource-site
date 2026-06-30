# Publisher — clean-HTML pipeline

> Harvest target: extract Instatic's node-tree → standalone-HTML render engine
> (clean semantic HTML + one deduped CSS bundle + layered sanitization) into a
> portable rr slice `publisher-clean-html`. **Verdict: net-new** (no rr slice
> renders a node tree to a sanitized, framework-runtime-free HTML string).

## What it does (flow)

Takes a page (a flat-map `NodeTree<PageNode>`) plus a `SiteDocument` and emits a
complete `<!DOCTYPE html>` document with **no framework runtime, no client
hydration of layout, no decorative markup**, and **one deduped per-page CSS
bundle**. The published page is plain semantic HTML — a static export a dumb
file host (Netlify/GH Pages) can serve.

End-to-end (pure engine half — the part worth harvesting):

1. `publishPage(page, site, registry, options?)` (`src/core/publisher/render.ts`)
   is the entry point. It resolves template-context frames, injects the root
   node's classIds onto `<body>`, builds `<head>` (title, description, favicon,
   importmap, runtime `<script>`s, CSP), then walks the tree.
2. `renderNode(nodeId, config, acc)` (`renderNode.ts`) is a recursive, **bottom-up**
   walk. Hidden nodes (`node.hidden`) prune first, before any renderer. Two
   specialized renderers branch off `moduleId`: `base.visual-component-ref`
   (inline a reusable component tree) and `base.loop` (iterate a data source).
   Everything else hits `renderStandardNode`.
3. Per standard node: recurse children → resolve props (breakpoint overrides +
   data bindings) → **`escapeProps(props, schema)`** (escape per the schema
   control `type`, not by guessing from key name) → call the module's **pure**
   `render(props, renderedChildren) → { html, css?, js? }` → store `css` in a
   `CssCollector` keyed by `moduleId` (first-write-wins dedup, ~60-80% CSS
   shrink) → splice the node's `classIds` + inline styles onto the rendered
   root element.
4. After the walk: assemble the CSS bundle in cascade order — reset CSS +
   framework CSS + deduped module CSS + user class CSS + page-scoped user
   stylesheets — each block neutralized for `</style` breakout
   (`sanitizeModuleCSS`) and each value sanitized (`sanitiseCssValue`).
5. The CSP is built as **data** (`CspPlan = Map<directive, Set<source>>`) and
   serialized deterministically (sorted) — never a regex-assembled string.
6. Output: `{ html, css }` standalone document. (Instatic's server half then
   DOMPurifies the whole doc, runs plugin filters, and bakes/caches it — see
   "out of scope" below.)

The three sanitization layers are the security spine:
- **HTML**: `escapeHtml` (5-char escape) + `isSafeUrl`/`safeUrl` (block
  `javascript:`/`vbscript:`/`data:` schemes) at the prop boundary; DOMPurify
  for richtext/svg-typed props.
- **CSS value**: `sanitiseCssValue` blocks `expression()`, `javascript:`,
  `behavior:`, `-moz-binding`, `data:text/`, `{}` (selector breakout), `</`
  (RAWTEXT escape).
- **CSS block**: `sanitizeModuleCSS` rewrites `</style` → `<\/style` so the
  HTML5 RAWTEXT tokenizer never sees the end-tag (CSS resolves `\/`→`/`, URLs
  round-trip).

## Where it lives

**Instatic** (`/home/rahman/projects/Instatic-convex`) — the portable, pure half:
- `src/core/publisher/render.ts` — `publishPage` entry + `<head>`/CSS/CSP assembly (22 KB)
- `src/core/publisher/renderNode.ts` — recursive walker; emits `<instatic-hole>` for dynamic nodes
- `src/core/publisher/renderConfig.ts` — `RenderConfig` (readonly inputs) vs `RenderAccumulators` (mutable `cssMap`/`infiniteLoopIds`/`holeNodeIds`/`jsMap`)
- `src/core/publisher/escapeProps.ts` — schema-type-dispatched prop escaping (Constraint #211)
- `src/core/publisher/cssCollector.ts` — `CssCollector` (moduleId dedup) + `sanitizeModuleCSS` + `collectClassCSS`
- `src/core/publisher/classCss.ts` — user `StyleRule` → CSS, incl. `@keyframes` (`bagToCSS`/`bagToInlineStyle`)
- `src/core/publisher/classInjection.ts` — splice author `classIds` into rendered root tag
- `src/core/publisher/cspPlan.ts` — `CspPlan` map + deterministic `serializeCsp` + `createBaseCspPlan`/`cspMetaTag`
- `src/core/publisher/reset.ts` — `PUBLISHER_RESET_CSS` cross-browser baseline
- `src/core/publisher/frameworkCss.ts` — `buildSiteFrameworkCss` (spacing scale, typography, `:root` tokens)
- `src/core/publisher/siteCssBundle.ts` — hash-named bundle composition
- `src/core/publisher/userStylesheets.ts` — page-scoped author stylesheets
- `src/core/publisher/sizesResolver.ts` — derive `<img sizes>` from layout
- `src/core/publisher/dynamicDetection.ts` — `findDynamicNodeIds` (4+1 rules) — only needed if you also lift Layer C
- `src/core/publisher/renderVisualComponentRef.ts` / `renderLoop.ts` — specialized renderers (only if lifting VC/loops)
- `src/core/html-sanitize/index.ts` — **dependency-free leaf**: `escapeHtml`, `isSafeUrl`, `safeUrl`
- `src/core/css-sanitize/index.ts` + `sanitiseCssValue.ts` — **dependency-free leaf**: canonical `sanitiseCssValue`
- `src/core/sanitize.ts` — DOMPurify wrappers `sanitizeRichtext`/`sanitizeSvg` + `configureRichtextSanitizer` (runtime injected)
- `src/core/publisher/utils.ts` — re-exports the sanitize leaves for publisher-side consumers

**Instatic** — the server/host half (NOT portable, leave behind, see "out of scope"):
- `server/publish/publishedHtmlPipeline.ts` — post-process: plugin filters + DOMPurify whole-doc + injections
- `server/publish/publicRouter.ts`, `staticArtefact.ts`, `renderCache.ts`, `publishState.ts` — three-layer caching (disk symlink-swap / in-mem LRU / `<instatic-hole>`)
- `server/publish/publishSite.ts`, `republish.ts`, `publishScheduler.ts`, `bakeDataRows.ts` — bake orchestration
- `server/publish/loopPrefetch.ts`, `mediaPrefetch.ts`, `renderTreeWalk.ts` — async pre-warm (Bun + Convex)
- `server/publish/holeRuntime.ts`, `loopRuntime.ts`, `moduleJsBundle.ts` — client runtimes
- `src/core/page-tree`, `src/core/module-engine`, `src/core/templates`, `src/core/framework`, `src/core/visualComponents`, `src/core/site-runtime` — engine deps the pure publisher imports

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`): **nothing.**
It is a Next SSR app — pages render through React Server Components at request
time; there is no static HTML export, no node-tree→string renderer, no
publish/sanitize pipeline. Grep for `publishPage|static.?export|clean.?html|
dompurify|sanitiz` over `app/`/`lib/`/`convex/` returns only an unrelated
`lib/shared/error.ts`. No source contribution to this feature.

## Data model

The harvestable engine is **pure and stateless** — it needs no Convex tables.
Its inputs are in-memory shapes (Instatic's `Page` / `SiteDocument` /
`IModuleRegistry`), not DB rows. The portable slice should keep it that way:
the host passes a tree + a registry, gets an HTML string back.

For reference, Instatic's *host* persists published output in Convex
(`convex/schema.ts`): `site_snapshots` (the `SiteDocument` stored once per
publish, content-hashed), `data_row_versions` (`site_snapshot_id` +
`runtime_assets_json`), `data_rows.status='published'` + `active_version_id`,
`published_runtime_assets`. Disk artifacts live at
`uploads/published/current/<route>.html` via a two-slot symlink swap. **None of
this is part of the portable slice** — it's the caching/hosting layer a consumer
wires around the pure `publishPage`. If a slice consumer wants a DB-cached
analog, the optional `convex/features/publisher-clean-html` table shape is:
`publishedArtifacts { route: v.string() (idx by_route), html: v.string(),
publishVersion: v.number(), contentHash: v.string() }` + a `publishVersion`
counter — but this is opt-in, not required by the trio.

## Public API

The pure engine exposes **functions, not Convex queries/mutations**:
- `publishPage(page, site, registry, options?) → { filename, html, jsModuleIds }`
  — the orchestrator (options carry breakpoint, `loopData`/`mediaAssets`
  prefetch maps, `cssEmission: 'inline'|'external'`, `cssBundle`, base URLs).
- `escapeProps(props, schema)`, `escapeHtml`, `safeUrl`, `isSafeUrl`,
  `sanitiseCssValue`, `sanitizeModuleCSS`, `new CssCollector()`,
  `sanitizeRichtext`/`sanitizeSvg` + `configureRichtextSanitizer(runtime)`.
- `createBaseCspPlan()`, `addCspSources`/`setCspDirective`, `serializeCsp`,
  `cspMetaTag`.
- `buildSiteCssBundle(site, registry)`, `collectClassCSS(site)`,
  `buildSiteFrameworkCss(site)`, `PUBLISHER_RESET_CSS`.

Instatic's host REST surface (left behind, for context): `POST
/admin/api/cms/publish/site`, visitor `GET /<slug>`, and the Layer C islands
`GET /_instatic/hole/<nodeId>`, `GET /_instatic/module-js/<id>.js`,
`GET /_instatic/css/<bundle>-<hash>.css`.

## UI surface

No CRUD admin UI in the engine itself — the *editor* that builds the node tree
is a separate concern (Instatic's visual canvas; in rr terms `pages-cms` or a
future visual-canvas slice). The publisher's only natural UI is a **preview
pane**: render `publishPage(...).html` into an `<iframe srcdoc={html}>` so an
admin can see the clean output before publishing. The portable slice should
ship exactly that one demo/preview component (env-free, like rr `markdown`'s
`preview.tsx`) plus the engine `lib/`.

## Dependencies

- npm: `dompurify` (richtext/svg sanitization; runtime injectable so the core
  stays env-agnostic). That's it for the pure core — escaping, CSS dedup, CSP,
  and the walker are zero-dependency.
- rr-slice deps: **none required.** Optional pairings — `pages-cms` (or a visual
  canvas) as the tree *source*, `seo` for meta/JSON-LD into `<head>`, `markdown`
  if a block renders markdown. The publisher consumes a generic tree; it does
  not import another slice.

## rr coverage

**net-new.** Proposed slug: `publisher-clean-html`.

Verified against the full `frontend/slices` catalog and `convex/features`:
- No slice named `publisher*`; grep for `publisher` returns nothing.
- `pages-cms` is the closest neighbor and does **not** cover this: its
  "publish" is a `PageStatus = "draft" | "published"` status flag, and its
  rendering is a **React** `BlockRenderer` (`"use client"`, emits JSX with
  Tailwind classes + Next `<Image>`/`<Link>`) — it renders *live in React*, it
  does not serialize a node tree to a sanitized standalone HTML **string**,
  has no per-module CSS dedup, no `</style`/CSS-value sanitization, no static
  export, no CSP plan. Different layer entirely (editor/runtime vs. publisher).
- `markdown` sanitizes nothing general (uses `dangerouslySetInnerHTML` for
  trusted katex/mermaid only); `seo` only builds `<head>` metadata. Neither is
  a node-tree→HTML engine.

The clean-HTML publisher (pure tree→string render + moduleId CSS dedup +
HTML/CSS-value/RAWTEXT/CSP sanitization, zero framework runtime in output) is a
genuinely new capability. This is harvest gold.

## Slice plan

**Action: build-new.** Frontend-only slice (pure TS engine + one preview
component); no Convex required — matches the env-free pure-logic pattern of
`markdown`/`pages-cms`.

**Laziest correct path (ponytail):** Do NOT lift the whole Instatic publisher.
Lift the **pure render-to-clean-HTML core** and skip the host machinery. Concretely:
1. Copy the two dependency-free leaves verbatim — `html-sanitize/` and
   `css-sanitize/` — into `lib/sanitize/`. They already have no imports; zero
   rework, highest value.
2. Copy `cssCollector.ts` (CssCollector + `sanitizeModuleCSS`) and
   `cspPlan.ts` (CspPlan + `serializeCsp`) — also near-dependency-free.
3. Copy `escapeProps.ts` + a trimmed `renderNode.ts` + `publishPage` shell,
   but **replace the `@core/*` engine imports with slice-local generic types**:
   a minimal `NodeTree<TNode>`, a `ModuleRegistry`/`ModuleDefinition` interface
   whose `render(props, children) → { html, css? }` is injected by the consumer,
   and a `PropertySchema` shape for `escapeProps` dispatch. The consumer brings
   their own module set; the slice ships the walker + escaping + dedup + CSP +
   assembly.
4. Drop the specialized `base.loop` / `base.visual-component-ref` renderers,
   `dynamicDetection.ts`, and all `server/publish/*` from v1 — they pull in
   loops, VCs, async prefetch, Bun, and Convex. Document them as a "Layer
   C / dynamic islands" follow-up. The static publisher alone is the 80%.
5. Ship one preview component: `<iframe srcdoc>` of `publishPage(...).html`.

**Portability blockers to strip (hardcoded coupling):**
- `@core/page-tree`, `@core/module-engine`, `@core/templates`,
  `@core/framework`, `@core/visualComponents`, `@core/site-runtime` imports →
  replace with slice-local generic `NodeTree`/`ModuleDefinition`/`PropertySchema`
  types or an injected adapter. This is the big lift.
- Bun/Convex server layer (disk symlink-swap, in-mem LRU, hole/loop/media
  prefetch, repositories) → out of scope; the host owns caching.
- Hardcoded `/_instatic/...` URL prefixes (css, assets, runtime importmap, hole,
  module-js) → make them `options` props (Instatic already does this for
  `cssAssetBaseUrl`/`loopEndpointBaseUrl`; finish the job for the rest).
- DOMPurify is already injectable via `configureRichtextSanitizer(runtime)` —
  keep that seam so the core runs in Node, browser, or workerd.
- `pixel-art-icons`, React Compiler, TypeBox, Mutative coupling — none reach the
  pure engine; do not carry them.

**Effort: L.** The pure core is intricate and security-critical (~1.5 KLOC
across sanitizers + collector + escapeProps + renderNode + publishPage +
cspPlan), and the de-coupling from `@core/*` into generic injected types is real
design work. But it's bounded and additive — no Convex, no UI CRUD.

**Proposed `slice.json` (frontend/slices/publisher-clean-html):**
```json
{
  "name": "publisher-clean-html",
  "kind": "slice",
  "title": "Publisher — clean-HTML pipeline",
  "description": "Pure engine: render a node tree to a standalone, framework-runtime-free HTML document with one deduped per-module CSS bundle. Layered sanitization (HTML escape + safe-URL, CSS-value guard, </style RAWTEXT neutraliser, deterministic CSP plan, injectable DOMPurify for richtext/svg). Bring your own module registry; the slice walks the tree, escapes props by schema type, dedups CSS by moduleId, and assembles the document. Stateless + env-free; no Convex. Optional preview pane renders output in an iframe srcdoc.",
  "deps": { "npm": ["dompurify"], "slices": [] },
  "exports": ["publishPage", "escapeProps", "CssCollector", "sanitiseCssValue", "sanitizeModuleCSS", "escapeHtml", "safeUrl", "isSafeUrl", "serializeCsp", "createBaseCspPlan", "configureRichtextSanitizer"],
  "convex": false
}
```
Plus the mandatory trio `slice.contract.ts` (public types: `NodeTree<TNode>`,
`ModuleDefinition`, `PropertySchema`, `PublishOptions`, `PublishedPage`) +
`slice.manifest.json`, and a catalog entry in `lib/content/slices.ts`.
No `convex/features/publisher-clean-html` in v1 (engine is pure); add the
optional `publishedArtifacts` table only if a consumer wants DB-cached output.
