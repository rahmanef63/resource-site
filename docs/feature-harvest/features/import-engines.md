# Import engines (html-import, site-import, site-transfer)

> Harvest note: this slug covers **three** engines that Instatic keeps separate.
> They sit on a spectrum from "deeply coupled to the visual editor" to "fully
> portable, backend-only". The honest answer is that only one of the three is a
> good standalone rr slice today; the other two are companion engines to the
> `visual-page-canvas` / `visual-components-model` harvest and should NOT be
> lifted on their own. Each engine is documented below in build-from-scratch
> depth, then the slice plan picks the laziest correct cut.

| Engine | What it ingests | Output | Portable alone? |
|---|---|---|---|
| **html-import** | an HTML string (paste / AI tool call) | flat fragment of `PageNode`s spliced into the live page tree | No — needs the page-tree + module model |
| **site-import** | a static-site folder / `.zip` (HTML+CSS+JS+fonts+media) | editable pages, style rules, design tokens, fonts, media, scripts | No — needs page-tree + style-rule registry + framework tokens |
| **site-transfer** | a CMS export `.zip` / JSON `SiteBundle` (whole-site snapshot) | restored Convex tables + rows + media + folders + redirects | **Yes** — backend-only, table-config-driven |

---

## What it does (flow)

### Engine 1 — html-import (`@core/htmlImport`)

Single pure entry point: `importHtml(source: string)` → `ImportResult`. It turns
arbitrary HTML into first-class editor nodes. Pipeline (all synchronous, browser
DOM only — no server DOM lib):

```
importHtml(source)
 1. parseHtml(source)              new DOMParser().parseFromString(source,'text/html')
 2. harvestInlineStyles(doc)       capture each element's style="" bag (camelCase,
                                   security-gated) BEFORE it is stripped, keyed by Element
    collectStyleCss(doc)           concatenate every <style> block's CSS before removal
 3. stripUnsafe(doc)               mutate in place: drop <script>, on* handlers
                                   (counted), <style>+style= (already harvested),
                                   comments/PIs → returns StripReport
 4. walkAndMap(doc, inlineStyles)  map doc.body element children → PageNodes via
                                   HTML_TO_MODULE_RULES, attach harvested inline bag
 → { nodes, rootIds, body?, stripped, styleCss }
```

Mapping is **rule-driven** (`HTML_TO_MODULE_RULES`, a declarative array in
`rules.ts`). The walker tests each element in order, first match wins, and the
last rule is `*` (catch-all → `base.container` with `tag:'custom'` + real tag
name) so **nothing falls through** — every element produces a node. Highlights:
`<h1>..<p>..<span>` → `base.text` (carries `tag`, not a level prop); `<a.btn>` →
`base.button`, plain `<a>` → `base.link`; `<img>` → `base.image` (`src` only,
alt lives on the media asset); `<form>`/`<input>`/`<select>`/`<option>` → form
primitives; void elements (`<br>`,`<hr>`) get a dedicated `recurse:false` rule
before the catch-all (React throws on children inside void tags). Two custom
elements bridge CMS concepts through the same path: `<instatic-outlet>` →
`base.outlet` (template content hole) and `<instatic-loop data-*>` → `base.loop`
(dynamic data repeater, config read from `data-source-id`/`data-table-id`/…).

Direct text inside a recursing container is preserved: the walker iterates
`childNodes` (not just `children`), and each significant text run becomes a
synthesized `base.text` child with `tag:'none'` (publishes as bare text, no
wrapper). Whitespace-only runs are dropped; internal whitespace collapses to a
single space; boundary spaces around element siblings are kept.

CSS is **preserved across two layers, both gated by `isEmittableProperty`** (the
publisher's property denylist):
- Inline `style="…"` → `node.inlineStyles` (the editor's per-node style layer).
- `<style>` blocks → returned raw as `result.styleCss`. `importHtml` does NOT
  parse CSS itself (would couple it to `@core/siteImport` and lose breakpoint
  context); the **consumer** parses with `cssToStyleRules(styleCss,{breakpoints})`
  into registry `StyleRule`s shown in the Selectors panel.

Class **names → ids** reconciliation is the load-bearing trick. `walkAndMap` is
registry-agnostic: it copies raw `class` names onto `node.classIds`
(`Array.from(el.classList)`). The store action `insertImportedNodes` then, inside
one `mutateActiveTreeAndSite` transaction (one undo step), rewrites each name to a
real style-rule id — reusing an existing class of that name, binding to a parsed
`<style>` rule of that name, or auto-creating a bare style-less class. Skipping
this step is the classic bug where HTML-authored styles silently never apply.

Two consumers, one pipeline: the **Paste-HTML modal** (`ImportHtmlModal`) and the
**AI agent tools** `insertHtml` / `replaceNodeHtml`. No duplicated mapping logic.

### Engine 2 — site-import (`@core/siteImport`)

Two-phase: a **pure synchronous analysis** `buildImportPlan({ fileMap, currentSite, options })` → `ImportPlan`, and an **async commit** `commitImportPlan(plan, adapter)`.
Headless — the pipeline carries no admin/React/server imports (gate:
`siteImport-headless.test.ts`).

```
drop files / folder / .zip
  ingestInput(input)                    → FileMap { files: Record<path,{bytes,mimeType}> }
  classifyFiles(fileMap)                → FileRole per file (html|css|js|image|font|binary|meta)
  per HTML file: makeHtmlPagePlan()     parses <body> via @core/htmlImport, derives
                                        title+slug from path, resolves <link> hrefs, keeps scripts
  expandLinkedCssImports()              follow unconditional local @import graphs recursively
  per CSS file:
    extractGoogleFontImports(css)       trusted CSS2 @import → installed-font requests
    cssToStyleRules(css,{breakpoints})  → StyleRule[] (class|ambient) + assetRefs + @keyframes + @font-face
    extractRootColorTokens(rules)       :root/html/body color custom props → ImportColorToken[]
    extractRootFontTokens(rules)        :root --font-* → ImportFontToken[]
  detectCrossSheetClassConflicts()      same class name with divergent defs across page cascades
  buildAssetPlan()                      normalize url() in props/attrs/CSS to FileMap keys;
                                        resolve @font-face → ImportFontFamily[]; collect assets
  detectConflicts()                     page-slug + class-name + design-token collisions
  → ImportPlan  (wizard preview: AnalyzeStep → ConflictsStep)
  commitImportPlan(plan, adapter):
    A. upload assets via adapter.uploadAsset (per-asset try/catch → warnings)
    B. applyAssetRewrites(plan, rewriteMap)  swap FileMap keys → media URLs
    C. adapter.commit(tx)  ONE atomic store mutation (one Cmd+Z): tx.addPage/
       overwritePage/addStyleRule/addConditions/addColorTokens/addFonts/
       addFontTokens/addScripts/addStylesheets
  → ImportResult (per-category counts)
```

Notable engine smarts: **per-stylesheet import modes** (`'convert'` → editable
registry rules, default; `'file'` → kept verbatim as a page-scoped `SiteFile` +
`runtime.styles` entry, no selector rewriting). **Cross-sheet class conflicts**:
a multi-page static site links one stylesheet per page reusing the same class
name (`.btn`, `.hero`) with different declarations; the CMS has one global rule
registry, so divergent defs surface as `CrossSheetClassConflict` rows (default
auto-rename), Bootstrap-like shared utilities (`row`, `col-*`, `d-flex`) are
exempted. **Design-token preservation**: root `--color`/`--font-*` custom props
become framework tokens, and a token rename rewrites every `var(--old)` →
`var(--new)` across imported rules and `inlineStyles` so the imported design
keeps resolving to its own token. **css-substitution helper** (`@core/css-substitution`)
encodes any declaration containing `var()`/`env()` into a marker custom property
(`--instatic-sub-border-left: …`) before the CSS engine parses it, then decodes
after — because Chromium and happy-dom both mangle pending-substitution values
differently; this makes import byte-faithful across engines by construction.

### Engine 3 — site-transfer (whole-site backup / migration)

Export and import a complete site as one self-contained ZIP — backend-only,
no visual-editor dependency. This is the portable engine.

```
EXPORT  GET|POST /admin/api/cms/export  (ExportRequest: which tables/rows, includeMedia/Site/Folders/Redirects)
  capability-gate data.export → load shell+tables+rows → stream media bytes as media/<storagePath>
  → site-bundle-<ts>.zip  (.instatic/site-bundle.json manifest first, then media/<storagePath>)

PREVIEW POST /admin/api/cms/import/preview   (SiteBundle JSON; dry-run of the import logic)
  → BundlePreview { meta, tables[{inBundle,willReplace,willAdd,currentLocal}], totals, rowConflicts[] }

IMPORT  POST /admin/api/cms/import[?strategy=replace|merge-add|merge-overwrite]   (SiteBundle JSON)
  POST /admin/api/cms/import/archive[?strategy=…&selection=…]                     (the user-facing ZIP)
  validate manifest (TypeBox) → run preview logic → ONE Convex mutation
  (importExport.replaceAll | mergeAdd | mergeUpdate) → write media bytes to uploads/ OUTSIDE the txn
  → ImportResult counts
```

Three strategies: **replace** (wipe + recreate everything incl. folders +
redirects — the full-restore path), **merge-add** (insert if id absent; never
overwrite; leaves shell/folders/redirects untouched), **merge-overwrite** (upsert,
incoming wins; keeps local items absent from the bundle). Merge identity is
**id**; row slugs have a table-scoped uniqueness constraint so a new incoming row
can collide with an unrelated local slug — preview reports these as `rowConflicts`
and the import wizard resolves them via `selection.rowSlugOverrides`.

The whole DB side is **one atomic Convex transaction** (`convex/importExport.ts`),
because an import spans `data_tables` + `data_rows` + `site` + `media_folders` +
`data_row_redirects` and a mid-loop crash must roll the entire bundle back. Media
bytes write to disk *after* the mutation commits (best-effort; a disk failure
skips the asset with a log entry). **PBOS** has the minimal cousin of this engine:
`convex/backup.ts` `exportAll`/`importAll` — a JSON snapshot of a fixed
`CONTENT_TABLES` list (no media bytes, no ZIP), with `importAll` doing wipe +
reinsert and remapping FK ids (`posts._id`→new, `chatSessions._id`→new) for
`comments`/`chatMessages`.

---

## Where it lives

### Instatic (`/home/rahman/projects/Instatic-convex`)

html-import:
- `src/core/htmlImport/index.ts` — public barrel (`importHtml`)
- `src/core/htmlImport/parseHtml.ts` — DOMParser wrapper (browser only)
- `src/core/htmlImport/inlineStyle.ts` — `harvestInlineStyles` (security-gated)
- `src/core/htmlImport/stripUnsafe.ts` — `stripUnsafe`, `collectStyleCss`, `StripReport`
- `src/core/htmlImport/rules.ts` — `HTML_TO_MODULE_RULES` (15KB declarative table)
- `src/core/htmlImport/walkAndMap.ts` — `importHtml()`, `walkAndMap()`, `ImportResult`, `ImportFragment`
- `src/core/htmlImport/text.ts` — text-run synthesis
- `src/admin/modals/ImportHtml/ImportHtmlModal.tsx` — paste-HTML modal (CodeMirror + tree preview)
- `src/admin/spotlight/commands/importHtml.ts` — Spotlight `editor.importHtml` command
- `src/__tests__/htmlImport/mapping.test.ts` — 95 per-rule mapping tests

site-import (all headless under `src/core/siteImport/`):
- `index.ts` (barrel), `types.ts` (`ImportPlan`/`ImportResult`/`ImportWarning`/errors),
  `ingestInput.ts`, `classifyFiles.ts`, `htmlPagePlan.ts`, `cssToStyleRules.ts` (26KB),
  `colorTokens.ts`, `fontTokens.ts`, `fontImports.ts`, `cssImports.ts`,
  `classCascades.ts` (cross-sheet conflicts, 20KB), `assetPlan.ts` (23KB),
  `applyAssetRewrites.ts`, `linkRewrite.ts`, `conflicts.ts` (23KB), `adapter.ts`
  (`SiteImportAdapter`/`SiteImportTransaction` — the one transaction contract),
  `planCss.ts`, `buildPlan.ts`, `commitPlan.ts`, `keyframesToStyleRule.ts`,
  `mediaQueryMatch.ts`, `mimeTypes.ts`, `paths.ts`, `rootScope.ts`, `stylesheetPlan.ts`
- `src/core/css-substitution/index.ts` — `encodeSubstitutionDeclarations`,
  `decodeSubstitutionProperty`, `readCssDeclarationBag` (the ONE CSSOM→bag walker,
  shared by both importers)
- `src/admin/modals/SiteImport/` — `SiteImportModal.tsx` (wizard shell + CMS-bundle
  router), `steps/{DropStep,AnalyzeStep,CmsBundleAnalyzeStep,ConflictsStep,CmsBundleConflictsStep,ImportStep}.tsx`,
  `shared/{createSiteImportAdapter,useCmsBundleImport,cmsBundleFlow,ConflictRow,ImportStepper,importProgress}.ts(x)`

site-transfer:
- `src/core/data/bundleSchema.ts` (15KB) — `SiteBundleSchema`, `MediaAssetExportSchema`,
  `BundleMediaFolderSchema`, `BundleRedirectSchema`, `ImportStrategySchema`,
  `ExportRequestSchema`, `ExportEstimateSchema`, `ExportSummarySchema`,
  `BundlePreviewSchema`, `ImportResultSchema`
- `src/core/data/bundleArchive.ts` — `SiteBundleArchiveManifestSchema`,
  `BUNDLE_ARCHIVE_MANIFEST_PATH` (`.instatic/site-bundle.json`), `mediaArchivePath()`
- `src/core/data/bundleSelection.ts` — `BundleImportSelection`, `rowSlugOverrides`
- `src/core/persistence/cmsTransfer.ts` — client-side typed fetch + native export form POST
- `server/handlers/cms/export.ts` (13KB), `import.ts` (12KB), `importArchive.ts`
  (22KB), `importPreview.ts` — the four endpoints
- `server/util/pathWithin.ts` — `assertPathWithin` media write-sink containment
- **`convex/importExport.ts`** — the three atomic strategy mutations
  `replaceAll` / `mergeAdd` / `mergeUpdate` (each one transaction)
- Round-trip gates: `src/__tests__/architecture/cmsTransfer{Export,Preview,Import}.test.ts`,
  `import-export-roundtrip.test.ts`

### personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)

- `convex/backup.ts` — `exportAll` (query) + `importAll` (mutation): minimal JSON
  snapshot over a fixed `CONTENT_TABLES` const (12 tables), auth tables excluded,
  wipe-and-reinsert with FK id remap. The portable seed of Engine 3.
- `convex/update.ts` — `fetchUpstreamVersion` (action; hardcoded raw-githubusercontent
  manifest URL) + `triggerDeploy` (action; POSTs `VERCEL_DEPLOY_HOOK_URL`). Adjacent
  "in-app update channel", NOT import — relevant only as a sibling admin-ops surface.

---

## Data model

site-transfer touches these Convex tables (`convex/schema.ts`):

- `data_tables` — table defs (`id`/`slug`/`kind`/`route_base`/`fields_json`/`system`/
  soft-delete `deleted_at`; indexes `by_app_id`, `by_slug`, …). 4 system ids
  (`posts`/`pages`/`components`/`layouts`) are seeded + never deleted.
- `data_rows` — all content rows (`id`/`table_id`/`cells_json`/`slug`/`status`/
  `published_at`/soft-delete; indexes `by_app_id`, `by_table_slug`, `by_table_updated`).
- `site` — singleton shell (`id:'default'`, `name`, `settings_json`).
- `media_assets` + `media_folders` + `media_asset_folders` (membership join).
- `data_row_redirects` — published-URL redirects (`from_route_base`/`from_slug`/
  `target_row_id`; index `by_source`).
- `published_runtime_assets` — published bytes (NOT in a bundle; re-rendered on publish).

App-generated **nanoid PKs are stored as an indexed `v.string()` `id` field looked
up via `by_app_id`** — never Convex `_id`. `*_json` columns (`cells_json`,
`settings_json`, `fields_json`) stay opaque strings, `JSON.parse`d in app code.

Bundle manifest shape (`SiteBundleArchiveManifest`, schemaVersion 1): `{ exportedAt,
sourceSiteName?, site?, tables[], rows[], media?, mediaFolders?, redirects? }`.
The internal import payload (`SiteBundle`) carries media as `bytesBase64`; the
user-facing archive omits bytes and stores them at `media/<storagePath>`.
`storagePath` is constrained at the schema level (`SAFE_RELATIVE_PATH_PATTERN`:
no leading `/`, no `..`) and re-asserted at the write sink (`assertPathWithin`).

**Excluded from every bundle** (by design — bundles travel between hosts as
downloadable files): sessions, users/roles/passwords, AI provider keys, audit
logs, published HTML, media variants, plugin packages, per-user prefs. Author
refs (`created_by_user_id`) reset to null on import.

PBOS `backup.ts` model: a flat `{ snapshotVersion, exportedAt, tables: Record<string,unknown[]> }`
over `CONTENT_TABLES`; `clean()` strips `_id`/`_creationTime` before reinsert.

html-import / site-import produce in-memory editor structures, not tables:
`PageNode` (module-typed: `base.text`/`base.container`/`base.image`/`base.button`/
`base.link`/`base.form`/`base.loop`/`base.outlet`/…), `ImportFragment`
(`{ nodes, rootIds, body? }`), `StyleRule` (`kind:'class'|'ambient'`),
`ImportColorToken`/`ImportFontToken`/`ImportFontFamily`/`ImportScript`. These live
on the `SiteDocument` / `NodeTree<PageNode>` model (see `visual-page-canvas` and
`visual-components-model` harvest docs), not in dedicated import tables.

---

## Public API

site-transfer (REST, server handlers):
- `GET|POST /admin/api/cms/export` — produce bundle (gate `data.export`)
- `GET|POST /admin/api/cms/export/estimate` — exact byte size, no disk read
- `GET /admin/api/cms/export/summary` — non-table category counts
- `POST /admin/api/cms/import/preview` — dry-run diff → `BundlePreview` (gate `data.export`)
- `POST /admin/api/cms/import[?strategy=…]` — apply JSON bundle (gate `data.import`;
  `replace` also needs `content.manage` + step-up; bundles with a `site` shell also
  need `site.structure.edit`)
- `POST /admin/api/cms/import/archive[?strategy=…&selection=…]` — apply the ZIP,
  staging+validating media before the data import

site-transfer (Convex, the atomic apply): `convex/importExport.ts` exports
`replaceAll(tables,rows,site?,mediaFolders?,redirects?)`, `mergeAdd(tables,rows)`,
`mergeUpdate(tables,rows,site?)` — each declares full `args` + `returns` validators
and runs every `ctx.db` write inline in one transaction.

PBOS: `api.backup.exportAll` (query, login-gated), `api.backup.importAll({snapshot})`
(mutation, login-gated, wipe + reinsert).

html-import: `importHtml(source) → ImportResult` and store action
`insertImportedNodes(parentId, fragment, { styleRules?, conditions? })`.

site-import: `buildImportPlan({fileMap,currentSite,options}) → ImportPlan` (pure)
and `commitImportPlan(plan, adapter) → ImportResult` (async, one `adapter.commit`).

---

## UI surface

- **html-import**: `ImportHtmlModal` (two-column: CodeMirror HTML editor + 200ms
  debounced DOM-tree preview, lazy-mounted with a skeleton fallback). Entry points:
  Spotlight "Import HTML", DOM-panel/canvas right-click "Paste HTML here…".
- **site-import / site-transfer share one wizard**: `SiteImportModal` — four stages
  Drop → Review → Conflicts → Import (Conflicts skipped when empty). Drop accepts
  loose files / a folder / static `.zip` / CMS-export `.zip`; a single ZIP is
  classified by whether `.instatic/site-bundle.json` is its first entry (→ CMS
  bundle path) else static. Review = category navigator (pages, style rules with
  per-sheet mode picker, media, color tokens, fonts, scripts, "Can't import").
  Mounted once at the authenticated admin shell; opened from Spotlight or any
  workspace. **Export site** dialog (`src/admin/pages/data/components/ExportDialog`)
  is the sibling: category navigator with per-row checklist + live size estimate,
  one-click full export via a same-origin form POST (streamed download, not blob).
- PBOS: a single admin-panel backup/restore button pair (download JSON / upload JSON).

---

## Dependencies

npm / platform:
- html-import: browser `DOMParser` (no server DOM lib — gated). Tests polyfill via
  `happy-dom`. CodeMirror for the modal editor.
- site-import: browser `CSSStyleSheet.replaceSync()` for CSS parsing; a ZIP reader
  for `.zip` ingest; `happy-dom` in tests. No framework runtime.
- site-transfer: a streaming ZIP writer/reader (ZIP64), TypeBox for schema
  validation, Convex client for the atomic mutations. Node `fs` + path-containment
  for the media write sink.
- PBOS: `convex`, `@convex-dev/auth/server` (`getAuthUserId`) only.

rr-slice deps (for the proposed slice): `convex-auth` (or whatever provides
`requireAdmin`), `rbac-roles` (for `data.export`/`data.import` capability gates),
optionally `files` / `media-studio` (if media bytes are carried), `command-menu`
(to open the wizard). No hard coupling — keep them props/contract-injected.

---

## rr coverage

**net-new.** Confirmed: `frontend/lib/content/slices.ts` and the slice catalog
contain no `import`, `transfer`, `backup`, or `migrate` slice; `convex/features/`
has no transfer/backup feature. The closest existing slices are `pages-cms`
(content model, but no import), `data-table` (display, no transfer), and `files`
(media, no bundle). None overlap the engines here.

Caveat on the three engines:
- **html-import** and **site-import** are net-new but **not portable standalone** —
  their outputs (`PageNode`, `StyleRule` registry, framework tokens, `NodeTree`,
  `SiteDocument`, the `mutateActiveTreeAndSite` store) only exist inside the
  visual-editor model harvested in `visual-page-canvas.md` /
  `visual-components-model.md`. Lifting them alone would drag the whole editor.
  They are **companion engines** to a future `visual-page-canvas` slice, not their
  own slice.
- **site-transfer** is net-new AND portable — backend-only, table-config-driven,
  no editor dependency. This is the realistic slice. PBOS `backup.ts` proves the
  minimal version already runs in a generic Convex app.

Proposed slug: **`import-engines`** (or, more honestly scoped to what ships,
`data-transfer` / `site-backup`).

---

## Slice plan

**Action: build-new — scoped to the site-transfer engine only.** Do NOT lift
html-import / site-import standalone; reference them as companion engines bolted
onto the `visual-page-canvas` slice when that lands.

### The laziest correct path (ponytail)

Build one `convex/features/import-engines` Convex feature that generalizes PBOS
`backup.ts` + Instatic `importExport.ts` into a **config-driven snapshot
export/import** over an injected table list, with the three strategies. Start at
PBOS's altitude (JSON snapshot, no media), because that already works env-free in
a generic Convex app, and add the Instatic richness (media bytes, folders,
redirects, preview/conflicts, ZIP) only as opt-in config. Concretely:

1. **Config object** the consumer provides: `{ tables: TransferTable[] }` where
   each entry declares `{ name, idField?, fkRefs?: {field, parentTable}[],
   stripFields?: string[] }`. This replaces Instatic's hardcoded `SYSTEM_TABLE_IDS`
   / `CONTENT_TABLES` and PBOS's `postIdMap`/`sessionIdMap` FK special-casing with
   declarative FK remapping. No table names hardcoded in the slice.
2. **`exportAll` query** — `requireAdmin`, loop the configured tables with
   `.withIndex(...).take(N)` paginated (NEVER bare `.collect()` — Instatic's
   `replaceAll` does `.collect()` and flags multi-thousand-row bundles as the
   chunking risk; the rr version must paginate), strip `_id`/`_creationTime` +
   declared secret fields, return `{ snapshotVersion, exportedAt, tables }`.
3. **`importReplace` / `importMergeAdd` / `importMergeUpdate` mutations** — three
   atomic strategy mutations mirroring `importExport.ts`, each validating all args
   with `v.*`, doing read-by-index → patch-or-insert (no `ON CONFLICT`), remapping
   FK ids from the config, dropping user-ref columns, returning typed counts.
4. **Preview query** — dry-run diff (`inBundle`/`willReplace`/`willAdd`/`currentLocal`
   + slug `rowConflicts`) so the UI can warn before a destructive `replace`.
5. **Frontend `frontend/slices/import-engines`** — a generic backup/restore card
   (export → download JSON; drop JSON → preview diff → pick strategy → import) +
   the conflict-resolution row component. Pure shadcn primitives, theme tokens.
   Media-ZIP + the static-site/html importers are explicitly out of scope v1.

### Portability blockers to strip

- Hardcoded table lists (`SYSTEM_TABLE_IDS`, `CONTENT_TABLES`) → config-injected
  `TransferTable[]`.
- Hardcoded FK remap (PBOS `postIdMap`/`sessionIdMap`; Instatic per-table inlining)
  → declarative `fkRefs` in config.
- Hardcoded capability strings (`data.export`/`data.import`) → contract-injected
  permission keys (consumer maps to its own `rbac-roles` enum).
- Bun/Node `fs` media write sink + `assertPathWithin` + ZIP archive → keep behind
  an optional `mediaAdapter` seam (default: no media, JSON only). Self-hosted
  Convex baseline has no local `uploads/` dir by default.
- `.instatic/` archive namespace + `instatic-*` custom-element tags → if media-ZIP
  is added later, namespace must be a config constant, not `instatic`.
- PBOS `update.ts` hardcoded GitHub raw URL + `VERCEL_DEPLOY_HOOK_URL` → NOT part
  of this slice; that's a separate "self-update" concern.
- html-import `HTML_TO_MODULE_RULES` + `base.*` module names + `insertImportedNodes`
  store action, and site-import's `StyleRule`/framework-token/`NodeTree` coupling →
  hard blockers; these belong with the editor slice, not here.

### Effort

**M** for the portable site-transfer slice (config-driven export + 3 strategy
mutations + preview + a backup/restore UI; the logic exists in two places already,
the work is generalizing + paginating + a clean contract). The full html-import +
site-import engines would be **L** each and are blocked on first lifting the
visual-editor / page-tree model — defer until that slice exists.

### Proposed `slice.json` shape

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "import-engines",
  "version": "0.1.0",
  "category": "data",
  "kind": "fullstack",
  "title": "Import engines — config-driven site backup, transfer & restore",
  "description": "Export a whole Convex app to a portable JSON snapshot and import it back with replace / merge-add / merge-overwrite strategies over an injected table list. Declarative FK remap, secret-field stripping, dry-run preview with slug-conflict resolution, atomic per-strategy mutations. Media-ZIP + static-site/HTML importers are companion engines (out of scope v1).",
  "namespace": "@/features/import-engines",
  "frontend": {
    "slicePath": "frontend/slices/import-engines",
    "configExport": "importEnginesFeature"
  },
  "convex": {
    "tablesExport": "",
    "schemaPath": "",                 // schema-less: operates on the host's tables via config
    "rootPaths": ["convex/features/import-engines"]
  },
  "deps": {
    "npm": ["lucide-react@^0.400.0"],
    "shadcn": ["button", "card", "dialog", "table", "badge", "select", "input", "alert"],
    "env": [],
    "peers": ["convex-auth", "rbac-roles"]
  },
  "contract": {
    "requires": {
      "config": ["tables: TransferTable[]", "permissions: { export, import }"],
      "deps": [{ "npm": "lucide-react", "range": "^0.400.0" }]
    },
    "provides": {
      "components": ["BackupRestoreCard", "ImportPreviewDialog", "ConflictRow", "StrategyPicker"],
      "hooks": ["useTransferExport", "useTransferImport"],
      "convex": {
        "functions": ["exportAll", "importReplace", "importMergeAdd", "importMergeUpdate", "previewImport"],
        "rbac": ["export", "import"]
      }
    }
  },
  "tags": ["data", "backup", "transfer", "migration", "export", "import", "convex"],
  "license": "MIT"
}
```

`convex/features/import-engines/` mirrors the existing `pages-cms` feature layout:
`index.ts` (barrel), `query.ts` (`exportAll`, `previewImport`), `mutation.ts`
(`importReplace`/`importMergeAdd`/`importMergeUpdate`), `_config.ts` (the
`TransferTable[]` contract type), `README.md`. No `_schema.ts` — the feature is
schema-less and reads/writes the host app's own tables through the injected config.
