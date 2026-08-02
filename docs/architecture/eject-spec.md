# `npx rr eject <slug>` — Spec (NOT YET IMPLEMENTED)

> Status: **design draft** (2026-05-20). No CLI binding yet. This doc
> records the agreed-upon contract so when the time comes — Rahman
> needs to commercialize a template, or a consumer outgrows the demo
> subdomain — the implementation is unambiguous and matches the
> architectural decisions already made.

> **2026-06-19 (P7) — slug source is stale.** This spec predates the catalog
> decommission. It assumes `<slug>` resolves to a `lib/content/layouts.ts` entry
> with `category: "website-template"` and that `components/templates/<slug>/`
> exists on disk — both are now GONE (`layouts.ts` data emptied, the OS template
> demos deleted from this repo; they live externally at `demo-*.rahmanef.com`).
> When this command is actually built, the eject SOURCE must point at the external
> dev-lab repo for the chosen OS template (or whatever store replaces `layouts.ts`),
> not the in-repo paths the examples below reference. The eject *mechanics*
> (selective copy, scaffold generation, Convex skeleton) remain valid.

## Why this exists

`npx rr add <slug>` already exists for copy-first slice/template
installation into an existing Next.js project. It assumes the
consumer has a host repo and just needs the template's files dropped
in.

`npx rr eject` is for the OPPOSITE direction: spin up a **fresh
standalone Next.js project** seeded from a single rr template,
without inheriting any rr-specific tooling (catalog, MCP, packages/,
38 other layouts, slices the template doesn't use). The output is a
THIN repo (~500–800 LOC for the template + scaffolding) that
consumer can `cd` into and treat as their own product.

Rejected alternative — forking the entire rr monorepo per template —
inherits 95% dead-weight (catalog/CLI/MCP/other templates). See
`docs/architecture/subdomain-routing.md` for the rationale that led
to the current wildcard-subdomain demo approach instead.

## Command signature

```bash
npx rr eject <slug> <target-dir> [--with-convex] [--with-auth] [--git-init]
```

| Arg / flag | Required | Default | Meaning |
|---|---|---|---|
| `<slug>` | yes | — | Must match a `lib/content/layouts.ts` entry with `category: "website-template"` |
| `<target-dir>` | yes | — | Path that does NOT yet exist (refuse to overwrite) |
| `--with-convex` | no | true | Generate `convex/` skeleton + `convex/_generated/` stub for self-hosted. Set `--with-convex=false` for client-only static export use case. |
| `--with-auth` | no | false | When set, scaffolds `@convex-dev/auth` (Password provider) inside `convex/auth.ts` + `app/sign-in/page.tsx`. Forces `--with-convex`. |
| `--git-init` | no | true | Init local git + initial commit. |

## Example

```bash
npx rr eject konsultan-os ../konsultan-real-os --with-auth
cd ../konsultan-real-os
cp .env.example .env.local       # fill NEXT_PUBLIC_CONVEX_URL
npm install --legacy-peer-deps
npx convex dev --once             # generates _generated/
npm run dev
```

Result: a working Next.js 16 app at `localhost:3000` rendering the
konsultan-os public landing + admin shell. Convex backend ready for
schema deploy.

## What gets copied (selective, not fork)

For an eject of `konsultan-os`:

```
target-dir/
├── app/
│   ├── (public)/        ← from rr's app/preview/konsultan-os/public/
│   │   ├── layout.tsx
│   │   ├── page.tsx     ← landing
│   │   ├── case-studies/
│   │   ├── contact/
│   │   └── ...          (whatever the template's public surface needs)
│   ├── dashboard/       ← from rr's app/preview/konsultan-os/dashboard/
│   │   ├── layout.tsx
│   │   ├── admin/
│   │   └── workspace/
│   ├── api/             ← only routes the template references
│   ├── layout.tsx       ← generated root layout (font, theme, metadata)
│   ├── globals.css      ← shared globals (Tailwind 4 + theme tokens)
│   ├── proxy.ts         ← NEW — empty boundary (no demo subdomain logic)
│   ├── opengraph-image.tsx
│   ├── robots.ts        ← regenerated for the target domain
│   └── sitemap.ts       ← regenerated for the target domain
│
├── components/
│   ├── templates/<slug>/  ← THE template — copied verbatim from
│   │   │                     rr's components/templates/<slug>/
│   │   ├── shared/
│   │   ├── slices/
│   │   ├── dashboard/
│   │   └── public/
│   ├── templates/_shared/ ← copied SELECTIVELY — only the _shared
│   │                        files the template actually imports
│   │                        (resolved by static analysis of
│   │                        imports). NOT the whole _shared/
│   │                        (which has admin-panel chassis, CRUD
│   │                        helpers, etc. the template may not use).
│   └── ui/                ← shadcn primitives the template imports
│                             (NOT the full shadcn registry; only
│                             what's reachable from the template)
│
├── frontend/slices/<peers>/ ← Tier-3 slice deps declared via slice.peers
│                              and slice.compat.enhances + landing-sections
│                              (the section editor primitive). Resolved
│                              transitively but NOT the whole rr
│                              slice catalog (44 entries).
│
├── lib/
│   ├── utils.ts         ← cn() + whatever lib/utils/ helpers the template imports
│   └── content/         ← ONLY entries the template needs (e.g. site.ts,
│                          changelog feed if used). NOT layouts.ts /
│                          slices.ts / resources.ts (those are rr
│                          catalog data, irrelevant standalone).
│
├── convex/              ← (when --with-convex) skeleton:
│   ├── schema.ts        ← composed from template's <slug>Tables export
│   ├── auth.ts          ← (when --with-auth) Password provider
│   ├── auth.config.ts
│   ├── http.ts
│   ├── _generated/      ← hand-written stubs; first `npx convex dev
│   │                     --once` overwrites them
│   └── features/<slug>/ ← if the template's convex/features/<slug>/
│                          directory exists in rr, copy it
│
├── public/              ← brand assets used by the template
├── .env.example         ← NEXT_PUBLIC_CONVEX_URL + auth keys if --with-auth
├── .gitignore           ← Next.js + node + convex/_generated
├── docker-compose.yml   ← Convex self-hosted skeleton (when --with-convex)
├── Dockerfile           ← Next.js standalone (multi-stage build)
├── next.config.ts       ← cacheComponents enabled, image domains, etc.
├── tailwind.config.ts   ← Tailwind 4 config (or globals.css with @theme)
├── tsconfig.json        ← strict mode, path aliases (@/* → ./)
├── package.json         ← only deps the template actually imports
└── README.md            ← "Forked from rr@<sha> on <date>. Original
                            template: github.com/rahmanef63/resource-site
                            /tree/main/components/templates/<slug>/"
```

## What does NOT get copied

- `packages/cli/` — rr's CLI source. Eject is a one-way operation;
  the ejected repo doesn't redistribute templates.
- `packages/mcp/` — same reasoning. Ejected repo isn't an MCP server.
- `app/(docs)/` — rr's documentation surface (catalog, slice/layout
  detail pages, agent install UI). Ejected repo doesn't need any of
  it.
- `app/preview/<other-templates>/` — the 7 other templates living in
  rr's preview tree.
- `components/site/` — rr's site chrome (top-navbar, command palette,
  showcase grid, preview iframe wrappers). Eject is decoupling FROM
  rr, not bringing rr along.
- `frontend/slices/<unrelated>/` — slices the template doesn't peer
  with.
- `lib/content/{layouts,slices,resources,changelog,…}.ts` — rr's
  catalog state. Ejected repo isn't a catalog.
- `proxy.ts` (host-based demo subdomain rewriter) — replaced with an
  empty proxy boundary so the ejected repo has its own canonical
  domain at root.
- `scripts/validation/*` — rr's audit chain. Optional re-add later
  if consumer wants the contracts, but not on by default.
- `MEMORY.md`, `CLAUDE.md`, `.claude/`, agent prompt artifacts.

## Selective dependency resolution

The CLI must run static analysis on the template's imports to figure
out WHAT to copy:

1. Start at `components/templates/<slug>/index.ts` (entrypoint).
2. Resolve every `from "@/..."` import recursively.
3. Build a set: `{used files}`.
4. Copy only those files. Re-route their imports if path aliases
   change.
5. For `frontend/slices/<peer>/`: include the whole peer dir
   (slice unit is atomic by contract).
6. For `convex/features/<slug>/`: include if the dir exists.

The resolver should also pick up runtime-resolvable imports (lazy
imports, dynamic `import()`), but missing one is recoverable —
consumer adds the file manually post-eject.

## What the consumer owns post-eject

Everything. The ejected repo is **not** synced back to rr:

- No `kitab.json` / `slice.manifest.json` heartbeat
- No bi-directional drift detection (BSDL — explicitly killed
  2026-05-16)
- No `npx rr update <slug>` recipe for the ejected dir
- No automated cherry-pick from rr

If rr improves a slice the ejected repo uses, the consumer either:
- (a) Manually `git diff` against rr and apply changes by hand
- (b) Re-run `npx rr add <slug>` inside the ejected dir to pull
      latest (overwrites local edits — consumer's responsibility to
      stash first)
- (c) Ignore the upstream improvement

Eject is a **point-in-time fork**, not a subscription.

## Why no automated sync engine

- BSDL (Bidirectional Sync Detection Layer) was killed 2026-05-16
  after 31 `.kitab.json` files for ~4 harvest events/month proved
  not worth the maintenance overhead.
- Wildcard demo subdomain (BR-wave, 2026-05-20) covers the "stay
  in sync with rr" use case — those subdomains literally serve rr's
  current main branch.
- Per-repo eject is for cases where the consumer needs OUT of rr:
  custom backend, own domain, own commercial path. Trying to keep
  these in sync defeats the purpose.

## Why this isn't `create-rahman-app` instead

A `create-X-app` flow (à la `create-next-app`) implies a curated
small set of starters. rr already has 8 templates each with rich
admin + Convex variants. Eject leverages those without rebuilding a
parallel scaffold tree.

## Where the CLI lives

When implemented:
- `packages/cli/bin/eject.mjs` — main implementation
- `packages/cli/lib/eject-resolver.mjs` — static import analysis
- `packages/cli/lib/eject-package-json.mjs` — minimal deps
  computation from used imports
- Tests under `packages/cli/test/eject/` — fixture-based: eject a
  known template, snapshot the file tree.

## Order of phases (when ready to build)

1. **Phase 1 — Static analyzer.** Walk imports from the template's
   entry, build the "used files" set. Output a JSON manifest. Test
   against all 8 templates → manual sanity check.
2. **Phase 2 — File writer + path rewriter.** Copy files, rewrite
   imports (drop `_shared/admin-panel/` prefix when admin panel
   stub is selected as the source of truth, etc).
3. **Phase 3 — Scaffold generator.** Generate `package.json`,
   `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`,
   `.env.example`, `README.md`. Each from a template literal +
   the resolved deps set.
4. **Phase 4 — Convex skeleton (when `--with-convex`).** Compose
   `schema.ts` from the template's tables exports. Hand-write
   `_generated/` stubs (matching the template-base/ Studio
   extraction's approach so the first `npx convex dev --once`
   succeeds before the real codegen runs).
5. **Phase 5 — Auth scaffold (when `--with-auth`).** `@convex-dev/auth`
   Password provider + JWT key generation hint in README + a
   working sign-in page using template's existing
   `convex-auth` slice if present.
6. **Phase 6 — Self-test.** After eject, programmatically `cd` into
   the target, run `npm install --dry-run` + `npx tsc --noEmit`.
   Bail and roll back if either fails.

Total estimated effort: **3–5 days of focused work** for a polished
v0.1 covering one template (canary). Then iterate the resolver +
add-ons across the other 7 templates.

## Trigger for actually building this

Build `npx rr eject` when one of these happens:

- Rahman decides to commercialize a specific template as a
  standalone product → eject it as the seed for that product
- A consumer asks "how do I take this template OUT of the rr
  monorepo and run it as my own app?"
- A template diverges enough from rr that the demo subdomain
  approach can't represent it (e.g. it needs Stripe/Resend/Vercel-
  exclusive features unavailable on the rr Dokploy box)

Until one of those triggers fires: deferred. Demo subdomains cover
the portfolio use case at zero ops cost.
