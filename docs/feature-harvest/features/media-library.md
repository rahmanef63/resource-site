# Media Library (folders + storage adapters)

> Harvest verdict: **partial → build-new**. The admin *UX* (folder tree + file grid + DnD + breadcrumb + context menu + upload button) is already ~70% covered by composing `file-explorer` + `files` + `image-picker`. But the **digital-asset-management (DAM) domain** — the `media_assets` metadata model (alt-text / caption / tags / variants / blurhash / soft-delete), many-to-many asset↔folder membership, role-based storage-adapter election + migration, smart folders, and signed-redirect serving — has **no existing rr slice and no `convex/features/media-library`**. That backend domain is the harvest gold; lift it nearly verbatim. The frontend should *wrap* existing slices, not reinvent them.

---

## What it does (flow)

Instatic's Media workspace (`/admin/media`) is an OS-style file manager for every binary on the site. End-to-end:

1. **Upload** — user drops files → `POST /admin/api/cms/media/upload`. The Bun pipeline validates (size + magic-byte MIME sniff), dispatches to the *elected* storage adapter for the `original` role, writes bytes, then (for JPEG/PNG/WebP only) runs a responsive-variant ladder in a `Bun.Worker` (sharp probe + blurhash + WebP rungs at 64/320/640/1024/1600/2048px below intrinsic + one rung at intrinsic). Each variant is streamed back through the elected `variant`-role adapter. A `media_assets` row is created; `variants_json` is populated. SVG/GIF stay originals-only.
2. **Browse** — `MediaCanvas` renders folders and assets in one grid. Folders are first-class grid items: opening one filters the canvas to its members; a parent-folder tile lets you navigate up. "All files" shows every active asset.
3. **Organize** — drag an asset onto a folder → `assignAssetToFolders` *replaces* its folder set with the target (desktop move semantics, even though storage is many-to-many). Drag a folder onto another → reparent (`media_folders.update`), with cycle/self/no-op guards. Drop onto "All files" → back to root (`folderId: null`).
4. **Curate metadata** — selecting one asset opens a floating viewer to edit `alt_text` / `caption` / `title` / `tags`. Selecting 2+ opens bulk-edit. **Smart folders** (sidebar virtual views) match by predicate (missing-alt, missing-title, untagged, large-files, recently-replaced) computed client-side over the loaded asset list.
5. **Lifecycle** — soft-delete stamps `deleted_at` (Trash, restorable); purge hard-deletes + sweeps `media_asset_folders` / `media_usage_refs` rows + returns `storage_path` so the host can delete bytes. "Replace file" swaps the binary keeping the same id/URL (`replaceBinary`, stamps `replaced_at`).
6. **Serve** — `public-url` adapters (local-disk) return `/uploads/...` the browser hits directly. Non-`public-url` adapters get a host-owned URL `/_instatic/media/<adapterId>/<storagePath>`; the host 302-redirects to a freshly-signed read URL (1h TTL) via `tryServeMediaRedirect`.
7. **Migrate** — admin elects a new adapter for a role; a background migration walks pending originals + pending variant entries (cursor-paged) and rewrites their storage location (`updateAssetStorageLocation` / `updateVariantStorageLocation`).

personal-brand-os is the *minimal* end of this spectrum: no library, no folders. `convex/files.ts` just `generateUploadUrl` + `getUrl` over Convex `ctx.storage`; `ImageField` POSTs a file to the upload URL and stores the served `*.convex.cloud` URL as a plain string. That is the **self-hosted-Convex storage baseline** an rr slice should default to.

---

## Where it lives

**Instatic (`/home/rahman/projects/Instatic-convex`)**
- Convex backend (the gold):
  - `convex/media.ts` — asset CRUD + folder-membership join + storage-migration queries + runtime assets (~856 lines, fully `args`+`returns` validated)
  - `convex/mediaFolders.ts` — folder tree CRUD, slug-uniqueness, recursive subtree delete
  - `convex/mediaStorage.ts` — per-role adapter election + singleton variant-delegate election
  - `convex/schema.ts:249-347` — the 8 media tables
- Bun server (host-coupled, NOT portable as-is):
  - `server/handlers/cms/media.ts`, `mediaFolders.ts`, `mediaStorageAdmin.ts`, `mediaStorageMigration.ts`, `mediaStorageReader.ts`, `mediaUpload.ts`, `mediaUploadDispatch.ts`, `mediaUploadExecutor.ts`, `mediaVariants.ts`, `imageVariantWorker.ts`
  - `server/repositories/media.ts`, `mediaAssetMapping.ts`, `mediaFolders.ts`, `mediaMigration.ts`, `mediaStorageAdapters.ts` (thin Convex pass-throughs)
  - `src/core/files/{schemas.ts,upload.ts,pathValidation.ts}` — upload validation + path safety
- Admin UI (React, CSS-Modules, host-coupled): `src/admin/pages/media/` — `MediaPage.tsx`, `hooks/useMediaWorkspace.ts`, `hooks/useMediaDnd.ts`, `hooks/useUploadQueue.ts`, `components/{MediaSidebar,MediaCanvas,MediaViewerWindow,UploadQueueWindow,BulkEditWindow,TagEditor,ReplaceFileDialog,MediaPickerModal,MediaPickerField,MediaStoragePanel}/`, `utils/{mediaDnd,mediaDragDrop,smartFolders,folderTree,filters,variants}.ts`
- Client wire: `src/core/persistence/cmsMedia.ts` (`CmsMediaAsset` / `CmsMediaVariant`)
- Doc: `docs/features/media.md` (authoritative)

**personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)**
- `convex/files.ts` — `generateUploadUrl` + `getUrl` (Convex `ctx.storage`, `requireUser`-gated)
- `components/image-field.tsx` — adapter bridging the portable picker to Convex storage
- `components/image-picker/` — the picker (already lifted to rr `image-picker`)

---

## Data model

8 tables (`convex/schema.ts:249-347`). All app-PK is a nanoid `v.string()` looked up via `by_app_id`; `*_json` columns are opaque strings parsed in app code.

**`media_assets`** — indexes: `by_app_id`, `by_deleted` (`deleted_at`), `by_public_path`, `by_storage_adapter`, `by_uploaded_by`.
Fields: `id, filename, mime_type, size_bytes, storage_path, public_path, uploaded_by_user_id, alt_text, caption, title, tags_json (string[]), width, height, duration_ms, dominant_color (#rrggbb), blur_hash, variants_json (MediaVariant[]), poster_path, deleted_at, replaced_at, created_at, storage_adapter_id, externally_hosted`.
- `storage_path` = adapter-internal handle (S3 key / local basename), never sent to browser.
- `public_path` = browser URL (`/uploads/...` for public-url, else `/_instatic/media/<adapterId>/<storagePath>`).
- `variants_json` entries: `{ width, height, format: 'webp'|'jpeg'|'png'|'avif', path, sizeBytes, storagePath, storageAdapterId }`.

**`media_folders`** — `id, parent_id (null=root), name, slug, sort_order, created_by_user_id, created_at`. Indexes `by_app_id`, `by_parent_slug` (uniqueness re-expressed: no partial-unique in Convex), `by_parent`. Slug unique *per parent*.

**`media_asset_folders`** (many-to-many join) — `asset_id, folder_id`. Indexes `by_asset`, `by_folder`, `by_asset_folder`. No folder rows = root-level asset.

**`media_smart_folders`** — `id, name, query_json, created_by_user_id, created_at` (`by_app_id`). Persisted *custom* smart folders (the 5 built-in ones are client-side predicates).

**`media_usage_refs`** — `asset_id, ref_kind, ref_id, ref_path, computed_at` (`by_asset`, `by_ref`). Where each asset is used (cascade-swept on hard-delete).

**`active_media_storage_adapter`** — `role, adapter_id, elected_at, elected_by_user_id` (`by_role`). One row per role; missing = `''` (local-disk).

**`active_media_variant_delegate`** — singleton (`singleton: v.literal(1)`, `by_singleton`): `delegate_id, variant_url_template, widths_json, formats_json, elected_at, elected_by_user_id`.

**`published_runtime_assets`** — `id, data_row_version_id, asset_path, public_path, content_type, content_bytes (v.bytes()), created_at`. Publisher-pipeline-specific; *out of scope* for the media-library slice (belongs with the publisher harvest).

---

## Public API

### Convex (the portable surface — every fn has `args` + `returns` validators)

`convex/media.ts`:
- Reads: `get(id)`, `list({includeDeleted?})`, `storagePath(id)`, `variantsJson(id)`, `countForExport()`, `listForExport()`, `migrationBacklogData({originalTarget})`, `listPendingOriginals({targetAdapterId,cursor,limit})`, `listAssetsWithPendingVariants({cursor,limit})`
- Writes: `create(...)`, `rename({id,filename})`, `updateMetadata({id,altText?,caption?,title?,tags?})`, `setVariants({id,width,height,blurHash,variants})`, `softDelete(id)`, `restore(id)`, `hardDelete(id)→{storagePath}`, `replaceBinary(...)`, `assignAssetToFolders({assetId,add?,remove?})`, `importAsset(...)`, `updateAssetStorageLocation(...)`, `updateVariantStorageLocation({assetId,oldPath,path,storagePath,storageAdapterId,sizeBytes})`
- Runtime assets (publisher): `saveRuntimeAssets(...)`, `getRuntimeAsset({publicPath})`

`convex/mediaFolders.ts`: `list()`, `get(id)`, `isSlugTaken({parentId,slug,excludeId?})`, `create(...)`, `update({id,name?,slug?,sortOrder?,parentId?})`, `del(id)` (recursive subtree + membership sweep), `deleteAll()`, `importFolder(...)`

`convex/mediaStorage.ts`: `getElectedAdapterId({role})`, `listElectedAdapters()`, `electAdapter({role,adapterId,userId})`, `countAssetsForAdapter({adapterId})`, `getElectedVariantDelegate()`, `electVariantDelegate({delegateId,variantUrlTemplate,widths,formats,userId})`, `clearVariantDelegate()`

### Bun REST (host layer, capability-gated — NOT lifted, reference only)
- `GET/POST/PATCH/DELETE /admin/api/cms/media[/:id]`
- `GET/POST/PATCH/DELETE /admin/api/cms/media/folders[/:id]` (matched *before* `/:id`)
- `POST /admin/api/cms/media/upload`
- `/admin/api/cms/media/storage[/...]`
- Public serving: `/_instatic/media/<adapterId>/<storagePath>` → 302 signed redirect (`tryServeMediaRedirect`)

Capability split: `media.read` (browse/copy-url), `media.write` (upload/edit/rename/move/restore), `media.replace`, `media.delete`. **Note: the Convex functions themselves are ungated** — Instatic enforces caps at the trusted Bun handler layer. An rr slice on the self-hosted-Convex baseline MUST add `requireUser`/`requireAdmin` *inside* each mutation.

---

## UI surface

**Admin (Instatic `src/admin/pages/media/`):** canvas-style workspace — folder-tree/storage sidebar, OS-style file grid (`MediaCanvas`), 3 floating windows (asset viewer / upload queue / bulk-edit, positions persisted via `workspaceLayoutStorage`), tag editor, replace-file dialog, storage-adapter panel, smart-folder rail. Plus an embeddable `MediaPickerModal` / `MediaPickerField` used by other workspaces.

**Public (personal-brand-os):** none — just `ImageField` (admin form control wrapping the picker).

**rr reuse mapping (don't rebuild):**
- folder tree + grid/list + DnD move + breadcrumb + context menu + multi-select → **`file-explorer`** slice (its `FileExplorerAdapter` is the seam to map `media_assets`/`media_folders` onto)
- upload button + URL-resolve + storage-adapter contract → **`files`** slice (`FilesAdapter`, `FileUploadButton`, `useFileUpload`)
- "pick an existing asset" modal (Gallery tab can read the library) → **`image-picker`** slice
- net-new media-only surfaces to build: asset metadata editor (alt/caption/title/tags), bulk-edit, tag editor, smart-folder predicate bar, storage-adapter election/migration panel.

---

## Dependencies

- **npm:** none provider-specific in the Convex layer. Host-side variant pipeline uses `sharp` + a blurhash encoder inside `Bun.Worker` — **Bun/Node-only, not portable** to Convex V8 or the browser. nanoid for PKs (already an rr convention).
- **rr-slice deps (compose, barrel-only `@/features/*`):** `file-explorer` (tree/grid/DnD chrome), `files` (upload + storage-adapter contract), `image-picker` (consume library as a Gallery source). Optionally `rbac-roles` for the capability gate, `data-table` if a list-view of assets is wanted.

---

## rr coverage

**partial** (the hint said "covered" — it is not). Mapping the feature's three layers:

| Layer | Existing rr slice | Gap |
|---|---|---|
| Folder tree + file grid + DnD + breadcrumb + CRUD chrome | `file-explorer` | strict hierarchy (no many-to-many folders), no media metadata, no media backend |
| Upload + URL resolve + storage-adapter contract | `files` | adapter *contract* only — no role-based election, no cross-adapter migration |
| Pick existing image / gallery source | `image-picker` | a chooser, not a management workspace |
| **DAM domain** (asset metadata model, alt/tags/variants/blurhash, soft-delete/trash, smart folders, storage election + migration, signed-redirect serving) | **none** | **net-new — `convex/features/media-library` does not exist** |

`media-studio`, `media-viewer`, `image-editor` are *editing/viewing* tools, not asset management — irrelevant to coverage. So: UI is composable from existing slices; the backend domain + media-specific UI is **net-new**.

Proposed slug: **`media-library`** (frontend `frontend/slices/media-library` + backend `convex/features/media-library`).

---

## Slice plan

**Action: build-new** (a composing slice, not a from-scratch rebuild).

**Laziest correct path (ponytail):**
1. **Lift the Convex backend almost verbatim.** `convex/media.ts` + `mediaFolders.ts` + `mediaStorage.ts` are already self-contained, index-driven, and dual-validated — drop them into `convex/features/media-library/{schema.ts,assets.ts,folders.ts,storage.ts}`. This is 95% of the harvest value and needs little change.
2. **Don't rebuild the UI.** The workspace = `file-explorer` (wired to a `MediaLibraryAdapter` that maps `media_assets`/`media_folders` ↔ explorer nodes) + `files` (`FileUploadButton`) + the few net-new media surfaces (metadata editor, bulk-edit, tag bar, smart-folder predicates, storage panel). Smart-folder predicates are pure client functions — copy `utils/smartFolders.ts` as-is.
3. **Default variants OFF.** Ship the slice as "originals-only" (the SVG/GIF path). Variant generation becomes an *injected, host-provided* server action (`onGenerateVariants?`) so the non-portable sharp/Bun.Worker code stays out of the slice.

**Portability blockers to strip / inject:**
- **Bun/Node-only upload+variant pipeline** (sharp, blurhash, `Bun.Worker`, `mediaUploadExecutor`) — not portable. Default to Convex `ctx.storage` (personal-brand-os `convex/files.ts` pattern); make variant generation an injected adapter, off by default.
- **Hardcoded URL shapes** `/uploads/...` and `/_instatic/media/<adapterId>/<storagePath>` — inject a `resolvePublicPath(asset)` / storage-adapter `getReadUrl(storagePath, ttl)` seam. Never hardcode the consumer's URL scheme.
- **Ungated Convex mutations** — add `requireUser`/`requireAdmin` inside every mutation (Instatic relies on the trusted Bun layer; rr's self-hosted-Convex baseline cannot).
- **Capability enum** `media.read/write/replace/delete` hardcoded — map to `rbac-roles`, props-driven (don't bake the enum).
- **Plugin-SDK adapter registry** (`api.cms.media.registerStorageAdapter`) — replace with the rr `files` `FilesAdapter` contract; election/migration tables stay but elect among injected adapters.
- **Full-table `.collect()` scans** in `list`, `countForExport`, `migrationBacklogData`, `listForExport` — re-route through the `by_deleted` index + `.paginate()` to honor the no-bare-`.collect()` rule before shipping.
- **Repository-coupling doc comments** referencing `server/repositories/*` and `docs/CONVEX-MIGRATION.md §N` — strip.

**Effort: L** — large surface (8 tables, ~40 Convex fns, a multi-window workspace), but the backend lifts cleanly and the UI is mostly composition, so it is not a from-scratch build.

**Proposed `slice.json` shape:**
```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "media-library",
  "version": "0.1.0",
  "category": "data",
  "kind": "full",
  "title": "Media Library — folders, asset metadata + pluggable storage adapters",
  "description": "Digital-asset-management slice: folder tree (many-to-many asset↔folder), asset metadata (alt/caption/title/tags), soft-delete Trash, smart folders, role-based storage-adapter election + cross-adapter migration. Backend is portable Convex (media_assets/media_folders/media_asset_folders + election tables); the workspace composes the file-explorer + files slices. Variant generation + blob storage are injected adapters (Convex ctx.storage default, originals-only).",
  "namespace": "@/features/media-library",
  "frontend": { "slicePath": "frontend/slices/media-library", "configExport": "mediaLibraryConfig" },
  "convex": {
    "tablesExport": "mediaLibraryTables",
    "schemaPath": "convex/features/media-library/schema.ts",
    "rootPaths": ["convex/features/media-library"]
  },
  "deps": {
    "npm": ["lucide-react", "nanoid"],
    "shadcn": ["button", "input", "dialog", "scroll-area", "dropdown-menu", "badge", "tabs"],
    "env": [],
    "peers": ["file-explorer", "files", "image-picker"]
  },
  "contract": {
    "requires": { "auth": "admin" },
    "provides": {
      "components": ["MediaLibrary", "MediaPickerModal", "AssetMetadataEditor", "StorageAdapterPanel"],
      "hooks": ["useMediaLibrary"],
      "utils": ["smartFolderPredicate", "createMockMediaAdapter"],
      "convex": {
        "tables": ["media_assets", "media_folders", "media_asset_folders", "media_smart_folders", "active_media_storage_adapter", "active_media_variant_delegate"],
        "rbac": ["media.read", "media.write", "media.replace", "media.delete"]
      }
    }
  }
}
```
Plus the mandatory `slice.contract.ts` (typed adapter + props contract) and `slice.manifest.json`, and a catalog entry in `lib/content/slices.ts`.
