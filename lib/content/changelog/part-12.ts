import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "AZ",
    "version": "AZ-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Dashboard foundation rename — /admin → /dashboard/admin + workspace stubs",
    "body": "AZ-wave foundation only (mechanical URL prefix shift). Every `/preview/<template>/admin/...` route moves under `/preview/<template>/dashboard/admin/...`, freeing `dashboard/workspace/` as the new productivity surface. Permanent redirect from old URLs preserves every external link. Per-template constants split: DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE introduced; ADMIN_BASE kept as alias for backwards compat. _shared/ui/admin-shell.tsx renamed to dashboard-shell.tsx with AdminShell as deprecated alias. Workspace landing pages now render a placeholder pointing to docs/architecture/dashboard-vision.md — BA/BB waves will populate it with notion editor + calendar + command-menu + database views. No URL breaking change; no consumer-side action needed.",
    "groups": [
      {
        "heading": "Templates touched (admin → dashboard/admin + workspace stub)",
        "bullets": [
          {
            "text": "saas-marketing-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — admin moved to dashboard/admin; workspace stub added",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "wirausaha-os",
            "kind": "template"
          },
          {
            "text": "notion-page-clone-os — admin moved to dashboard/admin; workspace stub added",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          "next.config.mjs — permanent redirect /preview/:tpl/admin/:path* → /preview/:tpl/dashboard/admin/:path*",
          "_shared/ui/dashboard-shell.tsx — canonical export DashboardShell + deprecated AdminShell alias (drop-in for existing layouts)",
          "_shared/ui/workspace-placeholder.tsx NEW — minimal coming-soon card for /dashboard/workspace until BB-wave",
          "lib/content/layouts.ts — adminPreviewPath + filePaths updated for all 8 OS templates (81 path replacements)",
          "Per-template nav-config.ts — DASHBOARD_BASE / ADMIN_PANEL_BASE / WORKSPACE_BASE constants (8 templates)"
        ]
      },
      {
        "heading": "Up next (see docs/architecture/dashboard-vision.md)",
        "bullets": [
          "BA-wave — Pages restructure inside Admin Panel + RBAC / CMS-menu / Analytics / CRM / Audit-log siblings",
          "BB-wave — Workspace bootstrap (notion editor at MAX, calendar, command-menu, database views)",
          "BC-wave — feature harvest from superspace + notion-page-clone via /rr lift"
        ]
      }
    ]
  },
  {
    "id": "AY",
    "version": "AY-wave",
    "date": 1779148800000,
    "kind": "improvement",
    "title": "Session close-out — All Pages first sub-item + Dashboard vision docs",
    "body": "Tiny nav UX fix + comprehensive close-out docs so the next session resumes without retracing today's conversation. Reorder Pages sub-items so All Pages comes first (the listing surface a user opens before drilling into a specific page editor like Landing). Capture the Dashboard architectural direction (Admin Panel + Workspace split, RBAC/CRM/Analytics harvest from superspace) at docs/architecture/dashboard-vision.md, and a wave-by-wave log at docs/sessions/2026-05-19-session.md. Memory entries written so /rr in the next session auto-loads the vision + open items.",
    "groups": [
      {
        "heading": "Templates touched (Pages children re-ordered)",
        "bullets": [
          {
            "text": "saas-marketing-os — All pages first, Landing second",
            "slug": "saas-marketing-os",
            "kind": "template"
          },
          {
            "text": "personal-brand-os — All pages first",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — All pages first",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — All pages first",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — All pages first",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — All pages first",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — All pages first",
            "slug": "wirausaha-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Docs",
        "bullets": [
          "docs/architecture/dashboard-vision.md NEW — Dashboard > Admin Panel + Workspace split direction; AZ→BC wave roadmap; source map for RBAC/CRM/Analytics from superspace + notion-page-clone",
          "docs/sessions/2026-05-19-session.md NEW — wave-by-wave commit log AK→AY; flagged items for next session; process notes (200-LOC cap, pre-push build hook, wave-letter collisions)",
          "Memory entries — dashboard-vision + session-2026-05-19 + feedback-wave-letters + feedback-changelog-discipline written to /home/rahman/.claude/projects/-home-rahman-projects-resources/memory/ for cross-session auto-load"
        ]
      }
    ]
  },
  {
    "id": "AX",
    "version": "AX-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "Nested Pages nav across all 7 templates + Open-full-page button",
    "body": "Closes the AV-deferred propagation: every website template now has the Pages parent + collapsible sub-items (Landing / All pages / blog / portfolio / services where applicable). ParentNavItem rewired to the canonical shadcn NavMain idiom (group/collapsible + group-data-[state=open]/collapsible:rotate-90) — same pattern shadcn ships in its docs. FeatureBar gets a new ExternalLink button: when the active docs tab is a preview surface, the button pops the iframed content out into a real browser tab at native size.",
    "groups": [
      {
        "heading": "Templates touched (Pages parent + nested sub-items)",
        "bullets": [
          {
            "text": "personal-brand-os — Landing, All pages, Blog, Portfolio, Services, Resources",
            "slug": "personal-brand-os",
            "kind": "template"
          },
          {
            "text": "agency-studio-os — Landing, All pages, Work, Services",
            "slug": "agency-studio-os",
            "kind": "template"
          },
          {
            "text": "konsultan-os — Landing, All pages",
            "slug": "konsultan-os",
            "kind": "template"
          },
          {
            "text": "kreator-studio-os — Landing, All pages",
            "slug": "kreator-studio-os",
            "kind": "template"
          },
          {
            "text": "riset-kit — Landing, All pages",
            "slug": "riset-kit",
            "kind": "template"
          },
          {
            "text": "wirausaha-os — Landing, All pages",
            "slug": "wirausaha-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "components/templates/_shared/ui/admin-nav-items.tsx — ParentNavItem refactored to canonical shadcn NavMain idiom (group/collapsible class + CSS-driven chevron rotation, no per-item useState)",
          "components/site/feature-context.tsx — FeatureManifest.previewUrls?: { public?, admin? } so FeatureBar can resolve the surface URL without a fresh ref",
          "components/site/preview/manifest-builder.tsx — buildPreviewManifest emits previewUrls from publicPath/adminPath",
          "components/site/feature-bar.tsx — new ExternalLink button (right-side cluster) opens the active preview surface in a new tab; auto-hides on split tab and when manifest has no URL for the current surface"
        ]
      }
    ]
  },
  {
    "id": "AW",
    "version": "AW-wave",
    "date": 1779148800000,
    "kind": "feature",
    "title": "Notion Page Clone OS — nested Pages nav + landing-renderer composition",
    "body": "Applies the AV nested-nav pattern to notion-page-clone-os and rewires the public homepage to compose existing rr slices instead of a bespoke React tree. Admin sidebar now groups Landing / Snippets / All-pages under a single \"Pages\" parent (Collapsible + SidebarMenuSub). Public homepage reads admin-editable LandingSection rows from the template store and renders each via the canonical HeroBlock / FeatureGridSection / CtaBand slices, plus a custom snippets gallery section for the notion-blocks demo. Store schema bumped to v2-landing — landing-sections now first-class state managed via LANDING_UPSERT / LANDING_DELETE alongside pages + snippets.",
    "groups": [
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "notion-page-clone-os — nested Pages nav + LandingRenderer composition",
            "slug": "notion-page-clone-os",
            "kind": "template"
          }
        ]
      },
      {
        "heading": "Slices reused (no change)",
        "bullets": [
          {
            "text": "hero-block — landing hero rendered via canonical HeroBlock",
            "slug": "hero-block"
          },
          {
            "text": "feature-grid — primitive showcase via FeatureGridSection",
            "slug": "feature-grid"
          },
          {
            "text": "cta-band — landing CTA rendered via canonical CtaBand",
            "slug": "cta-band"
          },
          {
            "text": "notion-blocks — snippet gallery embeds EquationBlock + CodeBlock + NotifyMePopover",
            "slug": "notion-blocks"
          }
        ]
      },
      {
        "heading": "Site",
        "bullets": [
          "components/templates/notion-page-clone/shared/nav-config.ts — buildAdminPrimaryNav now emits nested Pages parent with landing/snippets/all-pages children",
          "components/templates/notion-page-clone/shared/store.tsx — landingSections added to State; storageKey bumped to v2-landing; LANDING_UPSERT / LANDING_DELETE reducer",
          "components/templates/notion-page-clone/slices/home/LandingRenderer.tsx NEW — switch on section.kind → HeroBlock / FeatureGridSection / CtaBand / custom SnippetsGallery",
          "components/templates/notion-page-clone/slices/home/HomePage.tsx — reads useLandingSections() filter+sort, renders via LandingRenderer"
        ]
      }
    ]
  }
];
