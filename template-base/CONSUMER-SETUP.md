# template-base — Consumer Setup

Wiring guide for an app that adopts a `template-base/` subtree (or the whole
thing). The kitab ships green-tsc + green-tests; what follows are the
runtime hookups every consumer needs to do once.

## 1. Install + run Convex codegen

```bash
npm install --legacy-peer-deps
npx convex dev --once
```

The first command resolves the @auth/core ^0.37 peer + the rest of the
template-base deps. The second connects to your Convex deployment URL
(`CONVEX_DEPLOYMENT` env var) and overwrites the hand-written
`convex/_generated/{api,server,dataModel}.ts|js` stubs with real codegen.

After codegen lands you can flip `tsconfig.json` `noImplicitAny` back
to `true` — the stub-driven implicit-any was the only reason it's loose.

## 2. Auth providers

Provider list is in `convex/auth/providers.ts`. Default ships
`@convex-dev/auth/providers/Password`. OAuth (GitHub, Google) is gated on
env vars — missing creds means provider silently absent. Add more by
editing that file; never edit `convex/auth.ts`.

Required env (per provider):

| Provider | Env vars |
|---|---|
| Password | none (always on) |
| GitHub   | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Google   | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |

## 3. Stub modules to wire (or delete)

These typecheck as no-op stubs. Wire to your real backend or delete the
consumer:

| Stub | Path | Real-impl source |
|---|---|---|
| `useFileUpload` | `frontend/shared/lib/use-file-upload.ts` | superspace `frontend/shared/lib/use-file-upload.ts` |
| Image conversion | `frontend/shared/lib/image-convert.ts` | sharp / browser-canvas / your CDN |
| Auth context | `frontend/shared/lib/auth-context.ts` | already wired against `useQuery(api.auth.loggedInUser)` if your codegen exposes it; widen the shape if needed |
| `DebugStore` | `frontend/shared/ui/components/session-info/index.tsx` | superspace zustand store |
| `Toolbar` / `UniversalToolbar` | `frontend/shared/ui/layout/toolbar.tsx` | superspace's full toolbar slice |

## 4. Auto-generated registries

Three registries auto-generate from feature configs. Re-run after every
slice add/remove:

```bash
# Feature config registry
npx tsx scripts/features/generate-registry.ts

# Lazy preview imports
npx tsx scripts/features/generate-preview-registry.ts

# Export-config bindings
npx tsx scripts/features/generate-export-registry.ts
```

Pattern is identical across the three: glob slices, emit imports keyed by
slug, write to `frontend/shared/{lib/features,bindings/previews,bindings/export}/`.

## 5. Tests

```bash
npx vitest --run
```

Config is `vitest.config.ts`. It provides:

- `@vitejs/plugin-react` (handles `jsx: "preserve"` from tsconfig)
- jsdom env with the Radix mocks ported from superspace
- Path aliases mirroring tsconfig
- `convex.config` mock

If you mock `useQuery`, you don't need real codegen for tests. If a test
exercises real Convex, run `npx convex dev` first so `_generated/api.js`
becomes a real module.

## 6. Tailwind 4 + shadcn

`components.json` is configured for Tailwind 4 + the shadcn New York
preset. To re-init when adopting the kitab into an existing app:

```bash
npx shadcn@latest init --legacy-peer-deps
```

The kitab's vendored shadcn primitives in `components/ui/` will be
overwritten — diff first, only accept replacements that don't drop your
local edits.

## 7. CI

Two GitHub Actions checks live at the kitab repo:

- `typecheck-and-build (deployed kitab)` — root + Next 16 build.
- `typecheck (template-base copy-source)` — `npx tsc --noEmit` inside `template-base/`.

When you fork or vendor template-base, copy the relevant CI snippet from
`.github/workflows/ci.yml` so the same gates run in your repo.

## Long-term: what stays kitab-side vs consumer-side

| Stays kitab-side | Stays consumer-side |
|---|---|
| Schema composition pattern (per-feature `defineTable` exports) | `app/dashboard/<route>/page.tsx` route shells |
| Slice config + auto-generated registries | Real Convex backend URL, GitHub OAuth creds, etc. |
| Vitest config + setup mocks | Domain-specific test fixtures + integration tests |
| Stub APIs with consumer-shape contracts | Real impls (file upload, image convert, auth context) |
| `frontend/shared/foundation/*` infra | `app/(marketing)/*`, `app/(content)/*` content trees |

Re-merge guarantee: every kitab-side change preserves the contract shape
consumers depend on. New stub fields are additive; renames go through a
deprecation cycle.
