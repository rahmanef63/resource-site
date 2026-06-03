import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BQ",
    "version": "BQ-wave",
    "date": 1779235200000,
    "kind": "improvement",
    "title": "Operasi Mise M5 — public taxonomy rollout (Features → Modules, recipes retired) + SliceEntry resourceType/domain/maturity",
    "body": "Final phase of Operasi Mise. Public-facing taxonomy rename + additive data model extension. CHANGES THAT USERS SEE: (1) Navbar 'Features' → 'Modules'. URL stays /slices for back-compat with inbound links + bookmarks; internal code keeps 'slice' naming (slice.json contract unchanged). (2) Command palette: 'Recipes' group removed (recipes.ts has been an empty deprecated stub since 2026-05-12), replaced with 'Modules' group sourcing from slices[]. Pages quick-action 'Recipes' → 'Modules'. (3) Homepage ShowcaseGrid kind='recipes' (which silently rendered 0 cards) → kind='slices'. Heading 'Feature recipes' → 'Modules'. (4) Hero subtitle: '{layouts} layouts, {recipes} recipes' → '{layouts} layouts, {slices} modules'. (5) Docs intro page: dropped recipe count line + Recipes card; replaced with Modules card pointing at /slices. (6) Agents page: 'recipe' → 'module'/'resource' in 4 spots. ADDITIVE DATA MODEL: SliceEntry gains optional resourceType ('primitive'|'component'|'block'|'module'), domain ('auth'|'rbac'|'cms'|'crm'|'commerce'|'payments'|'ai'|'data'|'search'|'messaging'|'admin'|'infra'), maturity ('draft'|'beta'|'stable'). None populated yet — backfill is a separate wave so site filter chips + builder UI can opt in incrementally. Resource type in resources.ts surfaces these (maturity defaults to 'stable' when omitted). recipes.ts retained as silent dead stub (10 import sites still reference it; coordinated removal is post-Mise). Mise complete: M1-M5 shipped, ready to resume development with BR (notion-page-clone sync to admin-panel real impl).",
    "groups": [
      {
        "heading": "Public label renames",
        "bullets": [
          "Navbar Features → Modules (top-navbar.tsx)",
          "Command palette: Recipes group removed; Modules group added (sources from slices[])",
          "Homepage ShowcaseGrid kind: recipes → slices",
          "Hero subtitle: recipes count → slices count",
          "Docs intro: Recipes card → Modules card",
          "Agents page: 'recipe' → 'module' (4 mentions)"
        ]
      },
      {
        "heading": "Data model extension (additive, optional)",
        "bullets": [
          "SliceEntry.resourceType?: 'primitive'|'component'|'block'|'module'",
          "SliceEntry.domain?: 'auth'|'rbac'|'cms'|'crm'|'commerce'|'payments'|'ai'|'data'|'search'|'messaging'|'admin'|'infra'",
          "SliceEntry.maturity?: 'draft'|'beta'|'stable' (defaults to 'stable' when omitted)",
          "Resource type in resources.ts surfaces all three; layout entries inherit maturity='stable'"
        ]
      },
      {
        "heading": "Bug fix (side effect)",
        "bullets": [
          "Homepage ShowcaseGrid kind='recipes' was rendering 0 cards (empty stub) — replaced with kind='slices' (44 cards live)"
        ]
      },
      {
        "heading": "Operasi Mise complete (M1-M5)",
        "bullets": [
          "M1 BL docs SSOT · M2 BM route SSOT · M3 BN resources registry · M4 BO manifest+helpers · M5 BQ taxonomy",
          "Resume development next: BR — sync notion-page-clone slice into admin-panel real impl"
        ]
      }
    ]
  },
  {
    "id": "BP",
    "version": "BP-wave",
    "date": 1779235200000,
    "kind": "chore",
    "title": "Pivot pointer — notion-page-clone-os DEMO + notion-shell SLICE link to open-silong OSS product",
    "body": "Strategic positioning update. The upstream Notion-clone source (this rr's notion-shell + notion-page-clone-os) has been rebranded + open-sourced as github.com/rahmanef63/open-silong (silong.rahmanef.com, MIT). rr keeps both surfaces as DEMO + SLICE distribution; for production users (multi-workspace + auth + sharing + Convex), the rr catalog now points to the open-silong repo as the canonical product. Two-surface model documented in the upstream repo's docs/rr-sync/2026-05-20-pivot-nosion-source-of-truth.md. No code changes in rr — only catalog copy (description + agentRecipe) updates to call out the pointer.",
    "groups": [
      {
        "heading": "Catalog copy updates",
        "bullets": [
          {
            "text": "notion-page-clone-os layouts entry — title clarifies 'localStorage demo'; description calls out github.com/rahmanef63/open-silong as the production stack pointer; source field updated",
            "slug": "notion-page-clone-os",
            "kind": "template"
          },
          {
            "text": "notion-shell slices entry — agentRecipe adds product-pointer block clarifying that rr's slice is the EMBED surface and open-silong repo is the FULL PRODUCT surface",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Why",
        "bullets": [
          "rr monorepo (40+ slices) too broad for outside OSS contributors — focused single-product repo lowers barrier",
          "Real users want Convex-backed product (auth + multi-user + sharing); rr template is localStorage demo only",
          "Two-surface model: rr = template marketplace + lifted slice; open-silong = production OSS Notion clone"
        ]
      },
      {
        "heading": "Sync direction unchanged",
        "bullets": [
          "open-silong → rr (lift-only via scripts/rr-sync/ in open-silong repo)",
          "rr never modifies the lifted source; fixes originate in open-silong + re-sync"
        ]
      }
    ]
  },
  {
    "id": "BO",
    "version": "BO-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Operasi Mise M4 — manifest sync + 100% feature coverage + LandingRenderer parseConfigBadge extracted",
    "body": "Phase 4 of 5 in Operasi Mise (kitchen prep before continuing development). Goal: clean up structural debt the audit flagged — slice manifests drift, config title shortening, scaffolding dir counted in coverage stats, duplicated tiny helpers. (1) sync-slice-manifests.mjs: ran, wrote 4 manifests (ai-agents, ai-chat, ai-studio, icon-picker — config.ts added after manifest was last regenerated). Also taught the script to silently skip slices that have config.ts but no slice.json — those are catalog-only meta-slices (admin-panel, event-tracking, pages, rbac-roles) whose actual code lives in _shared/, not as standalone distributables. (2) Aligned 8 config.ts titles with their slice.json long-form (ai-agents/chat/studio, code-block, equation, notifications, notion-blocks, notion-shell). Pre-commit warnings now silent. (3) audit-feature-manifest.mjs: skip _-prefixed dirs (consistent with sync-slice-manifests convention) so _templates scaffolding doesn't count against coverage. Result: 98.0% → 100.0% (48/48). (4) Extracted parseConfigBadge to _shared/landing/parse-config.ts — 5 templates (kreator-studio, personal-brand, research, konsultan, wirausaha) had identical 8-line inline function. Now imported. Added generic parseConfigField<T>() helper for future config-key extraction. Net: -40 LOC across 5 templates. LandingRenderer base-class extraction (originally planned) revealed shallow shared surface — each template's switch-case maps to template-specific component imports (Hero, Stats, FeaturedPosts, etc), so no extraction beyond parseConfigBadge made sense.",
    "groups": [
      {
        "heading": "Manifest sync",
        "bullets": [
          "scripts/validation/sync-slice-manifests.mjs — skip catalog-only slices (config.ts only, no slice.json)",
          "4 manifest files updated: ai-agents, ai-chat, ai-studio, icon-picker — files[] regenerated from disk"
        ]
      },
      {
        "heading": "Feature manifest coverage 100% (48/48)",
        "bullets": [
          "scripts/audit-feature-manifest.mjs — skip _-prefixed dirs (matches sync-slice-manifests convention)",
          "_templates scaffolding now correctly excluded from coverage stats"
        ]
      },
      {
        "heading": "Slice title alignment (config.ts ↔ slice.json)",
        "bullets": [
          "ai-agents/ai-chat/ai-studio — long-form titles restored",
          "code-block/equation/notifications/notion-blocks/notion-shell — same"
        ]
      },
      {
        "heading": "Shared helper extracted",
        "bullets": [
          {
            "text": "components/templates/_shared/landing/parse-config.ts — parseConfigBadge + generic parseConfigField<T> (NEW)",
            "slug": "landing-sections",
            "kind": "slice"
          },
          {
            "text": "5 LandingRenderer.tsx files migrated: removed local parseConfigBadge, import from _shared",
            "slug": "landing-sections",
            "kind": "slice"
          }
        ]
      }
    ]
  },
  {
    "id": "BN",
    "version": "BN-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Operasi Mise M3 — unified resources registry + slice exposure in /api/knowledge",
    "body": "Phase 3 of Operasi Mise. NEW lib/content/resources.ts — derived layer over slices + layouts (additive, no upstream changes). Resource type with { source: 'slice'|'template'|'layout', slug, title, description, category, tags, href, previewPath, install }. /api/knowledge expanded to accept ?slice=, ?resource=, ?type= query params; response adds resources[], slices[], counts{} alongside the legacy layouts[]/recipes[]. llms.txt gets an Agent API section enumerating all endpoints + response shape so AI agents can discover the unified surface. Fixes ChatGPT's M-pre-audit finding that '/api/knowledge masih menerima recipe, mengembalikan recipes, dan belum expose slices sebagai first-class resource.'",
    "groups": [
      {
        "heading": "NEW lib/content/resources.ts",
        "bullets": [
          "Derived layer: spread slices.map(sliceToResource) + layouts.map(layoutToResource)",
          "Templates = layouts.category === 'website-template'; rest = layout source",
          "Helpers: getResource, getResourcesBySource, getResourcesByCategory, resourceCounts"
        ]
      },
      {
        "heading": "/api/knowledge expanded (additive)",
        "bullets": [
          "NEW query params: ?slice=<slug>, ?resource=<slug>, ?type=<source>",
          "NEW response fields: resources[] (unified), slices[] (Tier-3 full), counts{}",
          "Legacy layouts[], recipes[] preserved for pre-M3 consumers"
        ]
      },
      {
        "heading": "llms.txt — Agent API section",
        "bullets": [
          "Documents 7 endpoint variations with curl-paste examples",
          "Lists response shape so agents skip the discovery roundtrip"
        ]
      }
    ]
  },
  {
    "id": "BM",
    "version": "BM-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Operasi Mise M2 — route SSOT via buildTemplatePaths(slug) helper",
    "body": "Phase 2 of Operasi Mise. Goal: dedupe hardcoded /preview/<slug>-os/... paths across templates so renaming a template = change one constant instead of editing 16+ files. NEW components/templates/_shared/config/template-paths.ts: buildTemplatePaths(slug: string) factory returning publicBase, dashboardBase, adminPanelBase, workspaceBase. Each of 8 templates' site-config.ts exports canonical TEMPLATE_SLUG; nav-config.ts imports it and derives all BASE consts via helper. app/preview/<slug>/{sitemap,robots}.ts also migrated for the 6 templates that ship them. Hardcoded /preview/<slug> literals before: 39 across 29 files. After: 0 functional.",
    "groups": [
      {
        "heading": "NEW _shared/config/template-paths.ts",
        "bullets": [
          "buildTemplatePaths(slug: string): TemplatePaths factory",
          "Returns previewRoot, publicBase, dashboardBase, adminPanelBase, workspaceBase"
        ]
      },
      {
        "heading": "8 templates migrated",
        "bullets": [
          "site-config.ts adds canonical TEMPLATE_SLUG constant",
          "nav-config.ts derives PUBLIC_BASE / DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE via helper",
          "ADMIN_BASE deprecated alias preserved for callers"
        ]
      },
      {
        "heading": "12 app/preview/<slug>/{sitemap,robots}.ts migrated",
        "bullets": [
          "PUBLIC_BASE derives from helper",
          "robots.ts disallow rebased from stale /preview/<slug>/admin to dashboardBase"
        ]
      }
    ]
  },
  {
    "id": "BL",
    "version": "BL-wave",
    "date": 1779235200000,
    "kind": "chore",
    "title": "Operasi Mise M1 — docs SSOT + dead code cleanup",
    "body": "Phase 1 of Operasi Mise (kitchen prep before continuing development). Lowest risk wave. (1) lib/content/changelog.ts — append BK entry (the unified PageSectionsEditor + 98% feature manifest coverage that shipped at 9e5b72f had no changelog entry). (2) CLAUDE.md — version drift fixed. CLI 0.13.1 → 1.7.0, MCP 0.9.1 → 1.1.0 (matches npm published + local package.json). (3) app/(docs)/slices/page.tsx — h1 'Feature slices' → 'Slices' (navbar already says 'Features', metadata already says 'Slices'). (4) docs/slice-architecture.md — drop dangling MEMORY.md TODO (auto-memory lives in ~/.claude/projects). (5) docs/architecture/dashboard-vision.md — record BG–BK shipped + add Operasi Mise section with M1–M5 roadmap.",
    "groups": [
      {
        "heading": "Docs catch-up",
        "bullets": [
          "lib/content/changelog.ts — BK entry appended",
          "CLAUDE.md — package versions corrected (CLI 1.7.0, MCP 1.1.0)",
          "docs/architecture/dashboard-vision.md — Operasi Mise M1–M5 roadmap"
        ]
      },
      {
        "heading": "Dead code / drift",
        "bullets": [
          "app/(docs)/slices/page.tsx — h1 'Feature slices' → 'Slices'",
          "docs/slice-architecture.md — dangling MEMORY.md TODO removed"
        ]
      }
    ]
  }
];
