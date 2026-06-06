import type { ChangelogEntry } from "@/features/changelog-feed";

export const entries: ChangelogEntry[] = [
  {
    "id": "VP-SMOKE",
    "version": "variant-previews@smoke-gate",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Preview smoke gate + honest no-preview cards in the builder",
    "body": "Investigating a \"previews are missing\" report: every one of the 35 registered previews renders clean (verified live on production via headless Chromium + a new happy-dom smoke test). The real gap was silence — selected slices WITHOUT a preview (headless/server slices, opt-outs, template-base slices outside the registry) rendered nothing at all in /build, which reads as broken. The SlicePreviews panel now shows coverage (n/total) and an explicit \"No live preview — headless / server-side, or preview not yet authored\" card listing those slugs. New permanent gate: lib/preview/preview-smoke.test.tsx mounts EVERY registered preview with default variants in happy-dom on `npm test` (pre-push) — catches mount crashes and declared-component drift that tsc + the generator can't. vitest aliases now mirror tsconfig paths (@/features, @/shared dual-mapping) so tests can import through the registry.",
    "groups": [
      {
        "heading": "Infra",
        "bullets": [
          { "text": "lib/preview/preview-smoke.test.tsx — 35 previews mount-tested in happy-dom (now 357 tests total)" },
          { "text": "components/build/variant-preview.tsx — coverage header + dashed no-preview card for previewless selections" },
          { "text": "vitest.config.mts — @/features + @/shared alias parity with tsconfig (custom dual-dir resolver)" }
        ]
      }
    ]
  },
  {
    "id": "NOTION-1",
    "version": "notion@1.0.0",
    "date": 1780790400000,
    "kind": "feature",
    "title": "notion 1.0.0 — the block editor port is COMPLETE and in the catalog",
    "body": "M2c+M3+M4 land in one wave, closing the port that started 2026-06-03. M2c composes the working editor: BlockEditor + PageEditor orchestrators (dnd-kit drag with column layouts, slash menu, markdown triggers, per-block undo, paste-markdown import via a synthesized insertBlocksAfter over the seam's block CRUD), PageActionsMenu (font/width/lock/copy/duplicate/move/trash + md/html/txt export through the vendored export libs), SelectionToolbar (inline formatting), MentionTypeahead (async adapter search), DatabasePicker (delegates to adapter.database.pickDatabase), TocBlock, PageRefBlock, the page-editor chrome (title, breadcrumbs, actions, subpages, cover strip, skeleton/not-found) and a props-driven RowPropertiesPanel. M3 ports the pure convex block helpers (_blocks/_blockOps, 31 unit tests) into convex/features/notion. M4 flips the slice off WIP: version 1.0.0, public catalog entry (npx rr add notion), and a live variant preview — the full PageEditor running on a localStorage-backed in-memory EditorDataAdapter (two scenarios, every edit persists). Mount with adapter `{}` for a plain markdown block editor; wire data/selection/comments/ai/database/mention/page adapters to light up host capabilities. Source app peers that don't cross the seam (sharing, snapshots, wiki, analytics, notifications, presence) stay host-side by design.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "notion — M2c compose (28 new files) + M3 convex helpers + M4 catalog entry, preview, 1.0.0", "slug": "notion" },
          { "text": "markdown — unchanged, but the bridge note now points both ways: same grammar, blocksToMarkdown/markdownToBlocks", "slug": "markdown" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "vitest now scans convex/features/**/*.test.ts — 322 tests total (was 291)" },
          { "text": "@notion/shared vendors: database/property types, exportContext, html, databaseTable, csvCells (page → md/html export with embedded-database tables)" }
        ]
      }
    ]
  },
  {
    "id": "QA-MANIFEST",
    "version": "manifests@schema-a",
    "date": 1780790400000,
    "kind": "improvement",
    "title": "Manifest debt zeroed + previews for the freshly lifted editors",
    "body": "validate:manifests had 23 long-standing (warn-only) errors: 7 slices still shipped the legacy {name, deps, notes} manifest shape and user-management used a stability value outside the enum. All 7 are converted to Schema A (slug/version/tier/distribution/files/imports — file lists from git, imports scanned from source; preview.tsx excluded), user-management moves alpha → experimental, and the validator now reports 0 errors. The two os-vps editors lifted this morning also join the variant-preview registry (33 slugs total): code-editor with three mock-fs scenarios and media-viewer with the offline sample gallery + a data-URI remote payload.",
    "groups": [
      {
        "heading": "Manifests → Schema A",
        "bullets": [
          { "text": "image-picker, notion-database, notion-shell, notion-sidebar, selection, theme-presets — legacy shape converted; versions sourced from slice.json", "slug": "notion-database" },
          { "text": "files — converted with distribution.method \"manual\" (no slice.json yet; consumed by the notion template + image-picker page)" },
          { "text": "user-management — stability \"alpha\" → \"experimental\" (schema enum)", "slug": "user-management" }
        ]
      },
      {
        "heading": "New previews",
        "bullets": [
          { "text": "code-editor — sample-tree / markdown-doc / python-script scenarios over the writable mock fs", "slug": "code-editor" },
          { "text": "media-viewer — sample-gallery / remote-image scenarios, fully offline", "slug": "media-viewer" }
        ]
      }
    ]
  },
  {
    "id": "CODE-EDITOR",
    "version": "code-editor@1.0.0",
    "date": 1780704000000,
    "kind": "feature",
    "title": "code-editor 1.0.0 — overlay syntax editor lifted from os-vps",
    "body": "Fourth os-vps app in the catalog. A lightweight editor — transparent textarea over a highlighted pre (regex tokenizer for JS/TS/JSON/CSS), tabs with dirty dots, Cmd/Ctrl+S, status bar — plus a lazy per-directory explorer tree with inline create affordances. The lift bundles the previously app-shared file-tree into the slice and ships slice-local AppSidebar (rail ⇄ Sheet) and FormDrawer (dialog ⇄ bottom drawer) shims, so the only coupling point is lib/host.ts: configureCodeFs injects a real filesystem (list/read/write/mkdir) over the bundled writable in-memory mock. Pairs with file-explorer (onOpenFile → payload) the same way os-vps wires Files → Code.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "code-editor — NEW 1.0.0: overlay highlighting, tab strip, lazy explorer tree, injectable CodeFsAdapter + writable mock", "slug": "code-editor" },
        ],
      },
    ],
  },
  {
    "id": "MEDIA-VIEWER",
    "version": "media-viewer@1.0.0",
    "date": 1780704000000,
    "kind": "feature",
    "title": "media-viewer 1.0.0 — quick-look media viewer lifted from os-vps",
    "body": "Third os-vps app to land in the catalog, and the lightest: a macOS-Preview-style quick-look surface for image/video/audio/pdf/text. The lift follows the editors' host-seam recipe — lib/host.ts is the ONLY coupling point, with two injectable seams: configureMediaSource maps fs paths to fetchable URLs (identity default, so public URLs need zero wiring) and configureMediaOpener routes the Open-in-editor handoff to whatever shell hosts it. Launched bare it runs a fully offline sample gallery. Pairs naturally with file-explorer (onOpenFile → payload) and the image/reel editors.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          { "text": "media-viewer — NEW 1.0.0: zoomable image stage, audio/video transport players, pdf embed, editor handoff + media source seams", "slug": "media-viewer" },
        ],
      },
    ],
  },
  {
    "id": "VP6",
    "version": "variant-previews@full-catalog",
    "date": 1780790400000,
    "kind": "feature",
    "title": "Preview backfill — 31 slices in the variant-preview registry + coverage gate + Vercel demo links",
    "body": "VP-6 closes the VP wave. 28 new preview.tsx files land across the catalog (31 total in the generated registry): every marketing section, UI utility, content/data surface and previewable subsystem now renders live in the Bundle Builder with auto-generated knobs. Headless / embed / no-seam slices (ai-router, audit-log, cal-com-booking, resend-newsletter, reel-editor, seo, vector-search) explicitly opt out with `\"previews\": []` — a new audit:slices rule warns when a component-bearing slice neither declares nor opts out, and gen-preview-registry errors on an opt-out that still ships a preview.tsx. layouts.ts gains demoUrl: all 8 OS templates now link their own Vercel deployments (the dev-lab repos, always ahead of rr's snapshot) from the detail page, overriding the demo-subdomain rewrite.",
    "groups": [
      {
        "heading": "Marketing sections (variants)",
        "bullets": [
          { "text": "blog-section — layout cards/list/featured-split × columns × align", "slug": "blog-section" },
          { "text": "faq-section — layout single/two-column/grouped × align", "slug": "faq-section" },
          { "text": "feature-grid — layout cards/minimal/alternating/grouped × columns × align", "slug": "feature-grid" },
          { "text": "testimonials-grid — layout cards/quote-stack/masonry × columns × align", "slug": "testimonials-grid" },
          { "text": "portfolio-section — layout uniform/masonry/asymmetric × columns × align", "slug": "portfolio-section" },
          { "text": "pricing-page — columns 2-4 × featuredVariant ring/scale/tint", "slug": "pricing-page" },
          { "text": "changelog-feed — layout timeline/cards/list", "slug": "changelog-feed" }
        ]
      },
      {
        "heading": "UI utilities",
        "bullets": [
          { "text": "icon-picker — twemoji/native render style, picked icon previews live", "slug": "icon-picker" },
          { "text": "image-picker — Button variant × size (gallery/link/upload zero-config)", "slug": "image-picker" },
          { "text": "command-menu — palette rendered inline/open with live cmdk filtering", "slug": "command-menu" },
          { "text": "theme-presets — ThemePresetSwitcher sm/mobile under real providers", "slug": "theme-presets" },
          { "text": "selection — live marquee rubber-band select over demo rows", "slug": "selection" },
          { "text": "appshell — AppFrame scenarios: collapsed/expanded/with-topbar", "slug": "appshell" }
        ]
      },
      {
        "heading": "Content + data",
        "bullets": [
          { "text": "comments — density × resolved axes, replies persist via demo store", "slug": "comments" },
          { "text": "library — all-kinds/prompts-only/empty scenarios", "slug": "library" },
          { "text": "activity — with-stats/feed-only/empty scenarios", "slug": "activity" },
          { "text": "landing-sections — hero-only/hero-features/full-page scaled scenarios", "slug": "landing-sections" },
          { "text": "markdown + notion-database + full-width-toggle — pilots from VP-3", "slug": "markdown" }
        ]
      },
      {
        "heading": "Auth + admin + subsystems",
        "bullets": [
          { "text": "convex-auth — AuthCard methods × defaultPasswordMode, mock handlers", "slug": "convex-auth" },
          { "text": "rbac-roles — PermissionMatrix role seeds × readOnly", "slug": "rbac-roles" },
          { "text": "user-management — members/roles/teams/access scenarios, edits persist", "slug": "user-management" },
          { "text": "admin — AdminPage default/saas/blog presets", "slug": "admin" },
          { "text": "file-explorer — root/documents/projects, in-memory adapter CRUD", "slug": "file-explorer" },
          { "text": "notion-shell — CalloutBlock kind axis, editable seeded block", "slug": "notion-shell" },
          { "text": "notion-sidebar — nested-tree/with-icons/flat-list, live page CRUD", "slug": "notion-sidebar" },
          { "text": "ai-chat — with-mock-bot/unconfigured scenarios (canned reply)", "slug": "ai-chat" },
          { "text": "doku-payment — VA/QRIS/e-wallet/retail sandbox instructions", "slug": "doku-payment" },
          { "text": "midtrans-payment — single-item/cart/subscription checkout amounts", "slug": "midtrans-payment" },
          { "text": "image-editor — square/wide blank Konva docs, client-only stage", "slug": "image-editor" }
        ]
      },
      {
        "heading": "Infra",
        "bullets": [
          { "text": "gen-preview-registry — `\"previews\": []` opt-out support + stray-preview.tsx error" },
          { "text": "audit:slices — preview-coverage warning for component-bearing slices (advisory, flips to error at sustained 100%)" },
          { "text": "layouts.ts demoUrl — 8 OS templates link their Vercel dev-lab deployments; template-detail prefers it over the demo subdomain" }
        ]
      }
    ]
  },
  {
    "id": "SHELL-SYNC1",
    "version": "appshell@1.1.0 + file-explorer@1.1.0",
    "date": 1780617600000,
    "kind": "improvement",
    "title": "appshell + file-explorer synced with os-vps upstream fixes",
    "body": "Drift burn-down after the editors lift. appshell 1.1.0 ports the per-window close guard (setCloseGuard + AppProps.winId — apps can block close on unsaved work); audit confirmed multi-window, snap-grid geometry and stable capability refs were already in the rr copy. file-explorer 1.1.0 ports the Files-app UX fixes: the details panel always renders (selected entry or current folder) with a copy-path button, and mutation errors surface the REAL backend message through a friendly() mapper instead of a generic mask.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "appshell — setCloseGuard close guard + AppProps.winId plumbing (from os-vps 6644ae3)",
            "slug": "appshell"
          },
          {
            "text": "file-explorer — copy-path in details panel + honest error surfacing (lib/errors.ts friendly mapper)",
            "slug": "file-explorer"
          }
        ]
      }
    ]
  },
  {
    "id": "VP1",
    "version": "variant-previews",
    "date": 1780704000000,
    "kind": "feature",
    "title": "Variant previews + AI builder — slices preview like shadcn primitives",
    "body": "VP wave. Slices now declare a machine-readable `previews` block in slice.json (enum variant axes for leaf slices, scenario presets for subsystems) rendered by a sibling preview.tsx fed by localStorage demo data (createDemoStore, rr-demo:<slug> — client-only, zero VPS compute). gen-preview-registry.mjs emits lib/preview/{registry.gen.ts, preview-meta.gen.json} — one code-split dynamic import per slug, nothing hardcoded. The Bundle Builder mounts <VariantPreview> with auto-generated knobs for every selected slice, and a Builder AI panel (key-guarded /api/build-chat) function-calls the dynamic tool surface (list_slices / get_slice / preview_slice / compose_bundle — tool defs built at request time from the catalog + preview metadata) and renders validated preview_slice calls live. Pilots: full-width-toggle (variants), markdown (tabs × content axes), notion-database (table/board/list/chart scenarios). preview.tsx is rr-internal — `rr add` strips it. Spec: docs/SLICE-PREVIEW-SPEC.md.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "full-width-toggle — pilot leaf preview (variant axis: icon/button/segment)",
            "slug": "full-width-toggle"
          },
          {
            "text": "markdown — pilot medium preview (tabs read/crud × content basic/rich)",
            "slug": "markdown"
          },
          {
            "text": "notion-database — pilot subsystem scenarios (table/board/list/chart)",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
  {
    "id": "EDITORS-LIFT",
    "version": "image-editor@2.0.0 + reel-editor@1.0.0",
    "date": 1780617600000,
    "kind": "feature",
    "title": "Video editor lifted + image editor v2 — both self-contained, every file ≤200 LOC",
    "body": "Two os-vps creative apps land as catalog slices. reel-editor (NEW): a complete in-browser NLE — layered multi-track timeline (top row renders frontmost), one Canvas-2D draw path shared by preview AND realtime WebM exporter (real mixed audio), keyframes/easing/presets, transitions, text styling, color grading, 6 resizable workspace layouts, quick-import files pane on an injectable fs adapter (configureReelFs, in-memory mock default), sonner toasts. image-editor v2 (BREAKING): rebuilt editor replaces v1 — AI function-calling command registry (EDITOR_COMMANDS + useEditorCommands + in-editor chat) with an injectable stream bridge (configureAgentStream; chat optional), headless server.ts command runner, layer styles, tool rail chrome. Both slices were refactored upstream so every file passes the 200-LOC gate. dashboard-ide layout preview rebuilt as a real IDE: lazy explorer (per-folder fetch on expand, listing + DOM dropped on collapse — node_modules costs nothing until opened), open-file tabs, one-body editor, status bar.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "reel-editor — lifted from os-vps; self-contained host seam (sonner / no-op shell buses / injectable fs adapter); slice-local Segmented + native-range Slider primitives",
            "slug": "reel-editor"
          },
          {
            "text": "image-editor — v2.0.0 BREAKING: AI command registry + injectable configureAgentStream + headless server.ts; replaces the react-konva v1 surface",
            "slug": "image-editor"
          }
        ]
      },
      {
        "heading": "Templates touched",
        "bullets": [
          {
            "text": "dashboard-ide — real-IDE recipe: lazy explorer (RAM ≈ visible rows), tabs, breadcrumb, status bar; production swap = file-explorer FileExplorerAdapter",
            "slug": "dashboard-ide",
            "kind": "template"
          }
        ]
      }
    ]
  },
  {
    "id": "PUBGATE1",
    "version": "rahman-resources@1.10.0",
    "date": 1780617600000,
    "kind": "fix",
    "title": "Unblock CLI 1.10.0 publish — slice.json drift + structure violations",
    "body": "prepublishOnly gates were red. Fixed: image-picker deps.env string → typed object (UNSPLASH_ACCESS_KEY, scope server, optional); slice-schema gains optional deps.sharedFiles (notion-database / notion-shell already used it); version/title parity synced for resend-newsletter (0.1.3), ai-chat (0.2.0), landing-sections (0.2.0), markdown title; deleted stale template-base/frontend/slices/notion port-staging copy (R1 dual-home); AiChatFab refactored props-driven — convex/react import replaced with injected `chat` prop (R3).",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "image-picker — env dep typed (server-scoped, optional)",
            "slug": "image-picker"
          },
          {
            "text": "ai-chat — AiChatFab props-driven (`chat` prop, exported AiChatSend types)",
            "slug": "ai-chat"
          }
        ]
      }
    ]
  },
  {
    "id": "MARKDOWN2",
    "version": "markdown",
    "date": 1780531200000,
    "kind": "feature",
    "title": "markdown slice — CRUD tabs (Read/Write/Review) + mermaid diagrams + charts",
    "body": "md-reader renamed to `markdown` and maximised. <MarkdownPage> adds optional surfaces: Read (rich text), Write (raw source editor with snippet toolbar + live preview), Review (block-anchored comments with add/resolve — controlled callbacks or internal fallback). Fenced ```mermaid blocks render as SVG diagrams (dynamic-imported mermaid) and ```chart blocks as recharts bar/line/area/pie from a JSON spec. Notion sync grammar unchanged.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "markdown — MarkdownPage tabs + MermaidBlock + ChartBlock + comments model",
            "slug": "markdown"
          }
        ]
      }
    ]
  },
  {
    "id": "MD-READER1",
    "version": "md-reader",
    "date": 1780531200000,
    "kind": "feature",
    "title": "Markdown Reader slice — notion-synced rich-text page container",
    "body": "New read-only surface that renders a markdown string as a clean document (headings, lists, todo, callouts, fenced code, KaTeX, tables, images, toggles, inline marks). Sync with the notion block editor is by shared grammar: a new notion bridge (blocksToMarkdown / markdownToBlocks) serialises blocks ↔ the exact markdown this reader parses — so anything readable as a notion page is readable here, and back. Self-contained (own parser + inline renderer, no notion runtime dep). 21 tests.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "md-reader — new: MarkdownReader container + parseMarkdown + inline renderer",
            "slug": "markdown"
          },
          {
            "text": "notion — added shared/lib/markdown bridge (blocksToMarkdown / markdownToBlocks)",
            "slug": "markdown"
          }
        ]
      }
    ]
  },
  {
    "id": "DB-DATE7",
    "version": "notion-database",
    "date": 1780444800000,
    "kind": "fix",
    "title": "Date cell: back to the custom grid + range click-sequence",
    "body": "Reverting to the shadcn Calendar broke picking again (it's the unreliable part here); the self-contained DateCalendar grid is what works. Restored it and added Notion-style range picking: with End date on, click 1 = start, click 2 = end (the earlier of the two is always kept as start, so clicking before the start swaps them); clicking once a full range exists starts a fresh range.",
    "groups": [
      {
        "heading": "Slices touched",
        "bullets": [
          {
            "text": "notion-database — custom date grid + range click-sequence",
            "slug": "notion-database"
          }
        ]
      }
    ]
  },
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
