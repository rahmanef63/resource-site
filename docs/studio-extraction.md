# Studio Extraction (P10)

Studio = UI-builder + workflow-automation, unified. Extracted from superspace as a clean move.

**Authoritative artifact**: `template-base/frontend/slices/studio/EXTRACTED.md` (lives next to the code so it travels with the slice). This doc is a kitab-level pointer + contract.

## Source

- Repo: `github.com/rahmanef63/superspace`
- Commit: `aeced78a chore(studio): archive feature → docs/archive/studio/`
- Mode: clean move — archived in superspace under `docs/archive/studio/`, live here under `frontend/slices/studio/` + `convex/features/studio/`.
- State: beta (unchanged from source).
- Extracted: 2026-05-06.

## What landed

| Path | Count |
|---|---|
| `frontend/slices/studio/` | 385 files (367 TS/TSX + docs) |
| `convex/features/studio/` | 13 files (queries, mutations, executor, agents, schema fragments) |
| `app/studio/preview/page.tsx` | preview route |
| `tests/features/studio/` | 4 test files (`describe.skip` until RBAC restored) |
| `frontend/shared/builder/` (synced subset) | 4 fork-divergent files (110 others byte-identical) |
| `frontend/shared/ui/{dashboard,icons,color-picker}/` | vendored |
| `lib/features/{constants,package-contract,workspace-install}.ts` | vendored |
| `convex/features/ai/lib/types.ts` | FeatureAgent (relocated to satisfy `../../ai/lib/types`) |
| `components/ui/` | 50 shadcn primitives vendored |

## Strip strategy (single-tenant resources/)

Deviation from manifest §9.5 (which proposed sed-at-callsite). We chose **stub-at-helper** instead — reversible by file swap, no call-site edits on re-merge.

- `convex/auth/helpers.ts` (NEW, no-op)
  - `requirePermission` / `requireActiveMembership` / `canPermission` → return placeholder, never throw
  - `ensureUser` / `getExistingUserId` → still require auth via `@convex-dev/auth`'s `getAuthUserId`, skip clerk-id reconciliation
- `convex/features/database/utils.ts::hasWorkspaceAccess` → returns `Boolean(userId)` (signed-in = access)

Studio mutation call sites kept verbatim.

## Receiving-side wiring (no longer blockers)

- **Root schema**: `convex/schema.ts` composes `authTables + notionTables + studioTables + studioAgentTables`. Notion got a named `notionTables` export added alongside its default — zero behavioral impact.
- **`_generated/` stubs**: hand-written placeholders at `convex/_generated/{api,server,dataModel}.{d.ts,js}` so `tsc --noEmit` runs without an authenticated Convex deployment. **Overwritten on first `npx convex dev`** — runtime intentionally broken until then (api/internal proxies throw on access).
- **Peer deps** added to package.json: `reactflow`, `react-syntax-highlighter`, `@types/react-syntax-highlighter`, `html-to-image`, `ajv`, `ajv-formats`, `react-markdown`, `zustand`.
- **UI barrel** at `frontend/shared/ui/index.ts` exports `ResponsiveDialog`, `SharedCanvas`, `CMSPreview`, `AutomationPreview`. Extend if more callers land.

## Remaining tsc errors (51, all stabilization-class)

Categorised in `EXTRACTED.md`:

1. **Schema fit (~30)** — studio executor/queries/sla reference `tasks`, `dbTables`, `dbRows`, `documents` tables + a `notifications.workspaceId` field + `workflows.assigneeId`. Resolution: stub minimal tables OR refactor studio executor to be schema-agnostic (capability-gated).
2. **Builder enum widening (3)** — `SharedCanvasProvider.canvasMode` types as `'cms' | 'automation' | 'database'`; studio passes `'studio'`. Same for `UnifiedLibrary.currentFeature`. Pre-existing in superspace under TS suppression. Resolution: widen to `... | 'studio'` once studio is the primary consumer.
3. **`@testing-library/react` API drift (8)** — co-located test files import `waitFor` / `screen`. v16 moved them under `@testing-library/dom`. Resolution: downgrade testing-library or rewrite imports.
4. **Misc (~10)** — TS2339/TS2345 fallout from #1.

## Re-merge contract (when stable)

1. Resources publishes `@resources/studio` (+ optionally `@resources/builder`) as installable packages.
2. Superspace adds the dependency, replaces its archived `frontend/slices/studio/page.tsx` with a thin re-export.
3. Superspace restores its own `convex/auth/helpers.ts` (already present under `superspace/convex/auth/`); studio's mutation call sites here will then enforce real RBAC unchanged.

## Other follow-ups

- **shadcn `components.json`** not refreshed; `pnpm dlx shadcn-ui add` later may renumber/clash.
- **Tests** — `describe.skip` in all 4 files at `tests/features/studio/`. Un-skip when real RBAC is back.
- **UIUX001 / UIUX013** — known issues per source manifest §8.6, deferred.

## Latent steps for the operator

1. `npx convex dev` (interactive) — generates real `_generated/`, overwrites stubs.
2. Decide schema vs studio refactor for the ~30 schema-fit errors.
3. Widen builder `canvasMode` type once studio is primary consumer.
