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
| `rahman-resources` | 0.13.1 | CLI installer (`npx rahman-resources …` / alias `resources …`) |
| `rahman-resources-mcp` | 0.9.1 | MCP server (14 tools + ~70 resources) |
| `rahman-shared` | 0.2.0 | Pure utils + hooks (cn, formatDate, sanitizeHtml, useDebounce, useClickOutside, useResponsive) |

**Distribusi rule:**
- **`rahman-shared`** (npm install) — pure functions saja. Consumer import dari node_modules, no local copy.
- **CLI copy** (`npx rr add <slug>`) — UI/feature components. Consumer OWNS file di `slices/<slug>/`, edit Tailwind + theme tokens bebas.

Why split? Component butuh consumer-side Tailwind scan + theme tokens + logic tweaks. Pure function tidak.

## CLI (Sesi 1 — current state)

| Command | Apa kerjanya |
|---|---|
| `npx rr init <app>` | Scaffold project baru |
| `npx rr add <slug>` | Copy slice/template ke consumer (auto cascade shared deps) |
| `npx rr list [templates\|features\|skills]` | List available items |
| `npx rr info <slug>` | Full metadata |
| `npx rr lift <slug>` | Manual: kirim improvement consumer → rr (operator only) |
| `npx rr update <slug>` | Re-pull upstream version (overwrite, warn kalau local edit) |
| `npx rr scaffold-slice <slug>` | Bikin slice baru lokal (di rr repo) |

CLI baca `rr.json` (consumer project manifest) — schema di `packages/cli/lib/rr-schema.json`.

## Hard Rules

1. **NO Clerk.** Auth = `@convex-dev/auth`.
2. **All UI = shadcn primitives** atau composed dari shadcn. Forbid raw `<button>`, `<dialog>`, `<input type=date|file>`. Pakai `ResponsiveDialog`, `DateField`, `FileUpload`.
3. **Copy-first flow.** Jangan greenfield. `cp -r` dari source → adjust import alias → strip business-specific bits.
4. **Stack:** Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.
5. **Slice contract.** Setiap vertical feature = tier-3 slice di rr `frontend/slices/<slug>/` (dgn `slice.json` + `slice.contract.ts`) + `convex/features/<slug>/` (dgn `<slug>Tables` schema export). Imports di dalam slice WAJIB resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, atau relative-within-slice. No `../../` reaching out. Audit-bp gates ini di CI (`npm run audit:slices`).

## Forbidden

- `<a href="/internal">` (pakai `next/link` atau `SmartLink`)
- `<img src="...">` (pakai `next/image`)
- bare `.collect()` di Convex queries (pakai `.withIndex(...).take(N)`)
- public Convex fn tanpa `args: { ... }` validator (audit-bp P0)
- Server Action tanpa authn+authz (audit-bp P0)
- `NEXT_PUBLIC_*` untuk sensitive values (leak ke client bundle)
- `middleware.ts` di Next 16 (pakai `proxy.ts`)

## Source Map (kalau copy dari project lain)

| Want | Source path |
|---|---|
| Vertical slice arch | `/home/rahman/projects/superspace/frontend/slices/_templates/` + `frontend/slices/example/` |
| Feature registry | `/home/rahman/projects/superspace/frontend/shared/lib/features/` |
| Three-column layout | `/home/rahman/projects/superspace/frontend/shared/ui/layout/container/three-column/` |
| Dashboard shell | `/home/rahman/projects/superspace/frontend/shared/ui/layout/dashboard/` |
| Sidebar (AppSidebar) | `/home/rahman/projects/superspace/frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` |
| Validators | `/home/rahman/projects/superspace/scripts/validation/` |
| Slice CLI | `/home/rahman/projects/superspace/scripts/features/` |
| Motion primitives (marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox) | `/home/rahman/projects/rahmanef.com/frontend/shared/ui/` |
| OKLch theme presets | `/home/rahman/projects/rahmanef.com/frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` + `app/globals.css` |
| Asymmetric masonry | `/home/rahman/projects/rahmanef.com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |
| Hero carousel | `/home/rahman/projects/cescadesigns/components/cummon/hero-section.tsx` |
| ContactForm + Resend | `/home/rahman/projects/cescadesigns/app/contact/` |
| Block editor + slash menu | `/home/rahman/projects/notion-page-clone/frontend/slices/editor/` |
| Page tree dnd sidebar | `/home/rahman/projects/notion-page-clone/frontend/slices/workspace-sidebar/` |
| Multi-block selection | `/home/rahman/projects/notion-page-clone/frontend/slices/block-selection/` |
| Database views (11) | `/home/rahman/projects/notion-page-clone/frontend/slices/databases/` |
| Command palette | `/home/rahman/projects/notion-page-clone/frontend/slices/command-palette/` |
| Comments threaded | `/home/rahman/projects/notion-page-clone/frontend/slices/comments/` |
| RBAC roles (6 system roles + tier presets) | `/home/rahman/projects/superspace/convex/workspace/{permissions,roles.config}.ts` + `convex/lib/platformAdmin.ts` |
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

## CLI / MCP / Builder (3 surface, harus sinkron)

### `packages/cli` — `rahman-resources`

CLI installer. Lihat tabel command di atas.

### `packages/mcp` — `rahman-resources-mcp`

Stdio MCP server. 14 tools + ~70 dynamic resources via `rr://` URIs. Read dari sibling cli `manifest.json` + `skills.json` (single source of truth).

Wire ke Claude Code:
```json
{ "mcpServers": { "rahman-resources": { "command": "npx", "args": ["rahman-resources-mcp"] } } }
```

### `site/app/(docs)/build` — Bundle Builder UI

Visual picker template + features + skills + project form → emit `npx` commands. Compatibility matrix di `site/lib/build/compat.ts`.

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

SSOT di `site/lib/content/claude-skills.ts`. After edit:

```bash
node packages/cli/scripts/sync-skills.mjs          # write JSON
node packages/cli/scripts/sync-skills.mjs --check  # CI guard
```

`prepublishOnly` CLI run `--check` — drifted publish impossible.

---

## ⚠ Wave N+3 BSDL — DEPRECATED (Sesi 2 cleanup)

Bidirectional Sync Detection Layer (consumer-manifest + scan-consumers + DNA
lineage + drift scoring) di-deprecate per keputusan 2026-05-16. Reason:
solo-dev overhead — 31 `.kitab.json` di-maintain demi ~4 harvest event/bulan.
Manual `cp -r` lebih cepet.

Yang akan dihapus di Sesi 2:
- `.kitab.json` per slice (31 file across 5 consumer)
- `packages/cli/bin/scan-consumers.mjs`
- `packages/cli/lib/consumer-manifest.{mjs,d.ts,test.mjs}`
- `.kitab/lineage/*.dna.json` (40+ file — backup keep)
- `/admin/scan` tab + `/admin/registry` slice manifest viewer
- skill `/rr-prep`, `/rr-send` (replaced by manual `npx rr lift`)
- `scripts/rr-status.mjs`

Yang dipertahankan:
- `slice.contract.ts` DSL (typed declaration)
- `slice.manifest.json` (CLI distribution metadata)
- Audit-bp validators
- `/admin/lineage` (history view only, drift removed)
- `/admin/quality` (band scoring)
- `npx rr lift <slug>` — manual operator command + audit-bp guard
