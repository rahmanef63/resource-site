# Decomposition Recipes — Oversized Slices

Five Phase 3 slices exceed the autonomous-loop 500-LOC-per-iter budget and
must be harvested by an operator across multiple PRs. This document records
the recommended split for each.

Source paths assume `~/projects/` as the parent.

---

## 1. `workspaces` (superspace) — 8925 LOC

**Source**: `superspace/convex/workspace/` (22 files) + `superspace/frontend/slices/workspace-store/`

Split into **6 PRs**, each ≤ 500 LOC. Stack on the previous one.

| PR | Files | LOC est | Owner-scope |
|---|---|---|---|
| 1 | `workspaces.ts`, `schema.ts`, `helpers.ts` | ~450 | Core CRUD + workspace doc shape |
| 2 | `roles.ts`, `roleMenuPermissions.ts`, `permissions.ts` | ~450 | RBAC: 6 system roles + permission map |
| 3 | `hierarchy.ts`, `templates.ts` | ~400 | Parent-child workspaces + template scaffolds |
| 4 | `notifications.ts`, `comments.ts` | ~400 | Per-workspace notification + comment surfaces |
| 5 | `storage.ts`, `etlBootstrap.ts` | ~450 | Storage quota + import bootstrap |
| 6 | `exportImport.ts` + frontend `workspace-store` | ~500 | JSON export/import + Zustand store |

**Manifest target**: namespaced tables `workspaces_*`, `workspace_roles`, `workspace_permissions`, etc.
**Peer**: `convex-auth` (every mutation calls `requireUser`).
**Permissions**: `workspace.{create,manage,delete,invite,export,import}` × role tier.

**Pre-flight**: `requireActiveMembership` helper must land in `convex/_shared/auth.ts` first (not yet harvested; superspace has it).

---

## 2. `editor-blocks` (notion) — 5128 LOC

**Source**: `notion-page-clone/frontend/slices/editor/`

Split into **4 PRs**.

| PR | Scope | LOC est |
|---|---|---|
| 1 | `BlockRenderer` + `Block` core types + 5 atomic blocks (text/heading/quote/divider/callout) | ~480 |
| 2 | List blocks (bulleted, numbered, todo) + nested-list logic | ~450 |
| 3 | Code block + equation + embed + image blocks | ~480 |
| 4 | Slash-menu command palette + selection state + drag handles | ~500 |

**Deps to add**: `@tiptap/react@^3`, `@tiptap/starter-kit`, `@tiptap/pm`, `marked` for code.
**Peer**: none (presentational, hooks for editor state stay local).

**Caveat**: notion's editor wires into `PageContext` for collaborative cursors. Strip that — kitab editor is single-user; consumer brings own sync layer.

---

## 3. `databases-views` (notion) — 9452 LOC

**Source**: `notion-page-clone/frontend/slices/databases/`

Split into **7 PRs**.

| PR | View type | LOC est |
|---|---|---|
| 1 | Database core: schema, types, common toolbar/filter primitives | ~500 |
| 2 | Table view | ~500 |
| 3 | Board view (kanban) | ~500 |
| 4 | Feed view (timeline) | ~400 |
| 5 | Calendar view | ~500 |
| 6 | Gallery view | ~400 |
| 7 | Property editors (text/number/select/multi-select/date/relation/formula) | ~500 |

**Deps to add**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`.
**Peer**: `comments` (databases support cell-level annotations).

**Caveat**: cell-selection is its own slice in notion (`database-cell-selection`); harvest it separately as PR 0 prereq.

---

## 4. `file-upload` / asset-management (superspace) — 1899 LOC

**Source**: `superspace/frontend/slices/asset-management/` (17 files) + `superspace/convex/features/assetManagement/` (4 files)

Split into **3 PRs**.

| PR | Scope | LOC est |
|---|---|---|
| 1 | Convex `assets` schema + storage actions + WebP convert pipeline | ~500 |
| 2 | `useUploadAsset` hook + `AssetGallery` + thumbnail strip | ~480 |
| 3 | `FileUploadZone` Convex-wired version + `ConvexErrorAlert` + `WorkspaceProvider` integration | ~500 |

**Note**: a backend-agnostic FileUpload UI primitive already shipped (PR #27). This decomp adds the Convex-wired wrapper that uses #27 underneath. Don't duplicate the dropzone logic.

**Deps**: `imageConvert` lib (browser-side WebP), already-installed `react-dropzone` from #27.

---

## 5. `blog-mdx` (rahmanef.com) — 1020 LOC

**Source**: `rahmanef.com/frontend/slices/blog/`

Split into **2 PRs**.

| PR | Scope | LOC est |
|---|---|---|
| 1 | MDX content schema + frontmatter parser + `rehype-pretty-code` integration | ~480 |
| 2 | `BlogPost`, `BlogList`, `BlogCategory` components + RSS/sitemap generators | ~540 (slightly over — split RSS into separate file if needed) |

**Deps**: `@next/mdx`, `gray-matter`, `rehype-pretty-code`, `marked`.
**Peer**: `seo` (each post wires SEO metadata via harvested `seoConfig`).

---

## Workflow Per Decomp

1. Branch `ssot/phase3-<slice>-decomp-pr<N>` off the **previous** decomp PR (linear stack).
2. Each PR: `tsc --noEmit` + `next build` clean before push.
3. Final PR per slice: write the `slice.manifest.json` declaring all schema tables, deps, env vars, permissions accumulated across the stack.
4. Update SSOT_PROGRESS.md: flip `[!]` → `[x]` only after the **final** PR merges to main.

## Order Recommendation

Highest leverage first (covers the most consumer use cases):

1. `workspaces` — every other slice needs workspace isolation.
2. `file-upload` — many slices need asset attachments.
3. `editor-blocks` — content-layer foundation.
4. `databases-views` — biggest payload, defer until consumer demand.
5. `blog-mdx` — narrow use case, harvest last.
