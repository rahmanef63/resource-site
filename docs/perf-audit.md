# Performance Audit — resource.rahmanef.com

_Date: 2026-07-02 · Next 16 (cacheComponents/PPR), Dokploy/Traefik standalone, no CDN._

## TL;DR

Server and network are **not** the problem. TTFB is 30-42ms everywhere and edge cache is HIT (`s-maxage=31536000`, `x-nextjs-prerender:1`). The slowness is **client-side main-thread work on `/slices`**: it renders all 78-123 slice cards on one page, each with a **live full-Next.js iframe preview** that lazy-mounts but **never unmounts**, and every visitor downloads the **entire 292KB changelog history** plus a **200KB slice catalog** and an **eager 97KB recharts** in first-load JS.

Fix order below is lazy-biased: smallest diff that removes the most latency first.

---

## Root Causes (ranked)

1. **~74 live iframe preview thumbnails on `/slices`, and they never unmount.** `useIframeLazyLoad` calls `io.disconnect()` on first intersection and only ever flips `visible=true`. One scroll-through accumulates up to ~74 concurrent full Next.js route documents (root layout + all providers + Geist fonts + slice demo each), rendered at **2.5x area** (250% + CSS `scale(0.4)`). Memory/CPU/network balloon and stay resident forever.
2. **`/slices` ships a 1.13MB uncompressed HTML doc** (single 969KB line) rendering all 78 cards with **no pagination/virtualization**; content is sent **twice** (rendered HTML + 116 `self.__next_f.push` RSC-flight scripts) and hydrated across **142 `<script>` tags / ~400KB gz JS**. TTFB is fine (40ms) — the cost is parse + hydrate on the main thread.
3. **Every visitor downloads the whole changelog history in client JS.** `RecentlyUpdatedBadge` is `'use client'` and statically imports `getLatestUpdate` → the full 14-part changelog barrel (163 releases / 377 bullets / 5,299 lines). Confirmed: chunk `01.vvyhtmyi1h.js` = **292KB** in both `/slices` and `/slices/[slug]` manifests. Worse, `getLatestUpdate` is **O(slices × releases × bullets)** and **not memoized** — ~123 badges × 163 releases ≈ 20k array allocs + 46k comparisons on the hydration main thread per visit.
4. **Site-wide dead weight in first-load JS.** The full 200KB slice catalog (`lib/content/slices.ts`) ships on **every route** (command palette + sidebar in root layout only need slug/title/category), and **recharts (97KB gz)** rides the markdown render path eagerly even when no chart fence exists.

---

## Top Fixes (impact/effort, highest-leverage first)

### 1. Replace live-iframe thumbnails with static screenshots — **impact: high, effort: L (or S band-aid)**
Single biggest win. Each `/slices` card mounts a full Next route in an iframe and never releases it.
- **Best:** build-time Playwright snapshot of each `/preview/slices/*` route → WebP, served via `next/image loading="lazy"`. Keep the live iframe only inside `LivePreviewButton`'s dialog (mounts on click). Eliminates all ~74 full-route loads.
- **Band-aid (S) if iframes must stay:** make the observer two-way — drop `io.disconnect()`, `setVisible(false)` when the element leaves an expanded margin, so at most a handful are ever live. Also mount iframe on hover/focus instead of on card mount.
- Files: `components/site/preview/hooks/use-iframe-lazy-load.ts:30`, `components/site/catalog/iframe-thumbnail.tsx:110-122,116-120`, `components/site/preview/config.ts:24`, `components/site/preview/LivePreviewButton*`.

### 2. Resolve the changelog badge server-side + memoize the scan — **impact: high, effort: M (data), S (algo)**
Removes the 292KB changelog module from the client graph entirely and collapses 20k allocations into one pass.
- Make `RecentlyUpdatedBadge` purely presentational: accept resolved props (`date, releaseId, version, bulletText, href`) instead of `slug/kind`; drop its import of `changelog-helpers`. Call `getLatestUpdate` in the RSC parent and pass the small object down. Keep `formatRelative(date)` in a tiny client effect.
- Precompute once at module load: `Map<\`${kind}:${slug}\`, ChangelogRef>` in a single O(releases×bullets) pass (releases are newest-first → first-seen wins); `getLatestUpdate` becomes O(1) `map.get`. Removes all per-call `[...bullets, ...groups.flatMap()]` allocation.
- Files: `components/site/recently-updated-badge.tsx:1,11,33-45`, `lib/content/changelog-helpers.ts:58-64`, `app/(docs)/slices/page.tsx:71`, `components/.../slice-detail-header.tsx:66`, `components/.../template-detail.tsx:115`.

### 3. Ship a lightweight client slice index — **impact: high, effort: M**
The 200KB/59KB-gz catalog (all descriptions/exampleCode/installCommand/envVars) ships on **every** page because `command-palette.tsx` and `site-sidebar.tsx` are client components in the root layout — but they only read `.slug/.title/.category`.
- Generate a `slices-index` module (slug, title, category only); import that in the two client components. Keep the full array server-only. Cuts ~50KB gz off first-load JS site-wide.
- Files: `components/site/command-palette.tsx:17`, `components/site/site-sidebar.tsx:31`, `lib/content/slices.ts`.

### 4. Lazy-load recharts (ChartBlock) — **impact: high, effort: S**
`ChartBlock` top-level-imports recharts and is statically pulled by `MdNodeView` → `MarkdownReader/WriteTab/ReviewTab`, so ~97KB gz ships on every markdown/notion route with no chart. Its mermaid/katex siblings are already lazy — make it match.
- In `MdNodeView.tsx` replace `import { ChartBlock }` with `React.lazy(() => import("./ChartBlock"))` (wrap chart branch in `<Suspense>`). recharts then only loads on an actual ` ```chart ` fence.
- Files: `frontend/slices/markdown/components/MdNodeView.tsx:13`, `frontend/slices/markdown/components/ChartBlock.tsx:16`.

### 5. Paginate / virtualize the `/slices` grid — **impact: high, effort: M**
Render ~12-24 cards initially, lazy-load the rest on scroll/intersection (or split into category routes). Also stop eagerly calling `renderGrid()` for every per-group `TabsContent` (Radix unmounts inactive tabs anyway) — gate behind a mounted-tab check. Cuts the 1.13MB HTML doc, the 116 flight scripts, and hydration of off-screen cards.
- Files: `app/(docs)/slices/page.tsx:54-102`, `components/site/catalog/catalog-tabs.tsx:22-56,129-177`.

### 6. Cache-control for `/public` assets — **impact: high, effort: S**
`/brand-assets/*` and `/r/registry.json` (239KB) serve `cache-control: public, max-age=0` with no CDN → re-downloaded every visit. Append source rules to the existing `headers()` block in `next.config.mjs`: `public, max-age=31536000, immutable` (content-stable, changes only on deploy).
- Files: `next.config.mjs` (existing `headers()` block).

### 7. Convert slice cards to Server Components — **impact: high, effort: M**
Make cards emit HTML without per-card flight+hydration; keep only filter/search as client islands. Cuts both the flight payload and JS execution for 78-123 cards. (Overlaps with #5; do together.)
- Files: `app/(docs)/slices/page.tsx`, `components/site/catalog/catalog-tabs.tsx`.

### 8. Optimized OG banner — **impact: medium, effort: S**
`banner-dark.png` = 988KB; a 22KB webp sibling exists. OG needs PNG/JPEG for broad platform support — regenerate at ~100-150KB / lower res (1920x640 doesn't need 988KB).
- Files: `app/layout.tsx:34,41`, `public/brand-assets/banner-dark.png`.

### 9. Config cleanups — **impact: medium/low, effort: S**
- Add `recharts`, `@phosphor-icons/react`, `date-fns` to `experimental.optimizePackageImports` in `next.config.mjs:46-56` (list already has lucide/tabler/radix/cmdk/sonner).
- Wire `@next/bundle-analyzer` behind `ANALYZE=1` + `analyze` npm script so recharts-style eager-import regressions are visible per route.
- Audit Tailwind `@source`/content globs (457KB raw / 61KB gz CSS render-blocking) — ensure it isn't scanning `template-base/`, slice previews, or node_modules.

### Non-issues (verified, no action)
- `/slices` icon map is a static named-lucide `CATEGORY_ICON` map — tree-shakes fine, not the dynamic `Icons[name]` anti-pattern.
- mermaid, katex, highlight.js, konva, @imgly/background-removal all already lazy; tour code-splits each slice via `LazySliceMount`; framer-motion/monaco are only in comment strings, not deps; root layout ships no heavy eager deps, no global Convex provider.
- `proxy.ts` / `instrumentation.ts` per-request overhead negligible; no Convex/useQuery on any public docs path.
- `/changelog` total 0.101s (vs 0.04s home) — minor streaming quirk, deprioritize.

---

## Key Numbers
- `/slices`: 1,132,280 bytes uncompressed HTML (7.4x home, 15x /tour); single largest line 969,461 bytes; 78 `data-slot=card`, 142 `<script>`, 116 `self.__next_f.push`, 179 inline `<svg>`, 561 `<span>`.
- Wire transfer small: `/slices` 72,561 bytes br/gz in 0.060s (home 27,667 bytes) — cost is decoded DOM parse+hydrate, not network.
- TTFB all routes 30-42ms; edge cache HIT; 0 redirects; 0 base64 images.
- ~74 live iframe thumbnails; each rendered at 2.5x area (scale 0.4); 76 dedicated `/preview/slices/*` routes; 123 CatalogCard trees hydrated regardless of active tab.
- Changelog chunk `01.vvyhtmyi1h.js` = 292KB (163 releases / 377 bullets / 5,299 lines) shipped to `/slices` + all 123 `/slices/[slug]`.
- `getLatestUpdate`: ~123 badges × 163 releases ≈ 20k allocations + 46k comparisons per page load, unmemoized; also runs ~246x at build.
- `lib/content/slices.ts` = 200KB / 59KB gz in client chunk `11_cpu877lk12.js` on every page.
- recharts eager = 97KB gz / 291KB raw on every markdown route.
- Total client chunks 17MB; largest single 580-593KB raw; ~400KB gz JS to download+execute on `/slices`.
- `banner-dark.png` 988KB vs 22KB webp sibling (45x); `/public` assets served `max-age=0`, no CDN; `registry.json` 239KB.
- Tailwind CSS 457KB raw / 61KB gz, render-blocking every route.
