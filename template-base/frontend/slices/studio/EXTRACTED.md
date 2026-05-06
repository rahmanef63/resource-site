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

1. **Convex root schema** — `convex/schema.ts` does not exist in template-base. The studio schema fragments (`convex/features/studio/api/schema.ts` exporting `studioTables`, `convex/features/studio/api/agentConfig.schema.ts` exporting `studioAgentTables`) need to be merged into whatever root schema this project ends up with. Unblocks `convex dev` codegen + `_generated/` imports across studio.
2. **`useWorkspaceId`** — exists at `frontend/shared/foundation/workspaces/hooks/useWorkspaceId.ts`; relies on `ConvexWorkspaceContext`. Both ported but assume a `workspaces` table — same blocker as #1.
3. **shadcn `components.json`** — primitives are vendored but `components.json` not refreshed; if `pnpm dlx shadcn-ui add` is used later it may renumber/clash.
4. **Tests** — `describe.skip` markers in all 4 files. Un-skip when real RBAC is back.
5. **UIUX001 / UIUX013** — known issues per manifest §8.6, deferred to stabilization.

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
