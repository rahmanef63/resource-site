import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "perf-ppr",
    "version": "perf-skeletons-caching-wave",
    "date": 1783123200000,
    "kind": "improvement",
    "title": "Perf pass — preview skeletons, lazy recharts, deploy-life caching, dead-dep cut",
    "body": "The site had cacheComponents (PPR) on but barely used it. This wave closes the gaps a ponytail/perf audit surfaced: (1) a route-level loading.tsx paints an instant skeleton for all 63 /preview/** routes (each ships a 0.4–1.1MB slice chunk) instead of blank, plus a preview-shaped skeleton for /tour. (2) recharts (~150kB) is code-split out of the markdown slice — it only loads when a chart fence actually renders, not on every markdown page (ChartBlock now next/dynamic's a ChartCanvas chunk, mirroring the already-lazy MermaidBlock). (3) the slice-files fs walkers get cacheLife('max') + cacheTag('slice-files') so immutable repo files cache for the deploy's life instead of a 5–15min revalidate. (4) 25 zero-interactivity preview pages + the docs footer + code-tab dropped 'use client', leaving the client graph so they PPR-prerender.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "markdown — recharts code-split behind next/dynamic (ChartBlock → ChartCanvas + chart-spec)", "slug": "markdown" }
        ]
      }
    ]
  },
  {
    "id": "SS-variants",
    "version": "slice-variants-wave",
    "date": 1783036800000,
    "kind": "feature",
    "title": "shadcn-style slice variants — 80 slices consolidated to 69",
    "body": "New variant mechanism: a slice can declare `variants` in slice.json. `npx rr add <slug> <variant>` installs one variant (its files flatten to the slice root, so imports resolve at @/features/<slug> like any slice); `npx rr add <slug>` installs all variants + a root switcher and you pick via a prop — exactly the shadcn pattern. An optional `shared/` folder is copied for every variant, and each variant can declare its own `convex` roots so it pulls only its own backend. Purely additive: the ~60 non-variant slices install exactly as before, and every old slug keeps working via an alias. Used to collapse the confusingly-named slice families into fewer, clearer slices.",
    "groups": [
      {
        "heading": "Merged into variant slices",
        "bullets": [
          { "text": "feedback-states — loading + empty (was loading-states + empty-states)", "slug": "feedback-states" },
          { "text": "profile — resume + card (was resume + about-profile)", "slug": "profile" },
          { "text": "settings — account + appearance (was settings-page + shell-settings)", "slug": "settings" },
          { "text": "payment — doku + midtrans (was doku-payment + midtrans-payment)", "slug": "payment" },
          { "text": "notion-ui — page + database + sidebar (was notion-shell + notion-database + notion-sidebar)", "slug": "notion-ui" },
          { "text": "admin — shell + console, each pulling only its own convex (was admin + admin-console)", "slug": "admin" },
          { "text": "ai-workspace — chat + studio + agents, only the chat variant pulls convex (was ai-chat + ai-studio + ai-agents; studio/agents views lifted from superspace)", "slug": "ai-workspace" }
        ]
      },
      {
        "heading": "Renamed for clarity (old slugs aliased)",
        "bullets": [
          { "text": "files → file-upload (vs file-explorer)", "slug": "file-upload" },
          { "text": "media-studio → design-studio (vs image-editor)", "slug": "design-studio" },
          { "text": "onboarding-wizard → site-setup-wizard", "slug": "site-setup-wizard" },
          { "text": "notion → notion-app (vs notion-ui primitives)", "slug": "notion-app" },
          { "text": "landing-sections → sections", "slug": "sections" }
        ]
      }
    ]
  },
  {
    "id": "AG-bridge",
    "version": "agentic-wave-3b",
    "date": 1781049600000,
    "kind": "feature",
    "title": "Assistant goes live — real function-calling over every slice",
    "body": "configureAgentStream is now wired to a real Anthropic backend. New /api/agent-stream SSE proxy runs one model turn per call; the client-side runAgentLoop dispatches each tool_use against the live tool registry (tools bind to real React state, so they execute in the browser). createSseAgentStream + an AgentBridge mounted across /preview flip the assistant from the typing-demo to driving the 10 registered OS-app tool collections for real. Key-guarded (ANTHROPIC_API_KEY) + per-IP rate limited; falls back to the demo when unconfigured."
  },
  {
    "id": "AO",
    "version": "AO-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "Notion editor primitives lifted via new rr-sync pipeline",
    "body": "Four pure-UI primitives lifted from notion-page-clone using a new hash-based, idempotent sync pipeline. The pipeline auto-derives import rewrites from both repos' tsconfigs, follows transitive shared-dep graphs, cross-checks npm packages against rr's package.json, and ships a registry (rr-sync.json) so subsequent updates to the same slice in nosion can re-propagate with one command. Each lifted slice has an interactive preview at /preview/slices/<slug>.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "equation — KaTeX-rendered LaTeX block, click-pencil to edit",
            "slug": "equation"
          },
          {
            "text": "notifications — per-page subscription toggle (localStorage-backed NotifyMePopover)",
            "slug": "notifications"
          },
          {
            "text": "code-block — highlight.js syntax block with language picker + copy",
            "slug": "code-block"
          },
          {
            "text": "database-cell-selection — drag-fill + SelectableCell primitives for grid UIs",
            "slug": "database-cell-selection"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "rr-sync pipeline in notion-page-clone: pathMap registry + tsconfig alias auto-derivation + transitive-import follower + sibling-barrel resolver + npm-deps cross-check + skipFiles wildcards + per-file hash drift detection",
          "Pre-push hook adds `npm run build` to catch Next-only errors (cacheComponents conflicts, Turbopack loader issues) that tsc misses",
          "next.config: transpilePackages: [\"rahman-shared\"] added — required for slices using rewritten @/shared/lib/utils → rahman-shared/lib/utils imports"
        ]
      }
    ]
  },
  {
    "id": "AN",
    "version": "AN-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Changelog clickable + live-preview SSOT + landing editor polish",
    "body": "AM-wave unified the docs-shell tabs for /slices and /layouts behind a single buildPreviewManifest helper. AL-wave fixed admin landing editor: bgImage scrim, fg image inside Hero with aspect-ratio dropdown, 1-based reorder arrows. AK-E published landing-sections as installable slice. AN-wave: changelog bullets now link back to the slice/template they reference.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "landing-sections — promoted to distributable slice",
            "slug": "landing-sections"
          },
          {
            "text": "changelog-feed — bullets now accept { text, slug, kind } for back-links",
            "slug": "changelog-feed"
          }
        ]
      },
      {
        "heading": "Templates touched (admin landing editor)",
        "bullets": [
          {
            "text": "saas-marketing-os",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os",
            "slug": "wirausaha-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "VersionWatcher toasts when a redeploy lands (rc-samata-dash pattern)",
          "/slices/<slug> + /layouts/<slug> share the same Code/Public/Split/Admin tabs"
        ]
      }
    ]
  },
  {
    "id": "1.7.0",
    "version": "1.7.0",
    "date": 1779062400000,
    "kind": "feature",
    "title": "Seven canonical UI slices + V-wave three-column",
    "body": "R + S + T waves shipped the missing marketing-page primitives so every template consumes one SSOT per surface. V-wave ported superspace's PanelSection compound. W-wave wired live previews. CLI 1.7.0 + MCP 1.1.0 on npm.",
    "groups": [
      {
        "heading": "New slices",
        "bullets": [
          {
            "text": "pricing-page · PricingSection with renderTierCta slot",
            "slug": "pricing-page"
          },
          {
            "text": "feature-grid · cards / minimal / alternating / grouped layouts",
            "slug": "feature-grid"
          },
          {
            "text": "faq-section · single / two-column / grouped + footer CTA",
            "slug": "faq-section"
          },
          {
            "text": "testimonials-grid · cards / quote-stack / masonry",
            "slug": "testimonials-grid"
          },
          {
            "text": "blog-section · BlogListSection + BlogPostView (afterContent / extraMeta / related slots)",
            "slug": "blog-section"
          },
          {
            "text": "changelog-feed · timeline / cards / list",
            "slug": "changelog-feed"
          },
          {
            "text": "portfolio-section · PortfolioListSection + PortfolioDetailView with sections[]",
            "slug": "portfolio-section"
          }
        ]
      },
      {
        "heading": "Layout — V-wave",
        "bullets": [
          "PanelSection compound (Header / Items / Footer)",
          "PanelGroup / PanelMenu / PanelSeparator primitives",
          "leftFooter / centerFooter / rightFooter slots on ThreeColumnLayoutAdvanced",
          "Trigger ≠ Header separation rule",
          "Mobile drawer header + footer slot props"
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "/preview/slices/<slug> for all 7 new slices",
          "/preview/three-column-trio V-wave demo",
          "rr site dogfood — FeaturesGrid + /stack + /changelog use canonical slices"
        ]
      }
    ]
  },
  {
    "id": "1.6.0",
    "version": "1.6.0",
    "date": 1778371200000,
    "kind": "feature",
    "title": "Generic CRUD primitives + 25 entities migrated",
    "body": "<CrudListView> + <CrudFormView> + typed CrudController<T>. Replaced per-template bespoke admin tables. Every website template now has Pages CRUD with audit-templates hard-error gate."
  },
  {
    "id": "1.5.0",
    "version": "1.5.0",
    "date": 1776816000000,
    "kind": "feature",
    "title": "Page CRUD on all 7 website templates",
    "body": "Shared _shared/pages/ infra. PagesView + PageEditorView propagated to every website template. Hybrid client-wrap pattern: server chrome + client data section."
  },
  {
    "id": "1.4.0",
    "version": "1.4.0",
    "date": 1775779200000,
    "kind": "improvement",
    "title": "Security + infra + Next.js primitive sweep",
    "body": "Rate-limit, strict headers, isHidden wiring, env hygiene. next/link + next/image + typed catch across template-base. Sidebar grouping: 38 flat slices → 11 collapsible categories."
  },
  {
    "id": "1.3.0",
    "version": "1.3.0",
    "date": 1774396800000,
    "kind": "improvement",
    "title": "CLI publish prep + audit chain self-doc",
    "body": "Consumer install REAL test. .env.example per-slice augment. Schema unification. pre-commit hook expanded to run full audit chain. /llms.txt + catalog completeness."
  },
  {
    "id": "1.2.0",
    "version": "1.2.0",
    "date": 1772236800000,
    "kind": "improvement",
    "title": "Install snippet modernization + lint zero",
    "body": "Install snippets → npx rr init flow. 75 lint warnings → 0. Catalog drift fixes (5 ai-* + platform-admin + 2 landing). sync-slice-manifests handles both schemas."
  },
  {
    "id": "1.1.0",
    "version": "1.1.0",
    "date": 1771027200000,
    "kind": "feature",
    "title": "200-LOC modularity rule + audit-file-size guard",
    "body": "New audit-file-size.mjs gates file length. 8 top offenders refactored. Grandfather list driven 35 → 0. F4: TEMPLATE/SLICE distinction in audit guard."
  },
  {
    "id": "1.0.0",
    "version": "1.0.0",
    "date": 1769731200000,
    "kind": "feature",
    "title": "Audit chain comprehensive — D + B waves",
    "body": "Site-level raw-HTML audit. Convex authn+authz on every public mutation. Schema index validity. 39 raw <button> wrapped in shadcn Button. Pre-push hook installed. Hardcoded MCP URL extracted to env."
  }
];
