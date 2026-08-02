# Lifting features into the kitab

Checklist for porting a feature from an external source (superspace, rahmanef.com, notion-clone, cescadesigns, arbitrary GitHub repo) into the kitab as a tier-3 portable slice.

> **TL;DR.** A slice is two folders + one registry row. Get those right and `npm run slices:check` passes. Use `/rr` (Claude skill) or `npm run new:slice` to scaffold the boilerplate, then port the source files into it.

## 0. The slice contract — what every slice MUST have

| Half | Path | Required files | Optional |
|---|---|---|---|
| Frontend | `frontend/slices/<slug>/` | `slice.json`, `config.ts`, `page.tsx` (or omit if route-less) | `components/`, `hooks/`, `store/`, `types.ts`, `README.md` |
| Backend | `convex/features/<slug>/` | `schema.ts` (table-fragment export `<camelSlug>Tables`) | `queries.ts`, `mutations.ts`, `actions.ts` |
| Catalog | `lib/content/slices.ts` | one `SliceEntry` row | — |
| Generated | `lib/shared/features/registry.generated.ts` | auto-emitted by `gen:slices` from `slice.json` | — |

Plus: spread the table-fragment in the consumer's `convex/schema.ts` (`...<camelSlug>Tables`). Done in the consumer project at install time, not in the kitab.

## 1. Source-map first

Identify exactly what you're lifting. Reach into the source map (`docs/source-map.md` + root `CLAUDE.md`):

| Source | Common patterns |
|---|---|
| `superspace/frontend/slices/<slug>/` | Feature slice, already vertical-sliced. Pair with `superspace/convex/features/<slug>/`. |
| `rahmanef.com/frontend/shared/ui/` | Motion primitives (marquee, kinetic-heading, etc.) — usually become a component dir under a `ui` slice or live in `components/templates/_shared/`. |
| `cescadesigns/components/` + `app/contact/` | UI blocks + Resend wiring — became `recipes/contact-form-resend` and `slices/resend-newsletter`. |
| `notion-page-clone/src/slices/<name>/` | Already slice-shaped. Frontend pulls 1:1. Convex side may not exist (port from your own design). |

Note the **import boundary** of the source code: which `@/` aliases does it use, what npm deps does it import. You'll rewrite those.

## 2. Decide: slice or recipe?

| It's a slice if… | It's a recipe if… |
|---|---|
| Has a backend (Convex tables / actions / queries) | Frontend-only pattern, no DB |
| One install = self-contained working feature | Educational — user copies bits into their project |
| Has a route or mounts into shared chrome | Lives inside another slice or a template |
| Versioned independently | Rarely changes |

Recipes go in `lib/content/recipes.ts` only — no `slice.json`, no registry generation. Stop reading here if it's a recipe.

## 3. Scaffold the empty slice

```bash
npm run new:slice -- --slug payment-doku --category payment --title "Doku — Indonesia Payment"
```

This (see `scripts/features/scaffold-slice.mjs`):

1. Copies `frontend/slices/_templates/example-feature/` → `frontend/slices/<slug>/`
2. Copies `convex/features/example-feature/` → `convex/features/<slug>/`
3. Rewrites every `example-feature` / `exampleFeature` / `ExampleFeature` identifier to your slug
4. Patches `slice.json` `category` field
5. Appends a stub row to `lib/content/slices.ts`
6. Runs `npm run slices:check` — fails fast if anything regressed

After this, the slice is registered + valid but empty. Next steps populate it.

## 4. Port the source — the file mapping

For each file in the source slice:

### 4a. Frontend

| Source file | Destination | Rewrite |
|---|---|---|
| `<src>/components/*.tsx` | `frontend/slices/<slug>/components/*.tsx` | Imports — see §5 |
| `<src>/hooks/*.ts` | `frontend/slices/<slug>/hooks/*.ts` | Imports |
| `<src>/store/*.ts` | `frontend/slices/<slug>/store/*.ts` | Imports |
| `<src>/types.ts` | `frontend/slices/<slug>/types.ts` | Drop business-specific types |
| `<src>/page.tsx` | `frontend/slices/<slug>/page.tsx` | Imports |

Provider-specific code (e.g., midtrans-vs-doku) MUST live under `components/providers/<provider>.tsx`. Set `slice.json.providers: ["<provider>", ...]`. See `docs/authoring-slices.md` § "Provider sub-folder pattern."

### 4b. Backend

| Source file | Destination | Rewrite |
|---|---|---|
| `<src convex>/schema.ts` | `convex/features/<slug>/schema.ts` | Wrap exports as `<camelSlug>Tables = { ... }`. **Prefix table names with slug** if collision risk (`paymentInvoices`, not `invoices`) |
| `<src convex>/queries.ts` | `convex/features/<slug>/queries.ts` | Replace `.collect()` with `.withIndex().take(N)`. Add `args: { ... }` validators on every public function |
| `<src convex>/mutations.ts` | `convex/features/<slug>/mutations.ts` | Same — validators required on every public fn |
| `<src convex>/actions.ts` | `convex/features/<slug>/actions.ts` | Verify webhook signatures (constant-time compare). Don't store secrets in code |

## 5. Import rewriting — the audit-bp boundary

`scripts/validation/audit-slice.mjs` enforces this. A slice file can ONLY import from:

```
@/components/ui/*           shadcn primitives
@/components/shared/*       cross-template shared
@/lib/shared/*              cross-slice shared utilities
@/lib/utils                 cn() etc.
@/shared/*                  legacy alias for shared
@convex/*                   convex barrels
@convex-dev/*               convex-dev libraries
react, next/*, lucide-react, convex/*, zod, clsx, tailwind-merge   common deps
./relative                  same-slice files
```

Anything else FAILS the audit. Common mistakes when porting from superspace:

| Wrong (from superspace) | Right (in kitab slice) |
|---|---|
| `@/frontend/slices/other/...` | publish that slice separately, declare as `peers: [{ slug: "other", range: "^0.1" }]` |
| `@/frontend/shared/ui/marquee` | move marquee to `components/templates/_shared/ui/marquee.tsx`, import as `@/components/shared/ui/marquee` |
| `../../shared/lib/...` | move to `lib/shared/<topic>/...`, import as `@/lib/shared/<topic>/...` |
| `import { ... } from "@/features/payment-doku/..."` (cross-slice) | declare peer + import via `@convex/*` or component prop |

**Rewriting tools:** `sed`, `grep -r`, or for big ports use `Edit replace_all` (Claude Code).

## 6. Fill `slice.json`

Required fields (validator: `packages/cli/scripts/validate-slice.mjs`):

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "doku-payment",            // kebab-case, matches folder
  "version": "0.1.0",                // semver, slice-internal
  "category": "payment",             // enum — see schema
  "title": "Doku — Indonesia Payment",
  "description": "≥10 chars, what it does in one line.",
  "namespace": "@/features/doku-payment",
  "frontend": {
    "slicePath": "frontend/slices/doku-payment",
    "configExport": "dokuPaymentConfig"   // SHOULD start with camelCase(slug)
  },
  "convex": {
    "tablesExport": "dokuPaymentTables",
    "schemaPath": "convex/features/doku-payment/schema.ts",
    "rootPaths": ["convex/features/doku-payment"]
  },
  "deps": {
    "npm": ["doku-node-library@^2"],
    "shadcn": ["card", "button", "input"],
    "env": [
      { "name": "DOKU_CLIENT_ID", "scope": "convex", "required": true },
      { "name": "DOKU_SECRET_KEY", "scope": "convex", "required": true }
    ],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1", "reason": "user attribution on payment events" }
    ]
  },
  "providers": ["doku"],
  "registers": ["registry"],
  "audit": ["bp:public-fn-validator", "bp:webhook-signature"],
  "tags": ["payment", "doku", "indonesia"]
}
```

## 7. Add the catalog row in `lib/content/slices.ts`

`scaffold-slice.mjs` appends a stub. Fill in:

```ts
{
  slug: "doku-payment",
  title: "Doku — Indonesia Payment",
  category: "payment",
  version: "0.1.0",
  description: "...",
  source: "rahmanef63/resource-site",
  docsUrl: "https://developers.doku.com",
  install: "npm i doku-node-library",
  slicePath: "frontend/slices/doku-payment",
  convexPaths: ["convex/features/doku-payment"],
  npm: ["doku-node-library@^2"],
  shadcn: ["card", "button", "input"],
  env: [{ name: "DOKU_CLIENT_ID", scope: "convex", required: true }],
  peers: [],
  providers: ["doku"],
  tags: ["payment", "doku", "indonesia"],
  usedBy: [],                           // template slugs that pre-wire this
  agentRecipe: "Run `rr add doku-payment`. Set DOKU_* env vars via `npx convex env set`.",
  exampleCode: `// convex/features/doku-payment/actions.ts ...`,
}
```

The fields beyond `slice.json` (`docsUrl`, `install`, `exampleCode`, `usedBy`, `agentRecipe`) are **rich catalog metadata** for the `/slices/<slug>` detail page + MCP `rr_get_slice`. Don't skip them — they're how consumers (and AI agents) discover what to do.

## 8. Validate

```bash
npm run slices:check          # validate-slice + audit-slice + gen-slices --check
```

Fix all errors. Common fails:

| Error | Fix |
|---|---|
| `slug "X" != folder "Y"` | Folder name and `slice.json.slug` must match |
| `disallowed import in <file>: "..."` | See §5 — rewrite to allowed prefix or move the dep into shared |
| `convex table "foo" declared by both X and Y` | Prefix table name with slug (`fooItems` → `dokuItems`) |
| `<file>.generated.ts is out of date` | `npm run gen:slices` to regenerate |

## 9. Verify build

```bash
npx tsc --noEmit
npm run build
```

If `convex/features/<slug>/schema.ts` is referenced from `convex/schema.ts` (it should be, via `...<camelSlug>Tables`), Convex codegen needs to refresh. Locally: `npx convex dev --once` or set the dummy admin key for offline codegen (see CLAUDE.md).

## 10. Sync the CLI manifest

```bash
node packages/cli/scripts/gen-manifest.mjs
```

This regenerates `packages/cli/lib/manifest.json` from `lib/content/{layouts,slices,recipes}.ts` so consumers using `npx rahman-resources` see the new slice.

If you're publishing a CLI/MCP version: bump `packages/cli/package.json` + `packages/mcp/package.json`, run `prepublishOnly` checks, then `npm publish`.

## 11. Commit

```bash
git add frontend/slices/<slug> convex/features/<slug> lib/content/slices.ts lib/shared/features/*.generated.ts packages/cli/lib/manifest.json
git commit -m "feat(slices): add <slug>"
```

---

## Quick reference — the four entry points

| What | Use this |
|---|---|
| Scaffold empty slice in kitab | `npm run new:slice -- --slug X --category Y` |
| Scaffold empty template in kitab | `npm run new:template -- --slug X --from <base-slug>` |
| Modify existing slice metadata | `npm run modify:slice -- --slug X --add-npm pkg@^1` |
| Pull published slice into a consumer project | `npx rahman-resources add <slug>` |
| Pull arbitrary code from superspace into a consumer project | `npx rahman-resources lift superspace:frontend/slices/X` |
| Open PR to publish a slice you authored locally | `npx rahman-resources publish-slice <local-slice-dir> --open-pr` |
| Use the `/rr` agent to drive any of the above | Type `/rr` in Claude Code |

## Shared component integration

When a slice uses UI not yet in the kitab (e.g., a marquee primitive from rahmanef.com):

1. Lift the primitive to `components/templates/_shared/ui/<name>.tsx` (cross-template) or `components/shared/<name>.tsx` (cross-slice).
2. Update the slice's import to `@/components/templates/_shared/ui/<name>` or `@/components/shared/<name>`.
3. If multiple slices will use it, add a smoke test page under `app/(docs)/components/<name>/page.tsx`.

Never let a slice reach into another slice's components directly. Promote the dep to shared.
