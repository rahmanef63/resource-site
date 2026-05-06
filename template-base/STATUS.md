# template-base/ Status

**As of 2026-05-06.**

`template-base/` is the kitab's canonical "lean copy-from" source — extracted from superspace as the foundation new projects build on. It is **not** the deployed showcase site (that lives at the repo root) and is **not** the package shipped via the CLI's bundled starter (that lives at `packages/cli/lib/starter/`).

## Session 2026-05-06 progress

**1108 → 207 tsc errors (−81%)** via:

- 53 → 0 studio extraction errors (all 4 EXTRACTED.md categories cleared)
- Composed 6 cross-feature shared schemas into root (activity, attachments, comments, customFields, favorites, search)
- Backfilled 7 feature schemas from superspace (auth/RBAC, audit, chat, ai, menus, social, notifications, industryTemplates, example)
- Backfilled comprehensive database schema (19 tables — dbTables, dbFields, dbViews, dbRows, dbSavedViews, dbSharedViews, dbRowVersions, dbRowHistory, dbDeletedRows, dbFieldConditions, dbRelationConfigs, dbRelationJunctions, dbTableTemplates, dbSchemaVersions, dbSchemaMigrations, dbFieldValidations, dbImportExportJobs, dbFieldIndexes, universalDatabases)
- Compat shim `getUserByExternalId` in convex/shared/auth.ts (preserves caller call sites for re-merge)
- Backfilled frontend dirs (workspace, lib/invitations, mock-data, hooks/useCurrentUser, components/{logo,mode-toggle})
- Created generic stubs (use-file-upload, image-convert, auth-context) with full API surface
- Regenerated 4 auto-generated registries against actual slice set (studio + example only)
- Sed-fixed 4 path patterns (notion `_generated`, notion `_generated/api`, `@/shared/lib/cn`)
- Installed 37 missing peer deps
- Pinned 56 "latest" specs to exact versions
- Multi-targeted `@/shared/ui/*` path alias (components, motion, ui-components, root)

## What works (clean tsc)

- The studio slice — all 53 stabilization-class extraction errors resolved
- Cross-feature shared utilities (activity, attachments, comments, customFields, favorites, search) — schemas composed, code typechecks
- 4 auto-generated registries in sync with the slices that actually exist (`studio`, `example`)
- All package.json deps pinned to exact versions
- 37 missing peer deps installed

## What's still broken (~207 tsc errors, all internal)

Concentrated in specific UI components + dependency-on-codegen patterns. None affect the deployed kitab build, the CLI, or the MCP — they only show up if you run `tsc --noEmit` inside `template-base/`.

| File | # | Why |
|---|---:|---|
| `frontend/shared/settings/workspace/HierarchySettings.tsx` | 18 | Workspace hierarchy settings UI — references properties on workspaces that aren't in the kitab schema (e.g. parentId, hierarchyPath). Needs the workspace hierarchy table extension from superspace. |
| `components/ui/chart.tsx` + `frontend/slices/notion/shared/ui/chart.tsx` | 18 | Recharts API drift — version-specific narrowing. The chart wrapper assumes recharts v2 API; installed is v3+. Fix: rewrite against current recharts types or pin recharts to v2. |
| `frontend/shared/ui/components/theme-preset-switcher.tsx` | 9 | Imports a typed-config from `frontend/shared/foundation/utils/data/shared/config` that has its own broken imports. |
| `frontend/shared/ui/layout/sidebar/workspace-switcher/{EnhancedWorkspaceSwitcher,WorkspaceSwitcherStack}.tsx` | 16 | Workspace switcher UI — references workspace metadata (e.g. parent, color, lastActiveAt) not in the kitab's minimal `workspaces` schema. |
| `frontend/shared/ui/components/file-upload-queue.tsx` | 7 | Residual API mismatch with the use-file-upload stub. |
| `frontend/slices/notion/slices/editor/BlockEditor.tsx` | 6 | Vite→Next port residue. |
| `frontend/shared/ui/layout/sidebar/components/site-header.tsx` | 6 | References ai-assistant UI (not vendored). |
| `frontend/shared/foundation/utils/data/shared/config/index.ts` | 6 | Slice-config aggregator — lists feature configs that don't exist in the kitab. |
| (~145 more, scattered) | ~145 | One-off missing imports, `..` path drift, recharts narrowing fallout. |

By directory:

```
138 frontend/shared
 31 frontend/slices
 17 components/ui
 10 convex/features
  5 convex/lib
  1 scripts/features
  4 instrumentation.ts (next.js types)
  1 convex/auth.ts
```

## How to use template-base today

- **Don't** run `tsc --noEmit` inside it expecting clean. Use it as a copy-source.
- **Do** copy specific subtrees into a new project:
  ```bash
  cp -r template-base/frontend/slices/studio my-app/frontend/slices/
  cp -r template-base/convex/features/studio my-app/convex/features/
  cp -r template-base/frontend/shared/builder my-app/frontend/shared/
  ```
  Each subtree is internally consistent (studio + builder typecheck clean against the kitab schema).
- **Do** scaffold via `npx rahman-resources init my-app --template <slug>` — the CLI uses `app/preview/<slug>/` and `components/templates/_shared/` from the deployed kitab repo, not `template-base/`.

## Path to fully clean template-base

The remaining 207 errors fall into roughly 4 buckets, each with a distinct fix:

1. **Recharts API drift (~18 errors)** — pin `recharts@^2` in `template-base/package.json` OR rewrite the two chart wrappers against recharts v3+ types. Recommended: rewrite (recharts v3 is the current major).
2. **Workspace schema extensions (~30 errors)** — HierarchySettings + WorkspaceSwitcher reference workspace fields not in the kitab schema (parentId, hierarchyPath, color, lastActiveAt, etc.). Either backfill those fields into the workspaces table or strip the components that depend on them.
3. **Slice-config aggregator (~15 errors)** — `foundation/utils/data/shared/config/` lists every superspace slice. Re-run the slice CLI's config-aggregator script (similar to how we re-ran generate-registry) to produce a config list keyed to actual kitab slices.
4. **Misc one-offs (~145 errors)** — small, scattered, mostly in widget components. Best handled file-by-file as each becomes operationally needed.

Bucket 1 is fastest (one config change). Bucket 2 needs design decision (extend schema vs strip UI). Bucket 3 needs running an existing script + verifying. Bucket 4 is incremental.

## What was fixed this session (delta: −901 errors)

- 53 → 0 studio-internal errors (schema additions + builder enum + testing-library imports + misc).
- 7 cross-feature shared schemas composed (−110).
- 7+ feature schemas backfilled from superspace (chat, ai, menus, social, notifications, industryTemplates, example, comprehensive database) (−85).
- Auth/RBAC schema backfilled with workspaceMemberships, roles, adminUsers (−28).
- Audit log schema (activityEvents) (−15).
- `getUserByExternalId` compat shim (−5).
- Notion `from "./_generated/..."` paths corrected (−82).
- Notion sub-features path corrected to 4 levels up (−45).
- 4 registries regenerated (−147).
- 37 missing peer deps installed (−97).
- `@/shared/lib/cn` → `@/lib/utils` alias fix (−24).
- `@/convex/features/notion/_generated` → `@/convex/_generated` notion fix (−11).
- Builder canvas `'studio'` mode threaded through (−3).
- `@/shared/ui/*` multi-target path alias (−21).
- Backfilled frontend dirs + generic stubs (−65).
- Selective core/notifications/industryTemplates/example schema composition (−21).
- 4 misc/test fixes.

Total: 1108 → 207 tsc errors. The remaining 207 are documented above by bucket.
