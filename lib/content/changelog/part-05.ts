import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "CD",
    "version": "CD-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "webhooks Test button — live mock POST → delivery row prepended",
    "body": "First per-block depth feature after CC adapter pattern. Clicking the per-endpoint Test button now FIRES a synthetic delivery — bindings.fire(endpointId, event?) generates a delivery with random physics (70% delivered / 20% retry / 10% failed, 60-220ms latency on success, 5s on hard fail), prepends it to the deliveries list, and bumps the endpoint's lastDeliveryAt + failingRetries counters. The Recent deliveries tab updates in real time. Paused endpoints disable the Test button with an explanatory tooltip. Side effect: a hard-failed test marks the endpoint status as 'failing' — so a few rapid Tests on a 'good' endpoint can trip the failing state, demonstrating how the real system would surface intermittent endpoint health. Demo physics are intentionally rough (70/20/10) to make the demo feel alive without requiring 10 clicks to see a non-200. EXTRACTED rollDeliveryStatus() helper in bindings.tsx so a Convex impl can override the physics with real HTTP results. Side cleanup: DeliveryTable refactored to take {deliveries, endpoints} as props (single source of truth from the orchestrator's bindings), avoiding the multi-consumer-of-bindings duplicate-state pitfall.",
    "groups": [
      {
        "heading": "Behavior",
        "bullets": [
          "Click Test → new delivery row appears at top of the Recent deliveries tab",
          "Endpoint lastDeliveryAt updates; failingRetries increments on retry/fail",
          "Paused endpoints disable Test (tooltip: 'Resume endpoint to fire')",
          "Hard-failed fire bumps endpoint status to 'failing' — visible in the Endpoints tab badge"
        ]
      },
      {
        "heading": "Files",
        "bullets": [
          "bindings.tsx — adds fire() to WebhooksBindings + rollDeliveryStatus helper (95 LOC)",
          "endpoint-row.tsx — Test button wired to onFire prop; disabled when paused",
          "WebhooksBlockView.tsx — passes onFire={() => fire(e.id)} to each row",
          "delivery-table.tsx — takes {deliveries, endpoints} props (was bindings — fixes multi-consumer duplicate-state pitfall)"
        ]
      },
      {
        "heading": "Pattern lessons",
        "bullets": [
          "Default-fallback bindings (no Provider) → ONE consumer per block, or share via props. Don't call useDefault*Bindings twice in the same render tree.",
          "Children that need block data either consume bindings (single consumer) or take props (multi consumer). Provider-wrap-self pattern deferred."
        ]
      }
    ]
  },
  {
    "id": "CC",
    "version": "CC-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "adapter pattern propagated — all 6 admin-panel blocks now go through bindings",
    "body": "Follow-up to CB users-canary. The 5 remaining blocks (audit-log / ai-config / analytics / webhooks / settings) now each ship a bindings.tsx exposing a typed `<Block>Bindings` shape, a `useDefault<Block>Bindings()` hook (in-memory + SEED, the demo default), a `<Block>BindingsProvider value={...}>` context wrapper, and a `use<Block>Bindings()` consumer with default-fallback. Each BlockView refactored to consume via the hook instead of inline useState/SEED imports — all 6 views are now data-source agnostic. ZERO user-visible change (same seeded data, same optimistic mutations). FOUNDATION COMPLETE: any future Convex / REST / external-auth wire-up is a Provider override, not a view edit. PER-BLOCK bindings shape: audit-log = events + isLoading + optional logEvent; ai-config = config + moderation + isLoading + 4 mutators; analytics = kpis + series + sources + topPages + funnel + isLoading (read-only); webhooks = endpoints + deliveries + isLoading + togglePause + remove; settings = identity + integrations + apiKeys + isLoading + setIdentity + revokeKey. View JSDocs preserve the BS-canary pattern explanation + add the CC-wave adapter note. Eject (per docs/architecture/eject-spec.md Phase 2) is now a per-block file-swap operation: replace bindings.tsx with the Convex variant, leave everything else.",
    "groups": [
      {
        "heading": "NEW files (5)",
        "bullets": [
          "_shared/admin-panel/blocks/audit-log/bindings.tsx — AuditLogBindings (37 LOC, read-mostly)",
          "_shared/admin-panel/blocks/ai-config/bindings.tsx — AiConfigBindings (57 LOC, config + moderation + mutators)",
          "_shared/admin-panel/blocks/analytics/bindings.tsx — AnalyticsBindings (46 LOC, read-only)",
          "_shared/admin-panel/blocks/webhooks/bindings.tsx — WebhooksBindings (61 LOC, endpoints + deliveries + mutators)",
          "_shared/admin-panel/blocks/settings/bindings.tsx — SettingsBindings (53 LOC, identity + integrations + apiKeys + mutators)"
        ]
      },
      {
        "heading": "Refactored",
        "bullets": [
          "5 BlockViews: drop inline useState/SEED, consume via use<Block>Bindings() hook",
          "Demo behavior identical — same seed, same mutations, same state lifecycle"
        ]
      },
      {
        "heading": "Foundation complete — what this unlocks",
        "bullets": [
          "Real Convex per block: 1 file swap (bindings.tsx → useQuery + useMutation impl)",
          "npx rr eject Phase 2: bindings.tsx is the per-block override seam, see eject-spec.md",
          "Mock for tests: wrap with <BlockBindingsProvider value={mockBindings}> in stories / Vitest",
          "External auth flows: wrap dispatcher once at root with multi-block Provider stack"
        ]
      }
    ]
  },
  {
    "id": "CB",
    "version": "CB-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "users-bindings adapter canary — block IO routed through useUsersBindings() hook",
    "body": "First adapter-pattern canary for the admin-panel blocks. Establishes the contract that lets a future Convex / REST / external auth swap happen WITHOUT touching the BlockView. NEW file: _shared/admin-panel/blocks/users/bindings.tsx exports `UsersBindings` type (users: UserRow[] + isLoading + changeRole + revoke), `useDefaultUsersBindings()` hook (in-memory useState + SEED — the demo default), `<UsersBindingsProvider value={...}>` context wrapper, and `useUsersBindings()` consumer hook that falls back to default when no Provider is in scope — so the demo iframe needs zero setup, but an ejected app or future Convex wire-up can plug in by wrapping the dispatcher with a Provider. UsersBlockView refactored to consume via the hook instead of inline useState/SEED — view is now data-source agnostic. Behavior identical for the demo (same SEED, same optimistic mutations). Pattern to replicate per block in subsequent waves (audit-log → CC, ai-config → CD, etc.) when Convex bindings come online. Foundation for npx rr eject (per docs/architecture/eject-spec.md Phase 2) and for the real-Convex canary that BS-wave's eject spec was always pointing toward.",
    "groups": [
      {
        "heading": "NEW file",
        "bullets": [
          "_shared/admin-panel/blocks/users/bindings.tsx — UsersBindings + useDefaultUsersBindings + UsersBindingsProvider + useUsersBindings (65 LOC)"
        ]
      },
      {
        "heading": "Refactored",
        "bullets": [
          "UsersBlockView.tsx — drops inline useState/SEED, consumes via useUsersBindings(); view now data-source agnostic",
          "JSDoc updated: BS-canary pattern + CB-wave adapter pattern explanation"
        ]
      },
      {
        "heading": "Why this matters",
        "bullets": [
          "Real Convex swap (future): wrap dispatcher with <UsersBindingsProvider value={convexBindings}> — view code untouched",
          "npx rr eject (future): bindings.tsx is the file the ejected app rewrites to wire its own backend",
          "BSDL trauma avoided: no sync engine, no auto-detect, no .kitab.json — just a plain Provider override",
          "Audit suggestion (BY-wave): adapter pattern next — done for users canary; 5 more blocks to follow same shape"
        ]
      }
    ]
  },
  {
    "id": "CA",
    "version": "CA-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "/docs/architecture page refresh — current state of subdomain + dispatcher + block patterns",
    "body": "The /docs/architecture page was stale (described the old template-base/ structure that no longer exists in this repo, didn't mention any of the BR→BZ waves). Rewritten to reflect today's actual state: (1) wildcard subdomain routing diagram (request → proxy.ts → host-resolve → path rewrite → BlockView), (2) AdminFeatureStubPage dispatcher pattern with the actual 7-line switch + an 8×6 block × template coverage matrix showing the 48-routes-from-one-dispatcher leverage, (3) per-block file shape (types + seed + view + sub-components ≤200 LOC, with shared chrome from _shared/admin-panel/ui/), (4) hard rules updated (added LOC cap + audit chain + no-marketing-chrome-on-workspace + proxy.ts-not-middleware), (5) NEW wave-progression timeline section showing BR→CA at a glance. Portfolio-grade: a viewer can understand the system in 30 seconds. Single file, 135 LOC.",
    "groups": [
      {
        "heading": "Sections",
        "bullets": [
          "Subdomain routing — ASCII flow diagram (proxy.ts → AdminFeatureStubPage)",
          "Admin-panel dispatcher pattern — actual code + 8×6 coverage matrix",
          "Block file shape — _shared/admin-panel/ui/ + blocks/<segment>/ tree",
          "Hard rules — refreshed (NO Clerk / shadcn-only / copy-first / stack lock / ≤200 LOC / audit chain / no marketing chrome / proxy.ts)",
          "Wave progression — BR / BS-BX / BY / BZ / CA quick timeline"
        ]
      },
      {
        "heading": "What this isn't",
        "bullets": [
          "Not a tutorial (Notion-clone vs Notion comparison page lives elsewhere)",
          "Not a deploy guide (separate /docs section)",
          "Not a slice deep-dive (per-slice pages at /slices/<slug>)"
        ]
      }
    ]
  },
  {
    "id": "BZ",
    "version": "BZ-wave",
    "date": 1779321600000,
    "kind": "improvement",
    "title": "notion-page-clone-os — strip marketing chrome, full-bleed workspace (real Notion-like)",
    "body": "User request: 'tidak perlu ada header dan footer ... langsung saja workspacenya'. Template now opens directly into the Notion-clone workspace at the root URL (demo-nosion.rahmanef.com) with NO marketing header / footer / SiteShell wrapping. Behaves like the real Notion app, not a marketing site about one. CHANGES: (1) app/preview/notion-page-clone-os/public/layout.tsx — stripped SiteShell, PUBLIC_NAV, FOOTER_COLUMNS, brand object — now just Suspense + StoreProvider passthrough. Metadata preserved. (2) Dashboard.tsx h-[calc(100vh-8rem)] min-h-[640px] rounded border → h-dvh bg-background (full-bleed viewport, no rounded card). (3) DELETED dead components/templates/notion-page-clone/slices/home/ (HomePage + LandingRenderer never imported since BD-wave). (4) RESTYLED [...slug] catch-all: was meant to render custom pages INSIDE the SiteShell chrome; now renders standalone with a thin 'back to workspace' header at top + centered max-w-3xl canvas — mirrors Notion's 'publish to web' UX. Audit-bp's Pages CRUD requirement satisfied (8/8 templates have catch-all). (5) layouts.ts file manifest cleaned (HomePage.tsx ref removed). nav-config.ts kept (still consumed by the /dashboard side admin routes for ADMIN_BASE / PUBLIC_BASE / ADMIN_PANEL_BASE constants).",
    "groups": [
      {
        "heading": "User-visible at demo-nosion.rahmanef.com",
        "bullets": [
          "Root / → immediate Notion workspace (sidebar + welcome doc, full viewport)",
          "Sidebar CRUD (create / rename / delete / move) — unchanged",
          "/d/<id> → doc view, /db/<id> → database view (both full-bleed)",
          "/<custom-slug> → published custom page, standalone with back-to-workspace link",
          "No marketing landing, no top-navbar, no footer columns"
        ]
      },
      {
        "heading": "Files",
        "bullets": [
          "MODIFIED app/preview/notion-page-clone-os/public/layout.tsx — bare StoreProvider",
          "MODIFIED components/templates/notion-page-clone/slices/notion-app/Dashboard.tsx — h-dvh",
          "MODIFIED app/preview/notion-page-clone-os/public/[...slug]/catch-all-renderer.tsx — standalone framing",
          "DELETED components/templates/notion-page-clone/slices/home/ (HomePage + LandingRenderer)",
          "MODIFIED lib/content/layouts.ts — removed dead HomePage.tsx ref from manifest"
        ]
      },
      {
        "heading": "Not affecting",
        "bullets": [
          "Other 7 templates (konsultan / personal-brand / kreator / wirausaha / agency / saas / riset) — still keep marketing SiteShell, unchanged",
          "Admin side (/admin/...) — DashboardShell + sidebar unchanged",
          "Audit chain: 44 slices · 679 template files · pages-CRUD requirement still satisfied via standalone-render catch-all"
        ]
      }
    ]
  },
  {
    "id": "BY",
    "version": "BY-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "files slice lifted from open-silong — storage-adapter pattern reference",
    "body": "The `files` slice ships as the first proof of the storage-adapter pattern that unlocks the remaining open-silong blocked-pending-adapter wave (cover, workspace-io, templates, ai-agent, inbox, feedback, workspace-members, library, mobile-nav). Slice surface: <FileUploadButton>, <FileChip>, useFileUpload(), useFileUrl() — every read/write/url-resolve flows through a host-supplied FilesAdapter (upload + remove + useUrl). Bundled adapter: useLocalStorageFilesAdapter (data-URL bucket; small files only, capped by browser localStorage quota). Host wires its own via <FilesAdapterProvider adapter={...}> — open-silong drops in a Convex-backed adapter, an S3 deployment writes an S3 adapter, the rr demo uses the bundled localStorage one. The slice itself has ZERO backend coupling; the source-of-truth lives at https://github.com/rahmanef63/open-silong and syncs lift-only via scripts/sync-to-rr.mjs.",
    "groups": [
      {
        "heading": "NEW files (synced from open-silong)",
        "bullets": [
          "frontend/slices/files/adapter/types.ts — FilesAdapter interface",
          "frontend/slices/files/adapter/context.tsx — Provider + useFilesAdapter()",
          "frontend/slices/files/adapter/localStorageAdapter.ts — bundled demo adapter",
          "frontend/slices/files/{hooks,components,lib,types}/* — pure consumers of the adapter"
        ]
      },
      {
        "heading": "Catalog",
        "bullets": [
          "lib/content/slices.ts — new slug `files` entry with tag `notion-like` + `adapter` + `portable`",
          {
            "text": "Pattern reference for the remaining open-silong adapter wave",
            "slug": "notion-shell",
            "kind": "slice"
          }
        ]
      },
      {
        "heading": "Skip-list",
        "bullets": [
          "open-silong-side rr-sync.json adds `convexAdapter.tsx` to skipFiles — the Convex production adapter never ships to rr, only the localStorage demo + the host-pluggable contract."
        ]
      }
    ]
  },
  {
    "id": "BX",
    "version": "BX-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "admin-panel/settings real impl — sixth + final BS-pattern block (100% block coverage)",
    "body": "Sixth and final admin-panel block graduates from generic AdminFeatureCard stub to a real interactive view. ALL 6 ADMIN PANEL BLOCKS NOW REAL (users + audit-log + ai-config + analytics + webhooks + settings). SettingsBlockView ships with a 4-tab layout (Identity / Integrations / API keys / Danger zone). Identity tab: live editable workspace name + URL slug (auto-sanitized to a-z0-9-) + timezone Select (7 IANA zones) + language Select (4 locales) + contact email — all wired to local state. Integrations tab: 6-service grid (Slack messaging, Resend email, Stripe payments, Vercel deploy, GitHub vcs, DOKU payments) each with connected/disconnected/error status badge, category label, status detail line, Connect/Configure/Reconnect button, and docs link. API keys tab: 3 seed keys with scope badge (read / read-write / admin), masked tail, created date + last-used relative, copy button, revoke action (wired). Danger zone: 3 destructive actions (Transfer ownership / Archive workspace / Delete workspace) with descriptive subtext and destructive Button variant. Pattern identical to prior 5: _shared/admin-panel/blocks/settings/{types, seed, view, identity-form, integration-grid, api-keys-list} + final dispatch case. AdminFeatureStubPage's comment block updated to reflect 100% coverage. AdminFeatureCard retained as fallback for any future segment added to ADMIN_PANEL_BLOCKS before a real view ships.",
    "groups": [
      {
        "heading": "NEW files",
        "bullets": [
          "_shared/admin-panel/blocks/settings/types.ts — WorkspaceIdentity + IntegrationStatus + Integration + ApiKey",
          "_shared/admin-panel/blocks/settings/seed.ts — DEFAULT_IDENTITY + 7 TIMEZONES + 4 LANGUAGES + 6 INTEGRATIONS + 3 SEED_KEYS + tone tables",
          "_shared/admin-panel/blocks/settings/SettingsBlockView.tsx — orchestrator (4-tab + DangerZone)",
          "_shared/admin-panel/blocks/settings/identity-form.tsx — name + slug auto-sanitize + timezone + language + email",
          "_shared/admin-panel/blocks/settings/integration-grid.tsx — 6-service status grid",
          "_shared/admin-panel/blocks/settings/api-keys-list.tsx — list with revoke + masked tail + last-used relative"
        ]
      },
      {
        "heading": "Dispatcher final state",
        "bullets": [
          "AdminFeatureStubPage: added `if (segment === \"settings\") return <SettingsBlockView />;` case",
          "Comment updated: BS-canary → BX-wave (2026-05-20 → 2026-05-21) — all 6 blocks real",
          "AdminFeatureCard retained as the future-segment fallback"
        ]
      },
      {
        "heading": "Final coverage",
        "bullets": [
          "6 / 6 admin-panel blocks real (users · audit-log · ai-config · analytics · webhooks · settings) — 100%.",
          "All 8 templates inherit all 6 real blocks via the shared dispatcher. Single edit propagates to 48 admin-panel routes (8 templates × 6 blocks).",
          "BS-pattern (per-block: types + seed + view + sub-components + single-line dispatch case + ≤200 LOC cap) proven end-to-end."
        ]
      },
      {
        "heading": "What's next",
        "bullets": [
          "Templates pivot — real Convex bindings for blocks that have a slice (users → rbac-roles, audit-log → audit-log, analytics → event-tracking, ai-config → ai-router). Webhooks + settings need new canonical slices.",
          "Optional: extract a Mermaid/SVG architecture diagram for the dispatcher → block pattern, surface on /docs.",
          "Optional: build `npx rr eject` per docs/architecture/eject-spec.md when commercialize trigger fires."
        ]
      }
    ]
  },
  {
    "id": "BW",
    "version": "BW-wave",
    "date": 1779321600000,
    "kind": "feature",
    "title": "admin-panel/webhooks real impl — fifth BS-pattern block",
    "body": "Fifth admin-panel block graduates from generic AdminFeatureCard stub to a real interactive view. WebhooksBlockView ships with a 3-tab layout (Endpoints / Recent deliveries / Payload format) inside a shadcn Tabs. Endpoints tab shows 4 seed endpoints (Zapier CRM, Slack #ops, internal audit mirror, staging sandbox) with per-row status badge (active / paused / failing), event chips, masked secret tail, Test button, and a DropdownMenu with Pause/Resume + Rotate secret + Delete — all wired to local state so toggle/remove work live. Failing endpoint shows retry counter. Deliveries tab is a 12-row table (when, endpoint, event, status badge, HTTP code, ms, attempt-multiplier marker, replay action) covering delivered/failed/retry/pending. Payload tab shows a sample event body + the HMAC-SHA256 signature header consumers must verify (with 5-min replay protection note). Pattern identical to prior 4 blocks: _shared/admin-panel/blocks/webhooks/{types, seed, view, endpoint-row, delivery-table} + single dispatch case. No canonical slice yet — schema here would seed a future frontend/slices/webhooks/.",
    "groups": [
      {
        "heading": "NEW files",
        "bullets": [
          "_shared/admin-panel/blocks/webhooks/types.ts — WebhookEventName (8) + EndpointStatus (3) + WebhookEndpoint + DeliveryStatus (4) + WebhookDelivery",
          "_shared/admin-panel/blocks/webhooks/seed.ts — STATUS_META + DELIVERY_META tone tables + 4 endpoints + 12 deliveries + SAMPLE_PAYLOAD + SAMPLE_SIGNATURE",
          "_shared/admin-panel/blocks/webhooks/WebhooksBlockView.tsx — orchestrator (header stats + 3-tab Endpoints/Deliveries/Payload)",
          "_shared/admin-panel/blocks/webhooks/endpoint-row.tsx — row with Test + DropdownMenu (Pause/Resume/Rotate/Delete) + event chips + secret tail",
          "_shared/admin-panel/blocks/webhooks/delivery-table.tsx — 12-row recent deliveries grid with replay button"
        ]
      },
      {
        "heading": "Dispatcher update",
        "bullets": [
          "AdminFeatureStubPage: added `if (segment === \"webhooks\") return <WebhooksBlockView />;` case"
        ]
      },
      {
        "heading": "Coverage",
        "bullets": [
          "5 of 6 admin-panel blocks now real (users, audit-log, ai-config, analytics, webhooks). Only settings remains as placeholder.",
          "All 8 templates' webhooks routes auto-updated via shared dispatcher."
        ]
      }
    ]
  }
];
