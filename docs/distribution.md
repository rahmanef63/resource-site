# Rahman Resources (rr) — Distribution Guide

> Intern-friendly explanation: bagaimana slice mengalir antara `rr` dan project consumer.
> Last updated 2026-05-16 setelah BSDL teardown.

---

## TL;DR — 3 cara mudah

| Konsep | Kayak apa |
|---|---|
| **rr** | Toko buku (warehouse) — semua slice disimpan di sini |
| **`npx rr add <name>`** | Beli buku, copy ke rumah, jadi milik kamu |
| **`cp -r project/slice → rr/`** | Donate buku homemade ke toko biar orang lain bisa beli |
| **`npx rr update <name>`** | Toko keluar edisi revisi, kamu re-beli, file lama overwrite |
| **`slices/<name>/`** | Rak buku di rumah kamu (project) |
| **`shared/<name>/`** | Rak buku tambahan yang dibawa bareng buku utama (deps) |
| **`components/ui/` shadcn** | Rak khusus shadcn — rr **gak boleh nyentuh** ini |

---

## 1. Project → RR (kirim slice matang ke rr)

**Skenario:** kamu bikin slice `cv-generator` di CareerPack. Udah perfect. Mau bawa naik ke rr supaya project lain bisa pakai juga.

```bash
# 1. di CareerPack — pastikan slice udah bersih
# Checklist:
# - No Clerk imports
# - File ≤500 LOC
# - No hardcode "CareerPack" / business-specific strings
# - No cross-slice imports

cd ~/projects/CareerPack
ls frontend/src/slices/cv-generator/

# 2. copy ke rr
cp -r frontend/src/slices/cv-generator/ ~/projects/resources/frontend/slices/cv-generator/

# 3. beresin import path di rr-side
cd ~/projects/resources
# manual edit: replace "@/CareerPack-specific/*" → "@/components/ui/*" atau "@/shared/*"

# 4. bikin metadata (kalau belum ada)
# - slice.json (required: slug, version, deps, paths)
# - slice.contract.ts (recommended: typed DSL)
# - slice.manifest.json (for npm distribution)

# 5. cek lolos audit
npm run audit:slices
npm run validate:all

# 6. update catalog
# Edit lib/content/slices.ts — tambahin SliceEntry untuk cv-generator
cd packages/cli && node scripts/gen-manifest.mjs
cd ../..

# 7. push
git add frontend/slices/cv-generator/ lib/content/slices.ts packages/cli/lib/manifest.json
git commit -m "feat(cv-generator): lift dari CareerPack"
git push origin main

# 8. publish CLI baru (opsional, kalau mau slice baru aktif di npm)
cd packages/cli
npm version 1.1.0 --no-git-tag-version
git add package.json && git commit -m "chore(cli): 1.1.0 — add cv-generator"
git push origin main
npm publish --otp=...
```

**Kuncinya:** ini manual sekarang. Dulu ada `/rr-prep` + `/rr-send` skill yg automate via BSDL pipeline, tapi kita hapus 2026-05-16 karena overkill buat solo dev. Pakai `/rr lift <slug>` skill kalau mau bantuan terpandu.

---

## 2. RR → Project (ambil slice dari rr)

**Skenario:** kamu bikin project baru. Mau slice `command-menu` dari rr.

```bash
# 1. di project kamu
cd ~/projects/my-new-app

# 2. install (3 alias, sama aja)
npx resources add command-menu
# atau:
npx rr add command-menu
# atau:
npx rahman-resources add command-menu
```

**Yang terjadi otomatis:**
- CLI download file dari npm package `rahman-resources`
- Files masuk ke `my-new-app/slices/command-menu/`
- Kalau slice butuh shared util (misal `useDebounce`), auto-copy juga ke `my-new-app/shared/use-debounce/`
- Project kamu sekarang owner — bebas edit Tailwind, theme, logic

**Mau update?**

```bash
npx rr update command-menu   # re-pull versi terbaru, overwrite
```

CLI akan warn kalau ada local edit yang akan ke-overwrite.

**Mau lihat apa aja yang tersedia?**

```bash
npx rr list slices
npx rr info command-menu
```

---

## 3. Struktur konsisten

Aturan: struktur folder sama di kedua sisi. Beda cuma 1 — prefix root.

### Di RR (source of truth)

```
~/projects/resources/
├── frontend/slices/command-menu/      ← TETAP "frontend/" (rr = Next.js project)
│   ├── components/
│   ├── lib/
│   ├── utils/
│   ├── hooks/
│   ├── config/
│   ├── api/
│   ├── slice.json                     ← metadata
│   ├── slice.contract.ts              ← typed contract DSL
│   └── slice.manifest.json            ← CLI distribution manifest
├── packages/cli/                      ← installer code (rahman-resources npm)
├── packages/mcp/                      ← MCP server
└── packages/shared/                   ← npm-distributed utils (rahman-shared)
```

### Di Project (consumer)

```
~/projects/my-app/
├── components/ui/                     ← shadcn primitives — rr JANGAN sentuh
├── lib/utils.ts                       ← shadcn util — rr JANGAN sentuh
├── slices/                            ← FLAT — drop "frontend/" prefix
│   └── command-menu/
│       ├── components/                ← isi sama persis dgn rr
│       ├── lib/
│       ├── utils/
│       ├── hooks/
│       ├── config/
│       └── api/
└── shared/                            ← cascaded deps auto-install di sini
    └── use-debounce/
        └── hooks/
```

### Inti aturan path

| Lokasi | Path |
|---|---|
| Di rr | `frontend/slices/<name>/` |
| Di project kamu | `slices/<name>/` |
| Di rr (util shared) | `packages/shared/src/` (npm dist) |
| Di project (util shared) | `shared/<name>/` (cascade dari slice deps) |

CLI `npx rr add` udah tau cara terjemahin path dari rr ke project. Kamu gak perlu manage mapping.

### Subfolder dalam slice (konvensi, sama di kedua sisi)

```
components/   ← UI files
lib/          ← logic functions
utils/        ← helper utils
hooks/        ← React hooks
config/       ← config files
api/          ← API / Convex calls
```

Gak semua slice harus punya semua subfolder. Pakai yg perlu aja.

---

## FAQ

**Q: Kalau 2 project mau pakai slice yang sama tapi style beda?**

A: Itu fitur, bukan bug. Project A copy slice, project B copy slice juga — tiap project punya copy sendiri. Bebas edit Tailwind/theme tanpa ganggu project lain. Itu kenapa kita pilih shadcn-model (copy-first), bukan npm-import-model (sama buat semua).

**Q: Kenapa rr-side `frontend/slices/` tapi project-side cuma `slices/`?**

A: rr ini Next.js project sendiri yang juga hosting `https://resource.rahmanef.com`. Struktur Next.js taruh source di `frontend/`. Kalau project consumer mau pakai struktur lain (misal `src/`), CLI tetep nulis ke `slices/<name>/` flat.

**Q: Gimana kalau slice butuh Convex schema?**

A: Convex code dari slice tinggal di `convex/features/<slug>/` (juga ke-cascade saat `rr add`). Tables prefixed `<slug>_*` dengan `by_workspace` index. RBAC via `requirePermission`.

**Q: `rahman-shared` npm package itu apa beda sama `slices/`?**

A:
- `rahman-shared` = pure functions (cn, formatDate, sanitizeHtml, useDebounce, useClickOutside, useResponsive). Import dari node_modules, no local copy.
- `slices/<name>/` = UI/feature components. Copy ke project, kamu owner.

Pure function gak butuh per-consumer customization → npm OK. UI component butuh Tailwind tweak per project → harus copy.

**Q: Kalau aku skip metadata (slice.json/contract/manifest)?**

A: CLI gak bisa distribute slice itu via `npx rr add`. Tetap jalan kalau cuma manual `cp -r` ke project lain, tapi gak ke-track di catalog publik.

**Q: Apa beda `slice.json` vs `slice.contract.ts` vs `slice.manifest.json`?**

A:
- `slice.json` (required) — declarative JSON: slug, version, paths, deps. Tools-friendly.
- `slice.contract.ts` (recommended) — typed DSL via `defineSliceContract()`. Compile-time check.
- `slice.manifest.json` (for CLI dist) — npm package metadata. Required only if you want slice installable via `npx rr add`.

---

## Skill terkait

Pakai `/rr` skill dari mana saja:

```
/rr                 # status: di rr-repo atau di consumer?
/rr list            # available slices
/rr info <slug>     # metadata
/rr add <slug>      # install (consumer)
/rr update <slug>   # re-pull
/rr lift <slug>     # promote consumer → rr (operator)
/rr publish         # bump + npm publish (operator)
```

Skill detect cwd auto — gak perlu spesifik mode.

---

## Cleanup history (changelog ringkas)

| Date | Event |
|---|---|
| 2026-05-02 | rr init from copy-first vision |
| 2026-05-13 | rahman-shared npm package launch |
| 2026-05-15 | BSDL launch (Wave N+3) — bidir sync detection |
| 2026-05-16 | **BSDL teardown** — 8 file deleted + 31 .kitab.json deleted across 5 consumers |
| 2026-05-16 | Rename "kitab" → "rr" / "Rahman Resources" |
| 2026-05-16 | CLI v1.0.0 published (breaking — drop `scan-consumers` subcommand) |
| 2026-05-16 | MCP v1.0.0 published (breaking — drop `rr://sync/*` URIs) |
