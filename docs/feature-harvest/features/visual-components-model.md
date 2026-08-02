# Visual Components Model / registry

> Harvest target slug: `visual-components-model`. Coverage verdict: **net-new**
> (the tree-based reusable-component engine). The flat "block/section registry"
> idea is partially covered by `landing-sections` / `pages-cms`, but the
> defining capability — parameterized, slot-bearing, recursively-composable
> **reusable subtree components inlined at publish time** — exists nowhere in rr.

This harvest comes almost entirely from **Instatic** (`Instatic-convex`).
personal-brand-os contributes only the *shallow* comparison point: a static
`Record<type, BlockDef>` block registry.

---

## What it does (flow)

A **Visual Component (VC)** is a reusable subtree of nodes authored once, given
**typed named parameters** and **named slots**, then dropped onto pages (or into
other VCs) as a single reference node and **inlined by the publisher at render
time**. It is React's "props + children" pattern, but as *data* inside a visual
page-builder rather than as code.

Two layers stack here, and the harvest title ("Model / registry") names both:

1. **Module registry** (`src/core/module-engine/registry.ts`) — a runtime
   singleton mapping `moduleId` (e.g. `base.text`, `acme.hero`) → a
   `ModuleDefinition` (render fn, editor component, property schema, icon,
   category, `publishBehavior`). Base modules self-register on boot; plugin
   module-packs register dynamically. This is the *type* registry — "what kinds
   of node can exist". `useSyncExternalStore`-friendly via `subscribe()` +
   `generation()`.

2. **Visual Components model** (`src/core/visualComponents/`) — *user-authored*
   reusable components, stored as data rows, each one a `NodeTree<VCNode>` plus
   a `params: VCParam[]` list. This is the harvest gold.

End-to-end control/data flow:

```
Author a VC
  └─ open Site → Components, build a subtree (containers/text/image/…)
  └─ drop base.slot-outlet nodes  → each distinct slotName = one slot
  └─ add VCParam[] (typed: string/number/boolean/url/enum/color/image/richText/slot)
  └─ bind any node prop → a param via node.propBindings[propKey] = { paramId }
  └─ saved to data_rows (table_id = 'components') via visualComponentToCells()

Consume a VC on a page
  └─ drop a base.visual-component-ref node (props.componentId = vc.id)
  └─ wouldCreateCycle() guards against recursive refs   → abort if cycle
  └─ syncSlotInstances(ref, vc, tree.nodes) → spawns one LOCKED
       base.slot-instance child per slot, seeded with the outlet's default
       children; user fills slots with ORDINARY page-tree nodes inside them
  └─ instanceProps (keyed by VCParam.id) hold the per-instance param values

Edit-time preview (canvas)
  └─ VisualComponentRefEditor → instantiateVCAtRef() → flat node map
       (prop bindings substituted, slot-outlets expanded with consumer content)
  └─ VCInlineTree renders that map via the module registry; base.body is
       transparent (renders children, never a real <body>)

Publish-time render
  └─ walker hits base.visual-component-ref → renderVisualComponentRef()
  └─ instantiateVCAtRef() → synthetic Page → renderNode() with the SAME
       cssMap accumulator (CSS dedup shared with outer page) and inherited
       loopData / mediaAssets / templateContext (loops + images inside a VC
       body still resolve)
  └─ ref's classIds + inlineStyles injected onto the VC's rendered root element

Maintain
  └─ rename a slot outlet → positional-fallback match carries user content
  └─ delete a VC → previewVCDeletion() enumerates every page + VC ref usage;
       on confirm removeNodeSubtrees() splices every ref subtree everywhere
  └─ Componentize: promote any page subtree → a new VC + replace it with a ref
```

The product invariant that makes this elegant: **everything is one tree
primitive**. Pages, VC definitions, and slot fills are all `NodeTree<TNode>`.
Mutations are tree-agnostic; only `mutateActiveTree` knows which tree is active.
A VC ref nested inside another VC reconciles exactly like a ref on a page.

---

## Where it lives

### Instatic (`/home/rahman/projects/Instatic-convex`)
Core model (the portable nucleus):
- `src/core/visualComponents/schemas.ts` — `VisualComponentSchema`, `VCParamSchema`, `VCNodeSchema` (TypeBox SSOT; `VCNode === BaseNode`)
- `src/core/visualComponents/index.ts` — public barrel
- `src/core/visualComponents/instantiate.ts` — `instantiateVCAtRef()` (the heart: prop-binding substitution + slot-outlet expansion → flat node map)
- `src/core/visualComponents/slotSync.ts` — `syncSlotInstances()`, `applySlotSyncResult()`, `collectSlotOutletNames()` (name-first, positional-fallback reconciler)
- `src/core/visualComponents/recursionGuard.ts` — `wouldCreateCycle()`, `getReferencedComponentIds()`
- `src/core/visualComponents/deletionImpact.ts` — `previewVCDeletion()` → `VCDeletionImpact`
- `src/core/visualComponents/vcRefs.ts` — `forEachVCRef()`, `collectVCRefs()` (single VC-ref predicate)
- `src/core/visualComponents/nameValidation.ts` — `validateComponentName`, `validateParamName`, `vcSlugFromName`
- `src/core/visualComponents/virtualPage.ts` — `flattenVCToVirtualPage()`, `parseVirtualVCPageId()` (VC-mode wrapper so page-mode code paths edit a VC unchanged)
- `src/core/visualComponents/origin.ts`, `propGuards.ts`
- `src/core/visual-components-schema/index.ts` — thin schema-leaf re-export (low-level import seam)

Registry layer:
- `src/core/module-engine/registry.ts` — `ModuleRegistry` singleton (`register`/`getOrThrow`/`list`/`listByCategory`/`subscribe`/`generation`)
- `src/core/module-engine/types.ts` — `ModuleDefinition`, `IModuleRegistry`, `RenderOutput { html, css?, js? }`, `ModuleComponentProps`, `NodeWrapperProps`
- `src/core/module-engine/propertySchema.ts` — `PropertyControl` / `PropertySchema` (drives the Properties Panel form)
- `src/core/module-engine/index.ts`, `src/core/module-engine-schema/index.ts` — barrels

Storage adapter + Convex:
- `src/core/data/componentFromRow.ts` — `visualComponentFromRow()` / `visualComponentToCells()` (VC ↔ DataRow round-trip)
- `convex/schema.ts` — `data_tables` (kind `'component'`), `data_rows`, `data_row_versions`
- `convex/dataRows.ts`, `convex/dataTables.ts`, `convex/dataPublish.ts`
- `server/handlers/cms/components.ts` — `GET`/`PUT /admin/api/cms/components`
- `server/repositories/*` — thin pass-throughs to Convex

Editor + publisher integration:
- `src/modules/base/visualComponentRef/VCInlineTree.tsx`, `VisualComponentRefEditor.tsx`
- `src/core/publisher/renderVisualComponentRef.ts`
- `src/admin/pages/site/componentization/componentizeEligibility.ts` (`canComponentizeNode`)
- `src/admin/pages/site/panels/PropertiesPanel/ConvertToComponentButton.tsx`
- `src/admin/pages/site/store/slices/visualComponentsSlice.ts` (`convertNodeToComponent`, `deleteVisualComponent`)
- `src/admin/pages/site/store/slices/vcSlotReconcile.ts` (`allTreeNodeMaps`, `syncAllVCRefSlotInstances`)
- Feature doc (excellent, read it): `docs/features/visual-components.md`

### personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)
Only the *shallow* registry analog — NOT a tree model:
- `components/blocks/registry.ts` — `REGISTRY: Record<string, BlockDef>` SSOT (`hero`/`stats`/`featureGrid`/…), `BLOCK_ORDER`, `createInstance()`, `DEFAULT_CONFIG`
- `components/blocks/types.ts` — `BlockDef` (`{ type, name, component, fields: Field[], defaults, collection? }`), `BlockInstance`, `PageConfig` (`{ blocks, pages?, collections? }`)
- `components/blocks/BlockRenderer.tsx` — flat `blocks.map(b => REGISTRY[b.type].component)`; injects shared `collections[source]` into `collection` blocks
- `components/blocks/{Hero,FeatureGrid,Pricing,Testimonials,Faq,Cta,…}.tsx`

PBO's model is one level deep: a block is `{ type, props }`, no children, no
slots, no params, no recursion, no inlining. It is exactly the rr `pages-cms` /
`landing-sections` shape, not the VC model.

---

## Data model

### Convex tables (Instatic — `convex/schema.ts`)
VCs are NOT a dedicated table. They live in the **unified content store**:

- `data_tables` — `kind: 'component'` is one of the 5 system table kinds
  (`postType|data|page|component|layout`). The `components` system table is
  seeded + locked. Fields: `id` (nanoid `v.string`), `name`, `slug`, `kind`,
  `fields_json`, `system`, timestamps. Indexes `by_app_id`, `by_slug`.
- `data_rows` — one row **is** one VC. `table_id = 'components'`. Columns:
  `id` (= the VC id), `table_id`, `cells_json` (opaque `v.string`), `slug`,
  `status` (draft/published/unpublished/scheduled), `active_version_id`,
  author/timestamps. Indexes: `by_app_id`, `by_table_slug`,
  `by_table_status_updated`, `by_active_version`, etc.
- `data_row_versions` — version history (`row_id`, `version_number`, `cells_json`).

`cells_json` decodes to `DataRowCells`; for a component row:
`{ name, slug, body: { nodes, rootNodeId }, params: VCParam[], classIds: string[] }`.
The `body` cell is the VC tree. Round-trip via `componentFromRow.ts`.

### In-memory shapes (TypeBox SSOT, `schemas.ts`)
```ts
VisualComponent = {
  id: string            // = the data_rows.id
  name: string          // unique within the site; validated at write boundary
  tree: { nodes: Record<string, VCNode>, rootNodeId: string }   // flat NodeTree
  params: VCParam[]
  classIds: string[]
  createdAt: number
}

VCParam = {
  id: string            // nanoid; STABLE across renames — refs point at id, not name
  name: string          // free-form, unique within VC
  type: 'string'|'number'|'boolean'|'url'|'enum'|'color'|'image'|'richText'|'slot'
  description?: string
  defaultValue: unknown
  required: boolean
  enumOptions?: string[]   // only for type 'enum'
}

VCNode === BaseNode    // structurally identical to a page node, MINUS dynamicBindings
// BaseNode (flat): { id, moduleId, props, children: string[], parentId?,
//                    classIds, inlineStyles?, propBindings?, locked?, hidden?, ... }
```

Key relational facts:
- **Slots are not a field.** A slot is any `base.slot-outlet` node in the VC
  tree; its `props.slotName` (default `'children'`) names the slot. N outlets
  with the same name = 1 slot, multiple render positions.
- **Slot fills are not a prop.** On the consumer page, the
  `base.visual-component-ref` gets one `base.slot-instance` child per slot
  (`locked: true`); user content is ordinary nodes inside it, living in the
  consumer page tree.
- **Param binding** is `node.propBindings[propKey] = { paramId }` inside the VC
  tree; `node.props[propKey]` holds the design-time default; render overrides it.
- **Instance values** are `ref.instanceProps` keyed by `VCParam.id`.

### Module registry shape (`module-engine/types.ts`)
```ts
ModuleDefinition<TProps> = {
  id: string            // namespaced "ns.name"; bare ids rejected
  name; description?; category: string; icon: IconComponent; version: string
  trusted: boolean      // true = mounts in React tree; false = sandboxed iframe
  canHaveChildren: boolean
  inlineTextEdit?: { prop: string; multiline?: boolean }
  publishBehavior?: 'standard'|'special'|'transparent'   // 'special' = publisher renderer keyed by id (VC ref, loop)
  dynamic?: boolean; staticPlaceholder?: (p)=>string
  schema: PropertySchema                 // SSOT for the Properties Panel form
  defaults: TProps
  render(props, children): RenderOutput   // { html, css?, js? } — clean HTML, no React
  component: ComponentType<ModuleComponentProps<TProps>>   // editor preview
}
```

---

## Public API

REST (Bun server, `server/handlers/cms/components.ts`):
- `GET /admin/api/cms/components` — list all non-deleted component rows as raw
  `DataRow[]` (client reconstructs VCs via `visualComponentFromRow`).
- `PUT /admin/api/cms/components` — incremental roster save. Body =
  `{ componentIds: string[], changedComponents: VisualComponent[] }`. Server
  validates partial write (`validateVisualComponentsForPartialWrite`), converts
  via `visualComponentToCells`, and writes through `dataRows` (`table_id =
  'components'`). Deletes = ids absent from `componentIds`.

Convex functions: generic `convex/dataRows.ts` + `convex/dataTables.ts` (list /
upsert / publish rows by `table_id`) — there is no `components`-specific Convex
module; the component-ness is just a `table_id` filter.

Engine API (the genuinely portable surface, all pure + tree-agnostic):
- `instantiateVCAtRef(vc, propOverrides, slotInstancesByName, pageNodes, refId) → { nodes, rootNodeId }`
- `syncSlotInstances(refNode, vc, allNodes) → SyncResult` + `applySlotSyncResult(nodesMap, result)`
- `collectSlotOutletNames(vc) → string[]`
- `wouldCreateCycle(allVCs, hostVcId, candidateChildVcId) → boolean`
- `getReferencedComponentIds(vc) → Set<string>`
- `previewVCDeletion(site, vcId) → VCDeletionImpact | null`
- `forEachVCRef(nodes, cb)` / `collectVCRefs(nodes)`
- `validateComponentName` / `validateParamName` / `vcSlugFromName`
- `parseVisualComponent(raw) → VisualComponent | null` (tolerant)

Registry API: `registry.register / registerOrReplace / unregister / get /
getOrThrow / has / list / listByCategory / subscribe / generation`.

---

## UI surface

Admin (Instatic editor):
- **Site → Components** panel — VC roster (create/rename/delete).
- **VC-mode canvas** — same canvas as page-mode; `flattenVCToVirtualPage` wraps
  the VC tree so all 11 tree mutations work unchanged.
- **Parameters panel** — add/edit `VCParam`s (type-driven defaults).
- **Properties Panel** — per-prop "Bind to param" affordance; consumer side
  shows type-driven controls (`Input`/`Switch`/`Select`/`ColorInput`/…) for each
  param on a ref.
- **Componentize** — Layer context-menu item + Properties-Panel button
  (`ConvertToComponentButton`), gated by `canComponentizeNode`. Inline name-input
  strip → `convertNodeToComponent`.
- **Delete-impact dialog** — `previewVCDeletion` usage list before confirm.

Public / render:
- `renderVisualComponentRef` — server-side inlining into clean HTML/CSS.
- `VCInlineTree` / `VisualComponentRefEditor` — live canvas preview (React).

Note: this UI is **deeply canvas-coupled** (iframe-per-frame, zustand+mutative
editor store, dnd-kit, pixel-art-icons). It is NOT directly portable — see Slice
plan.

---

## Dependencies

Engine core (portable): `@sinclair/typebox` (schemas), `nanoid` (ids). Nothing
else — `instantiate.ts` / `slotSync.ts` / `recursionGuard.ts` /
`deletionImpact.ts` are pure functions over a `NodeTree<TNode>` shape.

Heavy coupling that blocks a naive lift:
- `@core/page-tree` / `@core/page-tree-schema` (the `NodeTree<TNode>` + `BaseNode`
  primitive + the 11 tree mutations) — VC model is meaningless without it.
- `@core/module-engine` (registry + `ModuleDefinition.render`) — needed to turn
  nodes into output.
- `@core/publisher` (`renderVisualComponentRef`, loop/media prefetch).
- Editor: zustand + `zustand-mutative`, `@dnd-kit/core`, CodeMirror, React 19 +
  React Compiler, `pixel-art-icons`, Bun server, self-hosted Convex.

rr-slice deps (if built): would peer on a future **page-tree / visual-builder**
slice (does not exist in rr today) and optionally `pages-cms` for storage.

---

## rr coverage

**net-new.** Verified against the three nearest slices:

- `frontend/slices/landing-sections` — a **flat section registry**:
  `LandingSectionKind` union → per-template renderer; sections carry
  `{ kind, order, title, subtitle, enabled, config: JSON }`. No children, no
  params, no slots, no reuse-as-reference, no inlining. Config is free-form JSON
  merged over template defaults. Covers "ordered list of typed sections" only.
- `frontend/slices/pages-cms` — a **flat block CMS**: `PageBlock` discriminated
  union of 11 kinds, `BlockRenderer` switches on `block.kind`, multi-page +
  duplicate + publish. Self-contained, no slice coupling. Again: one level deep,
  no tree, no params, no slots, no component-of-components.
- `frontend/slices/feature-grid` — a single prop-driven section (deprecated into
  landing-sections). Irrelevant to the model.

personal-brand-os `components/blocks/registry.ts` is the same shape as
`pages-cms`: `Record<type, BlockDef>` with `fields`/`defaults`, flat
`BlockInstance { type, props }`, optional shared `collections`. It is the
**registry** half done shallowly, and rr already has that half.

What is genuinely **missing in rr** (the harvest gold):
1. A **tree** node primitive (`NodeTree<TNode>`) — rr blocks are flat.
2. **Reusable parameterized components** referenced by id, with **typed params**
   and **prop bindings**.
3. **Named slots** (`slot-outlet`/`slot-instance`) with name-first/positional
   reconciliation that preserves user content across renames.
4. **Recursion guarding**, **deletion-impact analysis**, **componentize-from-
   selection**, and **publish-time inlining with shared CSS dedup**.

None of these exist anywhere in the rr catalog. Proposed slug:
`visual-components-model`.

---

## Slice plan

**Action: build-new — but gated.** Effort: **L**.

This is the rare harvest where "faithful" and "lazy-correct" diverge hard. The
full Instatic feature is welded to a page-tree engine, a module registry, a
publisher, and a canvas editor that rr does not have. Lifting it 1:1 means
lifting four engines first. **Do not do that.** Ponytail path, in order of
increasing ambition:

1. **Laziest correct (M, recommended first): "reusable block group" on top of
   `pages-cms`/`landing-sections`.** rr's flat block model can express ~80% of
   the *value* without a tree engine:
   - Add a `BlockGroup = { id, name, params: Param[], blocks: PageBlock[] }`
     stored alongside pages.
   - Add a `{ kind: 'group-ref'; groupId; instanceProps }` block.
   - Renderer expands a `group-ref` inline, substituting `instanceProps` into
     marked `{{param}}` placeholders in the group's blocks.
   - One named slot = a single `children` array on the ref (rr blocks are flat,
     so "one default slot" like `ModuleDefinition.canHaveChildren` is enough).
   - Port `wouldCreateCycle` + `previewVCDeletion` *as-is* (pure, tree-agnostic;
     they only need a "refs in a node list" walker — `forEachVCRef` generalizes).
   This is shippable on the existing rr block primitive and reuses pages-cms
   storage. Recursion-guard + deletion-impact + name validation port verbatim.

2. **Faithful (L, only once rr has a tree builder): headless `visual-components-
   model` slice.** Lift the pure logic core unchanged — `schemas.ts`,
   `instantiate.ts`, `slotSync.ts`, `recursionGuard.ts`, `deletionImpact.ts`,
   `vcRefs.ts`, `nameValidation.ts`, `origin.ts`, `propGuards.ts` — and make it
   operate on a host-injected `NodeTree<TNode>` adapter (the consumer supplies
   the tree primitive + a `renderNode` so the slice stays render-agnostic). This
   only earns its keep when/if rr ships a tree-based page builder; today it would
   be an orphan. Co-ship or wait.

**Portability blockers to strip** (hardcoded coupling found):
- `@core/page-tree*` import — replace with a generic `NodeTree<TNode>` type the
  slice declares and the host satisfies (injectable, not imported).
- `@core/module-engine` `registry.getOrThrow` calls inside render — replace with
  an injected `resolveModule(moduleId)` adapter.
- `base.*` magic module-id strings (`base.body`, `base.slot-outlet`,
  `base.slot-instance`, `base.visual-component-ref`) — these are Instatic's
  module namespace; lift them to slice-config constants
  (`SLOT_OUTLET_ID`, `REF_ID`, …) so a consumer can map to its own ids.
- `pixel-art-icons`, `zustand-mutative`, Bun/Convex `data_rows`,
  `CMS_API_PREFIX`/`/admin/api/cms/components` — all consumer-supplied; the
  storage round-trip (`componentFromRow.ts`) is Instatic-specific, replace with
  a `VisualComponentsStore` adapter port (load/save/list).
- Publisher CSS-dedup accumulator + loop/media prefetch — leave behind; the
  slice exposes `instantiateVCAtRef` and the host's renderer owns CSS dedup.
- React 19 + React Compiler assumption in the canvas components (`VCInlineTree`)
  — do not lift the canvas; expose the data, let the consumer render.

**No-go for a literal copy:** `VisualComponentRefEditor.tsx` / `VCInlineTree.tsx`
(iframe canvas), the zustand `visualComponentsSlice`/`vcSlotReconcile` store
slices, and `renderVisualComponentRef` (publisher) are all consumer-owned
integration code, not slice code.

### Proposed `slice.json` (if/when built as the faithful headless slice)
```jsonc
// frontend/slices/visual-components-model/slice.json
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "visual-components-model",
  "version": "0.1.0",
  "category": "content",
  "kind": "lib",                       // headless logic, not a drop-in UI
  "title": "Visual Components Model",
  "description": "Headless engine for reusable, parameterized, slot-bearing tree components: typed params + prop bindings, named slots with name-first/positional reconciliation, recursion guarding, deletion-impact analysis, and ref instantiation. Tree-primitive- and renderer-agnostic via injected adapters. Port of Instatic's src/core/visualComponents.",
  "namespace": "@/features/visual-components-model",
  "frontend": { "slicePath": "frontend/slices/visual-components-model", "configExport": "visualComponentsModelFeature" },
  "convex": {
    "tablesExport": "visualComponentsTables",
    "schemaPath": "convex/features/visual-components-model/schema.ts",
    "rootPaths": ["convex/features/visual-components-model"]
  },
  "deps": {
    "npm": ["@sinclair/typebox@^0.32", "nanoid@^5"],
    "shadcn": ["input", "select", "switch", "button", "label", "dialog"],  // only for the optional params/slot editor
    "env": [],
    "peers": ["page-tree-engine"]      // the NodeTree<TNode> primitive (does not exist in rr yet)
  },
  "contract": {
    "provides": {
      "utils": [
        "instantiateVCAtRef", "syncSlotInstances", "applySlotSyncResult",
        "collectSlotOutletNames", "wouldCreateCycle", "getReferencedComponentIds",
        "previewVCDeletion", "forEachVCRef", "collectVCRefs",
        "validateComponentName", "validateParamName", "vcSlugFromName",
        "parseVisualComponent"
      ],
      "components": ["VCParamsEditor", "VCSlotList"],   // optional thin admin UI
      "convex": { "tables": ["visual_components"], "rbac": [] }
    },
    "requires": {
      "adapters": ["NodeTreeAdapter", "resolveModule", "VisualComponentsStore"]
    }
  }
}
```

Optional backend `convex/features/visual-components-model/`: a `visual_components`
table (`id` `v.string()` + `by_app_id`, `name`, `slug` + `by_slug`,
`tree_json` `v.string()`, `params_json` `v.string()`, `classIds_json`,
`createdAt` `v.number()`, `updatedAt`) with validated `list`/`upsert`/`remove`
mutations, `requireAdmin` on every write, `.withIndex(...).take()` (no bare
`.collect()`). Mirrors Instatic's `data_rows` row but as a dedicated table since
rr has no unified-content store.

**Bottom line for the harvest queue:** mark net-new, recommend the **M** "reusable
block group on pages-cms" first (real value, no engine debt), and defer the **L**
faithful headless port until rr grows a tree-based builder primitive.
