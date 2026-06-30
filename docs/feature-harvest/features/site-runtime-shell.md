# Public site runtime & shell

Slug: `site-runtime-shell` · Coverage hint: partial (verified → **partial**)

This feature name collides across the two reference projects on two *different*
"site shell" concepts. The harvest separates them:

- **personal-brand-os** — the portable, in-scope one: the **public-facing shell
  composition layer**. The `(public)` layout wires brand identity (read from
  Convex at runtime) into nav + footer chrome, applies live branding to the
  document (title / favicon / `--brand` / theme), shows a hydration splash, and
  renders custom CMS pages via a catch-all. This is what a portable rr slice
  should capture.
- **Instatic** — the CMS-*engine* "Site Shell" + "site-runtime": the persisted
  `site` document (design tokens, style-rule registry, site files, Site
  Explorer, per-site `package.json`) plus a **runtime engine** (per-site
  `bun install` → importmap → published `<script type=importmap>`, runtime
  import analysis, per-asset scope/placement/timing targeting). This is deep
  publisher/visual-editor territory, **not** a drop-in slice. Only its portable
  *kernel* (the asset-targeting model) is worth lifting; the rest stays with the
  publisher harvest (`publisher-clean-html.md`).

---

## What it does (flow)

### personal-brand-os — public shell composition (the slice target)

```
app/(public)/layout.tsx                         (server component)
  ├─ export const metadata  ← built from DEFAULT_SITE_CONFIG + env
  │     (title template, description, canonical, openGraph, twitter, themeColor)
  ├─ <StoreProvider>            app store (localStorage-hydrated)
  │   └─ <CartProvider>         storefront-checkout
  │       ├─ <SiteLoader>       full-screen splash until store.ready (8s hard cap)
  │       ├─ <PublicChrome>     ← THE RUNTIME SHELL
  │       │     useQuery(api.settings.get)   read owner branding from Convex
  │       │     brand = { ...DEFAULT_SITE_CONFIG, brandName, brandLetter, logoUrl }
  │       │     <SiteShell brand nav cta navExtras footer… >
  │       │         <SiteNav/>      header (brand · nav · cta · extras)
  │       │         <main>{children}</main>
  │       │         <SiteFooter/>   columns · socials · tagline · copyright
  │       │       navExtras = <CartWidget/> + <ThemePresetSwitcher/>
  │       └─ <AiChatFab/>       floating chat
  └─ (BrandHead mounted elsewhere) runtime DOM branding side-effects:
        useQuery(api.settings.get) →
          document.title, <link rel=icon>, --brand css var,
          theme preset (theme-presets), default light/dark (next-themes)
```

Control flow: the layout is the single mount point; every public route inherits
the same chrome. Brand data flows **Convex `siteSettings` → `settings.get`
query → `PublicChrome`/`BrandHead` at runtime** so a non-coder's Settings edit
shows up with no rebuild. Static fallbacks come from `DEFAULT_SITE_CONFIG` +
`nav-config` so the chrome renders before Convex resolves (and if Convex is
down). The `SiteLoader` blocks paint until the app store reports `ready`, with
an 8s safety timeout so a dead backend never traps the visitor.

Custom pages: `app/(public)/[...slug]/page.tsx` resolves the slug server-side
(`fetchQuery(api.pages.bySlug)`) for a real SSR 404, then hands off to the
client `CatchAllRenderer`, which reads the localStorage-hydrated pages slice and
renders `<BlocksRenderer>`. `error.tsx` is the route-level error boundary.

### Instatic — site-runtime engine (out of slice scope; kernel only)

```
Site → Dependencies panel edits site.packageJson.dependencies
  → server bun install in uploads/sites/<siteId>/runtime/   (virtualSiteWorkspace)
  → dependencyResolver + dependencyCache → hashed cache dir
  → buildRuntimePackageImportmap → RuntimePackageImportmap { imports, lockHash }
  → persisted into site.runtime.dependencyLock + packageImportmap
Publish:
  collectRuntimeScripts(files, runtime, page, target)   pick + order user scripts
  collectAppliedStyles(files, runtime, page)            pick + order user styles
  analyzeRuntimeScriptImports(files, packageJson)       diagnostics (missing dep,
                                                        node-builtin, dev-only)
  scriptTagsForRuntimeAssets(assets, placement)         emit <script> tags,
                                                        self-hosted-URL guarded
  → published page gets <script type=importmap>{imports}</script>
    + <script type=module src=/_instatic/runtime/cache/<hash>/three/…>
```

The reusable idea here is **`SiteAssetScope` targeting** (an asset = a user
script or stylesheet; targets `all-pages` | explicit `pages[]` | explicit
`templates[]`) plus per-script `placement` (`head`|`body-end`) / `timing`
(`immediate`|`dom-ready`|`idle`) / `format` (`module`|`classic`) and a
`priority` cascade. Everything else (per-site bun install, importmap, QuickJS
plugin runtime) is engine plumbing that does not portably lift.

---

## Where it lives

**personal-brand-os** (the slice target)
- `app/(public)/layout.tsx` — metadata + provider tree + shell mount
- `app/(public)/error.tsx` — route error boundary (hardcoded ID copy)
- `app/(public)/[...slug]/page.tsx` + `[...slug]/catch-all-renderer.tsx` — custom-page catch-all
- `components/public-chrome.tsx` — `PublicChrome` (Convex-branded SiteShell wrapper)
- `components/brand-head.tsx` — `BrandHead` (runtime DOM branding effects)
- `components/site-loader.tsx` — `SiteLoader` (hydration splash)
- `frontend/slices/_shared/ui/site-shell.tsx` — `SiteShell` (nav + main + footer composition)
- `frontend/slices/_shared/ui/site-footer.tsx` — `SiteFooter` + `parseSocials`
- `frontend/slices/_shared/ui/site-nav.tsx` — `SiteNav` (header)
- `frontend/slices/_app/site-config.ts` — `DEFAULT_SITE_CONFIG` (brand/SEO defaults)
- `frontend/slices/_app/nav-config.ts` — `PUBLIC_NAV`, `PUBLIC_CTA`, `FOOTER_COLUMNS`, `FOOTER_TAGLINE`, `PUBLIC_BASE`
- `convex/schema.ts` → `siteSettings` table; `convex/settings.ts` → `settings.get`/setters

**Instatic** (engine; kernel reference)
- `src/core/site-runtime/schemas.ts` — `SiteRuntimeConfig`, `SiteAssetScope`, `SiteScriptRuntimeConfig`, `SiteStyleRuntimeConfig`, `SiteDependencyLock`, `RuntimePackageImportmap`, `PublishedPageRuntimeAssets`
- `src/core/site-runtime/runtimeConfig.ts` — `DEFAULT_SITE_RUNTIME`, `collectRuntimeScripts`, `collectAppliedStyles`, `assetScopeAppliesToPage`, normalizers
- `src/core/site-runtime/importAnalysis.ts` — `extractRuntimeImportSpecifiers`, `analyzeRuntimeScriptImports`, `packageNameFromImportSpecifier`
- `src/core/site-runtime/assetManifest.ts` — `scriptTagsForRuntimeAssets`, `hasPublishedRuntimeScripts`
- `src/core/site-dependencies/manifest.ts` — `SitePackageJson`, normalizers
- `src/core/page-tree/siteDocument.ts` — `SiteShell`/`SiteDocument`/`parseSiteDocument` (the persisted CMS shell; see `docs/features/site-shell.md`)
- `src/core/layouts/schemas.ts` — `SavedLayout` (named page-subtree snapshot, stored in `data_rows[table_id='layouts']`)
- `server/publish/runtime/*` — `virtualSiteWorkspace`, `dependencyResolver`, `dependencyCache`, `packageImportmap`, `packageServer`, `bundleScripts`
- `convex/schema.ts` → `site` (one row, `settings_json: v.string()`), `published_runtime_assets`

---

## Data model

**personal-brand-os — `siteSettings` (singleton-ish, Convex)** — this is the
shell's data source:
```
siteSettings: {
  siteName?, tagline?, ownerName?, ownerRole?, ownerInitials?,
  profileImageUrl?, contactEmail?, contactPhone?, contactAddress?,
  brandColor?,                 // → --brand css var (BrandHead)
  themeDefault?,               // "light"|"dark"|"system" (BrandHead → next-themes)
  themePreset?,                // tweakcn preset name (BrandHead → theme-presets)
  logoUrl?, faviconUrl?,       // → <link rel=icon>
  socials?,                    // JSON string {x,linkedin,github,youtube}
  seoDescription?, analyticsId?, aboutContent?, onboardedAt?
}
```
All fields `v.optional` — the shell always has static `DEFAULT_SITE_CONFIG`
fallbacks. Plus `pages` (custom CMS pages, slug-keyed) read by the catch-all.

**Instatic — persisted site document** (engine): single `site` row, everything
in `settings_json: v.string()` (opaque JSON, parsed in app code). In-memory
`SiteDocument = SiteShell & { pages, visualComponents }`; pages/VCs/layouts live
in `data_rows`. `SiteRuntimeConfig` (lives inside the shell):
```
SiteRuntimeConfig {
  dependencyLock: { version: 1, packages: Record<name, LockedSiteDependency>, updatedAt }
  scripts: Record<fileId, { enabled, runInCanvas, format?, placement, timing, scope, priority }>
  styles:  Record<fileId, { enabled, scope, priority }>
  packageImportmap?: { imports: Record<string,string>, lockHash }
}
SiteAssetScope = { all-pages } | { pages, pageIds[] } | { templates, templatePageIds[] }
```
`published_runtime_assets` table caches the per-page emitted script manifest.

---

## Public API

**personal-brand-os**
- `api.settings.get` — public query, returns the `siteSettings` singleton (feeds `PublicChrome` + `BrandHead`). No auth (public chrome reads it on every visit).
- `api.settings.set*` — admin mutations (owner Settings / onboarding) writing the singleton.
- `api.pages.bySlug { slug }` — public query for custom-page catch-all (server `fetchQuery`).

**Instatic** (engine REST + routes)
- `GET /admin/api/cms/site` + `PUT /admin/api/cms/site` — load/save the shell (settings/breakpoints/classes/files/runtime). Save is diff-validated (`validateSite`) and capability-gated.
- `/_instatic/runtime/cache/<lockHash>/<name>/<entry>` — self-hosted runtime package server (importmap targets).
- `/_instatic/hole/<nodeId>` — lazy dynamic-fragment fetch (publisher Layer C).
- Pure functions (engine, not HTTP): `collectRuntimeScripts`, `collectAppliedStyles`, `analyzeRuntimeScriptImports`, `scriptTagsForRuntimeAssets`.

---

## UI surface

**Public**
- `SiteShell` — composition wrapper: `<SiteNav>` + `<main>` + `<SiteFooter>` on a `min-h-screen bg-background` frame; props for brand, navItems, cta, navExtras, footerColumns, socials, tagline, copyright, belowFooterBrand.
- `SiteNav` (header) / `SiteFooter` (footer + `parseSocials`) — config-driven.
- `BrandHead` — renders `null`; pure runtime side-effects (title/favicon/`--brand`/theme).
- `SiteLoader` — full-screen splash with brand letter + creeping progress bar, fades on `ready`, 8s hard timeout.
- `error.tsx` — error boundary card (AlertTriangle + retry).
- `CatchAllRenderer` → `BlocksRenderer` for custom pages.

**Admin**
- Owner Settings / onboarding wizard write `siteSettings` (the branding source). Not part of this slice — that's `settings-page` / onboarding territory.
- Instatic: Site → Dependencies / Colors / Typography / Viewport-contexts panels (engine editor, out of scope).

---

## Dependencies

**npm** (PBO shell): `next` (metadata API, `next/link`), `convex/react`
(`useQuery`), `next-themes` (BrandHead), `lucide-react` +
`@tabler/icons-react` (footer social glyphs).

**rr-slice deps** (composition): `marketing-chrome` (header+footer primitives),
`theme-presets` (`useThemePreset`/`ThemePresetSwitcher`), `seo` (metadata gen —
optional), `storefront-checkout` (`CartProvider`/`CartWidget` — optional
navExtra), `ai-chat` (AiChatFab — optional). Settings storage overlaps
`settings-page` / `shell-settings`.

**Instatic engine** (not lifted): Bun (`bun install` per-site), QuickJS-WASM
plugin sandbox, TypeBox, the publisher pipeline.

---

## rr coverage

**Verdict: partial.**

Existing `marketing-chrome` (`frontend/slices/marketing-chrome`) covers the
*presentational* half well: `MarketingHeader` (split/centered/minimal layouts,
sticky, Sheet mobile menu) + `MarketingFooter` (columns/slim, social icons) —
all prop-only, no Convex. That maps almost 1:1 onto PBO's `SiteNav` +
`SiteFooter`. PBO's `SiteShell` is just the nav+main+footer composition of those
two, which marketing-chrome does not currently ship as one component.

What marketing-chrome (and the rest of the catalog) does **not** cover — the
"runtime" half of "site runtime & shell":
1. **`BrandHead`** — read live owner branding (from any settings source) and
   apply it to the live document: `document.title`, `<link rel=icon>`,
   `--brand` css var, theme preset, default light/dark with a
   "site-default-vs-visitor-choice" reconciliation. Net-new, portable, and the
   real value of this feature.
2. **`SiteLoader`** — hydration-gated splash with progress + hard timeout.
   Net-new (the `loading-states` slice is skeletons, not a full-screen
   data-readiness gate). Portable.
3. **`SiteShell`** composition wrapper + a `buildSiteMetadata(config)` helper
   that turns a brand config into a Next `Metadata` object (title template,
   canonical, openGraph, twitter, themeColor) with env-override for the
   canonical origin. Net-new glue.
4. The **Convex-backed brand wiring** (`PublicChrome` reading `settings.get` and
   merging over static defaults). Net-new as a *pattern*, but the storage itself
   overlaps `settings-page`/`shell-settings` and the theme apply overlaps
   `theme-presets` — so it should be **injectable**, not duplicated.

The Instatic site-runtime engine (per-site bun install, importmap, asset
targeting, import analysis) is **net-new** but belongs to the publisher/visual
harvest, not a public-shell slice. Its only portable kernel worth a footnote is
the `SiteAssetScope` + script/style targeting model.

Proposed slug if built: **`site-runtime-shell`** (net-new slice that *composes*
marketing-chrome rather than replacing it).

---

## Slice plan

**Action: build-new** a thin composition slice `site-runtime-shell` that
depends on `marketing-chrome` + `theme-presets`. (Alternative considered:
*enhance* marketing-chrome by adding `SiteShell` — rejected, because BrandHead /
SiteLoader / metadata are a different concern, runtime branding + hydration, and
folding them into marketing-chrome would bloat a clean pure-UI slice and force
theme-presets as a hard dep on it.)

**Laziest correct path (ponytail):**
1. `SiteShell` = 20-line composition of `MarketingHeader` + `<main>` +
   `MarketingFooter` from `@/features/marketing-chrome`. Don't re-implement
   nav/footer — re-export and compose.
2. `BrandHead` lifted from `components/brand-head.tsx` almost verbatim, but
   swap the hardcoded `useQuery(api.settings.get)` for an injected
   `branding` prop (or a `useSiteBranding()` hook prop) of shape
   `{ siteName?, tagline?, faviconUrl?, brandColor?, themePreset?, themeDefault? }`.
   Keep the `theme-site-applied` localStorage reconciliation logic — that's the
   non-obvious part worth shipping. Make `theme-presets` an optional injected
   `onPreset` callback so the slice doesn't hard-depend on it.
3. `SiteLoader` lifted verbatim but take `ready: boolean` + `progress: number`
   as props instead of reading `useStore()`.
4. `buildSiteMetadata(config, { siteUrl })` helper extracted from
   `layout.tsx`'s `metadata` block — pure function, no hardcoded brand.
5. **No `convex/features/site-runtime-shell`.** Branding storage = reuse
   `settings-page`/`shell-settings` or the consumer's own settings table;
   ship only the read *contract* (the `branding` prop shape). This keeps the
   slice backend-agnostic and avoids a second settings table.

**Portability blockers to strip (hardcoded → prop/config):**
- `public-chrome.tsx`: `useQuery(api.settings.get)` Convex coupling → inject `branding`.
- `layout.tsx`: `DEFAULT_SITE_CONFIG`, `PUBLIC_NAV`, `FOOTER_COLUMNS`, `FOOTER_TAGLINE` → config object props; `process.env.NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` → `siteUrl` option (no env reads inside slice).
- `brand-head.tsx`: literal `--brand` var name, `useThemePreset()` from theme-presets, localStorage keys `theme`/`theme-site-applied` → keep keys but make the preset apply an injected callback; allow `brandVar` override.
- `site-loader.tsx`: `useStore()` (`ready`/`progress`) → props.
- `error.tsx`: Indonesian copy + `lucide-react` import path → copy props, lucide is fine.
- `catch-all-renderer.tsx`: `usePages()` app-store coupling + `BlocksRenderer` → out of scope (that's `pages-cms`/`landing-sections`); do **not** lift the catch-all into this slice.
- nav `PUBLIC_BASE` path-prefix rewriting (`rewritePreviewPaths`) is a template
  concern, not a slice concern — drop it; hrefs are consumer-supplied.

**Effort: M.** Several small components (SiteShell ~20 LOC, BrandHead ~60,
SiteLoader ~55, metadata helper ~30) + the injectable branding contract +
trio + catalog entry. No backend. The risk is purely getting the injection
seams right so it composes with marketing-chrome / theme-presets / settings-page
instead of duplicating them.

**Proposed `slice.json` shape:**
```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "site-runtime-shell",
  "version": "0.1.0",
  "category": "ui",
  "kind": "ui",
  "title": "Site Runtime Shell — public layout + live branding",
  "description": "Public-site composition shell: SiteShell (composes marketing-chrome header+footer + <main>), BrandHead (apply live owner branding — title/favicon/--brand/theme preset/default light-dark — from an injected settings source, with site-default-vs-visitor-choice reconciliation), SiteLoader (hydration-gated splash + progress + 8s hard cap), and buildSiteMetadata (brand config → Next Metadata). Backend-agnostic: branding is a prop, not a Convex query.",
  "namespace": "@/features/site-runtime-shell",
  "frontend": { "slicePath": "frontend/slices/site-runtime-shell", "configExport": "siteRuntimeShellFeature" },
  "convex": { "tablesExport": "", "schemaPath": "", "rootPaths": [] },
  "deps": {
    "npm": ["next-themes@^0.4.0", "lucide-react@^0.400.0"],
    "shadcn": ["button"],
    "env": [],
    "peers": ["marketing-chrome", "theme-presets"]
  },
  "contract": {
    "provides": {
      "components": ["SiteShell", "BrandHead", "SiteLoader"],
      "utils": ["buildSiteMetadata", "parseSocials"],
      "hooks": [],
      "convex": { "tables": [], "rbac": [] }
    },
    "requires": { "slices": ["marketing-chrome", "theme-presets"] }
  },
  "tags": ["ui", "shell", "layout", "branding", "public-site"]
}
```
No `convex/features/site-runtime-shell` — settings storage is reused from
`settings-page`/`shell-settings` or the consumer's own table; the slice consumes
a `branding` prop only.
