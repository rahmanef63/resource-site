# CHANGELOG

Release history for the Rahman Resources monorepo. Tracks the rr site,
canonical slices, templates, CLI, and MCP server.

Format: keep-a-changelog-ish. Per-release sections list **CLI**, **Slices**,
**Templates**, and **Site** changes where applicable. The CLI version is
the user-facing handle (`npx rahman-resources@x.y.z`).

---

## [Unreleased]

### 2026-06-07 — backfill: library slice changelog entry (lift 2c3b745, 2026-05-30)

- The `library` 0.1.0 lift registered the catalog entry + manifest but skipped
  its ChangelogEntry, so `RecentlyUpdatedBadge` never fired for the slice.
  Backfilled `LIFT-LIBRARY` (dated 2026-05-30): polymorphic 6-kind resource
  hub — prompts / images / videos / links / downloads / snippets — Convex
  schema + index-bounded queries, filterable grid, detail with copy +
  opt-in upvote. No code change.

### 2026-06-07 — loading-states: skeleton + spinner SSOT (UX wave U8)

**Slices**

- New `loading-states` 0.1.0 — `LoadingSkeleton` with seven kind presets
  (text / card / list / table / form / page / block) on the shadcn
  `Skeleton` primitive, plus `LoadingState` (inline / block / overlay)
  on the shadcn `Spinner` for in-flight work. `kind="page"` is a route
  `loading.tsx` drop-in.

**Site**

- `DocsLoadingSkeleton` keeps only the docs-shell chrome strips; its body
  delegates to `LoadingSkeleton kind="page"`.
- Notion database/notes hosts: bespoke `animate-pulse` divs →
  `LoadingSkeleton kind="block"`.
- preview-kit chat/composer + admin-login: raw `Loader2` → shadcn
  `Spinner` primitive.
- agent.md regen catch-up (admin + five U6 slices).

**CLI**

- 1.12.1 — manifest picks up `loading-states` (63 slices).

### 2026-06-07 — docs sidebar tree fixed (UX wave U7)

- Branch toggle was dead: `tooltip` on `SidebarMenuButton` wraps it in a
  Tooltip root; `CollapsibleTrigger asChild` merged onClick onto that
  non-DOM wrapper. Tooltip removed from the trigger.
- Chevrons now rotate: `group/*` classes moved onto the Collapsible roots
  that actually carry Radix `data-state`.
- Sections collapse by default except the one containing the active path.
- Publish-gate fix: template-base `contact-form-resend` still on removed
  `email` category → `integrations`.

### 2026-06-06 — five basic slices (UX wave U6) — CLI 1.12.0

- **NEW slices**: `data-table` (TanStack v8 + shadcn Table — sorting,
  search, pagination, row selection, column visibility), `empty-states`
  (404/500/403/no-results/empty-list/first-use + ErrorPage drop-ins),
  `marketing-chrome` (MarketingHeader 3 layouts + MarketingFooter 2
  layouts), `settings-page` (adapter-driven 4-section shell),
  `notifications-center` (bell + inbox, adapter-driven).
- All pure-UI, variant previews registered (37 → 42), smoke-covered.
- **CLI 1.12.0**: 62-slice manifest + U2 category enum + U3 aliases.

### 2026-06-06 — shell hierarchy contract (UX wave U5)

- `/architecture` gains "Shell hierarchy — who composes whom": appshell (OS
  chrome) / dashboard-shell (app chrome SSOT) / workspace-shell (nav
  context, no chrome) / admin-panel + admin + platform-admin (inner
  surfaces). One rule: exactly one outer chrome, never nest two.
- admin-panel + platform-admin declare `dashboard-shell` peer with the
  mount direction; `admin` description states it's headless; AdminShell
  docblock spells out it's the inner section nav.

### 2026-06-06 — UI consistency pass (UX wave U4)

- `PageHeader` gains a `compact` bar variant; `/build`, `/control-room`,
  `/audit-chain`, `/agents/[slug]` drop their hand-rolled headers for it.
- Page root spacing standardized to `space-y-8`; section h2 → `text-2xl`;
  `DocCard` bakes in default `p-4`; thumbnail aspect string normalized.
- Slice detail header gains prev/next arrows (parity with layout detail).

### 2026-06-06 — slug aliases for merged landing sections (UX wave U3)

- `lib/content/slice-aliases.json` (SSOT) → `manifest.aliases`: the seven
  pre-merge section slugs (blog-section, faq-section, …, pricing-page) now
  resolve to `landing-sections` in the CLI (with a "superseded by" warning)
  instead of erroring, and `/slices/<old-slug>` redirects.
- `slice-schema.json`: optional `deprecated` field; set on the 7 old dirs.
- Fix: `landing-sections` miscategorized as `infra` → `content`.

### 2026-06-06 — taxonomy SSOT: 8 categories (UX wave U2)

- New `lib/content/taxonomy.ts` — category order/label SSOT; replaces 4
  drifted duplicates (sidebar "Ai"/"Ui", /build picker + /slices tabs both
  missing `os`, empty "Storage" group).
- Categories merged 12 → 8: payment+email → **integrations**,
  search+realtime → **data**, storage dropped. Slice moves: doku-payment,
  midtrans-payment, resend-newsletter, contact-form-resend → integrations;
  vector-search, broadcast-channel-sync → data. Schema enum +
  `SliceCategory` union updated.
- "Website templates" → "Templates — full apps" in sidebars; both catalog
  heroes now state the layouts-vs-templates distinction.

### 2026-06-06 — terminology: "Slices" everywhere, "kitab" retired (UX wave U1)

- All user-facing copy now says **Slices** (was a Modules/Slices mix across
  hero, /docs intro, breadcrumbs, command palette, detail meta titles).
- "kitab" → catalog/resources in site description, /build, /mcp, /directory.
- Removed orphan `app/(docs)/recipes/[slug]` route + dead `"template"`
  layout category (union + label entry).

### 2026-06-06 — screenshot pipeline for /layouts

- `npm run shots:capture` — VPS headless Chromium captures every layout
  previewPath on the deployed site → 800×500 webp (~18KB each) +
  `shots.gen.json` manifest. /layouts cards render the shot first (was: 36
  scaled live iframes), iframe fallback for uncaptured slugs, mock last.

### 2026-06-06 — "OS Apps" category (taxonomy)

- New `os` category: 11 os-vps app slices (appshell, file-explorer, the three
  editors, media-viewer, system-monitor, os-terminal, assistant, browser,
  app-store) move out of UI/AI. Sidebar gains an "OS Apps" cluster; /build
  picker groups automatically. Metadata-only — no version bumps.

### 2026-06-06 — live previews on slice detail pages

- Every `/slices/<slug>` with a registered variant preview gains a "Live"
  tab — same auto-knob widget as the Bundle Builder, same localStorage demo
  data. 37 slices interactive at the point of evaluation.

### 2026-06-06 — template-base previews (dashboard-shell + admin-panel)

- Generator scans `template-base/frontend/slices` as a second root; render
  files live site-side at `_shared/previews/<slug>.preview.tsx` (template-base
  ships its own node_modules → second react → hooks crash if .tsx lives
  there — caught by the smoke gate). Registry: 37 slugs.
- Spec documents the honest boundary: motion-primitives / responsive-dialog /
  three-column / workspace-shell are consumer-side facades — not previewable
  in rr; contact-form-resend is convex-bound.

### 2026-06-06 — preview smoke gate + honest no-preview cards

- **"Previews missing" investigated** — all 35 registered previews render
  clean (verified on production via headless Chromium + new smoke test). Gap
  was silence: previewless selections showed nothing in /build. Now: coverage
  header (n/total) + explicit "No live preview" card listing those slugs.
- **Smoke gate** — `lib/preview/preview-smoke.test.tsx` mounts every
  registered preview with default variants in happy-dom on `npm test`.
- **vitest aliases** — @/features + @/shared now mirror tsconfig paths.

### 2026-06-06 — notion 1.0.0: block editor port complete (M2c+M3+M4)

- **M2c compose** — BlockEditor + PageEditor orchestrators, PageActionsMenu
  (md/html/txt export), SelectionToolbar, MentionTypeahead, DatabasePicker,
  TocBlock, PageRefBlock, page-editor chrome, props-driven RowPropertiesPanel.
  28 new files behind the frozen EditorAdapter seam; peer-slice integrations
  (sharing/snapshots/wiki/analytics/notifications/presence) stay host-side.
- **M3 convex** — pure `_blocks`/`_blockOps` helpers + 31 unit tests into
  `convex/features/notion`; vitest now scans convex/features (322 total).
- **M4 catalog** — `npx rr add notion` public entry, version 1.0.0 (off WIP),
  live variant preview: full PageEditor on a localStorage in-memory
  EditorDataAdapter, two scenarios, edits persist.

### 2026-06-06 — manifest debt zeroed + editor previews

- **Schema A conversion** — 7 legacy-shape `slice.manifest.json` (image-picker,
  notion-database, notion-shell, notion-sidebar, selection, theme-presets,
  files) converted to the modern slug/version/tier/distribution/files/imports
  shape; user-management `stability` alpha → experimental. `validate:manifests`
  now reports 0 errors (was 23, warn-only).
- **Previews** — code-editor (3 mock-fs scenarios) + media-viewer (offline
  gallery + data-URI remote payload) join the registry → 33 slugs.

### 2026-06-06 — preview backfill: full catalog coverage (VP-6)

- **28 new previews** — every component-bearing slice in the catalog now
  renders live in the Bundle Builder (31 slugs in the generated registry).
  Marketing sections (blog/faq/feature-grid/testimonials-grid/portfolio/
  pricing/changelog-feed) ship variant axes; utilities (icon-picker,
  image-picker, command-menu, theme-presets, selection) demo real props;
  subsystems (appshell, admin, user-management, file-explorer, notion-shell,
  notion-sidebar, ai-chat, doku/midtrans-payment, image-editor, comments,
  library, activity, landing-sections, convex-auth, rbac-roles) ship curated
  scenarios with localStorage-persisted demo data.
- **Explicit opt-out** — `"previews": []` declares no-preview-by-design
  (ai-router, audit-log, cal-com-booking, resend-newsletter, reel-editor,
  seo, vector-search). New `audit:slices` rule warns when a component-bearing
  slice neither declares nor opts out; `gen-preview-registry` errors on an
  opt-out that still ships a `preview.tsx`.
- **Site** — `layouts.ts` gains `demoUrl`: all 8 OS templates link their own
  Vercel deployments (dev-lab repos, always ahead of rr's snapshot) from the
  template detail page, overriding the demo-subdomain link.

### 2026-06-05 — variant previews + AI builder (VP wave)

- **Preview contract** — slice.json gains an optional `previews` block
  (validated by slice-schema): enum variant axes (≤3, leaf slices) or
  scenario presets (subsystems). Rendered by a sibling `preview.tsx`
  (`SlicePreviewModule`, receives `{ variant }`). rr-internal: not in
  slice.manifest.json and `rr add` strips it post-pull. Spec:
  `docs/SLICE-PREVIEW-SPEC.md`.
- **Generated registry** — `npm run gen:previews` scans slices → emits
  `lib/preview/registry.gen.ts` (one code-split dynamic import per slug) +
  `preview-meta.gen.json` (server-safe metadata). `gen:previews:check` wired
  into `slices:check`. No hardcoded slice lists anywhere downstream.
- **Demo data** — `createDemoStore` (`@/shared/preview/demo-store`):
  localStorage `rr-demo:<slug>:v<n>`, seed-on-mount, write-through, reset.
  Client-only — previews cost the VPS a static chunk, no compute.
- **Builder** — `<VariantPreview>` cards with auto-generated knobs render for
  every selected slice in /build; reset button clears the slice's demo data.
- **Builder AI** — `/api/build-chat` (key-guarded: no ANTHROPIC_API_KEY →
  notice) runs a server-side tool loop; tool defs are built at request time
  from the catalog + preview metadata (`list_slices`, `get_slice`,
  `preview_slice`, `compose_bundle`). Validated `preview_slice` calls return
  as actions the chat panel renders live via `<VariantPreview>`. Model:
  `RR_BUILDER_MODEL` env (default `claude-opus-4-8`).
- **Pilots** — full-width-toggle (variant axis), markdown (tabs × content),
  notion-database (table/board/list/chart scenarios).
- **CLI** — `rr add`/`lift` strips `preview.tsx` from pulled slices.

### 2026-06-05 — theme-presets 0.3.0: site-default layer

- **theme-presets** — preset resolution is now 3-tier: visitor's explicit
  choice (localStorage) → owner's site-wide default (`siteSettings.themePreset`,
  pushed via new `useThemePreset().setSiteDefault`) → template's build-time
  `hostDefault` (new `ThemePresetProvider`/`ThemeProviders` props
  `hostDefault`/`defaultPreset` + `defaultMode`). Defaults apply WITHOUT
  persisting, so later default changes propagate to visitors who never picked.
  `setPreset(null)` resets to the default chain. New `SaveSiteDefaultButton`
  ("Jadikan default situs", props-driven persistence) for admin Appearance.
- **headless onboarding** — `OnboardingFields.themePreset` + optional
  color-preset picker in the Branding step (`presetOptions` prop).
- **settings contract** — `siteSettings.themePreset` (optional, additive) in
  convex-templates/personal-brand-os + CLI starter schema/settings.

### 2026-06-05 — headless-OS UI backported into SSOT

- **_shared/headless** (new) — canonical, props-driven (R3) ports of the
  template-personal-brand-os v1.0.0 headless surface: `SetupHealth`
  (self-diagnosing /setup checklist + env/backend error ladder),
  `UpdateCard` (upstream version check + deploy-hook rebuild), `BackupCard`
  (JSON export/restore), `OnboardingWizard` (4-step site config + seed).
  No `convex/react` here — the standalone repo injects its hooks via props
  (wiring recipe in `headless/README.md`). Tokens use `primary`, not pbo's
  `--brand`.
- **convex-templates/personal-brand-os** — reference backend synced from the
  standalone repo: `setup.ts` (status + bootstrapAdmin), `settings.ts`
  (siteSettings singleton), `users.ts` (derived owner/editor roles),
  `update.ts` (fetchUpstreamVersion + triggerDeploy), `backup.ts`
  (exportAll/importAll with FK remap); `schema.ts` now carries authTables +
  pages/landingSections blobs + siteSettings.

### 2026-06-05 — notion-database 0.17.1: complete dep declarations

- **notion-database** — `slice.json` declares the two deps an import scan
  found undeclared: shadcn `switch` (column-config toggles) and npm
  `lucide-react`. Fleet integrations previously had to discover these by
  build error; fresh `rr add notion-database` now installs clean.

### 2026-06-05 — unblock CLI 1.10.0 publish: slice.json drift + structure fixes

- **CLI** — prepublishOnly gates red → green. `slice-schema.json` gains
  optional `deps.sharedFiles` (string[]; notion-database / notion-shell
  already shipped it). Parity drift synced: resend-newsletter 0.1.3,
  ai-chat 0.2.0, landing-sections 0.2.0, markdown title.
- **image-picker** — `deps.env` string → typed object
  (`UNSPLASH_ACCESS_KEY`, scope `server`, optional — curated fallback works
  keyless).
- **ai-chat** — `AiChatFab` now props-driven (R3): `convex/react` import
  removed, backend injected via `chat` prop
  (`useAction(api.features.aiChat.action.chat)`); `AiChatSend` /
  `AiChatSendResult` types exported. Without the prop it degrades to a
  wire-me-up notice.
- **Structure** — deleted stale `template-base/frontend/slices/notion/`
  port-staging copy (R1 dual-home; root `frontend/slices/notion/` is canon).

### 2026-06-04 — markdown slice: CRUD tabs + diagrams + charts

- **markdown** (renamed from md-reader) — `<MarkdownPage>` adds optional CRUD
  surfaces: Read (rich text), Write (source editor + snippet toolbar + live
  preview), Review (block-anchored comments, add/resolve via controlled
  callbacks or internal fallback). Fenced ```mermaid → SVG diagram
  (dynamic-imported mermaid@11), ```chart → recharts bar/line/area/pie from a
  JSON spec. Notion sync grammar unchanged.

### 2026-06-04 — md-reader slice + notion ⇄ markdown bridge

- **md-reader** (new) — read-only `<MarkdownReader content={md}/>` page
  container rendering rich text (headings, lists, todo, callouts, fenced code,
  KaTeX, tables, images, `<details>` toggles, inline marks). Self-contained
  parser + inline renderer, no notion runtime dep.
- **notion** — added `shared/lib/markdown` bridge: `blocksToMarkdown` /
  `markdownToBlocks`. The wire format that syncs the block editor with
  md-reader — same grammar both ways, so notion content reads in md-reader and
  back. 21 tests.

### 2026-06-03 — date cell: custom grid (again) + range click-sequence

- **notion-database** — reverting to the shadcn Calendar broke picking again
  (it's the unreliable part here, not our state); restored the self-contained
  `DateCalendar` grid. Added Notion-style range picking: End date on → click 1 =
  start, click 2 = end (earlier of the two stays as start, so clicking before
  the start swaps them); clicking once a full range exists starts a fresh range.

### 2026-06-03 — date picking: pin react-day-picker to v9 (shadcn Calendar target)

- **notion-database** — the repo pinned `react-day-picker ^10.0.0`, but this
  shadcn `Calendar` component is generated for **rdp v9**; v10's breaking changes
  silently stopped the controlled `mode`/`selected`/`onSelect` path from
  registering day clicks (same bug in notion-page-clone). Pinned react-day-picker
  to `^9.14.0` and restored the canonical `Popover` + `Calendar` date picker
  (`mode="single"` / `mode="range"`).

### 2026-06-03 — date picking: decouple from react-day-picker v10 selection

- **notion-database** — dates couldn't be picked (same bug in notion-page-clone)
  because the controlled `mode`/`selected`/`onSelect` path broke under
  react-day-picker v10. The date cell now handles day clicks via `onDayClick`
  and drives the selected-day + range highlight purely from `modifiers` — both
  fed by our own controlled value — so it no longer depends on rdp's internal
  selection state machine.

### 2026-06-03 — notion M2b.2b: nested-rendering subtree (M2b complete)

- **notion** — ported the recursive nested-block tree behind the adapter seam:
  `NestedBlock` (self-registering dispatcher), `NestedContent` (by-type renderer
  — database→`adapter.database`, page nav→`adapter.page`, icon→built-in
  `PageIcon`, code→`SimpleCodeBlock`), `ToggleBlock`, `ColumnBlockEditor` (split
  into `column/panes`), `SyncedBlock` (split into `synced/{views,ChildrenList}`,
  cross-page source via `pages`/`workspaceId`), `NestedBlockControls`. Completes
  M2b (chrome + nested rendering). Next: M2c BlockEditor/page shell.

### 2026-06-03 — date picking reliable (single-mode calendar)

- **notion-database** — react-day-picker's range mode wasn't registering day
  clicks. Switched to single mode for both modes: range now uses an active-field
  model (two fields, click to pick which the calendar edits — Notion's blue
  active field) with the start→end span shaded via modifiers. Dates pick again.

### 2026-06-03 — date range picking fix + End-date toggle sync

- **notion-database** — dates couldn't be picked in range mode (an empty cell
  passed a `{from:undefined}` range that broke react-day-picker's first click);
  now passes `undefined`. The cell's End-date toggle patches `prop.dateRange` —
  the same switch the column header's edit-property panel toggles — so the two
  surfaces stay in sync.

### 2026-06-03 — notion M2b.2a: block toolbar

- **notion** — ported the per-block toolbar (`BlockControls` hub +
  `MenuHierarchy` + `QuickButtons`/`GripButton`) against the frozen adapter
  seam: data CRUD + selection via `useEditorData`/`useSelection`, comments via
  `useComments` (popover + count), AI panel via optional `useAi`. Nested
  rendering (toggle/columns/synced) is M2b.2b.

### 2026-06-03 — date range: side-by-side + clickable end time

- **notion-database** — range mode now shows two date fields side by side over
  a single range-highlighting calendar (was two stacked calendars), matching
  Notion. Toggling End date seeds `end = start` so the end-time field is
  enabled — fixes end time being unclickable.

### 2026-06-03 — date cell relayout + changelog link sanitizer

- **notion-database** — rebuilt the date-type cell popover to match
  notion-page-clone: date+time header row, one calendar, inline End-date
  section, then the options list (start/end time beside their date, not
  stacked). Formatted display + shadcn time input — no native date input.
- **Site** — changelog bullets pointing at dead/renamed/WIP slugs now render as
  plain text instead of 404 links (`lib/content/changelog/sanitize.ts`).

### 2026-06-03 — notion M2b.1 + changelog newest-first fix

- **notion** — expanded the `EditorAdapter` seam: `EditorDataAdapter` (block +
  page CRUD with a no-op fallback), revised `SelectionAdapter`, `CommentsAdapter`
  (hook + popover, no-op default), `AiAdapter`, and `useEditorData` /
  `useSelection` / `useComments` / `useAi` hooks. `BlockShell` wired to
  selection. Freezes the interface for the M2b.2 chrome port.
- **Site** — `/changelog` now renders newest-first per page (was sorting each
  page ascending).

### 2026-06-03 — notion block-editor port (M1+M2a) + content-slice pass

- **notion** (new, WIP cluster) — port of the notion-page-clone block editor as
  rr's rich-text engine. M1: vendored block model + 151-test pure core +
  `EditorAdapter` seam (13 cross-slice deps → optional host adapters). M2a:
  block rendering (BlockBody, registry, built-in code block) + editing layer
  (slash menu, key/input/slash handlers); uploads via the adapter, raw file
  inputs → `FilePicker`. Not yet in catalog.
- **comments** — real reply threading: `parentId` end-to-end + `buildThread` tree.
- **seo / comments / services / testimonials** — preview overhaul (responsive;
  services + testimonials gain public + admin previews).
- **mdx-blog** — **removed** (superseded by `notion`); unwired from catalog,
  registry, family-map, and the saas-marketing-os template copy.
- **workspace-shell** — preview rebuilt as a clean shadcn sidebar-07 dashboard.
- **Site** — `/changelog` paginated; release data split into
  `lib/content/changelog/part-*.ts` (bin-packed by line budget).

### 2026-06-02 — `cover` → `image-picker`: generic one-button image/wallpaper chooser

- **RENAMED slice `cover` → `image-picker` (0.1.0)** — degeneralized from the
  Notion framing. Headline API is now ONE button: `<ImagePickerButton onChange>`
  opens the 4-tab dialog (**Gallery** colours/gradients/textures · **Upload** ·
  **Link** · **Unsplash** curated+live) — drop it anywhere you set an image
  (wallpaper, cover, profile header, hero). `ImageBanner` is the optional
  reposition-able band (was `CoverBanner`); `ImagePickerDialog` (was
  `CoverPicker`). Renamed utils: `parseImage` / `isCssImage` / `isUrlImage` /
  `imageRef` / `imageStyle`; types `ImageValue` / `ImageField` / `ImageSource`.
  Still imports **no other slice + no backend** (onUpload + searchUnsplash
  injected). New `/preview/slices/image-picker` "change wallpaper" demo.
- **notion-shell** — `coverSlot` / `Page.cover` doc comments now point at the
  `image-picker` slice (structural `CoverValue` unchanged; no API change).
- **notion-page-clone template** — `DocCover` glue + `DocView` swap to
  `ImageBanner` / `ImagePickerDialog`; the page cover is now just an image-picker
  banner. Layout pullPaths `frontend/slices/cover` → `frontend/slices/image-picker`.

### 2026-06-01 — NEW `cover` slice: full page cover picker (upload · Unsplash · gallery · reposition)

- **NEW slice `cover` (0.1.0)** — the entire notion-page-clone cover feature,
  lifted and made portable. `CoverBanner` (band + hover Change / Reposition /
  Remove), `CoverPicker` (4 tabs: **Gallery** colours/gradients/Notion textures,
  **Upload** drag/click ≤8MB, **Link** paste URL, **Unsplash** curated + live
  search), `AddCoverButton`, `parseCover` (legacy string covers), `coverStyle`,
  `unsplashSearchVia`. Imports **no other slice + no backend** — `onUpload` and
  `searchUnsplash` are injected props; ships a curated Unsplash + gallery so it
  works with zero config. New `/preview/slices/cover` demo.
- **notion-shell 0.22→0.23** — `NotionPage` gains a `coverSlot`; `Page.cover`
  widened to a structural `CoverValue` (notion-database's type peer untouched).
- **notion-page-clone template** — `DocView` replaces the `window.prompt` cover
  with the real picker; new `DocCover` glue wires `onUpload`→the `files` slice
  (localStorage adapter via `FilesAdapterProvider`), resolves upload FileRefs to
  URLs, and points Unsplash at a new **`app/api/unsplash`** server proxy
  (holds `UNSPLASH_ACCESS_KEY` server-side). Layout bundles cover + files + route.

### 2026-06-01 — notion-sidebar split out of notion-shell (rename · dnd · icon picker)

- **NEW slice `notion-sidebar` (0.1.0)** — the tree-nav sidebar is now its own
  standalone, reusable slice (decoupled: owns its `NotionSidebarPage` type,
  imports no sibling slice). Enhancements over the old in-shell sidebar:
  **double-click a title to rename**, **drag the grip to reorder + reparent**
  (@dnd-kit sortable tree with horizontal-offset depth projection, collapse/
  expand), and an **optional per-row icon picker** (`renderIconPicker` +
  `onIconChange`). New `/preview/slices/notion-sidebar` demo.
- **notion-shell 0.21.1→0.22.0** — now the PAGE EDITOR only (NotionPage /
  NotionBlock / slash / inline toolbar / colour / layout + built-in code +
  equation). `NotionSidebar` export removed; domain types stay here so
  notion-database's type peer is unaffected. Its preview refocused to the page.
- **notion-page-clone template** — `Dashboard` imports the sidebar from
  `@/features/notion-sidebar`, wires `onMove` (new `doc.move` reducer action:
  reparent + reorder), `renderIconPicker`, and `onIconChange`.
- **notion-page-clone-os layout** is documented as the COMBINATION of three
  independently-reusable slices — notion-sidebar + notion-shell + notion-database.

### 2026-06-01 — theme playground preview + full Wiring-out-of-public-preview sweep

- **theme-presets preview → "Theme playground"** — the slice's switcher is a
  compact header icon that was easy to miss, so the preview now **spotlights**
  it (labelled ringed pill + bouncing arrow: "Click to change theme & color
  preset") and renders a **shadcn widget board** (buttons, badges, revenue stat
  + bar chart + progress, form controls, tabs + alert, team list, primary
  surface) that re-skins live on every preset pick. Preview-only.
- **Wiring out of every public preview** — finished the pattern: the remaining
  11 preview pages no longer show a Wiring code block in the live demo. Each
  snippet is lifted into its catalog entry's `wiring` field (rendered in the
  **Code tab**): cal-com-booking, command-menu, midtrans-payment,
  resend-newsletter, mdx-blog, motion-primitives, doku-payment, vector-search,
  broadcast-channel-sync, ai-router (+ full-width-toggle's section removed; it
  has no catalog entry — the snippet already lives in dashboard-shell's wiring).

### 2026-06-01 — notion cleanup + date cell parity + canvas group-move + preview tab moves

- **notion-shell 0.20→0.21.1** — `code` (highlight.js) + `equation` (KaTeX)
  block renderers are now **built-in** to `createDefaultBlockRenderers()` (npm
  += katex, highlight.js). No more app-level adapter wiring — hosts only inject
  `database` + `toc`. Added `Property.dateNotification` (cosmetic "Remind").
- **DELETED slices** `equation`, `code-block`, `notifications`, `notion-blocks`
  (catalog + manifest + previews + `notion-page-clone-os` pullPaths). The two
  primitives live inside notion-shell now; notifications dropped entirely.
- **notion-database 0.16.2→0.17.0** — the date cell popover now mirrors
  notion-page-clone: an options list with **End date** toggle, **Date format**
  (Full date…), **Include time**, **Time format**, **Remind** (None…), and
  **Clear** (`DateCellSettings`). `DatePanel` (column config) gains Remind too.
- **notion-page-clone template** — database demo rows removed (starts empty);
  Roadmap db ships **End date** (range + time) and **Due date** columns; a
  **+ New database** button in `DatabaseView` spins up a second db pre-linked
  via a relation column, and `databases`/`pages` are now passed so **relation +
  rollup** are testable.
- **selection canvas** — dragging a node that's part of a multi-select now
  moves the **whole selection** together (drag baseline snapshots in the canvas).
- **theme-presets preview** — content centered (vertical + horizontal).
- **responsive-dialog / dashboard-shell** — Variants + Wiring moved out of the
  public preview into the **Code tab** (new `SliceEntry.wiring` + `variants`).

### 2026-06-01 — selection v0.2.0 — canvas CRUD demo + bulk-duplicate + applied to notion

- **Full-bleed canvas preview** (`/preview/slices/selection`) — an empty
  dotted canvas with **floating nodes** and full **CRUD on the selection**, so
  the capability is actually visible: **create** (Add node / double-click
  canvas), **update** (drag the grip to move, type to edit), **delete** (✕ or
  select + Backspace), **duplicate** (floating toolbar). Marquee-select works
  across the whole 2-D surface — drag right = enclose (blue), left = cross
  (green). Full width + height with padding.
- **`SelectableBlock`** gains `style` + `edges` props (free-floating canvas
  nodes position absolutely and opt out of the edge strips).
- **`SelectionProvider`** gains optional `onBulkDuplicate` → a Duplicate button
  on the floating toolbar; click-outside-clear now ignores any selectable item
  / handle so dragging a node no longer drops the selection.
- **Applied to notion-shell** — the notion-clone template `DocView` and the
  preview `page-demo` now wire `onBulkDuplicate` (duplicate selected blocks)
  and give the marquee surface a left gutter + bottom padding + min-height so
  there's empty space to start a rubber-band drag.

### 2026-06-01 — slice renamed `block-selection` → `selection` + marquee rubber-band v0.1.0

- **Renamed** the slice to `selection` (`@/features/selection`); API is now
  `SelectionProvider` / `useSelection` / `SelectableBlock` / `SelectionMarquee`
  / `useMarquee`. The old `block-selection` slice is removed.
- **Marquee / rubber-band — the missing capability.** Hold-and-drag on empty
  space now draws a selection rectangle (`SelectionMarquee` + `useMarquee`,
  portal-rendered). **Direction-aware, AutoCAD-style** (matches npc): drag
  **RIGHT** = *window* (selects only fully-enclosed items, solid ring), drag
  **LEFT** = *crossing* (selects anything the rect touches, dashed green ring).
  Shift/Cmd-drag is additive (unions with the current selection).
- **Selecting visibly activates items** — each `SelectableBlock` tags itself
  `data-selectable-id` (so the marquee can hit-test it) and shows a ring +
  `data-block-selected` when selected. Click-outside now clears too.
- **Hosts rewired** — the notion-clone template `DocView` and the preview
  `page-demo` mount `<SelectionMarquee>` on a relative surface. New standalone
  preview at `/preview/slices/selection` demonstrating both drag directions.

### 2026-06-01 — NEW slice `block-selection` v0.1.0 + notion-shell extraction v0.20.0

- **New `block-selection` slice** — the multi-selection that shipped inside
  notion-shell (v0.19.0) is now its own framework-agnostic slice (mirrors
  notion-page-clone's architecture). `BlockSelectionProvider` +
  `SelectableBlock` + `useBlockSelection`: edge-click select (Shift = range,
  Cmd/Ctrl = toggle), Backspace/Delete bulk-delete, Escape clear, floating
  count toolbar. Zero deps; the host owns the data via `onBulkDelete(ids)`.
  Works on any vertical list (blocks, table rows, cards), with a standalone
  preview at `/preview/slices/block-selection`.
- **notion-shell 0.19.0 → 0.20.0** — removed `BlockSelectionProvider` /
  `SelectableBlock` / `useBlockSelection` (moved to the new slice; import
  them from `@/features/block-selection`). Keeps notion-shell a focused
  editor primitive; selection is now reusable beyond it.
- **Hosts repointed** — the notion-clone template `DocView` and the preview
  `page-demo` import the selection from `@/features/block-selection`.

### 2026-06-01 — notion-shell: markdown paste + multi-block selection v0.19.0

- **Markdown paste** (`blockPaste.ts`) — pasting multi-line text parses each
  line into a real block (headings, lists, todo, quote, code, divider via the
  same trigger map) instead of dumping raw text into one block. A single
  plain line still uses the browser's default inline paste (keeps markers).
  Wired with one `onPaste` on the NotionBlock editable.
- **Multi-block selection** (`BlockSelectionProvider` + `SelectableBlock` +
  `useBlockSelection`) — wrap the block list in the provider and each block in
  `SelectableBlock`; thin top/bottom edge strips select on click (Shift =
  range from the anchor, Cmd/Ctrl = toggle). Backspace/Delete with a
  selection (focus outside any editable) deletes them all, Escape clears, and
  a floating "N selected · Delete · Clear" toolbar offers the same. The host
  supplies `onBulkDelete(ids)`. Both the preview and the notion-clone template
  `DocView` wire it. notion-shell 0.18.0 → 0.19.0.

### 2026-06-01 — notion-shell: keyboard shortcuts + indent + @mentions + ToC v0.18.0

After a full feature audit against notion-page-clone, closed the biggest
editor-core gaps (the pure, no-backend ones):

- **Keyboard shortcuts** (`blockKeyHandler.ts`): **Shift+Enter** soft line
  break; **Tab / Shift+Tab** indent/outdent list items (persisted on
  `block.indent`, rendered as left margin); **Cmd/Ctrl+B/I/E** and
  **Cmd/Ctrl+Shift+X** wrap selection bold/italic/code/strike;
  **Cmd/Ctrl+D** duplicate; **Cmd/Ctrl+Shift+↑/↓** move block;
  **Cmd/Ctrl+Alt+1/2/3** → h1/h2/h3; **Cmd/Ctrl+Shift+7/8** → todo/bullet.
  Enter now also carries the list indent into the continued item.
- **`MentionTypeahead`** — `@`-trigger page/person mention popover. Mount
  once (like `InlineFormatToolbar`); props-driven `mentionables` list;
  arrow/Enter/Tab insert a markdown link over the `@query`. Zero NotionBlock
  wiring — it edits the focused contentEditable in place.
- **`TocBlock` + `toc` renderer slot** — a real table of contents.
  `collectHeadings(blocks)` walks h1–h3 (incl. toggle/column children); the
  host wraps a `toc` adapter that reads headings from context (stable
  identity → no caret-dropping remount) and jumps via `focusBlock`.
- **`wrapSelection`** extracted to `lib/selectionFormat.ts`, shared by the
  toolbar and the keyboard shortcuts.
- **Hosts wired** — preview `page-demo` (demo mentionables + ToC block) and
  the notion-clone template `DocView` (mentions from the page list, ToC from
  `doc.blocks`, seed welcome doc gets a live ToC). notion-shell
  0.17.0 → 0.18.0.

### 2026-06-01 — notion-shell: Notion-canonical Enter / Backspace / Arrow editing keys v0.17.0

- **The real "nothing changed" bug.** The editor had NO Enter or merge
  behaviour: pressing Enter inserted a literal newline *inside* the same
  contentEditable, and Backspace-on-empty just deleted the block outright
  (no list→paragraph downgrade, no merge into the previous line). The block
  renderers shipped earlier never made the editor *feel* like Notion.
- **`blockKeyHandler.ts`** (new, pure) — the canonical text-block key flow:
  - **Enter** splits at the caret into a new block. Lists (`bullet` /
    `numbered` / `todo`) continue their own type; an **empty list item**
    exits the list (converts to paragraph) instead of stacking another.
  - **Backspace on an empty non-paragraph** (heading / quote / callout /
    list) downgrades it to a plain empty paragraph — re-triggerable with
    `/`. A **second Backspace** on the empty paragraph **merges into the
    previous block** (carrying any text, caret at the join point).
  - **Arrow up/down** at a line edge hops to the adjacent block.
- **`NotionBlock`** gains host callbacks `onInsertAfter(type, init) => id`,
  `onMergeBack()`, `onFocusSibling(dir)`; the old inline key handling moved
  into the new file. **`focusBlock(id, offset?)`** exported to place the
  caret after a host state change.
- **Hosts wired** — the notion-clone template (`DocView` + two new reducer
  actions `doc.block.insertAfter` / `doc.block.mergeBack`) and the preview
  `page-demo.tsx` (array state) both implement the full flow, so the os
  editor and the slice preview now type like Notion.

### 2026-06-01 — notion-clone template: adopt full block-renderer registry (page-features wiring)

- **Root cause of "no change in rr"** — the notion-clone *template* (the
  `notion-page-clone-os` preview the user actually browses) still rendered
  blocks through a stale 7-renderer stub (`NOTION_BLOCK_RENDERERS`) whose
  toggle literally said *"wire nested blocks in a future wave"* and which had
  no columns / table / video / audio / page / button / database / colour. All
  the P1–P7 notion-shell work never reached it.
- **Fix** — template `block-renderers.tsx` now builds its registry via
  `createDefaultBlockRenderers({ code, equation, database })` (composing the
  sibling `notion-blocks` + `notion-database` slices at the template level,
  same slice-boundary pattern as the preview). The os editor now renders all
  ~28 block types live, with nested toggles/columns and block colour.
- **`DocView`** — mounts `InlineFormatToolbar` (select-text formatting) and
  wires `onMoveUp` / `onMoveDown` to `doc.block.reorder`, so the block ⋯ menu
  can move blocks without dragging.
- **Welcome seed** — added a live "Block gallery" section (toggle-with-
  children, 2-column layout, editable table, equation, button) so the rich
  blocks are visible on first load instead of only after inserting them.

### 2026-05-31 — notion-shell: inline database block (page-features P7) v0.16.0

- **Inline database block** — `createDefaultBlockRenderers` gains a
  `database` adapter slot, so a `database` block can mount the full
  `notion-database` surface inside a page. Composed at the app level
  (slice-boundary: notion-shell can't import notion-database) — the preview
  wires a `DatabaseAdapter` rendering `<NotionDatabase>` with a small inline
  table. Block-renderer coverage now ~28/30 Notion types.

### 2026-05-31 — notion-shell: column layouts (page-features P6) v0.15.0

- **Columns** — new block types `columns2` / `columns3` / `columns4` +
  `ColumnsBlock`. Lays a block's `columns` (Block[][]) out side by side;
  each column is an independent block list rendered through the *same*
  registry (any block nests inside, including toggles and further columns),
  with per-column add/turn-into/duplicate/delete patched via
  `onUpdate({ columns })`. Stacks vertically on narrow screens. Added to the
  slash menu; preview demos a 2-column row. Block-renderer coverage now
  ~27/30 Notion types (remaining: synced, toc, inline-database).

### 2026-05-31 — notion-shell: breadcrumbs + subpages + cover position (page-features P5b) v0.14.0

- **`PageBreadcrumbs`** — ancestor trail (root → current); pass the chain +
  `onNavigate`, last crumb renders muted.
- **`Subpages`** — a grid of child-page cards for the bottom of a page,
  with optional "New sub-page". Both pure / props-driven.
- **Cover focal point** — `NotionPage` gains `coverPosition` (0–100) driving
  the cover image's vertical `object-position`. Preview wires breadcrumbs +
  subpages live.

### 2026-05-31 — notion-shell: page + button blocks, copy-link + move (page-features P4b) v0.13.0

- **Two more block renderers** — `PageLinkBlock` (block-type `page`: a
  sub-page reference row, file icon + editable title) and `ButtonBlock`
  (block-type `button`: a CTA that opens a URL, with a gear popover to edit
  label + link). Both registered in `createDefaultBlockRenderers` + added to
  the slash menu. Block-renderer coverage now ~24/30 Notion types.
- **Richer block actions** — the block "⋯" menu gains **Copy link to block**
  (writes a `#block-<id>` deep link to the clipboard) and **Move up / Move
  down** (host supplies `onMoveUp`/`onMoveDown`; preview wires array reorder).
  Consolidated the two `BlockActionsHandle` call-sites into one shared element.

### 2026-05-31 — notion-shell: page layout chrome (page-features P5a) v0.12.0

- **Page layout controls** — `NotionPage` gains `font` (default / serif / mono),
  `fullWidth`, `smallText`, and `locked` props; the body + header width stay
  aligned (header takes a `widthClassName`). `locked` disables the title/icon
  editors. `PageActionsMenu` gains a **Layout** section (`PageLayoutSection`):
  Font cycle · Full width · Small text · Lock — items keep the menu open so
  several toggle in one pass.
- Preview's PageDemo (extracted to `page-demo.tsx`) wires all four live, with
  `locked` cascading `readOnly` to the blocks. Next (P5b): cover picker +
  position, breadcrumbs, subpages list.

### 2026-05-31 — notion-shell: block colour (page-features P4) v0.11.0

- **Block colour** — the `color` (text tint) + `bgColor` (background) fields
  finally have UI. The block "⋯" menu gains a **Color** section
  (`BlockColorPicker`): two swatch rows — 10 Notion text tints + 10
  backgrounds, independent, current swatches ringed. `NotionBlock` applies
  `blockColorClass(color, bgColor)` to the block wrapper (works for both
  text-shape and registry-rendered blocks); the picker writes through the
  block's own `onUpdate`, so no extra host wiring. Tailwind palette names
  (not hex) → dark mode resolves automatically.
- Next (P4b): copy-link-to-block + move up/down; then P5 page chrome.

### 2026-05-31 — notion-shell: inline format toolbar (page-features P3) v0.10.0

- **`InlineFormatToolbar`** — a floating rich-text toolbar that appears over
  any non-empty selection inside a notion-shell contentEditable: **bold /
  italic / strikethrough / code / link**. It wraps the selection in the
  markdown markers the live decorator already renders, editing the focused
  editable in place via `insertText` (re-fires the block's own `onInput`) —
  so it needs zero block wiring; mount `<InlineFormatToolbar />` once in the
  page surface. Buttons mousedown-preventDefault so the selection survives.
- Preview mounts it over the block demo. Next (P3b): @mentions typeahead
  (page / person / date), props-driven.

### 2026-05-31 — notion-shell: toggle nesting + media blocks (page-features P2) v0.9.0

- **ToggleBlock** — collapsible section (chevron) with an inline-editable
  heading and **nested child blocks**. Children render through the *same*
  registry (callouts, code, even nested toggles work inside), with child
  CRUD — add / turn-into / duplicate / delete — patched back via
  `onUpdate({ children })`. Bound to the registry by the factory.
- **Video + Audio blocks** (`MediaBlock`) — paste a URL → native
  `<video controls>` / `<audio controls>` player + caption; added to the
  slash menu.
- **`EditableLine`** — extracted the inline-editable contentEditable +
  live-decorator into one reusable primitive; CalloutBlock + ToggleBlock
  both ride it (keeps every block file ≤200 LOC). Preview now demos a
  toggle with nested callout + child blocks.

### 2026-05-31 — notion-shell: default block-renderer pack (page-features P1) v0.8.0

- **`createDefaultBlockRenderers()`** — a real block-renderer registry so
  `<NotionBlock>` stops rendering specialised blocks as gray text. notion-shell
  now ships **CalloutBlock** (leading kind icon + picker for note / tip /
  warning / important / caution + coloured box + inline-editable text),
  **TableBlock** (editable grid — add row/column, header-row toggle), and
  **DividerBlock**, plus the existing image + embed renderers, all wired into
  the factory.
- **code + equation** plug in via adapter: the factory takes optional
  `{ code, equation }` `BlockRendererProps` components, composed at the app
  level (slice-boundary keeps notion-shell from importing sibling slices). The
  notion-shell preview now demos callout / code / equation / table / divider
  live.
- First phase of the **page-features epic** (full notion-page-clone parity,
  user-requested). Next: toggle nesting, inline selection toolbar + @mentions,
  block colour, page chrome, columns, synced blocks, multi-block selection.

### 2026-05-31 — notion-database: date cell range + time editing v0.16.2

- **Date cell rewrite** — the `date` cell now matches notion-page-clone: a
  range opens **two separate single calendars** (Start + End, the end picker
  disables days before the start) instead of one flaky `mode="range"`
  calendar, so a range takes two explicit picks. Picking now also writes the
  end reliably.
- **Time editing wired** — the `dateIncludeTime` property toggle ("Include
  time") previously had no effect on the cell; it now renders `HH:mm` time
  inputs for the start (and the end, in range mode). Values stored as 24h
  internal, displayed per the column's 12h/24h `timeFormat`.
- Extracted the popover body into `DateCellEditor.tsx` (keeps both files
  ≤200 LOC); dropped the `as never` casts. Audited all 18 cell types vs
  notion-page-clone — date was the only behavioural gap; number / select /
  status / multi_select / url / email / phone / person / files / formula /
  relation / rollup / system cells already at or above parity.

### 2026-05-31 — notion-database: responsive view tabs + sharper AI recipe v0.16.1

- **Responsive fix** — the `<ViewTabs>` strip now scrolls horizontally
  (scrollbar hidden) instead of overflowing the card, and `<NotionDatabase>`
  clips to its rounded border (`overflow-hidden`). With all 11 view types
  added the tabs stay inside the container at every width; the "Add view"
  trigger is pinned past a divider and collapses to its icon on narrow
  screens.
- **AI agent prompt rewrite** — `notion-database` `agentRecipe` restructured
  from a single dense paragraph into numbered wire-up steps (install →
  minimal `<NotionDatabase>` example → data shape → import/export → Convex
  backend → single-view escape hatch). Regenerated `agent.md` + CLI manifest.

### 2026-05-31 — user-management: access matrix (P4c) v0.6.0 — epic complete

- **Cross-tenant `<AccessMatrix>`** — users (rows) × tenants (columns) grid
  showing each user's role per tenant across a hierarchy. Read-only by
  default; when `currentPerms` grants `members.manage` and `onAssign` is
  passed, each cell becomes a role select. Matrix types live in a new
  `access-types.ts` (TenantNode / MatrixUser / AccessCells) so `types.ts`
  stays under the 200-LOC cap.
- **`<UserManagementPanel>`** gains an optional **Access** tab (renders when
  the `access` prop bag is passed).
- **Convex** `hierarchy/query.ts`: `getAccessMatrix(rootTenantId, maxDepth?)`
  — walks root + descendants, builds `{ tenants, users, cells }` (cell key
  mirrors the frontend `tenantKey`). Soft-denied without `members.view`.
- Preview gains the Access tab (3-tenant mock hierarchy + inline assignment).
  Slice + catalog 0.5.0 → 0.6.0; no new shadcn deps.
- **This completes the user-management epic (P0–P4c): full superspace
  parity** — engine + members + invites + roles admin + teams + hierarchy +
  access matrix, all props-driven, RBAC-agnostic, self-contained.

### 2026-05-31 — user-management: tenant hierarchy + propagating invites (P4b) v0.5.0

- **Tenant hierarchy added to `user-management`.** rr deliberately does NOT
  own the tenant entities (your workspace/org) — instead a generic
  `um_tenant_links` edge table stores parent→child relationships, so
  propagating invites can walk the tree.
- **Convex** `convex/features/user-management/hierarchy/`: `linkTenant` /
  `unlinkTenant` (members.manage), `listChildTenants` / `getDescendantTenants`
  (BFS, cycle-safe, depth-capped), and `sendHierarchyInvite` — invites an
  email to a root tenant + its descendants with a `same` (role everywhere) or
  `decreasing` (steps one role down the rbac_roles level-ladder per depth)
  strategy; skips tenants with a pending invite; gated `members.invite`.
  (Lives in a `hierarchy/` subfolder — `mutation.ts` was already near the
  200-LOC cap.)
- **`<InviteDialog>`** gains optional hierarchy controls (a "propagate to
  sub-workspaces" Switch + strategy select + max-depth) shown when the new
  `allowPropagate` prop is set; `<MembersPanel>` threads it through.
  `InviteInput` gains `propagate` / `strategy` / `maxDepth`.
- New type `InviteStrategy`. Preview enables `allowPropagate` + shows
  propagation feedback. Slice + catalog 0.4.0 → 0.5.0; `switch` added to
  shadcn deps. Self-contained. P4c (cross-workspace access matrix) is the
  last sub-phase.

### 2026-05-31 — user-management: teams (P4a) v0.4.0

- **Teams added to `user-management`.** `<TeamsPanel>` — named user groups
  within a tenant: list teams (with member counts), create / delete, and
  `<TeamDetail>` to add / remove members (picking from active members). Gated
  on `members.manage`.
- **`<UserManagementPanel>`** gains an optional **Teams** tab (renders only
  when the `teams` prop bag is passed).
- **Convex** (`convex/features/user-management/`): `um_teams` +
  `um_team_members` tables; `listTeams` (each with member ids) +
  `createTeam` / `removeTeam` (cascades memberships) / `addTeamMember` /
  `removeTeamMember`, all gated `members.manage`. `mutation.ts` rewritten
  cleaner (convex is tsc-excluded — dropped the defensive casts) to fit the
  new endpoints under the 200-LOC cap.
- New types `Team` / `TeamsLabels`. Preview gains the Teams tab (seeded with
  Engineering + Design). Slice + catalog 0.3.0 → 0.4.0; no new shadcn deps.
- First of the P4 full-parity sub-phases — hierarchy + propagating invites
  (P4b) and the cross-workspace access matrix (P4c) follow.

### 2026-05-31 — user-management: roles admin + tabbed panel (P3) v0.3.0

- **Roles admin added to `user-management`.** `<RolesPanel>` — list roles
  (color + permission count), create / edit / delete custom roles; system
  roles are read-only. `<RoleEditor>` (name + description + permission grid +
  save/delete) and a local `<RolePermissionGrid>` (the slice can't import
  rbac-roles' PermissionMatrix, so the permission catalog comes in as the
  `permissionGroups` prop). All editing gated on `roles.manage`.
- **`<UserManagementPanel>`** — the composed surface: Tabs(Members, Roles),
  each fed its own prop bag. Invites live inside the Members tab.
- **No new convex** — roles CRUD reuses rbac-roles' `listRoles` /
  `upsertRole` / `removeRole` (built in P0). Wire `RolesPanel.onUpsert/onRemove`
  to those mutations + `roles` to `listRoles` at the app level.
- New types `ManagedRole` / `PermissionGroupDef` / `RolesLabels`. Preview
  rebuilt as the tabbed panel with the Admin/Manager view-as toggle (Admin
  edits roles; Manager read-only). Slice + catalog 0.2.0 → 0.3.0; `checkbox`
  + `tabs` added to shadcn deps. Still self-contained.

### 2026-05-31 — user-management: invite flow (P2 of the epic) v0.2.0

- **Invite flow added to `user-management`.** `<InviteDialog>` (email + role
  select + optional message, shadcn Dialog) and `<PendingInvites>` (pending
  list with resend / cancel) — both permission-gated on `members.invite`.
  `<MembersPanel>` now owns the dialog state (toolbar invite button opens it)
  and renders the pending list above the table. New props: `onInvite(input)`,
  `invites`, `onCancelInvite`, `onResendInvite`. New types `Invite` /
  `InviteInput` / `InviteStatus`.
- **Convex** (`convex/features/user-management/`): `um_invites` table
  (tenant-scoped, by_token index) + `listInvites` (soft-denied without
  members.invite/manage) + `sendInvite` (7-day crypto token, rejects
  duplicate pending) / `cancelInvite` / `resendInvite` (all gated
  members.invite) + `acceptInvite(token)` (public; creates/reactivates the
  membership for the signed-in user).
- Preview wires the full flow with the Admin/Manager view-as toggle. Slice +
  catalog bumped 0.1.0 → 0.2.0; `dialog` + `textarea` + `label` added to
  shadcn deps.

### 2026-05-31 — user-management: Members surface (P1 of the epic) v0.1.0

- **New `user-management` slice** — the members surface, ported from
  superspace. `<MembersPanel>`: searchable / role-filterable / sortable
  member table (avatar + name + email), inline role dropdown, soft-remove,
  and a permission-gated invite button. Sub-parts `MembersTable`,
  `MembersToolbar`, `MemberRowActions`, `RoleChip`, `useMembersView`.
- **Props-driven + RBAC-agnostic.** The slice imports no other slice's
  frontend (per the slice-boundary rule audit-slices enforces): it takes
  `roles` (options) + `currentPerms` (resolved permission strings) + CRUD
  callbacks as props. Cross-slice wiring (rbac-roles → roles + perms) happens
  at the app level — see the preview, which composes both. Local `can()` /
  `RoleChip` keep it self-contained.
- **Convex template** (`convex/features/user-management/`): `um_members`
  table (generic `tenantId`), `listMembers` (joins `users` for profile
  fields), `addMember` / `updateMemberRole` / `removeMember` (soft-delete) —
  all gated via rbac-roles' `requirePermission`.
- Preview: live members table with an Admin/Manager "view as" toggle showing
  permission gating. slice.json + contract + manifest; catalog +1 (new
  `user-management` entry); `registers: []`.
- **Fixed P0 debt:** wrapped the raw `<button>` in the rbac-roles preview in
  shadcn `<Button>`.

### 2026-05-31 — rbac-roles: real RBAC engine (P0 of user-management epic) v0.2.0

- **rbac-roles upgraded from config-only stub to a real RBAC engine**, ported
  from superspace. First of a split: this is the engine; a future
  `user-management` slice (peers this) carries the members/invites/roles-admin
  UI. Full superspace parity is the multi-phase goal (P0–P4).
- **Engine (pure, props-driven):**
  - `lib/permissions.ts` — `PERMS` (~30 curated dot-namespaced keys, open
    union) + `matchPermission` (`*` | exact | `feature.*`).
  - `lib/roles.ts` — the 6 system role presets (owner/admin/manager/staff/
    client/guest, levels 0–90, colors) + `ROLE_MAP`.
  - `lib/check.ts` — `resolvePermissions` / `hasPermission` /
    `roleHasPermission` / `roleLevel` / `isAtLeast`.
  - `lib/permission-catalog.ts` — grouped catalog for the matrix.
  - `hooks/usePermissions` — feed it the actor's resolved permissions →
    `{ can, canAny, canAll }`.
  - `components/` — `<PermissionGate>`, `<RoleBadge>`, `<PermissionMatrix>`.
- **Convex template** (`convex/features/rbac-roles/`): `rbac_roles` table
  (generic `tenantId`), `listRoles`, `seedSystemRoles` / `upsertRole` /
  `removeRole` (system roles immutable), and `checkPermission` /
  `requirePermission` / `getActorPermissions` helpers with a
  `PLATFORM_ADMIN_EMAILS` superadmin bypass. Reads `um_members` (provided by
  the upcoming user-management slice).
- Preview rebuilt as a live engine demo (pick a role → resolved permission
  matrix + PermissionGate/usePermissions reactions). slice.json + manifest +
  contract added; catalog bumped 0.1.0 → 0.2.0 (kind backend → full).
  `registers: []` (pure engine, no nav route).

### 2026-05-31 — convex-auth: props-driven AuthCard + tabbed preview (v0.3.0)

- **New `<AuthCard>`** — a presentational, props-driven sign-in card in the
  convex-auth slice. Pick `methods` (`google`, `github`, `magic-link`,
  `password` with signin/signup tabs, `phone` OTP, `anonymous`); order =
  render order; layout is OAuth row → divider → one field method → optional
  anonymous. Every handler is optional and defaults to a mock that resolves
  `{ ok: true }`, so the card is fully interactive in previews/modals with
  zero Convex wiring; real apps pass handlers wired to `useAuthFlow()`.
  Reuses the existing `GoogleButton` / `MagicLinkForm` / `AnonymousButton`
  blocks; adds `GithubButton` (inline SVG — lucide dropped brand icons),
  `PasswordBlock` (signin/signup Tabs), and `PhoneForm` (2-step phone →
  6-digit OTP via `input-otp`). New files `components/AuthCard.tsx` +
  `components/auth-card-blocks.tsx`; barrel exports `AuthCard` / `AuthCardProps`
  / `AuthMethod`. The production full-page `SignInPage` is unchanged.
- **convex-auth preview** rebuilt as Tabs over AuthCard variants — Magic
  link · Email + password · Google · Phone · Combined — each tab is the same
  `<AuthCard>` with a different `methods` prop.
- slice + catalog bumped 0.2.1 → 0.3.0; `input-otp` added to shadcn deps.

### 2026-05-31 — merge database-cell-selection into notion-database + warning sweep

- **`database-cell-selection` merged into `notion-database` v0.16.0** (NPC
  parity). The `useDragFill` hook + `SelectableCell` component now live in
  `notion-database` (`hooks/useDragFill.ts`, `components/cells/SelectableCell.tsx`)
  and are **wired into `TableView`**: click a cell to select it, drag the
  bottom-right handle up/down to copy its value into the spanned rows via the
  `onRowUpdate` callback. Active only when interactive (not `readOnly` +
  `onRowUpdate` supplied). `brand` token swapped for `primary` to match the
  existing row-selection styling. Barrel re-exports `useDragFill` / `FillSource`
  / `SelectableCell`; `notion-blocks` re-points its drag-fill re-export at
  `notion-database`. Standalone slice dir + catalog entry + preview route
  removed; `layouts.ts` ref dropped. Catalog 44 → 43.
- **Swept the pre-existing audit warnings.**
  - `config.ts` titles aligned to `slice.json` for `code-block`, `equation`,
    `notifications`, `notion-shell` (audit:slices now 0 warnings).
  - Raw `<button>` in `app/preview/slices/theme-presets/page.tsx` wrapped in
    shadcn `<Button>`.
  - `audit-convex-features`: documented the two intentional `@convex-dev/auth`
    deviations as carve-outs (`auth.ts` is the convexAuth entry by convention;
    `auth/_schema.ts` exports `authTablesExt` because it *extends* the library's
    own `authTables`). Audit now reports "all features canonical".

### 2026-05-31 — catalog prune: cut generic/dead slices + merge sections

- **Catalog 59 → 44.** Removed commodity slices that are widely available
  elsewhere (shadcnblocks / magicui / tailwindui) or are dead/niche, keeping
  the differentiators (notion-database, ai-stack, create-your-mcp, ID
  payments).
- **Hard-deleted** (dir + catalog + backend where present): `database-io`
  (deprecated re-export shim), `i18n-translate` (Google-Translate widget),
  `hero`, `cta`, `socials` (-6 convex fns), `document-checklist` (-7 convex
  fns; niche job-search tracker). Dropped dead convex scaffolds
  `audit-log` / `search` (0 endpoints) + `example-feature` (demo).
- **Merged into `landing-sections` v0.2.0** (dropped standalone catalog
  entries): the generic section renderers. Dirs that in-repo templates still
  import (`blog-section`, `pricing-page`, `portfolio-section`,
  `testimonials-grid`, `faq-section`, `feature-grid`, `changelog-feed`)
  keep their code (keep-dir / drop-catalog precedent), so template builds are
  unaffected — they're just no longer sold as separate slices.
- **Merged `subscribers` → `resend-newsletter` v0.1.3.** Standalone
  `subscribers` slice + catalog entry removed; its list backend
  (`convex/features/subscribers`) is retained and now documented as part of
  resend-newsletter.
- **Dropped `full-width-toggle` from catalog** (kept dir — `dashboard-shell`
  imports it; nulled its dangling peer).
- Regenerated `registry.generated.ts`, `manifest.json`, per-slice `agent.md`;
  pruned `family-map.ts`. Typecheck + audit:slices + validate:slices +
  audit:convex-features + gen checks all green.

### 2026-05-31 — notion-database date-range cell fix + catalog tidy

- **DateCell range now visible in the column.** `dateRange` was derived
  only at mount, so toggling the date property's End-date switch left
  already-rendered cells unchanged. Range is now derived live (`!!v.end
  || !!prop.dateRange`) and the cell shows a `Start → End date` slot
  whenever range is active — so the End-date toggle visibly affects the
  column. Per-cell override (popover Switch) still wins for one row.
- **Catalog tidy.** `notion-database` title/description were a multi-
  paragraph wall — trimmed to a short title ("Notion Database") + a
  one-paragraph description; release history stays here in CHANGELOG.
  `manifest.json` regenerated (was stale at v0.13 with the old title).
- **"Doubled" slice — not a bug.** Every slice appears in both the
  manifest's `features[]` and `slices[]` arrays because `loadFeatures()`
  derives features 1:1 from slices (legacy back-compat for old
  `--features` CLI + MCP `rr_list_features`; `features.ts` was deleted
  2026-05-09). The site catalog reads `slices.ts` directly — one entry.

### 2026-05-31 — notion-database per-type Edit-property config panel + date ranges in views

Follow-up to the config-driven menu: the dropdown now differs **per
property type** in a second dimension — an "Edit property" submenu whose
body is type-specific. Plus the date example the user asked for: an
End-date toggle that actually feeds Calendar + Timeline.

**Shipped (notion-database v0.14.0 → v0.15.0, notion-shell v0.7.1 → v0.7.2):**
- `components/column-header/panels/` — `PROPERTY_TYPE_PANEL` registry +
  per-type config panels:
  - `NumberPanel` — format (number/decimal/percent/currency) · decimals · currency code.
  - `DatePanel` — date format · include-time · time format · **End date (range)** toggle (editable `date` only).
  - `FormulaPanel` — expression input. `UniqueIdPanel` — prefix. `SelectPanel` — options summary.
  - `RelationPanel` — target database. `RollupPanel` — relation prop · target prop · aggregate.
  - `EditPropertyPanel` router — shared Name + Description + the routed type panel; every edit flows through one `onPatch(Partial<Property>)`.
- Menu: `edit_property` replaces the standalone `rename` item (Name lives
  in the panel now). `MenuItemContext` gained `prop` / `db` / `databases`;
  `ColumnHeaderActions.patch` replaces `rename`.
- `ColumnHeaderMenu` props: `onPatch` replaces `onRename`; added optional
  `db` + `databases` (relation/rollup pickers; degrade to a hint when
  absent). Re-pull on `rr update`.
- **notion-shell `Property.dateRange`** (new field) — date column defaults
  to a start→end range. `DateCell` opens in range mode when set.
- **Date ranges now drive views** (the user's ask):
  - `bucketByDate` spans every day from `date`→`end` → `CalendarView`
    renders multi-day bars (no view edit needed).
  - `TimelineView` falls back to the start column's own `end` when no
    separate end-prop is configured → a single range column draws the bar.

tsc green · audit:slices + file-size + docs-primitives clean · build green.

### 2026-05-31 — notion-database config-driven column-header menu (nosion parity)

Live `/slices/notion-database` had a flat per-column menu identical for
every property type; notion-page-clone's is config-driven and adapts to
the column. Rebuilt rr's to match the structure (prop-driven, no
`useDbAdapter`).

**Shipped (notion-database v0.13.0 → v0.14.0):**
- `components/column-header/menu-config.ts` — `PROPERTY_TYPE_MENU_CONFIG`
  maps every `PropertyType` → an ordered `mainMenu` of item keys (number →
  Calculate, select/status → Group, computed types drop irrelevant ops).
  `sectionOf` drives automatic separator placement; `inferFilterOp` seeds
  the right filter op per type.
- `components/column-header/items.tsx` — `MenuItemKey → renderer`
  registry: rename · change-type submenu (full dynamic type list) ·
  filter · sort submenu · group · calculate submenu · hide · duplicate ·
  insert-left/right · move-left/right · delete. Each self-hides when its
  host callback is absent.
- `components/column-header/actions.ts` — pure prop-driven stand-in for
  upstream's `useColumnHeaderActions` hook; closes over callbacks instead
  of a store, computes `flags` (filtered / currentSort / grouped /
  groupable / currentCalc / calcs / isTable / canMove*).
- `components/column-header/types.ts` — `MenuItemKey`, `ColumnHeaderActions`,
  `ColumnHeaderFlags`, `MenuItemContext`, `PropertyTypeMenuConfig`.
- `ColumnHeaderMenu.tsx` rewritten as a config render loop; **props
  changed** — now `view` + `index` + `propertyCount` + the new callbacks
  instead of the old flat `onSortAsc/onSortDesc/onSetCalc`. Re-pull on
  `rr update`.
- `NotionDatabase` gained optional `onPropertyDuplicate` /
  `onPropertyInsert` / `onPropertyMove` (items appear only when wired).
- Preview (`/preview/slices/notion-database`) wires all three via new
  `previewColumnOps.ts` transforms — duplicate copies per-row values,
  insert adds an adjacent text column, move reorders one slot.

tsc green · audit:slices + file-size + docs-primitives clean.

### CK-1D Phase 4 — 2026-05-26 — notion-database DB-level menu + full-page shell (silong port)

Final big functional gap from the upstream audit. Closes the "0% on
database-level operations" finding without dragging Convex coupling
into rr.

**Shipped (notion-database v0.11.0 → v0.12.0, notion-shell v0.6.0 → v0.7.0):**
- `components/database-shell/DatabaseMenu.tsx` (130 LOC) — popover w/
  rename / duplicate (structure-only OR with rows) / lock-toggle /
  delete (window.confirm fallback). Every action hidden when its
  callback is omitted, so the same component serves read-only viewers
  and full-edit admins.
- `components/database-shell/DatabasePage.tsx` (75 LOC) — full-page
  wrapper composing a big header (icon slot + inline title input +
  DatabaseMenu) over a NotionDatabase body. Use for canonical
  `/db/[id]` routes.
- `components/notion-database-helpers.tsx` (43 LOC NEW) —
  `buildColumnHeader` extracted from NotionDatabase to keep the
  orchestrator under the 200-LOC cap after adding the `headerActions`
  slot.
- NotionDatabase grew a `headerActions?: ReactNode` slot — hosts can
  drop a DatabaseMenu inline without switching to DatabasePage.
  NotionDatabase 205 → 192 LOC after helpers extraction.

**Type model extension (notion-shell):**
- Database += `locked?: boolean` — read by DatabaseMenu's lock-toggle.

**Architectural strip vs upstream:**
- `useDbAdapter` (Convex hooks bundle) — host wires data + mutations.
- SubItemsPicker (sub-items tree relation) — needs
  `subItemsParentPropId` schema field + `subItemsTree.ts` lib. Tracked
  as a sub-phase.
- IconPickerPopover — lives in rr's separate `icon-picker` slice;
  DatabasePage exposes `iconSlot` so host wires it explicitly.
- DataMenu — lives in the deferred `database-json` slice (export /
  template builders are in notion-database itself but no menu yet).
- PropertiesMenu (inline visibility toggles) — already covered by the
  per-column ColumnHeaderMenu.
- Native window.confirm + window.prompt — keeps zero new dialog deps.

**Parity uplift:** notion-database ~75% → ~83% vs upstream.

### CK-2D — 2026-05-26 — slice + template status tags (beta / wip / deprecated / experimental / coming-soon)

Catalog UX upgrade. Surface readiness signals on slice + template
detail pages so users can tell at a glance whether a resource is
production-ready, mid-port, or on the way out.

**Status taxonomy** (one badge per resource, defaults silently to
"stable"):

| Status | Color | Semantics |
|---|---|---|
| stable | none rendered | production-ready, default (available) |
| beta | blue | feature-complete, polishing |
| wip | amber | in-develop — visible but flagged not-ready |
| draft | zinc | hidden from default catalog (truly unfinished) |
| experimental | fuchsia | research preview, may break |
| deprecated | red strike-through | scheduled for removal |
| coming-soon | cyan | announced, not yet shipped (templates only) |

**Shipped:**
- `lib/content/slices.ts` — `Maturity` union widened from
  `"draft"|"beta"|"stable"` to add `wip`, `experimental`, `deprecated`.
- `lib/content/layouts.ts` — `LayoutStatus` widened similarly,
  preserving `coming-soon`.
- `components/site/maturity-badge.tsx` (47 LOC NEW) — single component
  handles every value across both unions. `stable` renders nothing
  (silent default to keep noise low).
- `app/(docs)/slices/[slug]/slice-detail-header.tsx` — renders
  `<MaturityBadge status={slice.maturity} />` in the header strip.
- `components/site/template-detail.tsx` — same render point. Status
  threaded through `TemplateDetailData.status` from the layout
  detail page server prop.
- `components/build/template-picker.tsx` — `TemplateOption.status`
  union widened to match.

**Seeded values:**
- `notion-database` → `beta` (active multi-phase CK-1D port)
- `notion-shell` → `beta` (Property + DatabaseViewConfig shape
  evolving alongside notion-database)
- `database-io` → `deprecated` (shim — merged into notion-database
  v0.6; slated for removal in v1.0)

Other entries remain default-stable. Future port waves can seed
`beta` / `wip` as they touch each slice.

### CK-1D Phase 7 — 2026-05-26 — notion-database Intl number + date formatters (silong port)

Lifted Intl-based formatters from notion-page-clone. Single source of
truth so cells / cards / charts / rollups render identically and
respect locale + currency-code preferences.

**Shipped (notion-database v0.10.0 → v0.11.0, notion-shell v0.5.0 → v0.6.0):**
- `lib/numberFormat.ts` (83 LOC) — resolveNumberFormat, formatPropertyNumber,
  COMMON_CURRENCIES (USD/EUR/GBP/JPY/CNY/IDR/SGD/MYR/AUD/CAD/CHF/INR/KRW/THB/VND/PHP).
- `lib/dateFormat.ts` (107 LOC) — parseYmdToLocal, formatYmd (6 patterns:
  full/short/mdy/dmy/ymd/relative), formatTime (12h/24h), formatDateValue
  (combined date + optional time + range), label maps.
- NumberCell: currency renderer now reads `prop.numberCurrencyCode` (was
  hardcoded "USD"). Backwards-compatible — defaults to "USD" when unset.
- DateCell: now accepts optional `prop` — routes through `formatDateValue`
  when any of `dateFormat` / `timeFormat` / `dateIncludeTime` is set,
  otherwise falls back to the previous date-fns "LLL d, yyyy" output.
  Wired from property-cells dispatcher.

**Type model extension (notion-shell):**
- Property += `numberCurrencyCode?: string`
- Property += `dateFormat?: "full" | "short" | "mdy" | "dmy" | "ymd" | "relative"`
- Property += `timeFormat?: "12h" | "24h"`
- Property += `dateIncludeTime?: boolean`
- `DatabaseViewConfig` extracted to `./view-config-types.ts` so
  `types.ts` stays under the 200-LOC cap.

**Strip vs upstream:** `dateNotification` field omitted — rr's
notion-database doesn't ship a calendar reminder runtime, so the
related labels stay in the editor slice when that lands.

**Parity uplift:** notion-database ~70% → ~75% vs upstream.

### CK-1D Phase 5 — 2026-05-26 — notion-database checkbox gutter + calendarDrag helpers

Light polish wave. Two additions, both wire into existing pieces
without breaking the public API.

**Shipped (notion-database v0.9.0 → v0.10.0):**
- `components/row-selection/Checkboxes.tsx` (74 LOC) —
  HeaderCheckboxGutter (tri-state select-all / clear with
  `aria-checked="mixed"` indeterminate state) + RowCheckbox (per-row
  toggle, stops propagation so it doesn't fight cell click-to-edit).
  Both require RowSelectionProvider in scope. Raw `<button>` used
  intentionally — wrapping in shadcn Button erases `role="checkbox"`
  context and breaks screen reader announcements.
- `lib/calendarDrag.ts` (75 LOC, pure, verbatim) — parseExistingDate,
  formatDateValue, shiftYmd, computeDateShift, parseDropTargetId.
  Hosts wire these inside their own DndContext to enable calendar /
  timeline drag-to-move without taking on @dnd-kit coupling inside
  the slice itself.
- TableView updated 83 → 97 LOC — automatically renders a leading
  checkbox gutter column when a RowSelectionProvider is in scope.
  `colSpan` math adjusted; visual diff is invisible without provider.

**Scope-down (deferred):**
- SortableHeader (column drag-reorder) + SortableRow (row
  drag-reorder) — upstream's implementations are tightly coupled to
  a flexbox-table refactor + InlineRowTitle + SelectableCell. Porting
  forces a TableView rewrite that blows the 200-LOC view cap. Tracked
  for a future "table-dnd" sub-slice.
- CalcFooter wiring — already active in rr's TableView since v0.6.

**Slice metadata:**
- shadcn deps unchanged (no new primitives)
- packages/cli/lib/manifest.json regenerated
- lib/content/slices.ts SSOT synced
- CHANGELOG appended Unreleased § CK-1D Phase 5

**Parity uplift:** notion-database ~66% → ~70% vs upstream.

### CK-1D Phase 3 — 2026-05-26 — notion-database row multi-select (silong port)

Lifted **row-selection** subsystem from notion-page-clone. Third
biggest gap from the upstream audit (multi-select + bulk delete +
marquee drag-band were all 0% in rr).

**Shipped (notion-database v0.8.0 → v0.9.0, 11 files, 617 LOC):**
- `components/row-selection/RowSelectionProvider.tsx` (82) — Context
  + state w/ stale-id pruning
- `components/row-selection/RowMarqueeOverlay.tsx` (41) — selects
  rows whose bounding rect intersects the band
- `components/row-selection/RowSelectionToolbar.tsx` (78) — floating
  bottom-center action bar
- `components/row-selection/RowSelectionKeyboard.tsx` (68) — Esc
  clear + Del/Backspace bulk delete
- `components/row-selection/Marquee.tsx` (29) — portal-mounted rect
  renderer
- `components/row-selection/useMarqueeDrag.ts` (189) — gesture hook
  w/ AutoCAD window/crossing modes + long-press text activation
- `components/row-selection/marquee-collect.ts` (61) — pure DOM
  hit-test (extracted to keep hook under cap)
- `components/row-selection/marquee-predicates.ts` (21) — interactive
  + text-target bail conditions
- `components/row-selection/marquee-types.ts` (30) — primitive types
- `components/row-selection/index.ts` (18) — barrel
- TableView updated (66 → 83 LOC) — rows now carry
  `data-row-shell-id` + render primary-tinted ring when wrapped

**Architectural strip vs upstream:**
- Toolbar: dropped "Edit property across selection" popover (depends
  on PropertyFormInput, deferred slice). Host injects custom bulk-edit
  UI via `extraSlot` prop.
- Keyboard: replaced `useDbAdapter().deleteRow` with `onDelete`
  callback prop.
- Marquee primitive lifted in-tree (rr didn't have a shared marquee
  helper); split into 5 sibling files to honour the 200-LOC cap.

**Slice metadata:**
- shadcn deps += `separator`
- packages/cli/lib/manifest.json regen
- lib/content/slices.ts SSOT synced
- CHANGELOG appended Unreleased § CK-1D Phase 3

**Parity uplift:** notion-database ~58% → ~66% vs upstream.

### CK-1D Phase 2 — 2026-05-26 — notion-database relation + rollup cells (silong port)

Lifted **relation + rollup** subsystem from notion-page-clone. Closes
the second-biggest gap from the upstream audit (linked-data + computed
aggregates were both 0% in rr — host couldn't model cross-database
references at all).

**Shipped (notion-database v0.7.0 → v0.8.0, notion-shell v0.4.0 → v0.5.0):**
- `cells/RelationCell.tsx` (182 LOC) — popover link picker w/ search,
  inline target-db selector, stale-link healing ("Remove N stale
  links"), optional "+ Create new row in <db>" affordance.
- `cells/RollupCell.tsx` (155 LOC) — read-only aggregate display with
  inline relation / aggregate / target-property pickers and
  graceful "property removed" recovery.
- `lib/relationCandidates.ts` (59 LOC) — pure candidate filter,
  lifted verbatim from upstream.
- `lib/computeRollup.ts` (95 LOC) — pure aggregator (count /
  count_unique / values / sum / avg / min / max / earliest / latest /
  checked / percent_checked). Stripped vs upstream: nested formula
  recursion omitted (returns "—" for formula targets).

**Type model extension (notion-shell):**
- `PropertyType` += `"relation"` `"rollup"` (was 18 → now 20)
- `RollupAggregate` new export
- `Property` extended with `relationDatabaseId`, `rollupRelationPropertyId`,
  `rollupTargetPropertyId`, `rollupAggregate`
- `PROPERTY_TYPE_META` += 2 entries (relation = advanced/non-CSV;
  rollup = computed)

**Dispatcher wiring:**
- `property-cells.tsx` adds 2 cases + 3 new optional `CellArgs`
  fields (`pages`, `databases`, `onCreateRelatedRow`).
- `NotionDatabase.tsx` surfaces matching 3 new top-level props so
  the host stays the source of truth for cross-database state.

**Architectural strip vs upstream:**
- No `useDbAdapter()` — host wires mutations via `onPropertyChange` +
  `onCreateRelatedRow` callbacks.
- No `DynamicIcon` — minimal text fallback inside chips.
- `<select>` swapped for shadcn `<Select>` (matches rest of rr).
- Formula recursion in rollup stripped — keeps lib/computeRollup
  pure and dependency-free (95 LOC vs upstream's ~50 LOC subset of
  a 700+ LOC formula engine).

**Parity uplift:** notion-database ~53% → ~58% vs upstream.

### CK-1D Phase 1 — 2026-05-26 — notion-database row-detail peek (silong port)

Lifted **row-detail subsystem** from notion-page-clone (`row/components/Row*`)
into `frontend/slices/notion-database/components/row-detail/` — 6 files,
409 LOC total, max 92 LOC/file (well under audit cap). Closes biggest
parity gap surfaced in the upstream audit (row-detail was 0% in rr —
host had to build its own sheet/dialog from scratch).

**Shipped (notion-database v0.6.0 → v0.7.0):**
- `useRowOpenMode` — localStorage-persisted "sheet"|"dialog" pref with
  cross-tab sync (storage event). Lifted verbatim from upstream.
- `RowOpenModeSwitcher` — three-button toggle (sheet / dialog /
  open-as-page). Page button only renders when host passes
  `onOpenAsPage` (no router → no button).
- `RowDetailBody` — shared chrome: header (switcher + close) + icon
  slot + editable title + properties slot + blocks slot. Pure /
  slot-driven — upstream's `useDbAdapter` / `useNotionAdapter` /
  `useDatabasesComponents` / `PageCommentsProvider` couplings ALL
  stripped. Host supplies icon picker, properties form, and block
  editor via render slots.
- `RowDetailSheet` — right-side drawer wrapper around Body.
- `RowDetailDialog` — centered modal wrapper around Body.
- `RowPeek` — orchestrator: reads `useRowOpenMode`, picks Sheet or
  Dialog, injects switcher into header, wires `onOpenAsPage` one-shot.

**API exports (additive — no breaking changes):**
- `RowPeek`, `RowDetailSheet`, `RowDetailDialog`, `RowDetailBody`
- `RowOpenModeSwitcher`, `useRowOpenMode`
- types: `RowPeekProps`, `RowDetailSheetProps`, `RowDetailDialogProps`,
  `RowOpenMode`

**Slice deps bumped:** shadcn list extended with `sheet`, `dialog`,
`toggle-group`, `tooltip` (consumer's `npx rr add notion-database`
will now scaffold these primitives if missing).

**Audit parity uplift:** notion-database 45% → ~53% vs upstream (closes
the row-detail gap, 4 files, ~1k upstream LOC — rr ships equivalent
in 409 LOC by slot-decoupling the heavy editor/comments/Convex deps).

### v0.6.0 (open-silong sync) — 2026-05-22 — notion-database mega-merge (Phase 7.10)

Single-slice install path for full Notion-like database table. Closes
the "2-slice install friction" reported by upstream consumer: previously
required `npx rr add notion-database` + `npx rr add database-io` for
the complete experience. Now just `npx rr add notion-database`.

**Merged into notion-database (v0.5.3 → v0.6.0):**
- `components/io/DatabaseIOActions.tsx` (was database-io/components/)
- `components/io/CsvImportDialog.tsx` + `csv-mapping.tsx`
- `components/io/JsonImportDialog.tsx`
- `lib/io/csv.ts` + `serialize.ts` + `template.ts`
- Re-exported from `@/features/notion-database` barrel

**API fix:** `CsvNewProperty` + `JsonImportResult.newProperties[]` now
expose `tempId: string` (was missing — host couldn't remap rowProps
keys when persisting). Single import handler now serves both formats
with proper id remapping.

**Catalog renames:** notion-database title bumped to "Notion-like
Database Table — full table with import/export (11 views · 16 cells
· CSV + JSON)". Tags + csv, json, import, export, template, data,
backup.

**`database-io` slice DEPRECATED:**
- `frontend/slices/database-io/index.ts` reduced to a thin re-export
  shim from `@/features/notion-database` (back-compat).
- Catalog entry marked `[DEPRECATED]` in title + tagline + description.
- `previewPath` redirects to `/preview/slices/notion-database`.
- Old `app/preview/slices/database-io/page.tsx` deleted.
- Scheduled for full removal in v1.0.

**Preview improvements:**
- `InstallCTA` removed from `/preview/slices/notion-database/page.tsx`
  (install info already lives in `/(docs)/slices/notion-database`
  detail page header + Code tab — no duplication).
- New `useLocalStorageState` hook in `previewState.ts` — demo state
  rehydrates on page reload (was reset every refresh). Namespace key:
  `silong-preview:notion-database:v1:{db,rows}`.
- `DatabaseIOActions` toolbar mounted above NotionDatabase — CSV +
  JSON import/export demoable end-to-end from the preview.
- Reset button clears localStorage in addition to resetting state.

**No CK conflict:** changes scoped to notion-database + database-io +
their preview. CK agent's other work (workspace-shell, family-map,
catalog-tabs RSC fix) untouched.

### v0.5.2 (open-silong sync) — 2026-05-22 — PROPERTY_TYPE_META SSOT registry

Closes type-list drift discovered during cross-slice audit. Three
places hardcoded `PropertyType[]` arrays with mismatched counts
(ColumnHeaderMenu: 10, csv-mapping NEW_TYPES: 12, types.ts union: 16).
Adding a new type (v0.6 relation/rollup) would have required syncing
all 3 sites — high drift risk.

- **New** `notion-shell/property-type-meta.ts` (65 LOC) — `PropertyTypeMeta` interface + `PROPERTY_TYPE_META` registry (one entry per type with `label / category / userAddable / csvImportable / computed` flags) + derived `PROPERTY_TYPES_USER_ADDABLE` (16) + `PROPERTY_TYPES_CSV_IMPORTABLE` (12) constants.
- **Refactored** `notion-database/components/ColumnHeaderMenu.tsx` — drops local `PROPERTY_TYPES` array; reads `PROPERTY_TYPES_USER_ADDABLE` + `PROPERTY_TYPE_META[t].label` from `@/features/notion-shell`. Now exposes ALL 16 user-addable types (was 10) — users can now add files / person / formula / created_time / last_edited_time / unique_id columns via the menu.
- **Refactored** `database-io/components/csv-mapping.tsx` — `NEW_TYPES` const stays as deprecated re-export of `PROPERTY_TYPES_CSV_IMPORTABLE` (back-compat); render loop reads from canonical list + uses `PROPERTY_TYPE_META[t].label` (was raw type name).
- **Adding new type** (e.g. v0.6 relation) now requires one edit (`property-type-meta.ts`) + the cell impl — every picker auto-discovers.
- Cell editor SSOT unchanged: `notion-database/components/cells/` is still the only source. database-io re-uses via `renderPropertyCell` re-export, no duplication.
- Open-silong typecheck + rr typecheck green. All files ≤ 200 LOC (types.ts split forced a sibling file to stay under the pre-commit gate).

### CK-1D — 2026-05-20 — workspace-shell slice (NavContext primitive)

New canonical slice `frontend/slices/workspace-shell/` + `convex/features/workspaceShell/` — atomic `(workspaceId, menuSetId)` NavContext, supersedes silo'd `menu-store` + `workspace-store` editors.

- **7 Convex tables** prefixed `workspaceShell_`: `menuSets`, `menuItems`, `itemComponents`, `wsAssignments`, `userAssignments`, `rolePerms`, `navContext`.
- **Resolver chain** (server): user cache → user assignment → workspace default → system default. Single round-trip via `getNavContext`.
- **Editor** at `/dashboard/workspace-shell?tab=menus|tree|settings` — FeatureShell.tabs primitive, URL-routed.
- **WorkspaceSwitcher v2** — 2-tier dropdown (workspace × menuSet) + inline `ForkMenuSetDialog`. Mounts via `<NavContextMount>` inside `WorkspaceProvider`.
- **Sidebar dual-read** — `useNavItems` prefers NavContext via `toLegacyMenuItems` adapter; falls back to legacy when empty (zero break for consumers w/o migration).
- **Tiered RBAC** — `menus.manage` (admin set/CRUD) + `menus.fork` (user fork-from-system).
- **Idempotent migration** `migrations/menusToWorkspaceShell:up` — in-memory map to dodge Convex 4096 read-op limit. Tested: 56 menuSets + 1106 menuItems + 56 wsAssignments. Rerun = all skipped via `metadata.__legacyId` stamp.
- **30-day deprecation shims** — legacy `/dashboard/menu-store` + `/dashboard/workspace-store` wrapped w/ `DeprecationBanner` countdown. Hard-removal runbook at consumer's `docs/cleanup/2026-06-19-workspace-shell-cleanup.md`.
- Catalog: 46 → 47 slices.

**Consumer-test findings (2026-05-22, content-rahmanef-com)**:

- 🐛 **CLI install empty** — `npx rahman-resources add workspace-shell` created empty dirs because template-base mirror not yet pushed to remote rr. CLI fetches from GitHub `main`; local catalog edits don't reach `gen-manifest` until commit lands. *Fix: stage `template-base/frontend/slices/workspace-shell/` + `template-base/convex/features/workspaceShell/` then push.*
- 🐛 **8 hard SuperSpace deps** — slice imports `@/frontend/shared/{lib/features/defineFeature, foundation/provider/WorkspaceProvider, ui/components/ResponsiveDialog, ui/layout/feature-shell/FeatureShell, foundation/utils/convex/any-api, preview, settings, ai/agent}`. Consumer without a `frontend/shared/` tree = unmountable.
- ✅ **3 working deps** — `@/lib/utils` (`cn`), `@/components/ui/{dropdown-menu, button, input, label, switch}` (standard shadcn paths).
- ✅ **Migration consumer-safe** — idempotent + legacy tables untouched + shim banner preserves old URLs.

**Lift-up work pending** (P0 for portability):
1. Inline or slice-local `defineFeature` helper.
2. Replace `WorkspaceProvider` with prop `workspaceId: Id<...>`.
3. Drop `FeatureShell` wrapper — emit plain `<Tabs>` (one less primitive dep).
4. Drop `any-api` cast — consumer Convex types may differ; ship slice-local `api.d.ts` shim or accept TS2589 risk.
5. Drop `defineFeaturePreview` registration (SuperSpace-only registry).
6. Drop `subAgentRegistry` (`agent/index.ts`) — SuperSpace-only AI surface.
7. RHF + Zod check on `ForkMenuSetDialog` — currently no validator.

Status: shipped to SSOT (superspace, commits `be72cd99`…`ee7dd006`). Catalog entry shipped (`lib/content/slices.ts` + `lib/content/changelog.ts`). Template-base mirror **uncommitted** — pre-commit hook blocked by pre-existing tsc errors in `lib/shared/store/*` (`a0d1f3f` database-json sweep) referencing `@convex/_generated/*` which tsconfig excludes. **Resolve upstream before pushing mirror.**

### CK-J — 2026-05-21 — database-json standalone slice

- New peer slice `frontend/slices/database-json/` — JSON wire format v1 (schema + rows) for notion-database.
- **JsonActions** — dropdown w/ Export (Blob-URL download) + Import.
- **JsonImportDialog** — file picker → schema diff preview → submit.
- **lib/serialize.ts** — exportDatabase / parseExport / diffSchema / buildImportResult / downloadJson.
- Schema match: property name (case-insensitive) + exact type. Mismatched listed as new.
- **Result shape MIRRORS CsvImportResult** — single host onImport handler can serve both formats.
- Dropped vs upstream: AI assist (AIAssistDialog + lib/ai.ts), cover, blocks, sub-items, templates.
- Preview `/preview/slices/database-json` — 3-row demo + Export downloads .json + Import + collapsible wire-format viewer.
- Catalog: 45 → 46. JSON 0% → 100%. Database adaptation ~80% → ~82%.

### CK-1C — 2026-05-21 — notion-database FormView (11/11 views)

- **FormView** lifted — title input + per-property inputs via reused `renderPropertyCell` (no separate PropertyFormInput widget), submit → `onRowCreate({title, rowProps})` callback. Settings panel (show/required toggles + title + description + success message).
- **ViewProps** + **NotionDatabaseProps** + **DatabaseViewConfig** extended (onRowCreate / formTitle / formDescription).
- VIEW_REGISTRY now has all 11 entries.
- notion-database `0.3.0` → `0.4.0`. Coverage: views 10/11 → 11/11 (100%). Adaptation ~76% → ~80%.
- Preview /preview/slices/notion-database uses React state so Form submit actually appends a row.

### CK-4 — 2026-05-21 — database-csv standalone slice

- New peer slice `frontend/slices/database-csv/` — Notion-style CSV import + export for `notion-database`.
- **CsvActions** — dropdown w/ Export (Blob-URL download) + Import items.
- **CsvImportDialog** — file picker → auto-map columns → user re-pick (existing prop / Title / skip / + New of 12 types) → submit emits single `onImport({newProperties, rows})` callback. Host owns persistence.
- **csv.ts** — `parseCsv` / `valueFromString` / `exportDatabaseToCsv` / `downloadCsv` helpers exported standalone.
- Auto-seeds select / multi_select / status options from CSV values. Computed types (formula / created_time / last_edited_time / unique_id) recognised + never written.
- Preview `/preview/slices/database-csv` — 3-row demo w/ working in-memory Export + Import.
- Catalog: 44 → 45 slices. CSV coverage 0% → 100%. Database adaptation ~72% → ~76%.

### CK-3 — 2026-05-21 — notion-database +6 property cells

- New cells: **FilesCell** (paste-URL chips), **PersonCell** (initials avatars), **FormulaCell** (expression engine w/ live preview), **CreatedTimeCell** + **LastEditedTimeCell** (readonly system timestamps), **UniqueIdCell** (auto-derived).
- New `lib/formula.ts` — `{{title}}` / `{{prop}}` interpolation + fn(arg, …) + `=expr` math. Pure, no backend.
- PropertyType: 10 → 16 (+ person, files, formula, created_time, last_edited_time, unique_id).
- Property: + formulaExpression?, + uniqueIdPrefix?. Database: + uniqueIdCounter?.
- Existing select / multi_select extracted to dedicated cells for ≤200 LOC budget.
- notion-database `0.2.0` → `0.3.0`. Coverage: 16/17 property types (94%). Adaptation ~65% → ~72%.
- Deferred: relation + rollup (need cross-DB context — wait for upstream mega-bundle).

### CK-wave — 2026-05-21 — notion-database 10/11 views + Filter/Sort builders

- **CK-1A** (`a7532da`) — Lifted **ChartView** (recharts) + **DashboardView**. Views 6→8/11. DatabaseViewConfig extended with chart/dashboard fields. ChartKind + ChartAggregate exported.
- **CK-1B** (`e742c10`) — Lifted **MapView** (SVG world + lat/lng pins) + **TimelineView** (Gantt drag-to-shift). Views 8→10/11 (91%). New helpers: visibility / format / keyboard / timeline-helpers / map-svg.
- **CK-2** (`7b81d41`) — Lifted **FilterBuilder** + **SortBuilder** (shadcn-Select-based). ViewOptions refactored to delegate. Coverage: filter/sort UI 0→100%.
- **CK-final** — notion-database `0.1.0` → `0.2.0`. recharts npm dep added. Catalog title/description/tagline/tags refreshed.
- **Adaptation**: notion-database ~35% → ~65% upstream parity.
- **Deferred**: CK-1C (FormView), CK-3 (file/person/timestamp cells), CK-4 (database-csv standalone). All wait for upstream mega-bundle (Phase 5, ~3wk).

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
