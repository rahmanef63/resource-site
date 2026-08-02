# Example Feature — reference slice

Minimal portable slice. Copy the whole folder when scaffolding a new slice manually; or run `npx rahman-resources scaffold-slice <slug>` once Phase 1 lands.

## What's inside

| File | Purpose |
|---|---|
| `slice.json` | Contract — registry uses this. **Required.** Validated by `node packages/cli/scripts/validate-slice.mjs`. |
| `config.ts` | `defineFeature(...)` export the registry generators auto-discover. |
| `page.tsx` | Slice's primary entry. Wraps with shared chrome once Phase 1 lifts it. |
| `components/` | Provider-agnostic UI. |
| `types.ts` | Slice-internal types. |

Pair with `convex/features/example-feature/` (in this repo) for the backend half: schema fragment + queries + mutations.

## How to author a new slice using this as a template

1. `cp -r frontend/slices/_templates/example-feature frontend/slices/<your-slug>`.
2. Edit `slice.json` — set new `slug`, `title`, `description`, `namespace`.
3. Edit `config.ts` — match the new slug + routes.
4. Replace `page.tsx` + `components/*` with your actual feature.
5. Add the matching backend half at `convex/features/<your-slug>/`.
6. Validate: `node packages/cli/scripts/validate-slice.mjs frontend/slices/<your-slug>/slice.json`.
7. Run `npm run gen:all` (Phase 1) to refresh registries.
8. Compose into the root convex schema (`convex/schema.ts`) by spreading `<your-slug>Tables`.

## Constraints (enforced by CI)

- **Imports** inside the slice MUST resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<slug>/*`, `@convex/*` only. No deep relative imports up out of the slice — breaks copy-paste portability. Gated by `audit:slices`.
- **Convex tables**: never declare outside `convex/features/<slug>/schema.ts`; never share a table name with another slice. Gated by `audit:slices`.
- **shadcn primitives only**: never raw `<button>`, `<dialog>`, `<input type=date|file>` — wrap with `<Button>`, `<Dialog>` / `ResponsiveDialog`, `DateField`, `FileUpload`. Gated by `audit:templates`.
- **200 LOC max per file**: hard cap, no exceptions for component/logic files. If a file approaches the cap, split sub-components/helpers into neighbour files (`components/<Name>.tsx`, `lib/<helper>.ts`, `<base>-data.ts`). Pure-data files (catalog arrays, theme presets, seed data) are exempt. Gated by `audit:file-size`.
- **Convex public mutations/queries**: every `mutation()` / `query()` MUST declare `args: { v.* }` validators AND call `requireUser()` / `requireAdmin()` from `convex/_shared/auth.ts` inside the handler (skip only for documented public endpoints). No bare `.collect()` — use `.withIndex(...).take(N)`.
- **Metadata trio**: every slice ships `slice.json` + `slice.contract.ts` + `slice.manifest.json`. Gated by `audit:slices` trio check.
- **Provider-specific code**: lives under `components/providers/<provider>.tsx` so a sibling provider can land without touching the slice's public API.

Run `npm run slices:check` before commit; pre-push hook re-runs the audit chain (`audit:slices` + `audit:templates` + `audit:file-size`).
