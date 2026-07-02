# Golden Slice Skeleton

Canonical, copy-able template for a SuperSpace vertical slice. Genericized
from `frontend/slices/example/` — keep the two in sync when slice
conventions change.

This is the **golden skeleton** that `pnpm run create:feature` mirrors. The
create script generates its output inline (see `scripts/features/create.ts`),
so this directory is the human-readable / tooling reference: a real slice you
can copy wholesale and find-replace.

## Why `.template` suffixes

Every source file here ends in `.template` so the TypeScript compiler and the
feature registry ignore it (tsconfig only picks up `*.ts` / `*.tsx`, and the
slice tooling skips any directory under `_templates` / starting with `_`).
The tokens below are **not** valid TypeScript on their own, so the files must
not be compiled until the tokens are replaced.

## Placeholder convention

Replace these tokens when you copy the skeleton into a new slice:

| Token        | Meaning                          | Example for `qsr-payables` |
|--------------|----------------------------------|----------------------------|
| `__SLUG__`   | kebab-case slug (folder name)    | `qsr-payables`             |
| `__PASCAL__` | PascalCase base (component name)  | `QsrPayables`              |
| `__CAMEL__`  | camelCase (Convex folder + cfg)   | `qsrPayables`              |
| `__TITLE__`  | Human display title              | `QSR Payables`             |
| `__CATEGORY__` | UI category (see defineFeature) | `administration`          |
| `__ICON__`   | Lucide icon name                 | `Wallet`                   |

## Manual steps

1. `cp -r frontend/slices/_templates/golden-slice frontend/slices/<slug>`
2. Rename every `*.template` → drop the suffix.
3. Find-replace the tokens above across all files.
4. Rename `views/__PASCAL__Page.tsx` → `views/<Pascal>Page.tsx`,
   `hooks/use__PASCAL__.ts` → `hooks/use<Pascal>.ts`,
   `settings/__PASCAL__Settings.tsx` → `settings/<Pascal>Settings.tsx`.
5. Create `convex/features/<camelSlug>/` if the slice declares `hasConvex: true`.
6. Run `pnpm run scaffold:slice-json` then `node scripts/generate-slice-trio.mjs`
   to (re)generate the metadata trio from `config.ts`.
7. `pnpm run sync:all && pnpm run validate:all`.

Prefer `pnpm run create:feature <slug> --category <cat> --icon <Icon>` for the
common path — it performs steps 1-4 automatically. Use this skeleton when you
need to copy/customize by hand.

## Files in the trio

`slice.json` + `slice.contract.ts` + `slice.manifest.json` are required for an
rr-publishable slice. They are generated from `config.ts` — do not hand-edit
the generated shape; edit `config.ts` and regenerate.
