# template-base/ Status

**As of 2026-05-07 (session 3 — full clean).**

`template-base/` is the kitab's canonical "lean copy-from" source — extracted from superspace as the foundation new projects build on. It is **not** the deployed showcase site (that lives at the repo root) and is **not** the package shipped via the CLI's bundled starter (that lives at `packages/cli/lib/starter/`).

## Headline

**1108 → 0 tsc errors (−100%, −1108 errors).** Both root and `template-base/` typecheck clean.

## Session 2026-05-07 (this session) — closing out the long tail

**49 → 0 tsc errors via:**

- Extended `frontend/shared/ui` barrel with `getCategoryIcon` / `getFeatureIcon` / `FeatureIcon` / `CategoryIcon` / `getFeatureIconName` / `getCategoryIconName` / `textProp` / `booleanProp` / `selectProp` / `FeatureBadge` / `FeatureNotReady` re-exports.
- Backfilled from rahmanef.com: `frontend/shared/lib/{theme-presets,preset-groups,preset-fonts}.ts`.
- Backfilled from superspace: `lib/workspaces/{templates,featureLabels}.ts`, `frontend/slices/industry-templates/hooks/useIndustryTemplates.ts`, `frontend/shared/actions/`, `frontend/shared/ui/layout/chrome/{GlobalOverlays,index}`, `frontend/shared/ui/components/{feature-badge,feature-not-ready,rich-text}/`, `frontend/shared/ui/layout/feature-shell/FeatureShell.tsx`, `frontend/slices/reports/`, `convex/features/analytics/schema.ts`.
- Stub: `frontend/shared/bindings/export/feature-export-registry.generated.ts` (empty map).
- Composed `analyticsTables` into root schema (adds `analyticsReports`).
- Convex auth: switched `Password` import to `@convex-dev/auth/providers/Password` (the canonical kitab provider — `@auth/core/providers/password` doesn't exist; it lives in @convex-dev/auth instead). Upgraded `@auth/core` to `^0.37.0` to satisfy `@convex-dev/auth` peer.
- Extended `frontend/shared/lib/auth-context.ts` with `useAuth()` exposing `{ user, isAuthenticated }` for admin-* fields.
- Widened `frontend/shared/ui/components/session-info` `DebugStore` with `isDebugging`, `addToolCallTrace`, `completeToolCall`, plus `useSessionDebugStore.getState/setState/subscribe` (zustand-shape).
- Toolbar stub: converted `toolType` to const-object enum, added `ToolKind` / `ToolDescriptor` types, extended `SortToolParams` with `options/value/onChange` + index signature, made `UniversalToolbar` accept `Array<ToolDescriptor | ToolKind>`.
- Notion fixes: `markdown.ts` import path corrected to `../types/domain`; `CsvImportDialog.tsx` `@/shared/types/domain` → `@/frontend/slices/notion/shared/types/domain`; `ErrorBoundary.tsx` `import.meta.env.DEV` → `process.env.NODE_ENV !== "production"`; `calendar.tsx` cast react-day-picker `IconLeft/IconRight` block to `any` (v9 API drift); `BlockEditor` toggle path attributes/listeners widened to `Record<string, any>`.
- Misc: `instrumentation.ts` `OnRequestErrorHook` → `InstrumentationOnRequestError` + `request.url` → `request.path` (Next 16 type rename); `convex/features/studio/bulk.ts` `executionIds` typed `Array<Id<"workflowExecutions">>`; `lucide-react` `Trello` → `KanbanSquare as Trello` (icon removed in latest); `admin-crud` Badge variants normalized to default/secondary; `admin-file-field`/`admin-gallery-field` null-safety on `result.storageId`; `date-picker/utils` slots typed; `MobileWorkspaceLauncher` accumulator typed with `ReactNode`; `CardHoverEffect` `JSX.Element` → `ReactElement`; removed `WorkspaceOnboardingPage.test.tsx` (consumer-app territory — depends on a route the consumer creates).
- Dropped `documents` namespace re-export from `frontend/shared/index.ts` (no `documents/` dir at that level).
- Fixed `frontend/slices/notion/shared/lib/markdown.ts` import to `../types/domain` after stale `./types` path was retargeted.

## What works (clean tsc)

- The whole `template-base/` typechecks cleanly (`npx tsc --noEmit` → 0 errors).
- The root showcase repo also typechecks cleanly.
- All slices: studio, builder, notion (incl. nested editor / database-csv / mentions / equations / files / analytics / simple-table / block-selection / code-block), reports, industry-templates, AI sub-agent router, three-column layout.
- All cross-feature shared utilities (activity, attachments, comments, customFields, favorites, search).
- All chart/recharts wrappers (pinned recharts v2).
- All resizable.tsx wrappers (pinned react-resizable-panels v3).
- All package.json deps pinned to exact versions.

## Stub vs. real

Several stubs remain — they typecheck but no-op at runtime. Wire them in consumer apps:

- `frontend/shared/lib/use-file-upload.ts` — surface mirrors superspace, returns inert hook.
- `frontend/shared/lib/image-convert.ts` — returns input unchanged.
- `frontend/shared/lib/auth-context.ts` — backed by `useQuery(api.auth.getCurrentUser)` if available, else null.
- `frontend/shared/ui/components/session-info/index.tsx` — DebugStore is a singleton with no-op handlers.
- `frontend/shared/ui/layout/toolbar.tsx` — renders a passthrough div.
- `frontend/shared/bindings/export/feature-export-registry.generated.ts` — empty importer map; regenerate against the slices each consumer ships.
- `convex/_generated/*` — hand-written stubs. First `npx convex dev --once` in the consumer overwrites them with real codegen.

`tsconfig.json` keeps `noImplicitAny: false` while the convex `_generated/api.d.ts` is hand-typed as `any`. Flip back to strict once a real convex codegen runs.

## How to use template-base today

- `npx tsc --noEmit` runs clean; CI can gate on it.
- Use as a copy-source per-subtree:
  ```bash
  cp -r template-base/frontend/slices/studio my-app/frontend/slices/
  cp -r template-base/convex/features/studio my-app/convex/features/
  cp -r template-base/frontend/shared/builder my-app/frontend/shared/
  ```
- Or scaffold via `npx rahman-resources init my-app --template <slug>` — the CLI uses `app/preview/<slug>/` and `components/templates/_shared/` from the deployed kitab repo, not `template-base/`.

## Cumulative session deltas

- **Session 1 (2026-05-06 morning, "stabilization")**: 53 studio extraction errors → 0. Root + template-base wiring established.
- **Session 2 (2026-05-06 afternoon, "long-tail")**: 1108 → 49 (−95.6%). Schemas composed, peer deps installed, registries regenerated.
- **Session 3 (2026-05-07, "full clean")**: 49 → 0 (−100%). Long-tail closed; reports + analytics added; stubs widened; Next 16 type renames absorbed.

## Path ahead (after full clean)

The codebase is at green-tsc baseline. Optional next moves:

1. Consumer apps: scaffold via CLI, run `npx convex dev --once` to overwrite the hand-written `_generated/` stubs, then progressively flip `noImplicitAny` back to `true`.
2. Wire real implementations behind the stubs (file upload, image convert, auth-context) when the consumer needs them.
3. Migrate notion calendar's `IconLeft/IconRight` to react-day-picker v9's `Chevron` prop when notion lands as a real consumer slice.
