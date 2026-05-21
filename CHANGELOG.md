# CHANGELOG

Release history for the Rahman Resources monorepo. Tracks the rr site,
canonical slices, templates, CLI, and MCP server.

Format: keep-a-changelog-ish. Per-release sections list **CLI**, **Slices**,
**Templates**, and **Site** changes where applicable. The CLI version is
the user-facing handle (`npx rahman-resources@x.y.z`).

---

## [Unreleased]

### CJ-wave — 2026-05-21 — Catalog cleanup

- **Deleted** `frontend/slices/pages/` — dead `defineFeature` skeleton (routes:[], zero live imports).
- **Dropped** `notion-blocks` catalog entry — pure re-export aggregator of 4 atoms (equation / code-block / notifications / database-cell-selection). Atoms remain individually catalogued; slice dir + barrel kept so consumer imports still resolve.
- **Deleted** `app/preview/slices/notion-blocks/page.tsx` preview route.
- **Retitled** `theme-presets` → "tweakcn Theme Loader (30+ presets)" — disambiguate from `theme-preset-switcher` (Convex-backed OKLch). No file moves.
- **Template** `notion-page-clone/shared/nav-config.ts` link `/slices/notion-blocks` → `/slices/notion-shell` to avoid catalog detail 404.
- Catalog count: 45 → 44 slices.
- **Deferred**: notion atom consolidation waits for upstream `notion/` mega-bundle (open-silong Phase 5, ~3wk per `docs/rr-sync/2026-05-21-notion-mega-lift-plan.md`).

---

## [1.7.0] — 2026-05-18

Live on npm: `rahman-resources@1.7.0`, `rahman-resources-mcp@1.1.0`,
`rahman-shared@0.2.0`.

### Slices — 7 new canonical UI slices

R + S + T waves added the missing marketing-page primitives so every
template consumes one SSOT per surface (pricing, features, FAQ,
testimonials, blog, changelog, portfolio).

- **`pricing-page`** — `PricingSection` + tiers + optional FAQ. Three
  `featuredVariant` styles (`ring` | `scale` | `tint`).
- **`feature-grid`** — `FeatureGridSection` with 4 layouts: `cards`,
  `minimal`, `alternating` (image+text rows), `grouped` (sub-categorized).
- **`faq-section`** — `FAQSection` accordion with `single`, `two-column`,
  `grouped` layouts + optional footer CTA.
- **`testimonials-grid`** — `TestimonialsGridSection` with `cards`,
  `quote-stack`, `masonry` layouts. Star ratings + avatars + featured ring.
- **`blog-section`** — `BlogListSection` (cards/list/featured-split) +
  `BlogPostView` (cover/meta/body/related). Routing left to consumer via
  `hrefFor`.
- **`changelog-feed`** — `ChangelogFeedSection` with timeline / cards /
  list layouts. 5 entry kinds (feature/improvement/fix/chore/breaking) +
  optional sub-grouped bullets per entry.
- **`portfolio-section`** — `PortfolioListSection` (uniform/masonry/
  asymmetric) + `PortfolioDetailView` (cover/sections/gallery/related).

### Slices — slot extensions (U-wave)

Each canonical section now accepts a render-slot to keep template-specific
customization without forking the slice:

- `PricingSection.renderTierCta(tier)` — replace default Link CTA with a
  modal trigger, custom button, etc.
- `PortfolioItem.sections[]` — structured `{ heading, body }[]`. Auto-grid
  by length (2→2col, 3→3col).
- `BlogPostView.afterContent` — comments / newsletter signup slot.
- `BlogPostView.extraMeta` — view counter / read-time next to author.
- `BlogPostView.related` + `hrefForRelated` — related-posts strip.

### Templates — full SSOT migration

All 4 marketing templates now consume the canonical slices end-to-end:

| Template | Pages migrated |
|---|---|
| `saas-marketing-os` | /pricing, /features, /blog, /blog/[slug], /changelog, home sub-sections |
| `agency-studio-os` | /services (→ pricing-page), /portfolio, /portfolio/[slug] (sections) |
| `personal-brand-os` | /services (renderTierCta), /portfolio, /portfolio/[slug] (sections), /blog, /blog/[slug] (afterContent), inline FAQ → faq-section |
| `wirausaha-os` | /services (→ feature-grid grouped) |

Templates retained as intentionally bespoke (would lose semantic
information on migration): `konsultan-os` (newsletter archive),
`kreator-studio-os` (progress-bar UI), `riset-kit` (document library).

### Layout — three-column V-wave

Ported `ThreeColumnLayoutAdvanced` updates from superspace:

- **PanelSection compound** (Header / Items / Footer) + `PanelGroup` /
  `PanelGroupLabel` / `PanelMenu` / `PanelMenuItem` / `PanelMenuButton` /
  `PanelSeparator` primitives. Models shadcn sidebar API.
- **Trigger ≠ Header rule** — collapse trigger always renders when
  enabled; `leftHeader` chrome row now renders BELOW the trigger instead
  of replacing it.
- **Footer slots** — `leftFooter`, `centerFooter`, `rightFooter` props on
  `ThreeColumnLayoutAdvanced` + `sidebarFooter` / `mainFooter` /
  `inspectorFooter` on `FeatureThreeColumnLayout`.
- **Mobile drawer** — `MobileInspectorDrawer` accepts `header` + `footer`
  slot props so mobile path mirrors desktop chrome.
- Both copies kept in sync — template-base canonical (verbatim from
  superspace) + components/previews superset (`tone="layout"|"feature"`
  blue/muted variants preserved).
- Doc: `docs/architecture/three-column-layout.md`.

### Site — live previews (W-wave)

Each of the 7 new slices now has `/preview/slices/<slug>` with a layout
toggle and realistic seed data. The catalog page `/slices/<slug>` shows
an iframe instead of metadata-only.

### CLI

- Bumped to **1.7.0**.
- Manifest regenerated — 45 slices total (up from 32).
- MCP server bumped to **1.1.0** with refreshed slice resources.

---

## [1.6.x] — Q-wave (May 2026)

### Slices — generic CRUD primitives

`<CrudListView>` + `<CrudFormView>` + typed `CrudController<T>` /
`ColumnDef<T>` / `FieldDef<T>`. Replaced per-template bespoke admin tables
with shared primitives.

### Templates — 25 entities migrated

- saas-marketing: 6 CRUD + 2 new admin views + hybrid propagation
- konsultan-os, wirausaha-os: 6 entities each
- riset-kit: 5 entities
- agency-studio: Clients + Leads
- personal-brand: Leads + Newsletter + Comments + Chatbot
- kreator-studio: Comments + Performance

---

## [1.5.x] — P + O waves (Apr 2026)

### Templates — Pages CRUD on all 7

Shared `_shared/pages/` infra + `PagesView` + `PageEditorView` propagated
to every website template. `audit-templates.mjs` hard-errors if a
website-template ships without Pages CRUD.

### Posts editor

Full route + reducer + form for `saas-marketing-os`. Background fix:
sidebar bg color loss in split preview.

---

## [1.4.x] — M + N waves (Apr 2026)

### Site — security + infra (M-A)

- Rate-limit on public mutations.
- Strict CSP / `X-Content-Type-Options` / `Referrer-Policy` /
  `Permissions-Policy` headers.
- `isHidden` admin wiring.
- Env-var hygiene (no NEXT_PUBLIC_ leak of sensitive values).

### Site — Next.js primitives (M-B)

`next/link` everywhere, `next/image`, typed `catch (e: unknown)`,
`DateField` for date inputs across template-base.

### Site — preview design-system canon (M-C)

Single SSOT for preview chrome — zero drift between `/preview/*` pages.

### Site — UI/UX overwhelm reduction (M-D)

Sidebar grouping — 38 flat slices → 11 collapsible categories.

### Convex — per-feature canonical shape (N-C)

`_schema.ts` + `query.ts` + `mutation.ts` + `action.ts` per feature.

### Templates — defaults sweep (N-A)

90% zoom + public default for 7 website templates.

---

## [1.3.x] — L + K waves (Mar 2026)

- CLI publish prep — bumped 1.5 → 1.6 with audit chain self-doc.
- Consumer install REAL test (local CLI → /tmp).
- `.env.example` per-slice augment in CLI add flow.
- Schema unification (`oneOf SchemaA SchemaB`).
- pre-commit hook expanded to run full audit chain.
- `/llms.txt` + `agentPrompt` verification + catalog completeness audit.

---

## [1.2.x] — H + I + J waves (Feb 2026)

- Modernized install snippet → `npx rr init` flow.
- Fixed `template-base/package.json` `$HOME` leak.
- Catalog drift fixes (5 ai-* + platform-admin + 2 landing).
- `sync-slice-manifests` handles both schemas.
- 75 lint warnings → 0.

---

## [1.1.x] — E + F + G waves (Feb 2026)

- **200-LOC modularity rule** + `audit-file-size.mjs` guard.
- Refactored 8 top shipped-code offenders + drove grandfather list 35 → 0.
- Expanded `audit-file-size` SCAN_ROOTS + refactored 7 newly-discovered
  offenders.
- 15 missing slice/template READMEs written.
- F4: TEMPLATE/SLICE distinction in audit guard.
- F3: backfilled validators on all public Convex fns. Bounded
  `admin/queries.ts` with `.take(LIMIT)`.

---

## [1.0.x] — D + B waves (Jan 2026)

- D-wave: site-level raw-HTML audit. Convex authn+authz audit on every
  public mutation. Server Action authn+authz audit. Schema index validity.
  Extended `audit-templates` to cookbook + convex-templates.
- B-wave: fixed title-mismatch warnings, wrapped 39 raw `<button>` →
  shadcn `Button` across block-demo templates + 8 in slices. Pre-push hook
  installed. Extracted hardcoded MCP URL → env.

---

## Pre-1.0 — Initial scaffolding

Initial wave: 30+ slices, 12+ templates, MCP server scaffold, BSDL
(removed in P+ waves), validation chain, copy-first CLI install pattern.

---

## Conventions

- Versions are CLI versions on npm (`rahman-resources@x.y.z`).
- MCP versions advance independently — see `packages/mcp/package.json`.
- Wave letters (A-Z) are internal session labels — not user-facing
  identifiers. Use the CLI version above when referencing a release.
- Auto-ship policy: main is always shippable. Tags are cut at CLI publish
  time, not per wave.
