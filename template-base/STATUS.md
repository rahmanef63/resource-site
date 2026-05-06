# template-base/ Status

**As of 2026-05-06.**

`template-base/` is the kitab's canonical "lean copy-from" source — extracted from superspace as the foundation new projects build on. It is **not** the deployed showcase site (that lives at the repo root) and is **not** the package shipped via the CLI's bundled starter (that lives at `packages/cli/lib/starter/`).

## What works

- The studio slice (`frontend/slices/studio/` + `convex/features/studio/`) typechecks clean. All 53 stabilization-class tsc errors from the original extraction are resolved (schema fit, builder enum widening, testing-library API drift, misc fallout).
- The shared schema composition: `convex/schema.ts` composes `authTables + notion + studio + studioAgent + database + documents + activity + attachments + comments + customFields + favorites + search`.
- 4 auto-generated registries are in sync with the slices that actually exist (`studio`, `example`):
  - `frontend/shared/lib/features/registry.ts`
  - `frontend/shared/foundation/manifest/registry.tsx`
  - `frontend/shared/preview/lazy-registry.ts`
  - `frontend/slices/initFeatureSettings.ts`
- All package.json deps are pinned to exact versions (no `"latest"`).
- 37 missing peer deps were installed (radix-ui aspect-ratio/menubar/toast, react-day-picker, vaul, embla-carousel, motion, etc.).

## What's still broken (~428 tsc errors, all internal)

Pre-existing breakage from the partial superspace strip during P2/P2.5/P2.6. Affects only `template-base/` typecheck in isolation; **does not** affect the deployed kitab build (excluded via root `tsconfig.json`), the CLI (uses its own `lib/starter/`), or the MCP.

| Category | Count | Why |
|---|---:|---|
| `convex/features/notion/*` | ~70 | Notion port relies on tables/auth helpers (`workspaceMemberships`, `getUserByExternalId`) that weren't extracted from superspace's full RBAC layer. |
| `convex/lib/{rbac,audit}/*` | ~33 | RBAC layer ships its CODE but not its `workspaceMemberships` schema. The kitab uses no-op stubs at `convex/auth/helpers.ts` instead. |
| `convex/shared/*` | ~50 | Most resolve once shared schemas compose (already done); residue references `getUserByExternalId` + clerk-style identity helpers stripped from the kitab. |
| `frontend/shared/communications/*` | ~40 | Chat/AI primitives that depend on a broader AI agent registry not in the kitab. |
| `frontend/shared/settings/*`, `ui/components/*` | ~70 | Reference `@/frontend/shared/workspace`, ai-assistant UI, mock-data — directories that exist in superspace but were not in the lean kitab strip. |
| `frontend/slices/notion/*` | ~30 | Vite→Next port residue (some `*.test.tsx` and a few hook files). |
| `components/ui/*` | ~17 | Shadcn primitives still missing tiny peer deps (e.g. `chart.tsx` recharts narrowing, `little-date`, `use-stick-to-bottom` deep API drift). |

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

Three options, in increasing scope:

1. **Strip dependent files**: rm the subtrees that reference missing modules (e.g. `frontend/shared/communications/`, `frontend/shared/settings/workspace/`). Loses functionality but achieves clean tsc.
2. **Backfill from superspace**: re-extract `workspaceMemberships`, `getUserByExternalId`, `frontend/shared/workspace/`, ai-assistant UI, etc. Restores functionality at the cost of ~50 more files brought in.
3. **Stub everything missing**: hand-write empty modules at every missing path so tsc resolves. Fastest to clean but leaves runtime broken.

Option 2 is the long-run best (full kitab parity with superspace's foundation, not just studio). Defer until the kitab actually consumes template-base/ as a package source — currently it doesn't.

## What was fixed this session (delta: −680 errors)

- 53 → 0 studio-internal errors (schema additions + builder enum + testing-library imports + misc).
- Cross-feature shared schemas composed (−110).
- Notion `from "./_generated/..."` paths corrected to `../../_generated/...` (−82).
- 4 registries regenerated against actual slice set (−147).
- 37 missing peer deps installed (−97).
- `@/shared/lib/cn` → `@/lib/utils` alias fix (−24).
- `@/convex/features/notion/_generated` → `@/convex/_generated` notion fix (−11).
- Builder canvas `'studio'` mode threaded through (−3).
- 4 misc/test fixes.

Total: 1108 → 428 tsc errors. The remaining 428 are documented above by category.
