import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "AV",
    "version": "AV-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "Admin sidebar: nested Pages parent + sub-items (POC on saas-marketing-os)",
    "body": "Admin nav was a flat list per template — every content surface (landing, blog, pricing, features, changelog) sat as a sibling top-level menu item. With more entities being added the sidebar started feeling crowded. AV adds optional `children` to AdminNavItem and renders nested entries via shadcn's `Collapsible` + `SidebarMenuSub` + `SidebarMenuSubButton`. POC on saas-marketing-os groups all page-driving CRUDs (landing, all pages, blog, pricing, features, changelog) under a single \"Pages\" parent. Top-level keeps Dashboard / Pages / Customers / Subscriptions / Leads. Other 6 templates queued for AW. Dynamic per-page section composition (using existing hero / feature-grid / pricing-page / blog-section / changelog-feed / faq-section / portfolio-section / cta / services / testimonials-grid slices) deferred to a separate AW-B sub-wave.",
    "groups": [
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "saas-marketing-os — Pages parent with 6 sub-items (POC)",
            "slug": "saas-marketing-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Templates queued for AW (same restructure)",
        "bullets": [
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
          "components/templates/_shared/types/common.ts: AdminNavItem.children?: AdminNavItem[]",
          "components/templates/_shared/ui/admin-nav-items.tsx NEW — ParentNavItem + LeafNavItem + isPathActive helper",
          "components/templates/_shared/ui/admin-sidebar.tsx — NavGroup routes child-having items through ParentNavItem (Collapsible + SidebarMenuSub)",
          "Existing flat nav items keep rendering as before (LeafNavItem)"
        ]
      }
    ]
  },
  {
    "id": "AU",
    "version": "AU-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "Notion Page Clone OS — full website template using notion-blocks",
    "body": "First end-to-end website template built on the notion-blocks bundle. Notion Page Clone OS = block-based notes-app starter with admin CRUD + public landing. Snippets entity (kind: equation/code/text/grid) renders live on the public landing via the four bundled primitives (EquationBlock / CodeBlock / NotifyMePopover / SelectableCell). Pure-localStorage state, zero convex required — drop-in for anyone shipping a writing surface or doc site. Wires the same _shared/{pages,landing,crud,ui} primitives the other 7 templates use so consistency holds across the OS family.",
    "groups": [
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "notion-page-clone-os — NEW website template (admin + public)",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-blocks — first downstream consumer (template usedBy)",
            "slug": "notion-blocks"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "/preview/notion-page-clone-os/public — homepage renders snippets via notion-blocks primitives (equations, code, NotifyMe bell)",
          "/preview/notion-page-clone-os/admin — dashboard + /snippets CrudListView for managing the public content",
          "lib/content/layouts.ts — new SliceEntry for notion-page-clone-os, with pullPaths cascading notion-blocks + 4 peer slices"
        ]
      }
    ]
  },
  {
    "id": "AT",
    "version": "AT-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Docs catalog sidebar now uses shadcn Sidebar primitives",
    "body": "User principle: rr is an extension of shadcn, not a replacement. The website-template ADMIN sidebars already used shadcn Sidebar primitives (Sidebar / SidebarMenuButton / SidebarMenuSub / SidebarMenuBadge wrapped in SidebarProvider) — but the rr docs CATALOG sidebar (the left nav on /slices /layouts /templates /changelog etc.) was still a hand-rolled <nav> with custom buttons + chevrons. AT refactors it to shadcn primitives so collapse tooltips, mobile drawer, and persistent state inherit from the same canon as the admin shells. We extend shadcn — we don't fight it.",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "components/site/docs-sidebar/nav-parts.tsx: SectionGroup → SidebarGroup + Collapsible + SidebarGroupLabel; BranchItem → SidebarMenuItem + SidebarMenuButton + SidebarMenuSub; leaf links → SidebarMenuButton / SidebarMenuSubButton",
          "components/site/docs-sidebar.tsx: wrapped in SidebarProvider so SidebarMenuButton has its useSidebar() context — overrides flex / min-h-svh classes so the provider stays flush inside ThreeColumnLayoutAdvanced's left column",
          "Visual hierarchy preserved (3-tier: section / branch / leaf) — chevron rotation, active badge, count pill all carry over via shadcn data-state"
        ]
      },
      {
        "heading": "Templates touched (no change — already on shadcn)",
        "bullets": [
          {
            "text": "saas-marketing-os — admin sidebar already shadcn-based (AdminShell)",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — admin sidebar already shadcn-based",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — admin sidebar already shadcn-based",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — admin sidebar already shadcn-based",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — admin sidebar already shadcn-based",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — admin sidebar already shadcn-based",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — admin sidebar already shadcn-based",
            "slug": "wirausaha-os",
            "kind": "template"
          }
        ]
      }
    ]
  },
  {
    "id": "AS",
    "version": "AS-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Consolidate notion editor primitives into single bundle",
    "body": "Four tiny notion-lifted primitives (equation, code-block, notifications, database-cell-selection) collapsed into one catalog entry: notion-blocks. Each was ~5 files / one component — splitting them four ways cluttered the catalog without giving consumers narrower install ergonomics. notion-blocks is a peer-bundle: re-exports the four slices' public API behind one import path. Per-block narrow imports still work (the peer slices stay registered + lifted). Updated equation + code-block index.ts to also re-export their Props types for ergonomic typing.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-blocks — NEW peer-bundle. Catalog entry replaces 4 sub-entries",
            "slug": "notion-blocks"
          },
          {
            "text": "equation — added EquationBlockProps to barrel exports",
            "slug": "equation"
          },
          {
            "text": "code-block — added CodeBlockProps to barrel exports",
            "slug": "code-block"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "/preview/slices/notion-blocks — single page demos all 4 primitives (KaTeX formulas, TS/Bash code samples, NotifyMe bells, drag-fill table)",
          "Removed /preview/slices/{equation,notifications,code-block,database-cell-selection} — bundle is canonical surface",
          "Removed 4 individual SliceEntry rows from lib/content/slices.ts"
        ]
      }
    ]
  },
  {
    "id": "AR",
    "version": "AR-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Skeleton fallbacks + cacheComponents-friendly slice file I/O",
    "body": "After AP killed the client-side reset churn, server-side nav still felt heavy because cacheComponents: true treats async server components as dynamic by default — every navigation re-ran readSliceFiles on the filesystem. AR adds Next 16 `use cache` directives to the file readers and per-route loading.tsx skeletons that stream instantly on click. /slices/[slug] now reports as Partial Prerender with 15m revalidate; nav between detail pages feels app-router-fast.",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "lib/slice-files.ts: \"use cache\" on readSliceFiles + readPathsFiles — cross-nav cache, not just intra-render dedupe",
          "components/site/docs-loading-skeleton.tsx NEW — shared title-strip / tabs / preview-iframe skeleton",
          "app/(docs)/loading.tsx — catch-all skeleton for plain docs routes",
          "app/(docs)/slices/[slug]/loading.tsx — tab + iframe skeleton",
          "app/(docs)/layouts/[slug]/loading.tsx — tab + iframe skeleton",
          "RecentlyUpdatedBadge → \"use client\" so Date.now() runs in the browser (cacheComponents blocked the previous server read)"
        ]
      }
    ]
  },
  {
    "id": "AQ",
    "version": "AQ-wave",
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
    "id": "AP",
    "version": "AP-wave",
    "date": 1779148800000,
    "kind": "fix",
    "title": "Stop full preview reset on every sidebar/layout nav",
    "body": "Regression from AM-wave: /slices/[slug] started registering a FeatureManifest to share the docs-shell tabs with /layouts/[slug]. Two long-standing rough edges in feature-context surfaced — useFeatureManifest's unmount cleanup flashed null on every nav (firing the provider's effect twice), and the effect reset activeTab / previewView / previewZoom on every manifest object identity change. Result: clicking any sidebar link rebuilt the iframe, dropped the user's tab choice, and felt like a fresh fetch. AP threads a stable manifest.id (slug-based) through buildPreviewManifest, gates the reset on id change via a ref, preserves activeTab across slugs when the id exists in the new tabs, drops the unmount cleanup, and React.cache-wraps readSliceFiles.",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "FeatureManifest gained `id` field; buildPreviewManifest derives from slug",
          "feature-context useEffect is now id-gated — same-id re-renders don't reset state",
          "useFeatureManifest cleanup dropped — no more null-flash between transitions",
          "lib/slice-files: readSliceFiles wrapped with React.cache for intra-render dedupe",
          "components/site/feature-context-effect.ts NEW — extracted manifest-effect helper to keep feature-context.tsx under 200 LOC"
        ]
      }
    ]
  }
];
