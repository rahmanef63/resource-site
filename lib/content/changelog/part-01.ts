import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "DB-DATE6",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking — pin react-day-picker to v9 (shadcn Calendar's target)",
    "body": "Root cause: the repo pinned react-day-picker ^10.0.0, but this shadcn Calendar component is generated for rdp v9; v10's breaking changes silently stopped the controlled mode/selected/onSelect path from registering day clicks (same bug in notion-page-clone). Fix: pin react-day-picker to ^9.14.0 (what the shadcn Calendar targets) and restore the canonical Popover + Calendar date picker (mode=single / mode=range).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — custom DateCalendar (drop react-day-picker)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE5",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking — decouple from react-day-picker v10 selection state",
    "body": "Dates couldn't be picked (same in notion-page-clone) — the controlled mode/selected/onSelect path broke under react-day-picker v10. The calendar now handles clicks via onDayClick and drives the selected-day + range highlight purely from `modifiers`, both fed by our own value, so it no longer relies on rdp's internal selection state machine.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date picking via onDayClick (rdp-v10-proof)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M2B2B",
    "version": "notion M2b.2b",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.2b — nested-rendering subtree (M2b complete)",
    "body": "Ported the recursive nested-block tree behind the adapter seam: NestedBlock (self-registering dispatcher) + NestedContent (by-type renderer — database via adapter.database, page nav via adapter.page, page icon via a built-in PageIcon, code via SimpleCodeBlock) + ToggleBlock + ColumnBlockEditor (split into column/panes) + SyncedBlock (split into synced/views + ChildrenList, cross-page source via pages/workspaceId) + NestedBlockControls. Completes M2b — chrome + nested rendering done. Next: M2c BlockEditor/page shell.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.2b nested rendering (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE4",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date picking reliable again — single-mode calendar + active field",
    "body": "react-day-picker range mode wasn't registering clicks. Switched the calendar to single mode (the proven path) for both modes: range now uses an active-field model (two fields, click to choose which the calendar edits — matching Notion's blue active field) with the start→end span shaded via modifiers. Picking works again.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date picking fix (single-mode active field)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE3",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date range picking + End-date toggle synced with the column header",
    "body": "Fixed: dates couldn't be picked in range mode (an empty cell passed a {from:undefined} range that broke react-day-picker's first click — now passes undefined). The cell's End-date toggle now patches prop.dateRange, the same switch the column header's edit-property panel toggles, so the two stay in sync.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — range pick fix + End-date toggle sync",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M2B2A",
    "version": "notion M2b.2a",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.2a — block toolbar wired to the adapters",
    "body": "Ported the per-block toolbar (BlockControls hub + MenuHierarchy action menu + QuickButtons/GripButton) against the frozen seam: data CRUD + selection via useEditorData/useSelection, comments via useComments (popover + count), AI panel via optional useAi. The nested-rendering subtree (toggle/columns/synced) is the next slice (M2b.2b).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.2a block toolbar (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE2",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date range: side-by-side start/end over one range calendar + clickable end time",
    "body": "Range mode now shows two date fields side by side over a single range-highlighting calendar (was two stacked calendars), matching Notion. Toggling End date seeds end=start so the end-time field is immediately enabled — fixes end time being unclickable.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — range date layout + end-time fix",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "improvement",
    "title": "Date cell editor relaid out to match notion-page-clone",
    "body": "The date-type cell popover now mirrors NCP: a date+time header row, one calendar, an inline End-date section, then the options list — so start/end time sit beside their date instead of stacked. Uses a formatted display + shadcn time input (no native date input).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — date cell editor relayout",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "CL-LINKS",
    "version": "changelog",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Changelog bullets no longer link to dead slugs",
    "body": "Bullets pointing at a slug that isn't in the catalog (renamed, merged, deleted, or WIP like notion) now render as plain text instead of linking to a 404. Valid slugs — including ones that ship later — still link.",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "changelog — sanitize bullet links against the live catalog"
        ]
      }
    ]
  },
  {
    "id": "NB-M2B1",
    "version": "notion M2b.1",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2b.1 — block-CRUD + selection/comments/AI adapter seam",
    "body": "Expanded the EditorAdapter seam: EditorDataAdapter (block + page CRUD, no-op fallback), revised SelectionAdapter, CommentsAdapter (hook + popover with no-op default), AiAdapter, plus useEditorData/useSelection/useComments/useAi context hooks. BlockShell wired to selection. Sets up the chrome port (M2b.2).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2b.1 adapter seam + BlockShell (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "RM-MDX",
    "version": "cleanup",
    "date": 1780444800000,
    "kind": "chore",
    "title": "Remove deprecated mdx-blog slice",
    "body": "Deleted mdx-blog (superseded by the notion editor). Unwired from catalog, registry, family-map, and the saas-marketing-os template copy.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          "mdx-blog — removed"
        ]
      }
    ]
  },
  {
    "id": "NB-M2A",
    "version": "notion M2a",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M2a — block rendering + editing behind the adapter",
    "body": "Block render (BlockBody, registry, built-in code block) + editing layer (slash menu, key/input/slash handlers) ported behind the EditorAdapter seam. Uploads route through the adapter; raw file inputs → FilePicker.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — M2a block render + edit (WIP cluster)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "NB-M1",
    "version": "notion M1",
    "date": 1780444800000,
    "kind": "feature",
    "title": "notion-editor M1 — cluster scaffold + decoupled pure core",
    "body": "New notion block-editor cluster (slice-of-slices). Vendored block model, 151-test pure core, and the EditorAdapter seam that inverts 13 cross-slice deps to optional host adapters.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion — new cluster + pure core (WIP)",
            "slug": "notion"
          }
        ]
      }
    ]
  },
  {
    "id": "PV-OVR",
    "version": "preview overhaul",
    "date": 1780358400000,
    "kind": "improvement",
    "title": "Content-slice previews + mdx-blog deprecation",
    "body": "Rebuilt seo/comments previews responsive; added services + testimonials previews (public + admin). mdx-blog deprecated in favour of the notion-editor.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "seo, comments — responsive previews",
            "slug": "seo"
          },
          {
            "text": "services, testimonials — new previews",
            "slug": "services"
          },
          {
            "text": "mdx-blog — deprecated",
            "slug": "mdx-blog"
          }
        ]
      }
    ]
  },
  {
    "id": "CM-THR",
    "version": "comments threading",
    "date": 1780358400000,
    "kind": "feature",
    "title": "comments — real reply threading + content-slice cleanup",
    "body": "comments gains real parentId threading + buildThread tree. Best-practice pass across mdx-blog/seo/comments (barrels, kitab purge, as-any removal).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "comments — parentId + buildThread",
            "slug": "comments"
          }
        ]
      }
    ]
  },
  {
    "id": "WS-07",
    "version": "workspace-shell",
    "date": 1780358400000,
    "kind": "feature",
    "title": "workspace-shell — clean sidebar-07 dashboard preview",
    "body": "Rebuilt the workspace-shell preview as a shadcn sidebar-07 dashboard: team switcher = atomic workspace×menuSet context, collapsible nav, nav-user footer.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "workspace-shell — sidebar-07 preview",
            "slug": "workspace-shell"
          }
        ]
      }
    ]
  },
  {
    "id": "CK1P",
    "version": "CK-1P",
    "date": 1780185600000,
    "kind": "feature",
    "title": "appshell — manifest-driven desktop + mobile OS shell, lifted from os-vps",
    "body": "New tier-3 slice: a generic, brand-free OS-style shell framework. One <AppShell manifest> wrapper provider gives any project a macOS-style window manager (drag/snap/maximize, dock with macOS click-to-focus + hover window switcher, menu bar, ⌘K Spotlight) AND an iOS-style mobile surface (home pager, app library, control center, widgets). Everything project-specific arrives through the manifest: brand, apps, features, surface regions, capabilities (data/auth/AI injection seam), persistence, keymap. The five shell features (search, inspector, notifications, control-center, widgets) ship bundled inside the slice as defineFeature() contributions that mount into named <Slot>s — `rr add appshell` installs the whole shell as one unit. Responsiveness is a single ResponsiveProvider + 4 DRY primitives (AppFrame, MasterDetail, ResponsiveToolbar, TouchList). Lift hardening: the slice was made fully self-contained (imports nothing but @/components/ui/* + @/lib/utils — ResponsiveDialog and a graceful useIsMobile were pulled in-slice), and four oversized files were split under the 200-LOC cap (store, responsive-dialog, menu-bar, mobile-app-library). Source: os-vps (Topside).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "appshell — lifted from os-vps; desktop+mobile shell, 5 features bundled (new, 0.1.0)",
            "slug": "appshell"
          }
        ]
      }
    ]
  },
  {
    "id": "CK1O",
    "version": "CK-1O",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Empties the CK-1L deferred list: newsletter rate-limit + orphaned checkEmail removed",
    "body": "Closes the last two CK-1L (Lane A) deferrals. (1) newsletter.subscribe — the lite subscribe mutation had no abuse defense beyond an email-shape check, so it now mirrors the hardened `subscribers` slice: a honeypot field (`website`), a per-email windowed rate-limit (new `newsletterSubscribeAttempts` table + `by_email_time` index, 3 attempts/hour), and an explicit `returns` validator. Idempotency + status flow unchanged; the new optional `website` arg is non-breaking. resend-newsletter 0.1.1 -> 0.1.2 (its slice.manifest.json was also stale at 0.1.0 and is corrected). (2) convex-auth — removed `convex/features/auth/checkEmail.ts`, an orphaned httpAction port (anti-enumeration email check + signin-attempt throttle) that imported non-existent `_shared/clientIp` + `_shared/origin` and queried a `loginCheckIpEvents` table defined in no schema. It was wired into no http router and called by no frontend, yet shipped to every consumer through the convex-auth `convexFiles` glob — breaking their `convex dev`. Removed rather than restored: nothing consumes it, and restoring would build an unused speculative feature (the design survives in git history if ever wanted). convex-auth 0.2.0 -> 0.2.1. Note: true per-IP rate-limiting would need an httpAction (Convex mutations can't read request headers); per-email + honeypot matches the production-grade subscribers pattern. convex/** is outside the root typecheck, so the new table's _generated types land on the next `convex dev` — code mirrors deployed slice patterns to stay correct-by-construction.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "resend-newsletter — honeypot + per-email rate-limit + returns validator on subscribe (0.1.1 -> 0.1.2)",
            "slug": "resend-newsletter"
          },
          {
            "text": "convex-auth — removed orphaned/broken checkEmail.ts (0.2.0 -> 0.2.1)",
            "slug": "convex-auth"
          }
        ]
      },
      {
        "heading": "CK-1L deferred list",
        "bullets": [
          "All three CK-1L follow-ups now closed — admin.stats gate (CK-1N), newsletter rate-limit + checkEmail (here)."
        ]
      }
    ]
  },
  {
    "id": "CK1N",
    "version": "CK-1N",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Closes CK-1L deferral: admin.stats now requireAdmin-gated",
    "body": "Follow-up to CK-1L (Lane A) closing the highest-severity deferred item: `convex/features/admin/query.ts:stats` was a public, unauthenticated `query` returning dashboard counts plus the 12 most-recent activity rows across every table — including contact-submission names/emails — so any caller could read it over WebSocket. The `admin` slice already advertised \"Gated by requireAdmin on Convex side\" in its slice.json, README, agent recipe, and catalog entry, so this is a documented-contract drift rather than a behaviour change: the handler now calls `await requireAdmin(ctx)` first (the same gate used by services/subscribers/testimonials/create-your-mcp, honouring the `SUPER_ADMIN_EMAIL` bypass). No call site in this repo is affected — the rr site's own /admin is cookie-gated and reads a local filesystem loader, never the Convex query; only consumer projects that `rr add admin` and wire `api.admin.stats` were exposed. admin slice patch bump 0.2.0 → 0.2.1. The two remaining CK-1L deferrals (newsletter per-IP rate-limit table; auth/checkEmail.ts missing `_shared` siblings) need a Convex dev loop to verify and are left for a focused pass.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "admin — stats query now requireAdmin-gated, matching its documented contract (0.2.0 → 0.2.1)",
            "slug": "admin"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "newsletter/subscribe per-IP rate-limit still needs a schema table (CK-1L item 1)",
          "auth/checkEmail.ts missing `_shared/clientIp` + `_shared/origin` + `loginCheckIpEvents` schema — restore-or-delete needs Convex verification (CK-1L item 2)"
        ]
      }
    ]
  },
  {
    "id": "CK1M",
    "version": "CK-1M",
    "date": 1779926400000,
    "kind": "improvement",
    "title": "Lane B+C: catalog→install UX + responsive + a11y P0 fixes",
    "body": "Eight P0 findings from the post-Phase-6 UI/UX + user-flow audit, shipped as one site wave (no consumer-slice API change beyond two preview pages). Flow: (1) catalog grid cards now carry a `RecentlyUpdatedBadge` corner overlay so freshness is scannable from /slices without opening each detail page — added a generic `cornerBadge` slot to `CatalogCard` (reusable by templates/layouts/recipes). (2) slice-detail HeroStrip gained a `CopyButton` next to the install command (was a truncated, un-copyable code chip — the page's primary CTA) plus an 'Already installed?' secondary line showing `npx rahman-resources update <slug>` so returning users find the update verb. (3) Branded `not-found.tsx` + `error.tsx` under `app/(docs)/` — typos/deleted-slice links + uncaught route errors now land on on-brand pages with recovery CTAs instead of the raw Next default (covers 60+ routes). Responsive + a11y: (4) slice-detail header strip stacks `flex-col` on mobile (was overflowing the action cluster below the h1 at ≤480px). (5) KIND_CLASS badge colors switched to dual-mode `text-{c}-700 dark:text-{c}-300` (were dark-only 300-level = WCAG contrast fail on light bg). Hard-rule compliance: (6) contact-form-resend preview raw `<input>/<select>/<textarea>` → shadcn `Input`/`Select`/`Textarea`/`Label` (this is the canonical contact slice consumers copy). (7) ai-router preview raw `<textarea>` → shadcn `Textarea`. (8) image-gallery block-renderer raw `<img>` (w/ eslint-disable) → `next/image` (unoptimized, since URLs are consumer-supplied). Deferred to a focused pass: /build mobile collapse (needs ThreeColumn→Tabs refactor + browser verification).",
    "groups": [
      {
        "heading": "Site",
        "bullets": [
          "CatalogCard — new `cornerBadge` slot; /slices grid shows RecentlyUpdatedBadge per card",
          "HeroStrip — CopyButton on install command + 'Already installed?' update-command line",
          "app/(docs)/not-found.tsx + error.tsx — branded 404 + error boundary with recovery CTAs",
          "slice-detail-header — flex-col mobile stack + dual-mode KIND_CLASS badge colors (WCAG)"
        ]
      },
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "contact-form-resend — preview page raw form inputs → shadcn primitives",
            "slug": "resend-newsletter"
          },
          {
            "text": "ai-router — preview page raw textarea → shadcn Textarea",
            "slug": "ai-router"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "/build mobile: collapse nested ThreeColumnLayoutAdvanced to Tabs at <md (needs browser verification)",
          "version-pin selector on install command (--ref vX.Y.Z)"
        ]
      }
    ]
  },
  {
    "id": "CK1L",
    "version": "CK-1L",
    "date": 1779926400000,
    "kind": "fix",
    "title": "Lane A: P0 security patch — 7 fixes across 8 backend slices",
    "body": "Cross-slice security batch from the post-Phase-6 audit. Zero P0 surfaced, but seven P1 findings warranted same-day patches before more slices accreted around the same patterns. Per-slice changes: (1) `payment.markPaid` now verifies `order.userId === requireUser(ctx)` so a logged-in user can no longer flip another user's order to paid by guessing the (string) orderId. (2) `payment.get` and `payment.getOrderByOrderId` are now owner-only — anon callers + non-owner authenticated callers get null instead of full order detail (amount, channel, instructions). (3) `comments.listForTarget` flipped from public `query` to `_listForTarget` `internalQuery` with default-deny semantics — consumers MUST wrap with their own target-visibility gate; ships with doc-comment example. (4) `newsletter.broadcastPublic` admin gate is now enforced (`isAdminUser` internalQuery checks `userProfiles.role==='admin'` or `SUPER_ADMIN_EMAIL`) instead of the TODO comment that any-logged-in could bypass. (5) `newsletter.subscribe` validates email shape (`^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$`) + length cap (200 chars) + normalises before insert — partial defense; per-IP rate-limit table deferred to follow-up since it needs schema migration. The canonical `subscribers` slice already has the full hardened pattern (honeypot + windowed rate-limit + unsubscribe token); recommended for production. (6) Unbounded `.collect()` on public/internal queries replaced with explicit caps: `services.listAll` 500, `socials.listAll/listVisible` 200, `testimonials.listAll` 500, `seo.callsInWindow` 1000, `newsletter.activeSubscribers` 10000. Defense-in-depth — these tables would otherwise grow unboundedly on adopted projects with no read-time guard. Eight slice patch bumps: doku-payment 0.1.1, midtrans-payment 0.1.1, resend-newsletter 0.1.1, comments 0.2.1, services 0.1.1, socials 0.1.1, testimonials 0.1.1, seo 0.2.1.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "doku-payment + midtrans-payment — markPaid owner-check + get/getOrderByOrderId owner-only (0.1.0 → 0.1.1)",
            "slug": "doku-payment"
          },
          {
            "text": "resend-newsletter — broadcastPublic admin gate + subscribe email validation (0.1.0 → 0.1.1)",
            "slug": "resend-newsletter"
          },
          {
            "text": "comments — listForTarget flipped to internalQuery default-deny (0.2.0 → 0.2.1)",
            "slug": "comments"
          },
          {
            "text": "services — listAll bounded to 500 (0.1.0 → 0.1.1)",
            "slug": "services"
          },
          {
            "text": "socials — listAll/listVisible bounded to 200 (0.1.0 → 0.1.1)",
            "slug": "socials"
          },
          {
            "text": "testimonials — listAll bounded to 500 (0.1.0 → 0.1.1)",
            "slug": "testimonials"
          },
          {
            "text": "seo — callsInWindow .collect() bounded to 1000 (0.2.0 → 0.2.1)",
            "slug": "seo"
          }
        ]
      },
      {
        "heading": "Follow-ups (deferred)",
        "bullets": [
          "newsletter/subscribe needs a `newsletterSubscribeAttempts` schema table for per-IP rate-limit on par with subscribers/mutation.ts",
          "auth/checkEmail.ts references missing `_shared/clientIp` + `_shared/origin` — restore or delete (file is functional, just unwired)",
          "convex/features/admin/query.ts:stats unauthenticated — gate for production-grade deployments"
        ]
      }
    ]
  }
];
