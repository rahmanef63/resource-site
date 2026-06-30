# Visual Page Canvas (WYSIWYG builder)

> Harvest source: **Instatic-convex** (the real engine) + **personal-brand-os** (only a config-driven foil, NOT a canvas).
> Coverage verdict: **net-new**. No existing rr slice does free-form drag-drop on an arbitrary node tree.

A true Webflow/Framer-class visual editor: drag arbitrary modules onto an infinite canvas, nest them into a free-form tree, style each node with classes + inline styles + per-breakpoint overrides, edit text in place (real `contentEditable` on the published element), and reorder by drag. The canvas renders the page tree inside per-viewport `<iframe>`s so user CSS, combinators, and viewport units behave exactly as published. This is the harvest gold — describe-to-build depth below.

---

## What it does (flow)

End-to-end control/data flow for a single edit:

1. **Load.** A page is a `NodeTree` = `{ nodes: Record<nodeId, PageNode>, rootNodeId }` (flat map, O(1) lookup; root is always a `base.body` node). The page tree is parsed/validated (`parsePage` → `parsePageNode` → `reindexNodeParents`) and dropped into the editor Zustand store (`siteSlice`). The site shell (breakpoints, the class/style registry `styleRules`, custom `conditions`, settings) loads alongside it.
2. **Render.** `CanvasRoot` decides `design` vs `live` view. Design mode mounts one `IframeFrameSurface` per breakpoint inside `CanvasTransformLayer` (pan/zoom). Each frame boots an empty `srcDoc` iframe, captures its document, and `createPortal`s the recursive `NodeRenderer` tree into the iframe `<body>`. Every module spreads `nodeWrapperProps` (data-node-id + click/hover/dblclick/contextmenu handlers) directly onto its own root element — no wrapper div between authored siblings, so CSS combinators match. CSS arrives via three `<style>` injectors (`EditorChromeInjector` unlayered, `ClassStyleInjector` + `UserStylesheetInjector` in `@layer user-authored`).
3. **Select.** Clicking a node fires a React synthetic event (bubbles through the fiber tree even across the iframe DOM boundary) → `selectNode(id, mode)`. Selection is a Figma-style ordered multi-set (`selectedNodeIds`, anchor = last; replace/toggle/range modes). A `BreakpointSelectionOverlay` draws the selection ring in parent-document coordinates.
4. **Edit props/styles.** The Properties panel edits the anchor node. A prop edit → `updateNodeProps(nodeId, props)`. A style edit routes to the active breakpoint (`setBreakpointOverride`) or the active custom condition (`contextStyles`) or a shared class in the registry. Class CSS is re-emitted into the iframe `ClassStyleInjector` live.
5. **Inline text edit.** Double-click a text-bearing node → the node's *own* element becomes `contentEditable="plaintext-only"` (no overlay). `onInput` reads `innerText` back and `updateNodeProps` live; single-field patches coalesce into ONE undo entry; every other breakpoint frame previews the edit live.
6. **Structure.** Drag a row in the DOM panel or drag on the canvas → `@dnd-kit/core` + `canvasDnd.resolveCanvasDropTarget` computes a `{parentId, index, position}` honoring lock/cycle/slot rules → `moveNode`. Insert from the module picker → `insertNode`. All 11 structural ops go through `mutateActiveTree(fn)` which routes to the active page OR Visual Component tree.
7. **History.** Mutations run through Mutative `create({ enablePatches })`; the store keeps patch/inverse-patch stacks for undo/redo. Coalesce keys (`props:<nodeId>:<prop>`) fold a burst into one entry.
8. **Persist.** The store autosaves the page tree blob + site shell back to Convex (`data_rows` body for pages, `site`/`site_snapshots` for the shell). Publishing is a separate pipeline (clean static HTML) — out of scope for this slice.

The single most important architectural choice: **one tree primitive (`NodeTree<TNode>`) + tree-agnostic mutations.** Pages, Visual Components, and slot fills are all the same shape; the only place that knows which tree is "active" is `resolveActiveTreeTarget`/`mutateActiveTree`.

---

## Where it lives

**Instatic-convex** (`/home/rahman/projects/Instatic-convex`):

Engine (framework-agnostic core, no editor imports — Constraint #269):
- `src/core/page-tree/treeSchema.ts` — `NodeTree<TNode>` + `NodeTreeSchema`
- `src/core/page-tree/baseNode.ts` — `BaseNode` (id, moduleId, props, breakpointOverrides, children[], parentId, classIds, inlineStyles, propBindings) + tolerant parser
- `src/core/page-tree/pageNode.ts` / `page.ts` — `PageNode` (BaseNode + `dynamicBindings`), `Page` (NodeTree + slug/title/template), `parsePage`
- `src/core/page-tree/mutations.ts` (27 KB) — the 11 tree mutations, all `NodeTree<TNode>`-generic
- `src/core/page-tree/operationSchema.ts` — `TreeOperation` discriminated union + `applyTreeOperation` dispatcher (the plugin/agent entry to the same engine)
- `src/core/page-tree/dnd.ts` — `resolvePageTreeDropTarget` (lock/cycle/slot drop rules)
- `src/core/page-tree/selectors.ts`, `parentIndex.ts`, `cloneNode.ts`, `subtreeRemoval.ts` — traversal/clone/prune
- `src/core/page-tree/breakpoint.ts`, `styleRule.ts`, `condition.ts`, `cssPropertyBag.ts`, `classNames.ts` — breakpoints, class registry, custom conditions, style bags
- `src/core/page-tree/dynamicBinding.ts` — `DynamicPropBinding` (template data binding: currentEntry/parentEntry/page/site/route)
- `src/core/page-tree/siteDocument.ts` — `SiteShell`/`SiteDocument` shapes
- `src/core/module-engine/registry.ts` — `ModuleRegistry` singleton (register/get/listByCategory/subscribe)
- `src/core/module-engine/types.ts` (19 KB) — `ModuleDefinition`, `RenderOutput {html,css?,js?}`, `ModuleComponentProps`, `InlineEditBinding`, sandbox runtime
- `src/core/module-engine/propertySchema.ts`, `validateNodeProps.ts`, `runtimeResolver.ts`
- `src/modules/base/` — the first-party module library (container, text, image, button, link, body, loop, slot-instance, visual-component-ref, …)

Canvas UI (the visual editor proper):
- `src/admin/pages/site/canvas/IframeFrameSurface.tsx` — the iframe primitive (srcDoc boot, portal, event bridging)
- `src/admin/pages/site/canvas/CanvasRoot.tsx`, `CanvasTransformLayer.tsx`, `BreakpointFrame.tsx` — design mode pan/zoom multi-breakpoint
- `src/admin/pages/site/canvas/CanvasLiveSurface.tsx` — live mode single frame + resize handles
- `src/admin/pages/site/canvas/NodeRenderer.tsx` — recursive React node tree (the heart of editor rendering)
- `src/admin/pages/site/canvas/canvasDnd.ts`, `useCanvasReorderDrag.ts`, `canvasDomGeometry.ts` — drag-reorder + geometry
- `src/admin/pages/site/canvas/{ClassStyleInjector,EditorChromeInjector,UserStylesheetInjector,RuntimeScriptInjector}.tsx` — CSS/JS injection
- `src/admin/pages/site/canvas/ModuleSandboxFrame.tsx` + `moduleSandboxSrcDoc.ts` — plugin module `sandbox="allow-scripts"` postMessage isolation
- `src/admin/pages/site/canvas/useCanvasKeyboardShortcuts.ts`, `useIframeCursorBridge.ts`, `iframeEventCoordinates.ts` — cross-iframe input
- `src/admin/pages/site/store/slices/` — `canvasSlice` (zoom/pan/view/activeBreakpoint), `selectionSlice` (multi-select), `inlineEditSlice` (contentEditable session), `siteSlice`, `styleRuleSlice`, `visualComponentsSlice`, `clipboardSlice`, `saveTrackingSlice`
- `src/admin/pages/site/{panels,property-controls,toolbar,module-picker,sidebars}/` — Properties panel, DOM tree, color/spacing/typography panels, module picker
- `src/admin/SitePage.tsx`, `src/admin/pages/site/SitePage.tsx` — workspace mount
- Docs: `docs/features/canvas-iframe-per-frame.md`, `docs/features/modules.md`, `docs/features/visual-components.md`, `docs/features/loops.md`, `docs/features/templates.md`, `docs/reference/page-tree.md`
- Storage: `convex/schema.ts` → `site`, `site_snapshots`, `data_tables`, `data_rows`

**personal-brand-os** (`/home/rahman/projects/_templates/personal-brand-os`) — NOT a canvas, only a foil:
- `frontend/slices/landing-sections/` — config-driven, fixed section kinds, up/down reorder arrows. No tree, no drag-drop, no per-node styling.
- `convex/landing.ts` — `landingSections` table: `{ sectionId, data }` blob upsert keyed by `sectionId`.
- `convex/pages.ts` — `pages` table: `{ entryId, slug, data }` blob upsert keyed by `entryId`, `data: v.any()`. A page is just an opaque blob; the structure/editor lives entirely client-side.

---

## Data model

Instatic page tree (the shape worth lifting):

```ts
// the universal tree primitive
NodeTree<TNode> = { nodes: Record<nodeId, TNode>; rootNodeId: string }

BaseNode = {
  id: string                  // nanoid
  moduleId: string            // "namespace.module-name", e.g. "base.text"
  props: Record<string, unknown>             // flat, no dot-nesting
  breakpointOverrides: Record<bpId, Record<string, unknown>>  // shallow-merged per breakpoint
  children: string[]          // ordered child ids (single default slot)
  parentId?: string | null    // DERIVED cache of children arrays (reindexed on load)
  label?: string              // overrides module name in DOM tree
  locked?: boolean            // not selectable/movable
  hidden?: boolean            // hidden on canvas, still in tree
  classIds: string[]          // ordered refs into the site class registry
  inlineStyles?: Record<string, unknown>     // base-only inline style layer (camelCase CSS)
  propBindings?: Record<propKey, { paramId }> // VC param substitution
}
PageNode = BaseNode & { dynamicBindings?: Record<propKey, DynamicPropBinding> }
Page     = NodeTree<PageNode> & { id, slug, title, template?, *byUserId? }

DynamicPropBinding = { source: 'currentEntry'|'parentEntry'|'page'|'site'|'route';
                       field: string; format?: 'plain'|'html'|'url'|'media';
                       fallback?: 'static'|'empty' }

// site shell (separate from pages)
SiteShell = { id, name, breakpoints: Breakpoint[], conditions?: ConditionDef[],
              styleRules: Record<classId, StyleRule>, settings, files… }

TreeOperation =   // discriminated union, applied via applyTreeOperation(tree, op)
  | insertNode{parentId,index,node} | updateNodeProps{nodeId,props}
  | setBreakpointOverride{nodeId,breakpoint,props} | clearBreakpointOverride{nodeId,breakpoint}
  | renameNode{nodeId,name} | toggleNodeLocked{nodeId} | toggleNodeHidden{nodeId}
  | moveNode{nodeId,parentId,index} | duplicateNode{nodeId}
  | wrapNode{nodeId,wrapper{moduleId,defaults?}} | deleteNode{nodeId}
```

Convex persistence (Instatic, self-hosted, nanoid string PKs via `by_app_id`, never `_id`):
- `data_rows` — every page IS a row where `table_id = 'pages'`; the node tree lives in `cells_json` (opaque `v.string()`, parsed in app code). Columns: `id, table_id, cells_json, slug, status('draft'|'published'|'unpublished'|'scheduled'), active_version_id, *_by_user_id, *_at`. Indexes: `by_table_slug`, `by_table_status_updated`, `by_table_author_updated`, `by_scheduled_publish`, `by_active_version`.
- `data_tables` — collection metadata; `kind` includes `'page'|'component'|'layout'|'postType'|'data'`; `fields_json` defines columns.
- `data_row_versions` — publish history snapshots.
- `site` (`settings_json`) + `site_snapshots` (`site_json`, `content_hash`) — the SiteShell + full document snapshots.

personal-brand-os (the lazy contrast): `pages` table `{ entryId, slug, data }` — `data: v.any()` whole-page blob, indexes `by_slug`/`by_entryId`. No node-level model server-side at all.

---

## Public API

Instatic page-tree mutations are **engine functions** (not Convex), exercised two ways:
- Editor: 11 named store actions (`insertNode`, `deleteNode`, `updateNodeProps`, `setBreakpointOverride`, `clearBreakpointOverride`, `renameNode`, `toggleNodeLocked`, `toggleNodeHidden`, `moveNode`, `duplicateNode`, `wrapNode`) → one-liners over `mutateActiveTree`.
- Plugins/agent: `applyTreeOperation(tree, op)` over the `TreeOperation` union; plugin RPC `cms.content.tree.mutate` runs each op through the same engine (rides the editor's gates).

Persistence (Instatic Convex, thin pass-throughs in `server/repositories/*` → `convex/*`): page CRUD over `data_rows`, site shell save over `site`/`site_snapshots`. personal-brand-os exposes the laziest possible surface and is the right shape for an rr slice baseline:
- `pages.list()` / `pages.bySlug(slug)` — queries
- `pages.upsert({ entryId, slug, data })` / `pages.remove({ entryId })` — mutations, `requireUser(ctx)` first

---

## UI surface

Admin (visual editor):
- **Canvas** — `CanvasRoot` → design (`CanvasTransformLayer` pan/zoom, N `BreakpointFrame` iframes) or live (`CanvasLiveSurface`, single resizable iframe). `IframeFrameSurface` is the per-viewport primitive; `NodeRenderer` is the recursive node component.
- **Toolbar** — view toggle (design/live), breakpoint switcher, zoom, undo/redo (`UndoRedoButtons`), run-scripts toggle, mode toggle.
- **Module picker** — drag source for inserting modules, grouped by `registry.listByCategory()`.
- **DOM / Site explorer panel** — the tree as a draggable outline (lock/hide/rename/duplicate/delete context menus).
- **Properties panel** + property-controls — props editor, plus `ColorsPanel`, `SpacingPanel`, `TypographyPanel`, `SelectorsPanel`, `DependenciesPanel`, class registry editing, breakpoint/condition routing.
- **Overlays** — `BreakpointSelectionOverlay` (selection ring), `CanvasNotch`, `CanvasModeToggle`, `CursorTooltip`, context menus (cross-realm dismiss).
- **Inline editing** — in-place `contentEditable` on the real element (no overlay).

Public: published pages are static clean HTML emitted by the publisher pipeline (separate feature — `docs/features/publisher.md`), NOT a React renderer.

---

## Dependencies

npm (Instatic): `react@19` (+ React Compiler / Babel), `@dnd-kit/core`, `zustand` + `mutative` + `zustand-mutative` (patch-based undo), `dompurify` (publish-boundary sanitize), TypeBox (boundary validation, zod banned), `codemirror` + `@codemirror/*` (code-editing panels), `pixel-art-icons` (vendored icons). Vite (not Next). Bun runtime + hand-written `Bun.serve` router (server) — not portable.

rr-slice deps a portable slice would lean on: `icon-picker`/shadcn icons (replace pixel-art-icons), `data-table` (collection lists), `selection` (multi-select primitives), `command-menu` (slash/insert), `pages-cms` or `landing-sections` (the persistence + page-list scaffolding to graft onto), `theme-presets` (token styling), `convex-auth`/`rbac-roles` (mutation gating). For the dnd outline, the rr Source Map points at `notion-page-clone` `block-selection` + `workspace-sidebar` slices.

---

## rr coverage

**net-new.** Verified against every plausible existing slice:

| rr slice | What it is | Why it does NOT cover this |
|---|---|---|
| `pages-cms` | block-composed multi-page CMS: `PageEntry.blocks: PageBlock[]`, 11 fixed `kind`s, renderer/editor `switch` on `block.kind`, reorder by index | **Flat ordered block list, not a tree.** No nesting, no arbitrary modules, no per-node CSS classes/inline-styles/breakpoint overrides, no drag-drop onto a canvas, no iframe, no inline contentEditable. It is the "lazy" sibling of this feature. |
| `landing-sections` | config-driven section renderer, fixed kinds, up/down arrows | Even flatter than pages-cms; pure section composition. |
| `ai-studio` | "Generation Canvas" — AI prompt → streaming output | "Canvas" is a generation viewport, not a layout editor. |
| `media-studio` | photo/social design canvas (Konva-ish) | Raster/graphic design, not an HTML page tree. |
| `image-editor` / `reel-editor` | layer editors | Different domain (raster/video), not a DOM node tree. |
| `notion` (+ `block-selection`, `command-menu`) | document block editor with slash menu + drag | Closest *primitive* match (block tree + dnd), but a writing/document surface — no breakpoints, no class registry, no per-node CSS, no iframe-fidelity rendering, no published-HTML target. Reusable as a **building block**, not coverage. |

Proposed new slug: **`visual-page-canvas`** (frontend slice + optional `convex/features/visual-page-canvas`).

---

## Slice plan

**Action: build-new.** Effort: **L** (this is the single largest harvest in the catalog).

### Laziest correct path (ponytail)

Do NOT attempt to port Instatic's full editor (iframe-per-breakpoint × N + plugin QuickJS sandbox + runtime-script bundler + clean-HTML publisher + Visual Components + dynamic data + template loops) into one slice. That is 148-file engine territory and most of it is separate harvest features (publisher, plugin-system, loops, html-import, visual-components each get their own slug). Lift the **minimum viable WYSIWYG core**, props-driven, and stop:

1. **Engine first, headless.** Lift `src/core/page-tree` (`NodeTree`, `BaseNode`, the 11 `mutations.ts`, `operationSchema.ts` + `applyTreeOperation`, `dnd.ts`, `selectors.ts`, `parentIndex.ts`, `cloneNode.ts`) verbatim into `slices/visual-page-canvas/lib/`. It already has zero editor/UI imports (Constraint #269) — this is the cleanest part to port. Swap TypeBox → light runtime checks or keep types-only (rr bans zod; TypeBox is fine but heavy — prefer plain TS types + a tiny validate for the persistence boundary).
2. **Module registry, props-injected.** Lift `module-engine/registry.ts` + `types.ts`. Ship 4-6 starter modules (body, container, text, image, button) as a default registry, but accept a consumer registry via context/prop so the slice never hardcodes a module set.
3. **ONE iframe, ONE breakpoint to start.** Port `IframeFrameSurface` + `NodeRenderer` + the three CSS injectors as a single-frame `live`-style canvas with `@dnd-kit/core` reorder. Skip the multi-breakpoint pan/zoom `CanvasTransformLayer` in v1 (gate it behind a later `enhance`). Breakpoint overrides stay in the data model from day one (cheap) but the multi-frame UI is deferred.
4. **Selection + Properties + inline edit.** Port `selectionSlice` (multi-select), a minimal Properties panel (props + classIds + inlineStyles), and `inlineEditSlice` contentEditable. These are the payoff.
5. **Persistence adapter seam.** Default to a localStorage adapter (the rr demo rule — no Convex in the site). Provide `convex/features/visual-page-canvas` as copy-source: a `pages`-style table storing the tree blob, modeled on personal-brand-os `pages.upsert` but with the richer Instatic columns (status, slug index). Inject the adapter; never call Convex directly from the slice.

### Portability blockers to strip

- **`pixel-art-icons` (vendored, deep-imported)** → swap to shadcn/lucide via rr `icon-picker`. Hard rule: no inline SVG strings.
- **CSS Modules + `globals.css` `--editor-*` tokens + the "no hardcoded hex" gate** → rr is Tailwind 4 + shadcn theme tokens. This is the biggest cosmetic lift: every `*.module.css` must become Tailwind/shadcn. The *editor chrome* CSS injected into the iframe (`EditorChromeInjector`) must be rewritten to emit from theme tokens, not CSS-module class names.
- **In-house admin router `@site`/`src/admin/lib/routing`** (react-router-dom banned in Instatic) → rr uses `next/link`/`SmartLink`. Strip all `@site`/`@core` path aliases → `@/features/visual-page-canvas/*`.
- **Bun server + `server/convex/client.ts` + `server/repositories/*` thin pass-throughs** → not portable; replace with the injected persistence adapter + standard Convex `mutation`/`query` (`args: v.*`, `requireUser`/`requireAdmin`, `.withIndex().take(N)`, no bare `.collect()`).
- **TypeBox everywhere** → keep types-only in the slice; validate only at the persistence boundary (rr doesn't mandate TypeBox).
- **React Compiler reliance** (no manual memo) → rr is React 19 too; fine, but the hot recursive `NodeRenderer` should keep its `React.memo` bailout (exception case).
- **Vite `srcDoc` iframe + React 19 portal nuances** → works under Next 16 client components, but the canvas MUST be a client-only (`"use client"`) island; no SSR of the iframe tree.
- **Plugin sandbox / runtime scripts / Visual Components / dynamic-data loops** → explicitly OUT of v1; each is its own harvest slug. Keep `breakpointOverrides`/`dynamicBindings` in the data shape (forward-compatible) but don't build their UI.

### Proposed `slice.json` shape

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "visual-page-canvas",
  "version": "0.1.0",
  "category": "content",
  "kind": "ui",
  "title": "Visual Page Canvas — drag-drop WYSIWYG page builder",
  "description": "Free-form visual editor over a universal NodeTree: drag arbitrary modules onto an iframe canvas, nest into a tree, style each node (classes + inline styles + per-breakpoint overrides), edit text in place via real contentEditable, reorder by drag. Props-driven module registry + injectable persistence adapter (localStorage default; Convex copy-source). Distinct from pages-cms (flat block list) — this is a nested node tree with per-node CSS.",
  "namespace": "@/features/visual-page-canvas",
  "frontend": { "slicePath": "frontend/slices/visual-page-canvas", "configExport": "visualPageCanvasFeature" },
  "convex": { "tablesExport": "visualPageCanvasTables", "schemaPath": "convex/features/visual-page-canvas/_schema.ts", "rootPaths": ["convex/features/visual-page-canvas"] },
  "deps": {
    "npm": ["@dnd-kit/core@^6.3.1", "zustand@^5", "mutative@^1.3.0", "zustand-mutative@^1.3.1", "dompurify@^3.4.2", "lucide-react@^0.400.0"],
    "shadcn": ["button","input","textarea","label","select","switch","card","dialog","tabs","scroll-area","tooltip","context-menu","separator","popover"],
    "env": [], "peers": []
  },
  "registers": [],
  "tags": ["content","cms","page-builder","wysiwyg","drag-drop","canvas","node-tree","editor","builder"],
  "contract": {
    "requires": { "deps": [
      { "npm": "@dnd-kit/core", "range": "^6.3.1" },
      { "npm": "zustand", "range": "^5" },
      { "npm": "mutative", "range": "^1.3.0" }
    ] },
    "provides": {
      "components": ["VisualPageCanvas","CanvasRoot","IframeFrameSurface","NodeRenderer","PropertiesPanel","DomTreePanel","ModulePicker","CanvasToolbar"],
      "utils": ["applyTreeOperation","resolvePageTreeDropTarget","reindexNodeParents","cloneNode","emptyPage","defaultModuleRegistry"],
      "hooks": ["useCanvasStore","useActiveTree","useSelection","useInlineEdit"],
      "convex": { "tables": ["pages"], "rbac": [] }
    }
  }
}
```

Backend (`convex/features/visual-page-canvas`), modeled on personal-brand-os `pages.ts` but with richer columns:
- table `pages` { id (nanoid `v.string()`), slug, title, status, tree_json (`v.string()` opaque NodeTree), updatedAt } indexed `by_slug`, `by_status_updated`.
- `list()` (`.withIndex().take(N)`), `bySlug({slug})`, `upsert({id,slug,title,tree})` + `requireUser`/`requireAdmin`, `remove({id})`. Validate all args with `v.*`. The tree is stored opaque and parsed in app code (mirror Instatic's `*_json` rule).
