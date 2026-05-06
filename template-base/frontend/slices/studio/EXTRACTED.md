# Studio — Extracted from SuperSpace

**Source repo**: `github.com/rahmanef63/superspace`
**Source commit**: `aeced78a chore(studio): archive feature → docs/archive/studio/`
**Extracted on**: 2026-05-06
**Mode**: clean move (archive in superspace; live here)
**State landed**: beta (unchanged from source)

## What landed

- `frontend/slices/studio/` — 385 files (367 TS/TSX + docs from source slice)
- `convex/features/studio/` — 13 files (queries, mutations, executor, agents, schema fragments)
- `app/studio/preview/page.tsx` — preview route (path picked per manifest §9.5)
- `tests/features/studio/` — 4 test files (all `describe.skip` until RBAC restored)
- `frontend/shared/builder/` — 4 files synced from superspace fork (registry, SharedCanvasProvider, UnifiedInspector, UnifiedLibrary). The other 110 builder files in template-base were already byte-identical.
- Vendored: `frontend/shared/ui/{dashboard,icons,color-picker}/`, `lib/features/{constants,package-contract,workspace-install}.ts`, `lib/utils.ts`, `hooks/use-{mobile,toast}.ts`, 50 shadcn primitives in `components/ui/`.

## What was stripped

Per manifest §8.2 (single-tenant resources/ project):

- `convex/auth/helpers.ts` is a **stub file** here, not the real superspace 6-tier RBAC.
  - `requirePermission` / `requireActiveMembership` / `canPermission` → no-op (return placeholder, never throw).
  - `ensureUser` / `getExistingUserId` → still require auth via `@convex-dev/auth`'s `getAuthUserId`, but skip the clerk-id reconciliation.
- Original call sites in studio mutations are **kept verbatim**. Re-merge to superspace = swap the stub helpers back to superspace's helpers; no call-site edits needed.

This deviates from manifest §9 step 5 (which suggested seding out the calls). Justification: stub-at-helper is reversible by file swap; sed-at-callsite would force every studio mutation to be re-edited on re-merge. Owner direction in §8.2 explicitly allows "no-op stub during port" — this honors that.

## Receiving-side gaps that need follow-up

### Wired during extraction (no longer blockers)

- **Convex root schema** — `convex/schema.ts` now composes `authTables + notionTables + studioTables + studioAgentTables`. Notion's per-feature `schema.ts` was lightly refactored to also export a named `notionTables` const alongside its default `defineSchema(...)` (zero behavioral impact — nothing imported the default).
- **`_generated/` stubs** — hand-written placeholders at `convex/_generated/{api,server,dataModel}.{d.ts,js}` so `tsc --noEmit` runs without an authenticated Convex deployment. These files are **overwritten on first `npx convex dev`**. Runtime is intentionally broken until that happens (api/internal proxies throw on access).
- **Vendored peer deps** — `reactflow`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `html-to-image`, `ajv`, `ajv-formats`, `react-markdown`, `zustand` added to `package.json`.
- **UI barrel** — `frontend/shared/ui/index.ts` exports `ResponsiveDialog`, `SharedCanvas`, `CMSPreview`, `AutomationPreview`. Extend if more callers land.
- **`hasWorkspaceAccess`** — stub at `convex/features/database/utils.ts` returns `true` once auth is present (single-tenant).

### Remaining tsc errors (51 in studio code, all stabilization-class)

`npx tsc --noEmit` reports 51 errors localized to studio. Categorized:

1. **Schema fit (~30 errors)** — studio's executor / queries / sla reference tables that don't exist in template-base's schema: `tasks`, `dbTables`, `dbRows`, `documents`, plus a `notifications.workspaceId` field and a `workflows.assigneeId` field. In SuperSpace those tables exist via other features. Resolution: either (a) add minimal stub tables to root schema; or (b) refactor studio's executor to be schema-agnostic (gated behind capability checks). Defer — picks during stabilization.
2. **Builder enum widening (3 errors)** — `frontend/shared/builder/canvas/core/SharedCanvasProvider.tsx` types `canvasMode` as `'cms' | 'automation' | 'database'`, but studio passes `'studio'`. Same in `UnifiedLibrary.currentFeature`. Pre-existing in superspace too — never raised because TS suppression patterns covered it. Resolution: widen builder type to `... | 'studio'` once studio is the primary consumer.
3. **`@testing-library/react` API drift (8 errors)** — co-located test files at `frontend/slices/studio/ui/{hooks,slices/renderer/components}/__tests__/` import `waitFor` / `screen`. v16 moved them under `@testing-library/dom`. Resolution: either downgrade testing-library or rewrite imports. These tests are inside the slice (not in `tests/features/studio/`) so they were never in the "skip suite".
4. **Misc (~10 errors)** — small TS2339/TS2345 fallout from #1.

### Other follow-ups

- **shadcn `components.json`** — primitives are vendored but `components.json` not refreshed; if `pnpm dlx shadcn-ui add` is used later it may renumber/clash.
- **Tests** — `describe.skip` markers in all 4 files at `tests/features/studio/`. Un-skip when real RBAC is back.
- **UIUX001 / UIUX013** — known issues per manifest §8.6, deferred to stabilization.

## Re-merge contract (future)

When this stabilizes:

1. Resources/ publishes `@resources/studio` + (optionally) `@resources/builder` as installable packages.
2. SuperSpace adds the dependency, replaces `frontend/slices/studio/page.tsx` with a thin re-export.
3. SuperSpace restores its own `convex/auth/helpers.ts` (already in place under `superspace/convex/auth/`); studio's mutation call sites here will then enforce real RBAC unchanged.

## Source map

| Here | From |
|---|---|
| `frontend/slices/studio/` | `superspace/docs/archive/studio/frontend-slice/` |
| `convex/features/studio/` | `superspace/docs/archive/studio/convex-feature/` |
| `app/studio/preview/page.tsx` | `superspace/docs/archive/studio/app-route/preview/page.tsx` |
| `tests/features/studio/` | `superspace/docs/archive/studio/tests/` |
| `frontend/shared/builder/` (4 files) | `superspace/frontend/shared/builder/` |
| `frontend/shared/ui/{dashboard,icons,color-picker}/` | `superspace/frontend/shared/ui/` |
| `lib/features/{constants,package-contract,workspace-install}.ts` | `superspace/lib/features/` |
| `convex/ai/lib/types.ts` | `superspace/convex/platform/ai/lib/types.ts` (relocated to satisfy studio's `../../ai/lib/types` relative path) |
