# Rahman Resources — Slice Consolidation Plan

**Goal:** collapse overlapping/confusingly-named slices into fewer slices carrying shadcn-style **variants**, so a consumer runs `npx rr add <slice> <variant>` for one surface or `npx rr add <slice>` for all-of-them-and-pick-via-props. This plan turns nine family analyses + a variant-mechanism design into an ordered, shippable execution path.

---

## 1. Inventory summary

- **80** directories under `frontend/slices/` (one is `_templates`, not a slice).
- **78** installable slices in `packages/cli/lib/manifest.json` (+ 7 aliases).
- Nine analyzed families: **8 partial merges**, **2 keep-separate** (`media-editors`, `data-backend-misc`).
- **25 source slugs** collapse into **8 merged slices** → net **-17** → catalog goes **78 → 61 installable**.
- The remaining ~53 slices are genuine singletons or layered-composition members that must NOT merge; several get **renames/retitles** for clarity instead.

**Confidence ladder (merge quality):**
1. `sections` — pre-blessed (all 7 group-A slices already stamped `"deprecated":"landing-sections"`).
2. `feedback-states`, `profile` — tiny, pure-UI, no backend, ~0 conflicts.
3. `payment` — backend already merged behind a `provider` discriminator; only frontend left.
4. `settings`, `notion-ui`, `ai-workspace` — real but bounded refactors.
5. `admin` — riskiest (3 access models, 2 table prefixes, a scaffold to harvest).

---

## 2. Merge map

### 2.1 `sections`  (was: landing-sections + 7)  — Effort **L**, verdict **partial**

- **Absorbs:** `landing-sections` (core/SSOT), `feature-grid`, `faq-section`, `pricing-page`, `testimonials-grid`, `blog-section`, `portfolio-section`, `changelog-feed`.
- **Variant axis (outer):** which marketing **section KIND** you install — selected by `npx rr add sections <kind>`. **Inner axis:** each section's own `layout`/`columns`/`align`/`featuredVariant` prop (shadcn-style, per-component).
- **Variants → source:** `features`←feature-grid · `faq`←faq-section(+landing-sections dup) · `pricing`←pricing-page(+dup) · `testimonials`←testimonials-grid(+dup) · `blog`←blog-section · `portfolio`←portfolio-section · `changelog`←changelog-feed · `stats`/`newsletter`/`custom`/`composition`←landing-sections only. `composition` is the "add-all" layer (LandingSection[] model + reducer + LandingProvider store + admin LandingEditorView + kind→renderer map) that makes bare `npx rr add sections` a dashboard-configurable page composer.
- **Shared core to hoist:** the `SectionHead` (eyebrow/title/subtitle + align) + `Reveal` motion + the `section px-6 py-16 md:py-24 · mx-auto max-w-*` wrapper contract — today hand-inlined identically in all 7 AND imported from template-scoped `@/components/templates/_shared/*`. Plus landing-sections' config parse helpers (`parseConfigObject`/`cfgArray`/row guards) so any section is drivable off `section.config` JSON.
- **Props API:** two idioms. One section → `<FAQSection layout="grouped" items={faqs} />`, `<PricingSection columns={3} featuredVariant="tint" tiers={tiers} />`. All + configure → `npx rr add sections` pulls every renderer + composition layer → `<LandingRenderer sections={landingSections} />`. Rejected a single polymorphic `<Section kind>` because payloads differ (blog items vs pricing tiers vs Q&A).
- **Key conflicts:** duplicate export NAMES (`PricingSection`/`FaqSection` defined twice — config-driven in landing-sections vs prop-driven in the standalone slice; pick prop-driven as canonical + optional config adapter). `SectionHead`/`Reveal` reach OUT to `@/components/templates/_shared` → must be **vendored into the slice** or fail the audit:slices no-reaching-out gate (this is the real refactor cost). Client/server boundary mix (group-A are server components, landing-sections renderers are `'use client'` — keep radix FAQ accordion as leaf client island).
- **Do NOT fold in:** `testimonials`/`services` (Convex backends — rule 6), `marketing-chrome` (site frame/nav, not body), `content-loops` (generic repeater, one level below "a section"). Note `services` has no UI renderer, so it can't be a variant anyway.

### 2.2 `admin`  (was: admin-console + admin + platform-admin)  — Effort **L**, verdict **partial**

- **Absorbs:** `admin-console` (core/merge-base, richest + portable + real AccessGate/section-registry), `admin`, `platform-admin`.
- **Variant axis:** admin **scope/composition surface** — generic single-instance shell → composed multi-section console → multi-tenant control plane. Same primitive (access-gated nav + content region fed by injected adapters); differs by how much it composes and whom it gates.
- **Variants → source:** `shell`←admin (minimal titled card + `buildAdminStats()` factory + SliceAdminLabels; zero tables) · `console`←admin-console (default; gated two-column shell driving a 26-section registry that mounts OTHER rr slices via a components map; owns Analytics/Audit/Nav-config/SEO-health/Leads + `ac_leads`/`ac_nav_items`) · `platform`←platform-admin (multi-tenant lifecycle + tier presets + KPI grid; owns `padmin_audit`/`padmin_kpi_snapshot`; **needs-adapter**).
- **Shared core:** the access-gate + nav-shell primitive. `admin-console/lib/access.ts` already holds the superset (5-level `AdminAccessLevel`, wildcard `hasPermission`, `filterSections`, `AccessGate`); `admin`'s AdminPage is a degenerate single-card of the same idea; `platform-admin`'s PlatformAdminShell is the same nav+content gated by `platform.*`. All backend-agnostic (injected access + data adapters, no hard Convex import).
- **Props API:** `<Admin variant="shell|console|platform" access={access} sections={ADMIN_CONSOLE_SECTIONS} components={{ users:<UsersPanel/> }} />`. `platform` additionally requires the tenant adapter props.
- **Key conflicts:** env-gate collision (`SUPER_ADMIN_EMAIL` single vs `PLATFORM_ADMIN_EMAILS` allowlist — standardize on the allowlist, reconcile `requireAdmin` with the 5-level model). Three Convex roots/prefixes (none / `ac_` / `padmin_`) → **per-variant schema roots, not one merged schema** (rule 6). `platform` is `needs-adapter` (can't be zero-config like the other two). **`platform-admin` is a contract-only scaffold in-repo** — real impl must be harvested from superspace first or the variant ships empty. Provider-slug repointing: `admin-console/lib/sections.ts` hard-codes `provider:"platform-admin"` and `provider:"ai-admin"` — the platform token must be repointed on merge.
- **Do NOT fold in:** `ai-admin` (a section PROVIDER that plugs INTO the console variant, kept separate and mounted), `resources-launcher-admin` (an `os`-category icon-launcher sharing only the word "admin"). Note: the referenced `admin-panel` peer slug does not exist in-repo (dangling peer) — resolve during merge.

### 2.3 `notion-ui`  (was: notion-shell + notion-database + notion-sidebar)  — Effort **M**, verdict **partial**

- **Absorbs:** `notion-shell` (core; page+block editor + the suite's domain-type SSOT), `notion-database`, `notion-sidebar`. **KEEP SEPARATE:** `notion` (the full app — different architecture).
- **Variant axis:** which **surface** of the pure/props-driven Notion-clone OS you install — page+block editor / database / tree-nav sidebar. All stateless, callback-CRUD, compose together; the variant selects which surface(s) get copied, not an either/or render mode → this is shadcn-**suite** style (multi-surface), not one god-component.
- **Variants → source:** `page`←notion-shell (NotionPage/Header/Block, SlashMenu, block renderers, inline-markdown decorator + BLOCK_SPECS; also holds the Block/Page/Property/Database/DbView type SSOT) · `database`←notion-database (11 views, 18 property types, filter/sort/group, formulaEngine, CSV/JSON I/O) · `sidebar`←notion-sidebar (dnd-kit tree nav; owns its own lightweight 4-field type, deliberately decoupled).
- **Shared core:** the domain type model in notion-shell — `database` currently peer-imports it via `@/features/notion-shell`. Merge folds those types into the suite's `shared/` layer; `database` imports intra-slice.
- **Props API:** `npx rr add notion-ui` copies all three surfaces → compose `<NotionSidebar/>` + `<NotionPage><NotionBlock/>…</NotionPage>` + `<NotionDatabase view="board"/>`. `npx rr add notion-ui database` copies only the DB surface. Behavior via each surface's own props.
- **Key conflicts:** **name collision** with the existing `notion` app slug (both use `Notion*` component names) — keep suite = `notion-ui`, consider renaming app → `notion-app`. **`notion` cannot become a variant** (adapter/context-driven + Convex backend + 182 tests; a variant swaps layout/style via a prop, not data-architecture + backend). Peer-dep rewrite: repoint `notion-database/types.ts` from `@/features/notion-shell` to `@/features/notion-ui/shared` and drop its `peers: notion-shell ^0.7`. **Stale contract:** notion-shell/slice.json lists NotionDatabase/TableView/etc as `provides` but `index.ts` doesn't export them (they live in notion-database) — merge reconciles this.
- **Why keep the app too:** it's complementary, not redundant — the app exposes a `DatabaseAdapter.renderDatabase()` seam and bundles NO DB views, so `<NotionDatabase>` is exactly what a consumer plugs into the app's database blocks.

### 2.4 `ai-workspace`  (was: ai-chat + ai-studio + ai-agents)  — Effort **M**, verdict **partial**

- **Absorbs:** `ai-chat` (core), `ai-studio`, `ai-agents`; the chat variant also absorbs **only ai-router's ChatFab UI** (ai-router itself stays separate). **KEEP SEPARATE:** `ai-router`, `ai-admin`, `create-your-mcp`.
- **Variant axis:** **interaction surface** over the one shared agent loop — conversational chat vs generation canvas vs autonomous async runner. Logic (agent loop + tool registry + model/message types) is identical; only how turns render differs.
- **Variants → source:** `chat`←ai-chat (+ai-router FAB) — FAB/panel + `runAgentLoop` over a ToolHost; sub-layout `layout="fab|workbench|sidebar"` · `studio`←ai-studio (single prompt → streaming output + variation grid + version tree; scaffold) · `agents`←ai-agents (async task queue + run-trace dashboard; `createAgentRunner` drives the same loop; in-memory Map default, Convex host optional).
- **Shared core:** the ONE function-calling loop in `@/shared/agentic` (`runAgentLoop` + `ToolHost` + `defineToolCollection` + `globalToolRegistry`) — confirmed across all three. Lift the FAB/panel shell + message rendering, the model/tier picker, the agent-loop binding, and the shared message/step/generation types. All three share the identical peer set.
- **Props API:** `<AiWorkspace variant="chat" chat={sendFn} />` | `variant="studio" generate={genFn}` | `variant="agents" runner={createAgentRunner(host)}`. Backend injected as props (portable-slice R3).
- **Key conflicts:** **duplicate FAB** — ai-chat/AiChatFab (props-injected `chat`) vs ai-router/chat-fab (auto-binds globalToolRegistry) → collapse to ONE FAB whose binding is a prop. **Three Convex roots** (`aiChat` / `ai-studio` / `ai-agents`) → per-variant convex gating so `add ai-workspace chat` doesn't drag studio/agents tables (see §6 open question). **Module-path naming:** ai-chat uses camelCase `aiChat` (Convex forbids hyphens) while studio/agents dirs are hyphenated — normalize each variant to a hyphen-free module. Per-variant npm deps diverge (chat: @ai-sdk/*; studio/agents: just `ai`).
- **Do NOT fold in:** `ai-router` (the OpenRouter tier-proxy BACKEND the suite consumes as a peer transport — only its redundant FAB folds), `ai-admin` (config plane / operator console; becomes an optional shared dep, not a variant), `create-your-mcp` (inverse direction — exposes YOUR tools to external clients). **Flag:** `assistant` ships yet another chat panel over the same kit — candidate to fold into the chat variant in a later pass.

### 2.5 `payment`  (was: doku-payment + midtrans-payment)  — Effort **M**, verdict **partial**

- **Absorbs:** `doku-payment` (core, richest), `midtrans-payment`. **KEEP SEPARATE:** `storefront-checkout`, `resend-newsletter`, `cal-com-booking`.
- **Variant axis:** **payment service provider** (Indonesia PSP). One checkout/webhook/order lifecycle; only the gateway integration differs — exactly what the schema's `provider = v.union("midtrans","doku","stripe")` discriminator was built for (a future `stripe` variant is already reserved → extensible).
- **Variants → source:** `doku`←doku-payment (Hosted Checkout + Direct channel picker, 22-entry channel registry, HMAC-signed REST, dep-free, server-side env) · `midtrans`←midtrans-payment (Snap hosted-checkout button + orders history; needs npm `midtrans-client` + a next-public client key).
- **Shared core:** **the entire `convex/features/payment` backend is ALREADY the shared core** — `paymentOrders` + `paymentWebhookEvents` with a provider column, shared query/mutation/http, provider code isolated under `doku/` and `actions/<provider>.ts`. Frontend shared contract = the common `<ProviderCheckout amount orderId customer callbackUrl onCheckout/>` signature (doku.tsx is explicitly a mirror of midtrans.tsx) + `formatIDR`.
- **Props API:** neutral router page → `<Checkout provider="doku|midtrans" amount={…} orderId={id} customer={…} />` lazy-imports `components/providers/<provider>`. midtrans's own checkout-page.tsx already anticipates this router.
- **Key conflicts:** both register `/checkout` route + nav "Checkout" → one router page keyed on the prop. **`generalization.forbiddenTerms` cross-ban** (doku forbids "midtrans" and vice-versa, fed to check-forbidden-terms.mjs) → must be dropped/rescoped or the merged slice fails audit. Stale contract metadata claims per-provider prefixed tables (`doku_orders`/`midtrans_orders`) but the real `_schema.ts` uses shared unprefixed tables — no real conflict, reconcile the metadata. Dep asymmetry (only midtrans pulls npm + a next-public key). **Peer-ref breakage:** `storefront-checkout` peers `doku-payment@^0.2` by slug → repoint to `payment`.
- **Why M not L:** backend merge is done; work is frontend consolidation into `components/providers/{doku,midtrans}` + the router page + metadata/version reconciliation.

### 2.6 `settings`  (was: settings-page + shell-settings)  — Effort **M**, verdict **partial**

- **Absorbs:** `settings-page` (core), `shell-settings`. **KEEP SEPARATE:** `icon-picker`, `image-picker`, `theme-presets`, `full-width-toggle`.
- **Variant axis:** which settings **surface** the shell renders — **account** (profile/preferences/notifications/danger-zone, async `load+save` adapter) vs **appearance** (style/mode/accent/wallpaper/shell/display, synchronous per-setting adapter). Both follow "consumer injects an adapter, slice owns no data" and share the Section/Row/Segmented visual language.
- **Variants → source:** `account`←settings-page (two-column shell, collapses to Select on mobile; `createMemoryAdapter` for demos) · `appearance`←shell-settings (also the HOME of the shared `SettingsSection`/`SettingsRow`/`Segmented`/`AccentSwatches` primitives).
- **Shared core:** the settings visual primitives currently in shell-settings — on merge, settings-page's Card-based sections rebase onto them so account + appearance share one chrome.
- **Props API:** two adapter shapes differ, so this ships **shared primitives + two composable shells**, not a single-prop switch. `<Settings variant="account" adapter={accountAdapter} />` (async) and `<Settings variant="appearance" adapter={appearanceAdapter} />` (sync).
- **Key conflicts:** **hard name collision** — settings-page exports `type SettingsSection` (a union) while shell-settings exports a `SettingsSection` COMPONENT → rename the union to `SettingsSectionId`. **Incompatible adapters** (async persistence vs sync per-setting) → ship BOTH adapter types + TWO shells; `variant` selects component+adapter, not just render. Content overlap (Preferences theme/language/density vs appearance style/mode/accent) → pick a canonical. No Convex on either side.
- **Do NOT fold in:** `icon-picker`/`image-picker` (same field-picker PATTERN but zero shared code + incompatible value types: `string` vs `ImageValue` object; merging would force heavy phosphor/lucide catalogs onto image-only users — the monolith rule warns against this; group them under a "pickers" catalog CATEGORY at most). `theme-presets` (a theme ENGINE with next-themes + a ~240KB tweakcn registry; it DRIVES an appearance panel by composition). `full-width-toggle` (a single app-shell preference, composes into a Display group, not a merge).

### 2.7 `feedback-states`  (was: loading-states + empty-states)  — Effort **S**, verdict **partial**

- **Absorbs:** `loading-states` (core), `empty-states`. **KEEP SEPARATE:** `command-menu`, `notifications-center`, `onboarding-wizard`, `start-here`.
- **Variant axis:** which non-content state phase renders — in-flight **loading** (skeleton/spinner) vs zero-data/error **empty** (empty + 404/500/403). Both = "no real content to show yet" placeholders.
- **Variants → source:** `loading`←loading-states (`LoadingSkeleton kind=text|card|list|table|form|page|block` over shadcn Skeleton; `LoadingState variant=inline|block|overlay` over Spinner) · `empty`←empty-states (`EmptyState kind=404|500|403|no-results|empty-list|first-use` over shadcn Empty; `ErrorPage` full-page wrapper for not-found/error).
- **Shared core:** shared PATTERN, ~0 lines of literal common code — both are a `Record<Kind,Preset>` map + one configurable component composing a single shadcn primitive with every slot overridable. Merge **co-locates** them under `feedback-states/{loading,empty}/`; it does not dedup code. Both pure-UI, no Convex/store/router.
- **Props API:** `npx rr add feedback-states loading|empty`, bare pulls both. `<LoadingSkeleton kind="table" columns={4}/>`, `<EmptyState kind="404" primaryAction={…}/>`.
- **Key conflicts:** filename collision (both ship `components/presets.ts` → must live under variant subdirs). Two tool namespaces + two configExports + two nav entries reconcile into one. Dep asymmetry (empty needs lucide + shadcn empty/button; loading only skeleton/spinner).
- **Do NOT fold in:** `command-menu`/`notifications-center` ("overlays" — only commonality is a floating surface; different deps/state/data). `onboarding-wizard`/`start-here` ("onboarding" — one is a config FORM that writes, the other a read-only OS TOUR that reads a registry). **Naming remedy:** rename `onboarding-wizard`→`site-setup-wizard`; leave the others (names already accurate).

### 2.8 `profile`  (was: resume + about-profile)  — Effort **S**, verdict **partial**

- **Absorbs:** `resume`, `about-profile`. **KEEP SEPARATE:** all other os-apps (browser, code-editor, os-terminal, system-monitor, files, file-explorer, quicklinks, app-store, assistant, booking, appshell, media-viewer).
- **Variant axis:** presentation depth of one owner's identity — a formal long-form printable **CV** vs a compact avatar+links+FAQ **card**. Same subject, two renderings.
- **Variants → source:** `resume`←resume (summary/skills/experience/projects + Print/PDF; `ResumeProfile`/`configureResume`) · `card`←about-profile ("About This Mac"-style identity card + FAQ accordion; `AboutProfile`/`configureAbout`).
- **Shared core:** module-singleton data seam (`let profile` + `configureX` + `useXProfile()`), identical `lib/host.ts` boilerplate (`AppDescriptor` + inert `usePublishInspector`), the identity header block (name h1, `roles.join(" · ")`, MapPin, outbound-link rows), overlapping fields name/roles/location, and the portable-person `generalization` contract. Deps near-identical (lucide + shadcn button/scroll-area; card adds avatar).
- **Props API:** `<Profile variant="resume"/>` / `<Profile variant="card"/>`; a single dispatcher switches on variant. Merged slice keeps TWO typed data shapes + both `configure()` seams.
- **Key conflicts:** divergent data models (overlap only name/roles/location → keep two shapes), two module-level singletons must coexist (`configureResume` + `configureAbout`), default-export name collision resolved by the `Profile` dispatcher.
- **Do NOT fold in:** the hinted `files`↔`file-explorer` merge does NOT hold — `files` is an attachment PRIMITIVE over opaque `storageId` blobs; `file-explorer` is a full file-MANAGER over a hierarchical path fs. Incompatible adapter contracts, overlap is only the word "file". **Rename remedy:** `files`→`file-upload`/`file-attachment`, do not merge.

---

## 3. Keep-separate list (do NOT merge)

**media-editors family (all keep, rename instead):**
- `image-editor` — canonical raster tool (Konva + @imgly bg-removal). Keep the name.
- `media-studio` — DOM/CSS social-graphic maker; currently mis-titled "Image Editor". **RENAME → `design-studio`/`social-studio`** + fix `config.title`, `mediaStudioApp.title`, and media-viewer's `editorFor()` label.
- `media-viewer` — READ-ONLY quick-look; **reclassify out of "editors"** (it's the hub that hands off).
- `reel-editor` — Canvas-2D video NLE (unrelated to image editing).
- `html-studio` — sandboxed-iframe code sandbox (unrelated). Optional real win: hoist the copy-pasted `AppDescriptor`/`usePublishInspector` into a `shared/os-appshell` module cascaded as a dep — dedups without merging.

**data-backend-misc family (all 18 keep):** `data-table`, `activity`, `library`, `event-tracking`, `vector-search`, `broadcast-channel-sync`, `audit-log`, `rate-limit`, `convex-auth`, `rbac-roles`, `user-management`, `seo`, `selection`, `markdown`, `pages-cms`, `publisher-clean-html`, `comments`, `motion-kit`.
- Auth cluster (`convex-auth → rbac-roles → user-management`) is a **layered peer-dep composition chain, not variants** — they stack, they don't substitute; already composed at app level via prop bags. Document as an explicit 3-layer add order in catalog copy.
- Content cluster (`pages-cms` / `markdown` / `publisher-clean-html`) — three incompatible content models + output targets; `publisher-clean-html` is a build-time export STAGE, not an editor. **Retitle** it to signal "Static HTML Export".
- Event trio (`audit-log` = compliance / `event-tracking` = product analytics / `activity` = productivity feed) — share only "events have timestamps". **Retitle** to disambiguate (event-tracking's title is currently "Analytics" while a sibling is literally `activity`).

**Other keep-separates surfaced by families:** `ai-router`, `ai-admin`, `create-your-mcp`, `resources-launcher-admin`, `testimonials`, `services`, `marketing-chrome`, `content-loops`, `icon-picker`, `image-picker`, `theme-presets`, `full-width-toggle`, `command-menu`, `notifications-center`, `start-here`, `storefront-checkout`, `resend-newsletter`, `cal-com-booking`, `notion` (app), and all remaining os-apps.

---

## 4. Variant mechanism

### 4.1 slice.json extension (SSOT, convention-driven)

Add one optional top-level `variants` object. Variant files live at `frontend/slices/<slug>/variants/<id>/`; an optional shared-core folder sits at slice root and is copied for **every** variant.

```json
"variants": {
  "default": "full",
  "shared": "shared",
  "items": [
    { "id": "minimal", "title": "Minimal composer", "description": "Input + streaming bubbles only." },
    { "id": "full",    "title": "Full workbench",   "description": "Three-column shell with tools." }
  ]
}
```

- **Required:** `default` (must ∈ items ids) + `items[]` (each `id` kebab `^[a-z0-9-]+$`).
- **Optional:** `shared` (folder copied for every variant; omit if variants are self-contained), per-item `title`/`description` (power `info` + site).
- **Deliberately NOT in v1:** per-variant `version` (variants share the slice's single version — the PAIR SSOT is untouched) and per-variant `npm`/`shadcn` (slice-level deps stay the union — a variant install may pull an unused dep; add optional `items[].npm` later if a footprint diverges).
- **Author also writes** (never CLI-generated): root `index.ts` = the all-mode prop switcher, and each `variants/<id>/index.ts` exporting the **same canonical component name**.

### 4.2 add-with-variant

Variant becomes the **2nd positional** (matching the required UX), disambiguated against the existing `[target]` 2nd positional in `runAdd()` (cli.js L488): read declared ids from the manifest entry, and only treat `restPos[0]` as a variant if it's in `ids`; `--variant` flag wins; unknown variant → clear `fail()`. Thread through `runLift` → `resolveLiftPlan` (L1222). When `slice.variants && variant`, **replace** the single `slicePath` step with variant steps (reusing the existing from/toAbs decoupling — tiged flattens a subpath's contents into `toAbs` for free):

```
steps.push({ from: `${slicePath}/variants/${variant}`, toAbs: join(target, slicePath) });  // flatten to slice root
if (variants.shared) steps.push({ from: `${slicePath}/${shared}`, toAbs: join(target, slicePath, shared) });
// convexPaths, npm, shadcn, env, peers unchanged (slice-level union)
```

Only the chosen variant's files + shared core land in `slices/<slug>/`, flattened so imports resolve at `@/features/<slug>` exactly like a non-variant slice. `preview.tsx` isn't pulled (lives at slice root, outside `variants/<id>`). `rr.json` records the variant (rr.mjs `addSlice` gains `opts.variant`).

### 4.3 all-variants mode

`npx rr add <slug>` (no variant) keeps the **current single whole-tree step untouched** — the source tree now also contains root `index.ts` (switcher) + `shared/` + `variants/<a,b>/`, so the consumer receives all variants + the switcher with **no cli.js copy-logic change**. Runtime selection via the authored root barrel:

```tsx
// frontend/slices/<slug>/index.ts (all-mode entry)
const REGISTRY = { minimal: Minimal, full: Full } as const;
export function AiChat({ variant = "full", ...props }) { return (REGISTRY[variant] ?? Full)(props); }
```

**Swap symmetry:** each `variants/<id>/index.ts` exports the SAME canonical name, so in single-variant mode the flattened variant index *is* `slices/<slug>/index.ts` and `@/features/<slug>` resolves to that variant directly (prop absent); in all-mode it's the switcher. **Same import site, both modes.** Constraint for flatten correctness: intra-variant file→file imports MUST be relative-within-variant; variant→shared imports MUST use `@/features/<slug>/shared/...`; NEVER import `@/features/<slug>/variants/<id>/...`.

### 4.4 catalog / gate impact

- **`gen-slice-catalog.mjs` — NO CHANGE.** Its rewriter only touches 4-space scalar lines; deeper-indented keys never match. A hand-authored `variants` prose block in slices.ts is ignored. We do NOT generate per-variant scalars (nothing to sync — one version).
- **`slice-schema.json` — REQUIRED.** Root is `additionalProperties:false`, so add the `variants` object to `properties` or every variant slice.json fails validation. (Note: the existing `variants` at schema L249 is an unrelated nested `preview.kind` enum — no collision.)
- **`gen-manifest.mjs` — REQUIRED.** Add a `sliceJsonVariants(slug)` reader mirroring `sliceJsonVersion` (L105) and emit `variants` on the manifest entry **only when present** (keeps slice.json the SSOT, keeps non-variant manifest bytes unchanged). `resolveLiftPlan` reads the manifest, not slice.json directly.
- **`lib/manifest.json`** — regenerate via `npm run manifest:sync`.
- **`lib/content/slices.ts`** — OPTIONAL hand-authored variants prose for /slices + `info`.
- **Gates:** the version PAIR gate (audit-slice L68) is UNCHANGED (variants add no version fields). `sync-slice-manifests.mjs` already recurses, so `files[]` naturally includes `variants/<id>/**`. **Recommended new audit checks:** every `items[].id` has a `variants/<id>/` folder; `default ∈ ids`; forbid `@/features/<slug>/variants/` self-imports.

### 4.5 backward compatibility

A slice without a `variants` key is **byte-for-byte unaffected end-to-end**: gen-manifest emits no `variants` (identical entry); `ids = entry.variants?.items ?? []` is empty so positional[1] is treated as target as today; the variant branch in resolveLiftPlan is guarded by `slice.variants && variant`; schema keeps `variants` optional; the PAIR gate, sync-slice-manifests, gen-slice-catalog, and import-boundary audit all operate identically. **Net: purely additive — all 78 existing slices keep installing with the same command, files, and rr.json shape.** This is why the mechanism ships as a proven no-op (Phase 0) before any merge.

### 4.6 files to change

- `packages/cli/lib/slice-schema.json` — add optional top-level `variants` (mandatory, root is `additionalProperties:false`).
- `packages/cli/bin/cli.js` — `runAdd` variant parse + disambiguation; `runLift` thread `flags.variant`; `resolveLiftPlan` variant-step swap + flatten + optional shared step.
- `packages/cli/scripts/gen-manifest.mjs` — `sliceJsonVariants(slug)` reader; emit-when-present.
- `packages/cli/lib/manifest.json` — regenerate (`npm run manifest:sync`).
- `scripts/validation/audit-slice.mjs` + `audit-slice-helpers.mjs` — variant gates + surface `meta.variants`.
- `packages/cli/lib/rr.mjs` + `rr-schema.json` — persist `opts.variant` in rr.json for `update`.
- `CLAUDE.md` + `docs/slice-architecture.md` — document the `variants/<id>/ + shared/` convention, import rules, authored switcher.
- `scripts/features/scaffold-slice.mjs` — OPTIONAL `--variants a,b` to scaffold shape + stub switcher.

---

## 5. Migration phases (ordered, lowest-risk first — each a shippable chunk)

**Phase 0 — Variant mechanism (no merges).** Land §4.6 machinery + docs + optional scaffold support. Prove it's a no-op on all 78 slices (add one throwaway 2-variant fixture, verify `add`/`add <variant>`/`add` all-mode, then remove it). Wire `manifest:sync` into the same pre-commit gate as `gen:catalog:check` so a variants block can never drift from the manifest. **Prerequisite for every merge below.** Bump CLI, do not publish yet.

**Phase 1 — Cheap non-merge clarity renames (independent, parallelizable).** `media-studio`→`design-studio`, `files`→`file-upload`, `onboarding-wizard`→`site-setup-wizard`, plus retitles (`event-tracking`, `publisher-clean-html`, media-viewer's `editorFor` label). Each is a slug/alias + catalog + manifest touch, no structural risk. (Gated on the open-question rename approvals.)

**Phase 2 — `feedback-states` (S).** First real merge; pure-UI, no backend, filename collision resolved by variant subdirs. Exercises the whole pipeline on the safest possible pair.

**Phase 3 — `profile` (S).** Two tiny slices, no backend; unify the two `configure` seams + add the `Profile` dispatcher. Second easy win, builds confidence.

**Phase 4 — `settings` (M).** Rename the `SettingsSection` collision → `SettingsSectionId`; rebase account sections onto shell-settings' primitives; ship two adapter types; pick a canonical for the Preferences/Appearance overlap. No Convex.

**Phase 5 — `payment` (M).** Backend already merged — frontend-only: `components/providers/{doku,midtrans}` + neutral `<Checkout provider>` router page + drop the cross-provider `forbiddenTerms` ban + reconcile stale table-prefix metadata + repoint `storefront-checkout` peer.

**Phase 6 — `sections` (L, highest value).** The biggest collapse (8→1) and pre-blessed. Main real cost: **vendor `SectionHead`/`Reveal` into the slice** (kill the `@/components/templates/_shared` reach-out), pick prop-driven canonical for the doubly-defined `PricingSection`/`FaqSection`, keep the radix FAQ accordion as a leaf client island. Regenerate catalog + drop 7 slugs from manifest/MCP.

**Phase 7 — `notion-ui` (M).** Fold the trio's types into `shared/`; repoint `notion-database`'s peer-import intra-slice; reconcile notion-shell's stale `provides`; keep `notion` app distinct (decide the `notion-app` rename). No new backend work — pure props suite.

**Phase 8 — `ai-workspace` (M).** Collapse the duplicate FAB to one prop-bound component; normalize the three Convex module paths to hyphen-free; **add per-variant convex gating** (the one mechanism extension — see open questions) so add-all doesn't drag all three table sets; register the three RBAC namespaces in the merged contract. Merge the two scaffolds (studio/agents) as honest "impl pending" variants or block them (open question).

**Phase 9 — `admin` (L, riskiest → last).** Standardize on `PLATFORM_ADMIN_EMAILS`, reconcile `requireAdmin` with the 5-level `AdminAccessLevel`, keep three per-variant schema roots (no monolith), repoint the `provider:"platform-admin"` section token, scope deps per variant. **Harvest `platform-admin`'s real impl from superspace first** or ship a 2-variant admin (shell/console) now and add `platform` when harvested.

**Phase 10 — Finalize + publish.** Full catalog regen (`gen-slice-catalog.mjs`), `manifest:sync`, skills sync, MCP resources refresh, run `audit:slices` + `npm run e2e`. Bump `rahman-resources` (CLI) + `rahman-resources-mcp`, verify `npx tsc --noEmit`, push main → then the publish suggestion (user runs OTP).

---

## 6. Risks + open questions

**Risks (from the mechanism design + merge specifics):**
- **Flatten breaks escaping relative imports.** Single-mode pulls `variants/<id>/` into the slice root; any intra-variant import that climbs above the variant folder resolves in all-mode but breaks after flatten. Mitigation: the enforced import rule + the new audit check forbidding `@/features/<slug>/variants/` imports.
- **Manifest must carry variants or the CLI can't resolve them.** `resolveLiftPlan` reads manifest.json; if `gen-manifest.mjs` isn't re-run after adding a variants block, `add <slug> <variant>` silently treats the variant as a target dir. Mitigation: wire `manifest:sync` into pre-commit (Phase 0).
- **Positional ambiguity edge:** a target dir literally named like a variant id would be read as a variant. Rare; `--variant`/`--target` are the escape hatch; document it.
- **Union deps on single-variant install** (a few unused deps) — acceptable for lazy v1; extend with `items[].npm` only where footprint diverges (sections/ai-workspace/payment are the candidates).
- **slice.json isn't pulled in single-variant mode** (sits at slice root, outside `variants/<id>`), so the consumer copy lacks the SSOT that `update`/audit read locally. Either add a tiny single-file slice.json step in variant mode, or accept it (rr.json already records slug+version+variant).
- **Author discipline:** the root switcher and each `variants/<id>/index.ts` must export the SAME canonical name or single/all-mode swap symmetry breaks. Cover with the scaffold stub + a doc note; optionally lint the export name.
- **convexPaths stay whole/shared across variants** in v1 — fine when the backend is variant-agnostic, but `ai-workspace` and `admin` genuinely need per-variant schema roots. This is the one v1 gap that Phases 8–9 must close (see open question).
- **Scaffold variants (platform-admin, ai-studio, ai-agents)** risk shipping empty; harvest or block per the open questions.

**Open questions (require your decision before file surgery):** see the `openQuestions` list — merged-slug naming (notion-ui/notion-app, sections vs landing-sections, admin umbrella), whether to ship scaffolds now or harvest first, version-rebasing policy, per-variant dep scoping vs lazy union, rename approvals, ai-router FAB fold-in scope, per-variant Convex gating for the two multi-backend merges, and the `assistant` later-pass fold-in.