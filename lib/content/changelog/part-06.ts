import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "BV",
    "version": "BV-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "admin-panel/analytics real impl — fourth BS-pattern block (recharts)",
    "body": "Fourth admin-panel block graduates from generic AdminFeatureCard stub to a real interactive view — first one to use charts. AnalyticsBlockView ships with 4 KPI cards (page views, sessions, conversion, bounce rate — each with signed delta-vs-prev-period and good/bad coloring), a 30-day stacked area chart (views + sessions, recharts via shadcn chart wrapper with proper CSS-variable theming), a traffic-source donut + legend (Direct / Organic search / Referral / Social / Email with deterministic visit counts), a 5-step conversion funnel showing drop-off % between steps, and a top-pages table (path / title / avg duration / bounce rate / views). Range chips (7d/30d/90d) wired but seed is single 30-day series. Pattern identical to BS+BT+BU: _shared/admin-panel/blocks/analytics/{types, seed, AnalyticsBlockView, traffic-chart, sources-donut, funnel-and-pages} + a single dispatch case. All 8 templates' /admin/admin-panel/analytics routes auto-updated. Backed by frontend/slices/event-tracking/ (today config-only — events schema + ingest endpoint deferred to a separate wave that wires real Convex writes).",
    "groups": [
      {
        "heading": "NEW files",
        "bullets": [
          "_shared/admin-panel/blocks/analytics/types.ts — DayPoint + TrafficSource + PageStat + FunnelStep + KpiCardData",
          "_shared/admin-panel/blocks/analytics/seed.ts — buildSeries() deterministic 30-day series + 4 KPI cards + 5 sources + 6 top pages + 5-step funnel",
          "_shared/admin-panel/blocks/analytics/AnalyticsBlockView.tsx — orchestrator (header range chips + KPI grid + chart + donut + funnel + top-pages table)",
          "_shared/admin-panel/blocks/analytics/traffic-chart.tsx — recharts AreaChart with gradient fills via shadcn ChartContainer + ChartConfig",
          "_shared/admin-panel/blocks/analytics/sources-donut.tsx — recharts PieChart donut + legend list with visit counts + %",
          "_shared/admin-panel/blocks/analytics/funnel-and-pages.tsx — FunnelList (drop-off % per step) + TopPagesTable"
        ]
      },
      {
        "heading": "Dispatcher update",
        "bullets": [
          "AdminFeatureStubPage: added `if (segment === \"analytics\") return <AnalyticsBlockView />;` case",
          {
            "text": "Real impl backed by event-tracking slice",
            "slug": "event-tracking",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Coverage",
        "bullets": [
          "4 of 6 admin-panel blocks now real (users, audit-log, ai-config, analytics). 2 still placeholder (webhooks, settings).",
          "All 8 templates' analytics routes auto-updated via shared dispatcher. Zero per-template touchpoints."
        ]
      }
    ]
  },
  {
    "id": "BU",
    "version": "BU-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "admin-panel/ai-config real impl — third BS-pattern block",
    "body": "Third admin-panel block graduates to a real interactive view. AiConfigBlockView ships with 4 providers (Anthropic, OpenAI, Mistral, Google), 10 models across 3 tiers (fast / balanced / frontier) with per-model context window + input/output cost per 1M tokens, an active-model picker grouped by provider in a shadcn Select with full pricing metadata in each option, system prompt textarea (4000 char cap, live counter), temperature + max-output-tokens sliders, and a moderation rule list with 5 rules (toxicity threshold, PII redaction, off-topic refusal, competitor mention threshold, external-link allowlist) each toggleable via Switch with graded rules exposing a 0-1 Slider for threshold. Reset button restores defaults. Provider cards show status badge (connected / missing-key / rate-limited), masked key tail, and docs link. Pattern identical to BS+BT: _shared/admin-panel/blocks/ai-config/{types, seed, AiConfigBlockView, provider-card, moderation-row, knobs} + a single dispatch case in AdminFeatureStubPage. All 8 templates' /admin/admin-panel/ai-config routes auto-updated. Backed by frontend/slices/ai-router/ (barrel-only today, real impl deferred until a separate wave wires provider adapters + a Convex key vault).",
    "groups": [
      {
        "heading": "NEW files",
        "bullets": [
          "_shared/admin-panel/blocks/ai-config/types.ts — ProviderId + ProviderStatus + AiProvider + ModelTier + AiModel + ModerationRule + AiConfig",
          "_shared/admin-panel/blocks/ai-config/seed.ts — 4 providers + STATUS_META + TIER_META + 10 models + DEFAULT_CONFIG + DEFAULT_MODERATION (5 rules)",
          "_shared/admin-panel/blocks/ai-config/AiConfigBlockView.tsx — orchestrator (header stats + provider grid + active model card + prompt+sampling + moderation list)",
          "_shared/admin-panel/blocks/ai-config/provider-card.tsx — provider tile (status badge + masked key + rotate/connect button + docs link)",
          "_shared/admin-panel/blocks/ai-config/moderation-row.tsx — rule row (Switch + optional threshold Slider)",
          "_shared/admin-panel/blocks/ai-config/knobs.tsx — Stat tile + Knob slider+label helpers (extracted to keep orchestrator ≤200 LOC)"
        ]
      },
      {
        "heading": "Dispatcher update",
        "bullets": [
          "AdminFeatureStubPage: added `if (segment === \"ai-config\") return <AiConfigBlockView />;` case",
          {
            "text": "Real impl backed by ai-router slice (today barrel-only)",
            "slug": "ai-router",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Coverage",
        "bullets": [
          "3 of 6 admin-panel blocks now real (users, audit-log, ai-config). 3 still placeholder (analytics, webhooks, settings).",
          "All 8 templates' ai-config routes auto-updated via shared dispatcher. Zero per-template touchpoints."
        ]
      }
    ]
  },
  {
    "id": "CK1D",
    "version": "CK-1D",
    "date": 1779235200000,
    "kind": "feature",
    "title": "workspace-shell lifted from superspace — atomic NavContext",
    "body": "New full-stack slice `workspace-shell` lifted from superspace. Unified workspace + menu navigation primitive replacing the silo'd menu-store + workspace-store. NavContext = (workspaceId, menuSetId) atomic pair with resolver chain (user cache → user assignment → workspace default → none). 2-tier dropdown switcher (workspace radio + menuSet picker), ContextBadge header chip, full editor with tabs (menus / workspace tree / settings), tiered RBAC (menus.manage for admin, menus.fork for user-personal copy). Convex tables prefixed `workspaceShell_*` (7 tables: menuSets, menuItems, itemComponents, wsAssignments, userAssignments, rolePerms, navContext). Audit-log dependency is graceful (try/catch — slice still works if audit-log not installed). 7-phase rollout: P0 scaffold + trio + schema → P1 idempotent migration menus/* → workspaceShell_* (in-memory map for 4096 read-op limit) → P2 NavContextProvider + useNavContext hook + getEffectiveMenuItems with role filter → P3 WorkspaceSwitcher v2 + ContextBadge + MenuSetPicker → P4 editor tabs with CRUD mutations → P5 dual-read wiring into primary sidebar (NavContext primary, legacy fallback) → P6 30-day deprecation shims for menu-store + workspace-store (auto-removal 2026-06-19).",
    "groups": [
      {
        "heading": "New slice",
        "bullets": [
          {
            "text": "workspace-shell 1.0.0 — atomic NavContext primitive",
            "slug": "workspace-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Tables (workspaceShell_*)",
        "bullets": [
          "menuSets / menuItems / itemComponents",
          "wsAssignments / userAssignments / rolePerms",
          "navContext — per-user atomic (wsId, menuSetId) cache"
        ]
      },
      {
        "heading": "Components",
        "bullets": [
          "NavContextProvider + useNavContext + useNavContextRequired",
          "WorkspaceSwitcher — 2-tier dropdown",
          "MenuSetPicker — 3-tier (user / workspace / system) radio",
          "ContextBadge — header chip",
          "DeprecationBanner — 30-day countdown for legacy shims"
        ]
      },
      {
        "heading": "RBAC",
        "bullets": [
          "menus.manage — admin edits workspace-default menuSet",
          "menus.fork — user creates personal copy via forkMenuSet",
          "menus.view / savedViews.{view,manage,manage_shared} — already shipped"
        ]
      }
    ]
  },
  {
    "id": "BT",
    "version": "BT-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "admin-panel/audit-log real impl — second BS-pattern block (after Users)",
    "body": "Second admin-panel block graduates from generic AdminFeatureCard stub to real interactive view. AuditLogBlockView ships with 14 seed events covering all 10 actions (create/update/delete/publish/unpublish/invite/revoke/login/logout/export) across 8 entity types (page/user/role/webhook/setting/post/workflow/session) at 3 severities (info/warn/alert). Interactive filters: text search across actor + entity + diff, action chip filter (8 chips), severity chip filter (4 chips), live count badge. Each event row shows actor avatar + name, action badge with tone, entity type → entity label, optional diff summary (e.g. `permissions: +manage:workflows`), relative timestamp, IP, entity id. Pattern identical to BS Users canary: _shared/admin-panel/blocks/audit-log/{types.ts, seed.ts, AuditLogBlockView.tsx, event-row.tsx} + a single dispatch case in AdminFeatureStubPage. Single edit → all 8 templates' /admin/admin-panel/audit-log routes serve the real UI. Backed by frontend/slices/audit-log/ contract (AuditLogBindings → real Convex impl post-eject, see eject-spec.md). NEXT BLOCKS (4 remaining, one wave each): ai-config / analytics / webhooks / settings.",
    "groups": [
      {
        "heading": "NEW files",
        "bullets": [
          "_shared/admin-panel/blocks/audit-log/types.ts — AuditAction (10) + AuditEntityType (8) + AuditSeverity (3) + AuditEventRow shape mirroring slice's AuditEvent",
          "_shared/admin-panel/blocks/audit-log/seed.ts — ACTION_META + SEVERITY_META tone tables + 14 demo events",
          "_shared/admin-panel/blocks/audit-log/AuditLogBlockView.tsx — header stats + 3 severity cards + filter bar + filtered list",
          "_shared/admin-panel/blocks/audit-log/event-row.tsx — EventRow + SeverityCard + formatRelative helpers (extracted to keep view ≤200 LOC)"
        ]
      },
      {
        "heading": "Dispatcher update",
        "bullets": [
          "AdminFeatureStubPage: added `if (segment === \"audit-log\") return <AuditLogBlockView />;` case",
          {
            "text": "Users block remains live from BS-wave (unchanged)",
            "slug": "rbac-roles",
            "kind": "slice"
          },
          {
            "text": "Real-impl pattern backed by audit-log slice contract",
            "slug": "audit-log",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Coverage",
        "bullets": [
          "2 of 6 admin-panel blocks now real (users, audit-log). 4 still placeholder (ai-config, analytics, webhooks, settings).",
          "All 8 templates' audit-log routes auto-updated via shared dispatcher. Zero per-template touchpoints."
        ]
      }
    ]
  },
  {
    "id": "BS",
    "version": "BS-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "notion-like tag + theme-presets slice + lift-status audit (open-silong sync round 1)",
    "body": "Round 1 of pushing every nosion (open-silong) slice into rr. Outcome: 6 slices truly synced + tagged (1 NEW + 5 pre-existing), 31 slices identified as blocked-pending-adapter due to convex coupling, missing shared primitives (responsive-dialog / responsive-alert-dialog), or lucide-react version drift (rr ^1.16 vs nosion ^0.462). Tag `notion-like` added to all open-silong-derived catalog entries so consumers can filter by source upstream. Lift status audit lives upstream in docs/rr-sync/lift-status.md.",
    "groups": [
      {
        "heading": "NEW slice",
        "bullets": [
          {
            "text": "theme-presets — tweakcn theme preset loader + 30+ color schemes (no backend, pure React + Tailwind v4 + next-themes; storage key `nosion:theme-preset` preserved verbatim for back-compat)",
            "slug": "theme-presets",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "`notion-like` tag added (5 entries)",
        "bullets": [
          {
            "text": "command-menu — renderless ⌘K",
            "slug": "command-menu",
            "kind": "slice"
          },
          {
            "text": "icon-picker — emoji + lucide picker",
            "slug": "icon-picker",
            "kind": "slice"
          },
          {
            "text": "notion-blocks — 4-primitive bundle",
            "slug": "notion-blocks",
            "kind": "slice"
          },
          {
            "text": "notion-shell — 18-component wrapper set",
            "slug": "notion-shell",
            "kind": "slice"
          },
          {
            "text": "theme-presets — NEW (above)",
            "slug": "theme-presets",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Blocked-pending-adapter (31 slices, registry tracked at rr-sync.json upstream)",
        "bullets": [
          "Convex coupling (admin-panel:18, editor:10, feedback:3, comments:3, ai-agent/cover/files/inbox/templates/workspace-io:2 each, plus 6 with 1 convex import) — need adapter pattern + storage-adapter interface to lift",
          "Missing shared primitives — responsive-dialog, responsive-alert-dialog need lift first OR slice must adopt @/components/ui/dialog wrapper",
          "lucide-react version drift — rr ^1.16 (missing Github icon used by shared/icon-picker copy); resolve via bump or icon swap",
          "Nosion-named source files (comments/adapters/nosionStandalone.ts, command-palette/adapters/NosionCommandPalette.tsx) — scrub script renames CONTENT but not file BASENAMES; need post-scrub rename step"
        ]
      },
      {
        "heading": "How to query (consumers)",
        "bullets": [
          "rr catalog UI filter by tag `notion-like` shows everything open-silong-derived",
          "node scripts/rr-sync-status.mjs (upstream) shows file-level drift for the 6 truly-synced",
          "docs/rr-sync/lift-status.md (upstream) lists every slice + status + blocker reason"
        ]
      }
    ]
  },
  {
    "id": "BR",
    "version": "BR-wave",
    "date": 1779235200000,
    "kind": "feature",
    "title": "Wildcard subdomain demo routing — 8 templates × portfolio-grade domain via host-based rewriter (one codebase, zero sync)",
    "body": "8 website templates now each get a portfolio-quality demo URL: demo-konsultan.rahmanef.com, demo-personal-branding.rahmanef.com, etc. ARCHITECTURE: all 8 subdomains resolve to the same Next.js deployment — proxy.ts inspects the Host header and rewrites /demo-<short>.rahmanef.com → /preview/<slug>/public (or /admin → /preview/<slug>/dashboard/admin). Zero fork, zero sync engine, zero webhook. Editing any template in rr → push to main → Dokploy rebuilds → all 8 subdomains reflect change in next request because they ARE the same codebase, just different entry points. CHOSEN OVER FORK-rr-per-template (rejected — 95% dead-weight: catalog, CLI, MCP, 38 other layouts) AND multi-tenant single-deployment without subdomain (rejected — no portfolio storytelling value). FILES: lib/content/template-subdomains.ts (NEW — SSOT map subdomain→slug, helpers resolveDemoSlug + getDemoUrl); proxy.ts (NEW — Next.js 16 root proxy, pass-through for _next/api/brand-assets/favicon/sitemap/robots/llms, rewrite for demo-* hosts); components/site/template-detail.tsx (Live demo button on /layouts/<slug> detail page); docs/architecture/subdomain-routing.md (NEW — full ops doc for Cloudflare wildcard DNS + Dokploy custom domain + SSL setup). MANUAL OPS REQUIRED (Rahman, one-time): (1) Cloudflare DNS add wildcard A record *.rahmanef.com → Dokploy IP, proxied. (2) Dokploy add *.rahmanef.com to resource-site deployment custom domains. (3) Verify SSL via Cloudflare proxy (orange cloud) OR Let's Encrypt DNS-01.",
    "groups": [
      {
        "heading": "NEW infrastructure",
        "bullets": [
          "lib/content/template-subdomains.ts — SSOT mapping (subdomain → slug); resolveDemoSlug(host) + getDemoUrl(slug) helpers",
          "proxy.ts — Next 16 root proxy, host-based rewriter with safe pass-through list (_next, api, brand-assets, favicon, sitemap, robots, llms, manifest)",
          "docs/architecture/subdomain-routing.md — Cloudflare + Dokploy ops walkthrough"
        ]
      },
      {
        "heading": "8 demo subdomains live (after DNS+Dokploy setup)",
        "bullets": [
          "demo-personal-branding.rahmanef.com → personal-brand-os",
          "demo-konsultan.rahmanef.com → konsultan-os",
          "demo-kreator.rahmanef.com → kreator-studio-os",
          "demo-wirausaha.rahmanef.com → wirausaha-os",
          "demo-riset.rahmanef.com → riset-kit",
          "demo-agency.rahmanef.com → agency-studio-os",
          "demo-saas.rahmanef.com → saas-marketing-os",
          "demo-nosion.rahmanef.com → notion-page-clone-os"
        ]
      },
      {
        "heading": "User-visible",
        "bullets": [
          "Each /layouts/<slug> detail page (template subset) now shows a 'Live demo' button linking to the matching subdomain",
          "Subdomain root → public landing. /admin → dashboard admin panel. localStorage isolated per subdomain."
        ]
      },
      {
        "heading": "What this is NOT",
        "bullets": [
          "Not a per-template repo fork (rejected — inherits 95% dead-weight)",
          "Not a per-template Convex backend (deferred — `npx rr eject` future CLI)",
          "Not affecting rahmanef.com personal site (different deployment, untouched)",
          "Not affecting resource.rahmanef.com canonical main site (pass-through)"
        ]
      }
    ]
  }
];
