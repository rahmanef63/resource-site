# Authoring a slice

A slice is a portable vertical feature unit. One folder, copy-paste anywhere it compiles. See [`slice-architecture.md`](./slice-architecture.md) for the full plan + contract.

## Quick path

```bash
npx rahman-resources scaffold-slice my-feature --category data
```

This pulls the reference at `frontend/slices/_templates/example-feature/` + `convex/features/example-feature/` into your project, rewriting identifiers + setting the category in `slice.json`.

## Manual path

1. `cp -r frontend/slices/_templates/example-feature frontend/slices/<slug>` (or scaffold via CLI above).
2. `cp -r convex/features/example-feature convex/features/<slug>`.
3. Edit `frontend/slices/<slug>/slice.json` — set new slug, title, description, namespace, deps.
4. Edit `frontend/slices/<slug>/config.ts` — match the new slug, set routes, nav, peers.
5. Replace `page.tsx` + `components/*` with your real UI.
6. Replace `convex/features/<slug>/{schema,queries,mutations}.ts` with real backend code.
7. Spread the slice's tables into the root convex schema:
   ```ts
   import { mySliceTables } from "./features/<slug>/schema";
   export default defineSchema({ ...mySliceTables, /* others */ });
   ```
8. Run `npm run gen:slices` to regenerate registry-generated files.
9. Run `npm run slices:check` (validate + audit + gen-drift gate).
10. Commit. If publishing back to the kitab: `npx rahman-resources publish-slice frontend/slices/<slug>`.

## What slice.json controls

The contract is enforced by `packages/cli/scripts/validate-slice.mjs` against `packages/cli/lib/slice-schema.json`:

- **Identity**: `slug`, `version`, `category`, `title`, `description`, `namespace`.
- **Layout**: `convex.{tablesExport,schemaPath,rootPaths}`, `frontend.{slicePath,configExport}`.
- **Deps**: `npm`, `shadcn`, `env` (with scope: convex / next-public / server), `peers`.
- **Registers**: which generators auto-discover it (`registry`, `preview-registry`, `export-registry`).
- **Audit**: which audit-bp rules apply.
- **Providers**: optional sub-provider list when the slice routes between alternatives (e.g., `["midtrans","doku"]`).

## Constraints (audit-bp enforces)

- Imports inside the slice MUST resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, react/next/lucide-react/convex/zod, or relative-within-slice. No deep `../../` reaching out of the slice.
- Convex table names must NOT collide with another slice's tables.
- Slug MUST equal the folder name AND the value in `config.ts`.
- `configExport` SHOULD start with `camelCase(slug)`.

## Provider sub-folder pattern

When a slice supports multiple sibling providers (e.g., payment with Midtrans + Doku):

```
frontend/slices/<slug>/components/providers/
├── midtrans.tsx
└── doku.tsx                    # drop-in sibling

convex/features/<slug>/actions/
├── midtrans.ts
└── doku.ts                     # drop-in sibling
```

Both providers expose the same `<*Checkout amount orderId>` signature. The slice's primary page routes by env (`PAYMENT_PROVIDER=midtrans|doku`) or per-user preference.

Bump `slice.json.providers` to `["midtrans","doku"]` and minor-bump `version` when adding a sibling.

For very-different providers, prefer publishing each as its own slice with `peers: [{ slug: "payment-base" }]` instead — keeps each slice copyable without dragging the other.

## Lift from elsewhere

```bash
npx rahman-resources lift superspace:frontend/slices/<slug> .   # local superspace dir
npx rahman-resources lift github:owner/repo/path .              # arbitrary
npx rahman-resources lift rahman:<slug> .                       # kitab manifest entry
```

Pass `--dry-run` to preview the plan without writing.
