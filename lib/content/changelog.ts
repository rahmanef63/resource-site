import type { ChangelogEntry } from "@/features/changelog-feed";

/**
 * Public release history for the Rahman Resources monorepo. Surfaced on
 * `/changelog` via the canonical `changelog-feed` slice — same component
 * every template ships via `npx rr add changelog-feed`.
 *
 * Source of truth is CHANGELOG.md (human-readable wave history). This
 * file lists the user-facing CLI release dates only.
 */
export const releases: ChangelogEntry[] = [
  {
    id: "AR",
    version: "AR-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Skeleton fallbacks + cacheComponents-friendly slice file I/O",
    body:
      "After AP killed the client-side reset churn, server-side nav still felt heavy because cacheComponents: true treats async server components as dynamic by default — every navigation re-ran readSliceFiles on the filesystem. AR adds Next 16 `use cache` directives to the file readers and per-route loading.tsx skeletons that stream instantly on click. /slices/[slug] now reports as Partial Prerender with 15m revalidate; nav between detail pages feels app-router-fast.",
    groups: [
      {
        heading: "Site",
        bullets: [
          "lib/slice-files.ts: \"use cache\" on readSliceFiles + readPathsFiles — cross-nav cache, not just intra-render dedupe",
          "components/site/docs-loading-skeleton.tsx NEW — shared title-strip / tabs / preview-iframe skeleton",
          "app/(docs)/loading.tsx — catch-all skeleton for plain docs routes",
          "app/(docs)/slices/[slug]/loading.tsx — tab + iframe skeleton",
          "app/(docs)/layouts/[slug]/loading.tsx — tab + iframe skeleton",
          "RecentlyUpdatedBadge → \"use client\" so Date.now() runs in the browser (cacheComponents blocked the previous server read)",
        ],
      },
    ],
  },
  {
    id: "AQ",
    version: "AQ-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion editor primitives lifted via new rr-sync pipeline",
    body:
      "Four pure-UI primitives lifted from notion-page-clone using a new hash-based, idempotent sync pipeline. The pipeline auto-derives import rewrites from both repos' tsconfigs, follows transitive shared-dep graphs, cross-checks npm packages against rr's package.json, and ships a registry (rr-sync.json) so subsequent updates to the same slice in nosion can re-propagate with one command. Each lifted slice has an interactive preview at /preview/slices/<slug>.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "equation — KaTeX-rendered LaTeX block, click-pencil to edit", slug: "equation" },
          { text: "notifications — per-page subscription toggle (localStorage-backed NotifyMePopover)", slug: "notifications" },
          { text: "code-block — highlight.js syntax block with language picker + copy", slug: "code-block" },
          { text: "database-cell-selection — drag-fill + SelectableCell primitives for grid UIs", slug: "database-cell-selection" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "rr-sync pipeline in notion-page-clone: pathMap registry + tsconfig alias auto-derivation + transitive-import follower + sibling-barrel resolver + npm-deps cross-check + skipFiles wildcards + per-file hash drift detection",
          "Pre-push hook adds `npm run build` to catch Next-only errors (cacheComponents conflicts, Turbopack loader issues) that tsc misses",
          "next.config: transpilePackages: [\"rahman-shared\"] added — required for slices using rewritten @/shared/lib/utils → rahman-shared/lib/utils imports",
        ],
      },
    ],
  },
  {
    id: "AP",
    version: "AP-wave",
    date: Date.parse("2026-05-19"),
    kind: "fix",
    title: "Stop full preview reset on every sidebar/layout nav",
    body:
      "Regression from AM-wave: /slices/[slug] started registering a FeatureManifest to share the docs-shell tabs with /layouts/[slug]. Two long-standing rough edges in feature-context surfaced — useFeatureManifest's unmount cleanup flashed null on every nav (firing the provider's effect twice), and the effect reset activeTab / previewView / previewZoom on every manifest object identity change. Result: clicking any sidebar link rebuilt the iframe, dropped the user's tab choice, and felt like a fresh fetch. AP threads a stable manifest.id (slug-based) through buildPreviewManifest, gates the reset on id change via a ref, preserves activeTab across slugs when the id exists in the new tabs, drops the unmount cleanup, and React.cache-wraps readSliceFiles.",
    groups: [
      {
        heading: "Site",
        bullets: [
          "FeatureManifest gained `id` field; buildPreviewManifest derives from slug",
          "feature-context useEffect is now id-gated — same-id re-renders don't reset state",
          "useFeatureManifest cleanup dropped — no more null-flash between transitions",
          "lib/slice-files: readSliceFiles wrapped with React.cache for intra-render dedupe",
          "components/site/feature-context-effect.ts NEW — extracted manifest-effect helper to keep feature-context.tsx under 200 LOC",
        ],
      },
    ],
  },
  {
    id: "AO",
    version: "AO-wave",
    date: Date.parse("2026-05-19"),
    kind: "feature",
    title: "Notion editor primitives lifted via new rr-sync pipeline",
    body:
      "Four pure-UI primitives lifted from notion-page-clone using a new hash-based, idempotent sync pipeline. The pipeline auto-derives import rewrites from both repos' tsconfigs, follows transitive shared-dep graphs, cross-checks npm packages against rr's package.json, and ships a registry (rr-sync.json) so subsequent updates to the same slice in nosion can re-propagate with one command. Each lifted slice has an interactive preview at /preview/slices/<slug>.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "equation — KaTeX-rendered LaTeX block, click-pencil to edit", slug: "equation" },
          { text: "notifications — per-page subscription toggle (localStorage-backed NotifyMePopover)", slug: "notifications" },
          { text: "code-block — highlight.js syntax block with language picker + copy", slug: "code-block" },
          { text: "database-cell-selection — drag-fill + SelectableCell primitives for grid UIs", slug: "database-cell-selection" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "rr-sync pipeline in notion-page-clone: pathMap registry + tsconfig alias auto-derivation + transitive-import follower + sibling-barrel resolver + npm-deps cross-check + skipFiles wildcards + per-file hash drift detection",
          "Pre-push hook adds `npm run build` to catch Next-only errors (cacheComponents conflicts, Turbopack loader issues) that tsc misses",
          "next.config: transpilePackages: [\"rahman-shared\"] added — required for slices using rewritten @/shared/lib/utils → rahman-shared/lib/utils imports",
        ],
      },
    ],
  },
  {
    id: "AN",
    version: "AN-wave",
    date: Date.parse("2026-05-19"),
    kind: "improvement",
    title: "Changelog clickable + live-preview SSOT + landing editor polish",
    body:
      "AM-wave unified the docs-shell tabs for /slices and /layouts behind a single buildPreviewManifest helper. AL-wave fixed admin landing editor: bgImage scrim, fg image inside Hero with aspect-ratio dropdown, 1-based reorder arrows. AK-E published landing-sections as installable slice. AN-wave: changelog bullets now link back to the slice/template they reference.",
    groups: [
      {
        heading: "Slices touched",
        bullets: [
          { text: "landing-sections — promoted to distributable slice", slug: "landing-sections" },
          { text: "changelog-feed — bullets now accept { text, slug, kind } for back-links", slug: "changelog-feed" },
        ],
      },
      {
        heading: "Templates touched (admin landing editor)",
        bullets: [
          { text: "saas-marketing-os", slug: "saas-marketing-os", kind: "template" },
          { text: "personal-brand-os", slug: "personal-brand-os", kind: "template" },
          { text: "agency-studio-os", slug: "agency-studio-os", kind: "template" },
          { text: "konsultan-os", slug: "konsultan-os", kind: "template" },
          { text: "kreator-studio-os", slug: "kreator-studio-os", kind: "template" },
          { text: "riset-kit", slug: "riset-kit", kind: "template" },
          { text: "wirausaha-os", slug: "wirausaha-os", kind: "template" },
        ],
      },
      {
        heading: "Site",
        bullets: [
          "VersionWatcher toasts when a redeploy lands (rc-samata-dash pattern)",
          "/slices/<slug> + /layouts/<slug> share the same Code/Public/Split/Admin tabs",
        ],
      },
    ],
  },
  {
    id: "1.7.0",
    version: "1.7.0",
    date: Date.parse("2026-05-18"),
    kind: "feature",
    title: "Seven canonical UI slices + V-wave three-column",
    body:
      "R + S + T waves shipped the missing marketing-page primitives so every template consumes one SSOT per surface. V-wave ported superspace's PanelSection compound. W-wave wired live previews. CLI 1.7.0 + MCP 1.1.0 on npm.",
    groups: [
      {
        heading: "New slices",
        bullets: [
          { text: "pricing-page · PricingSection with renderTierCta slot", slug: "pricing-page" },
          { text: "feature-grid · cards / minimal / alternating / grouped layouts", slug: "feature-grid" },
          { text: "faq-section · single / two-column / grouped + footer CTA", slug: "faq-section" },
          { text: "testimonials-grid · cards / quote-stack / masonry", slug: "testimonials-grid" },
          { text: "blog-section · BlogListSection + BlogPostView (afterContent / extraMeta / related slots)", slug: "blog-section" },
          { text: "changelog-feed · timeline / cards / list", slug: "changelog-feed" },
          { text: "portfolio-section · PortfolioListSection + PortfolioDetailView with sections[]", slug: "portfolio-section" },
        ],
      },
      {
        heading: "Layout — V-wave",
        bullets: [
          "PanelSection compound (Header / Items / Footer)",
          "PanelGroup / PanelMenu / PanelSeparator primitives",
          "leftFooter / centerFooter / rightFooter slots on ThreeColumnLayoutAdvanced",
          "Trigger ≠ Header separation rule",
          "Mobile drawer header + footer slot props",
        ],
      },
      {
        heading: "Site",
        bullets: [
          "/preview/slices/<slug> for all 7 new slices",
          "/preview/three-column-trio V-wave demo",
          "rr site dogfood — FeaturesGrid + /stack + /changelog use canonical slices",
        ],
      },
    ],
  },
  {
    id: "1.6.0",
    version: "1.6.0",
    date: Date.parse("2026-05-10"),
    kind: "feature",
    title: "Generic CRUD primitives + 25 entities migrated",
    body:
      "<CrudListView> + <CrudFormView> + typed CrudController<T>. Replaced per-template bespoke admin tables. Every website template now has Pages CRUD with audit-templates hard-error gate.",
  },
  {
    id: "1.5.0",
    version: "1.5.0",
    date: Date.parse("2026-04-22"),
    kind: "feature",
    title: "Page CRUD on all 7 website templates",
    body:
      "Shared _shared/pages/ infra. PagesView + PageEditorView propagated to every website template. Hybrid client-wrap pattern: server chrome + client data section.",
  },
  {
    id: "1.4.0",
    version: "1.4.0",
    date: Date.parse("2026-04-10"),
    kind: "improvement",
    title: "Security + infra + Next.js primitive sweep",
    body:
      "Rate-limit, strict headers, isHidden wiring, env hygiene. next/link + next/image + typed catch across template-base. Sidebar grouping: 38 flat slices → 11 collapsible categories.",
  },
  {
    id: "1.3.0",
    version: "1.3.0",
    date: Date.parse("2026-03-25"),
    kind: "improvement",
    title: "CLI publish prep + audit chain self-doc",
    body:
      "Consumer install REAL test. .env.example per-slice augment. Schema unification. pre-commit hook expanded to run full audit chain. /llms.txt + catalog completeness.",
  },
  {
    id: "1.2.0",
    version: "1.2.0",
    date: Date.parse("2026-02-28"),
    kind: "improvement",
    title: "Install snippet modernization + lint zero",
    body:
      "Install snippets → npx rr init flow. 75 lint warnings → 0. Catalog drift fixes (5 ai-* + platform-admin + 2 landing). sync-slice-manifests handles both schemas.",
  },
  {
    id: "1.1.0",
    version: "1.1.0",
    date: Date.parse("2026-02-14"),
    kind: "feature",
    title: "200-LOC modularity rule + audit-file-size guard",
    body:
      "New audit-file-size.mjs gates file length. 8 top offenders refactored. Grandfather list driven 35 → 0. F4: TEMPLATE/SLICE distinction in audit guard.",
  },
  {
    id: "1.0.0",
    version: "1.0.0",
    date: Date.parse("2026-01-30"),
    kind: "feature",
    title: "Audit chain comprehensive — D + B waves",
    body:
      "Site-level raw-HTML audit. Convex authn+authz on every public mutation. Schema index validity. 39 raw <button> wrapped in shadcn Button. Pre-push hook installed. Hardcoded MCP URL extracted to env.",
  },
];
