# CLAUDE.md — Rahman Resources (rr)

> Vision: pola **shadcn** untuk slice. Consumer run `npx resources add <name>`,
> file di-copy ke `slices/<name>/` (vertical slice, owned by consumer).
> Tidak ada npm dependency runtime. Tidak ada framework lock-in. Consumer bebas
> edit.

## Naming (2026-05-16 transition)

| Lama | Baru |
|---|---|
| "kitab" | "Rahman Resources" / "rr" |
| `frontend/slices/` (consumer side) | `slices/` (consumer side) |
| `frontend/slices/` (rr internal) | tetap `frontend/slices/` (preserves Next.js routing layout) |
| Multiple shared dirs | `shared/<name>/` (cascade dari slice deps) |
| BSDL + `.kitab.json` per slice | dihapus di Sesi 2 |
| CLI bin `rahman-resources` | tetap published, tambah alias `resources` |

Per-slice + per-shared folder shape (consumer):

```
slices/<name>/
├── components/    ├── lib/
├── utils/         ├── hooks/
├── config/        └── api/

shared/<name>/
├── components/    ├── lib/
├── utils/         ├── hooks/
├── config/        └── api/
```

Root project (consumer) **tidak disentuh** RR:
- `components/ui/` — shadcn primitives (default)
- `lib/utils.ts` — shadcn util (default)

## Published Packages (npm public)

| Package | Version | Purpose |
|---|---|---|
| `rahman-resources` | published 1.16.2 · next 1.17.0 | CLI installer (`npx rahman-resources …` / alias `resources …`) |
| `rahman-resources-mcp` | published 1.2.5 · next 1.3.0 | MCP server (tools + dynamic `rr://` resources, including infrastructure definitions) |
| `rahman-shared` | 0.3.0 | Pure utils + hooks (cn, formatDate, sanitizeHtml, useDebounce, useClickOutside, useResponsive) + ./formulaEngine |

**Distribusi rule:**
- **`rahman-shared`** (npm install) — pure functions saja. Consumer import dari node_modules, no local copy.
- **CLI copy** (`npx rr add <slug>`) — UI/feature components. Consumer OWNS file di `slices/<slug>/`, edit Tailwind + theme tokens bebas.

Why split? Component butuh consumer-side Tailwind scan + theme tokens + logic tweaks. Pure function tidak.

## CLI (Sesi 1 — current state)

| Command | Apa kerjanya |
|---|---|
| `npx rr init <app>` | Scaffold project baru |
| `npx rr add <slug> [variant]` | Copy slice/template ke consumer (auto cascade shared deps). Slice ber-`variants`: `add <slug> <variant>` copy satu varian (flatten ke slice root), `add <slug>` copy semua + root switcher, pilih via prop `variant=` (shadcn-style). Contract: `docs/slice-architecture.md#variants-shadcn-style` |
| `npx rr list [templates\|features\|skills]` | List available items |
| `npx rr info <slug>` | Full metadata |
| `npx rr lift <slug>` | Manual: kirim improvement consumer → rr (operator only) |
| `npx rr update <slug>` | Re-pull upstream version (overwrite, warn kalau local edit) |
| `npx rr scaffold-slice <slug>` | Bikin slice baru lokal (di rr repo) |

CLI baca `rr.json` (consumer project manifest) — schema di `packages/cli/lib/rr-schema.json`.

## Hard Rules

1. **Auth follows the active profile.** rr's own Next + Convex runtime uses `@convex-dev/auth` (NO Clerk in rr). For Svelte + Convex consumers, use `convex-svelte` `setupAuth`/`useAuth` as the framework boundary and verify the selected provider/adapter against current Svelte support; never transplant React auth providers into Svelte.
2. **All shared UI = shadcn-family primitives** atau composed wrappers: shadcn/ui for rr/Next, shadcn-svelte for Svelte consumers. Keep native semantics when they are the correct accessible primitive; never hand-roll a parallel design system.
3. **Copy-first flow.** Jangan greenfield. `cp -r` dari source → adjust import alias → strip business-specific bits.
4. **Stack profiles:** rr runtime remains Next + React + Tailwind + Convex. Consumer best-practice profiles are **Next.js OR Svelte 5**, with **Convex optional**. Exact reviewed versions + official docs live only in `lib/content/best-practice-techs.ts` and drive `/best-practice` + its generated prompt. Svelte profile = Svelte 5 Runes + SvelteKit + Bun + shadcn-svelte; no legacy Svelte syntax for new code.
5. **Slice contract.** Consumer feature UI stays at ROOT `slices/<slug>/`; framework route files are thin adapters and repeated page families use one dynamic `[slug]` route + registry/data SSOT. Source copy di rr = tier-3 slice di `frontend/slices/<slug>/` (dgn `slice.json` — composition contract sekarang di-fold ke dalam `slice.json` di bawah block `contract`, id/version derived dari scalar slice.json) + `convex/features/<slug>/` (dgn `<slug>Tables` schema export). Imports di dalam slice WAJIB resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, atau relative-within-slice. No `../../` reaching out. Audit-bp gates ini di CI (`npm run audit:slices`). **Version SSOT = PAIR: `slice.json.version` === `slice.manifest.json.version`**, di-gate `audit:slices` (bukan trio lagi — `slice.contract.ts` di-fold ke `slice.json.contract` 2026-06-21). `lib/content/slices.ts` scalar (version/title/category/kind) di-**generate** dari slice.json via `gen-slice-catalog.mjs` (gated `gen:catalog:check` di pre-commit + `slices:check`) — drift udah gak mungkin, prose catalog tetap hand-authored.
6. **rr backend = admin-only.** Slice demo di site jalan pakai client localStorage adapter, BUKAN Convex. `convex/features/*` = **copy-source** — consumer compose ke backend mereka sendiri pas `npx rr add <slug>`. rr's OWN backend (`api-resource.rahmanef.com`) cuma deploy `rate_limit` (admin-login limiter) via `npm run deploy:convex` (allowlist `ADMIN_CONVEX` di `scripts/deploy-convex-functions.mjs`). JANGAN compose semua feature ke `convex/schema.ts` — itu bikin library jadi monolit.

## Forbidden

- Next profile: `<a href="/internal">` (pakai `next/link` atau `SmartLink`)
- Next profile: `<img src="...">` (pakai `next/image`)
- bare `.collect()` di Convex queries (pakai `.withIndex(...).take(N)`)
- public Convex fn tanpa `args: { ... }` validator (audit-bp P0)
- Next profile: Server Action tanpa authn+authz (audit-bp P0)
- Next profile: `NEXT_PUBLIC_*` untuk sensitive values (leak ke client bundle)
- Next profile: `middleware.ts` di Next 16 (pakai `proxy.ts`)
- Next profile: runtime `fs.readdir`/`readFile` ke dir repo TANPA nambahin dir itu ke `outputFileTracingIncludes` di `next.config.mjs` — lokal jalan, di image docker standalone diam-diam kosong (lihat docs/deploy.md)

- Svelte profile: legacy reactivity/events in NEW code (`$:`, `export let`, `on:click`, `createEventDispatcher`, `<slot>`); use Runes, event attributes, callback props, snippets.
- Svelte profile: npm/pnpm/yarn lockfiles; package manager = Bun only.


## Source Map (kalau copy dari project lain)

| Want | Source path |
|---|---|
| Vertical slice arch | `~/projects/superspace/frontend/slices/_templates/` + `frontend/slices/example/` |
| Feature registry | `~/projects/superspace/frontend/shared/lib/features/` |
| Three-column layout | `~/projects/superspace/frontend/shared/ui/layout/container/three-column/` |
| Dashboard shell | `~/projects/superspace/frontend/shared/ui/layout/dashboard/` |
| Sidebar (AppSidebar) | `~/projects/superspace/frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` |
| Validators | `~/projects/superspace/scripts/validation/` |
| Slice CLI | `~/projects/superspace/scripts/features/` |
| Motion primitives (marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox) | `~/projects/legacy-rahmanef-com/frontend/shared/ui/` |
| OKLch theme presets | `~/projects/legacy-rahmanef-com/frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` + `app/globals.css` |
| Asymmetric masonry | `~/projects/legacy-rahmanef-com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |
| Hero carousel | `~/projects/cescadesigns/components/cummon/hero-section.tsx` |
| ContactForm + Resend | `~/projects/cescadesigns/app/contact/` |
| Block editor + slash menu | `~/projects/notion-page-clone/frontend/slices/editor/` |
| Page tree dnd sidebar | `~/projects/notion-page-clone/frontend/slices/workspace-sidebar/` |
| Multi-block selection | `~/projects/notion-page-clone/frontend/slices/block-selection/` |
| Database views (11) | `~/projects/notion-page-clone/frontend/slices/databases/` |
| Command palette | `~/projects/notion-page-clone/frontend/slices/command-palette/` |
| Comments threaded | `~/projects/notion-page-clone/frontend/slices/comments/` |
| RBAC roles (6 system roles + tier presets) | `~/projects/superspace/convex/workspace/{permissions,roles.config}.ts` + `convex/lib/platformAdmin.ts` |
| Admin panel (17-section shell + access gate) | `template-base/frontend/slices/admin-panel/` + `superspace/frontend/slices/platform-admin/` |
| Event tracking SDK (P0 instrumentation) | `template-base/frontend/slices/admin-panel/slices/events/` |
| DOKU payment (Checkout + Direct + webhook) | `frontend/slices/doku-payment/` + `convex/features/payment/{doku,actions/doku.ts,http.ts}` |

## Notion Slice Convention

`frontend/slices/notion/` = **nested vertical slice** (slice-of-slices):

```
frontend/slices/notion/
├── config.ts          # outer defineFeature() registered ke root registry
├── init.ts
├── page.tsx
├── slices/            # inner slices (editor, workspace-sidebar, dll)
│   └── {inner}/
│       ├── config.ts  # inner defineFeature() registered ke notion sub-registry
│       └── ...
└── shared/            # notion-private shared (types, store, hooks)
```

Path alias `@notion/*` → `./frontend/slices/notion/*`. Convex code dari notion-clone merge ke root `convex/features/notion/` (not nested), avoid Convex generator confusion.

## Workflow

1. Cek Source Map untuk path
2. `cp -r {source} {target}`
3. Adjust imports (`sed`/Edit). Pertahankan alias structure sebisanya.
4. Run `npm run audit:slices`
5. Commit chunked per source.

## Triggers

- `/use-audit-bp` sebelum deploy atau after major slice copy
- `/use-si-coder` untuk first dokploy deploy + DNS setup

## Staging + E2E (docs/staging-e2e.md)

- `npm run e2e` = Playwright smoke (7 flows) vs local prod build :3137;
  `npm run e2e:staging` = vs https://staging-resource.rahmanef.com.
- Staging = Dokploy app `resource-site-staging`, auto-deploy branch `staging`
  (`git push origin main:staging`). Main tetap canonical; staging buat
  perubahan berisiko sebelum push main.

## CLI / MCP / Builder (3 surface, harus sinkron)

### `packages/cli` — `rahman-resources`

CLI installer. Lihat tabel command di atas.

### `packages/mcp` — `rahman-resources-mcp`

Stdio MCP server. 14 tools + ~70 dynamic resources via `rr://` URIs. Read dari sibling cli `manifest.json` + `skills.json` (single source of truth).

Wire ke Claude Code:
```json
{ "mcpServers": { "rahman-resources": { "command": "npx", "args": ["rahman-resources-mcp"] } } }
```

### `app/(docs)/build` — Bundle Builder UI

Visual picker template + features + skills + project form → emit `npx` commands. Compatibility matrix di `lib/build/compat.ts`.

### Publishing (npm)

CLI + MCP packages = distribution channel. Trigger publish suggestion kalau ALL hold:

1. Files di `packages/cli/` ATAU `packages/mcp/` modified
2. `version` bumped above `npm view <pkg> version`
3. `npx tsc --noEmit` green
4. Pushed ke main

When all 4 hold, end response dgn:

```
Saatnya publish — cd packages/cli && npm publish --otp=…
```

User run OTP step. JANGAN run `npm publish` sendiri.

### Skills sync (CLI ↔ site)

SSOT di `lib/content/claude-skills.ts`. After edit:

```bash
node packages/cli/scripts/sync-skills.mjs          # write JSON
node packages/cli/scripts/sync-skills.mjs --check  # CI guard
```

`prepublishOnly` CLI run `--check` — drifted publish impossible.

---

## ⚠ BSDL (legacy) — removed 2026-05-16

Wave N+3 Bidirectional Sync Detection Layer was deleted in Sesi 2
(commits `1573128` → onwards). Reason: solo-dev overhead — 31
`.kitab.json` files maintained for ~4 harvest events/month. Manual
`cp -r` + `git commit` is faster.

**Removed:**
- `packages/cli/bin/scan-consumers.mjs` + `packages/cli/lib/consumer-manifest.*`
- `packages/mcp/src/resources/sync.mjs` (rr://sync/* URIs no longer served)
- `scripts/rr-status.mjs` + `npm run scan:consumers` + `npm run rr:status`
- `app/admin/scan/page.tsx` + `lib/admin/scan.ts`
- `.kitab.json` per slice in consumer repos (cleanup Phase E)

**Kept:**
- `slice.contract.ts` DSL (typed declaration) — the `bidir` block was REMOVED 2026-06-07; its `generalization` payload (still feeds `check-forbidden-terms.mjs`) was promoted to a top-level contract field
- `slice.manifest.json` (CLI distribution metadata)
- Audit-bp validators
- `.kitab/lineage/*.dna.json` (historical archive, read-only by `/admin/lineage`)
- `/admin/lineage` (history view), `/admin/quality` (band scoring), `/admin/registry` (manifest viewer)
- `npx rr lift <slug>` — manual operator command (audit-bp guard preserved)
