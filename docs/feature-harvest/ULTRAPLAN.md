# ULTRAPLAN — Harvesting Instatic's visual-CMS engine into rr slices

Companion to [README.md](README.md) (coverage matrix) and the per-feature studies under [`features/`](features/).

## 0. Principle (ponytail)

**reuse > enhance > build-new. Never rebuild what an rr slice already covers. Harvest the differentiator, not the runtime.**

- The differentiator is Instatic's **editor-free engine**: `page-tree` + `module-engine` + `publisher` + `loops` + `templates`. That is pure logic and worth lifting near-verbatim.
- The **runtime** around it (Bun server, `server/repositories/*` pass-throughs, `/_instatic/*` URL prefixes, in-memory caches, CSS Modules + pixel-art-icons, TypeBox everywhere, server-managed cookie sessions) is host machinery — **leave it behind**, replace with injected adapters / props / native Convex.
- rr already ships auth (`convex-auth`), roles (`rbac-roles`), users (`user-management`), payments (`doku-payment`/`midtrans-payment`/`convex/features/payment`), the content domains (`pages-cms`, `blog-section`, `portfolio-section`, `landing-sections`, `services`, `library`), theming (`theme-presets`), shell (`appshell`, `marketing-chrome`), palette (`command-menu`), grids (`notion-database`, `data-table`), files (`file-explorer`, `files`). **None of these get re-harvested.**
- Every lift obeys rr slice law: the slice **PAIR** (`slice.json` with a folded `contract` block + `slice.manifest.json`, version SSOT `slice.json.version`===`slice.manifest.json.version`) + a **generated** catalog row (`npm run gen:catalog` → `lib/content/slices.ts`); barrel-only cross-slice imports (`@/features/<slug>`), no deep reach; props-driven (no hardcoded consumer URL/env/copy/role-enum); Convex args validated (`v.*`), no bare `.collect()`, `requireUser`/`requireAdmin` in every mutation, every filter/order indexed; files ≤200 lines; shadcn primitives + theme tokens only; Next16 (`proxy.ts`).

## 1. Dependency graph

```
                       [exists: convex-auth, rbac-roles, rate-limit, command-menu,
                        appshell, marketing-chrome, theme-presets, pages-cms,
                        notion-database, file-explorer, files, payment, services]
                                          │
  audit-log(enhance) ──────────┐         │
                               ▼         ▼
   ┌─────────── PURE-LOGIC LEAVES (no Convex, injected types + mocks) ───────────┐
   │  content-loops ──────► site-templates-engine ──────► publisher-clean-html   │
   └──────────┬──────────────────┬────────────────────────────┬─────────────────┘
              │                   │                            │
              ▼                   ▼                            ▼
        visual-components-model ──────────────────────────► visual-page-canvas  ◄── data-workspace
                                                                 ▲                      │
                                                                 └── import-engines ────┘
                                                                     (site-transfer)

  CONVEX-BACKED (layer on convex-auth + rbac-roles + rate-limit + audit-log):
     data-workspace · media-library · ai-byok · cms-native-forms · auth-hardening · plugin-sandbox
```

**Hard ordering rules**
- `visual-components-model` **before** `visual-page-canvas` (canvas renders the block/VC model the components-model defines).
- `content-loops` + `publisher-clean-html` + `site-templates-engine` **before** the canvas (canvas composes them via barrels for dynamic loops, preview/export, and template instantiation).
- `data-workspace` before/with the canvas's dynamic-data binding (canvas can ship without it; bind later).
- `convex-auth` + `rbac-roles` + `rate-limit` + `audit-log` **before** `plugin-sandbox`, `ai-byok`, `cms-native-forms`, `auth-hardening`.
- `import-engines` (site-transfer) after the canvas's data model exists; `html-import`/`site-import` are **deferred** (they need the editor node model).

## 2. Build waves

Each slice below = `frontend/slices/<slug>/` (+ `convex/features/<slug>/` where backed). Author the **PAIR** (`slice.json` with folded `contract` + `slice.manifest.json`) + regen the catalog (`npm run gen:catalog`). Cross-check shape against `frontend/slices/pages-cms/`. (See §3 for the current metadata convention.)

### Wave 0 — Foundations & enhance-in-place (lowest risk, unblocks the rest)
- **audit-log** (enhance, S). Create the missing `convex/features/audit-log/_schema.ts` that `slice.json` already points at; add a validated + auth-gated `logEvent` mutation and `list` query; reconcile `_shared/auditLogger.ts` (drop the `workspaceId`/branded-`Id` contract, route through `TenantAdapter`, write the defined `activityEvents` table). Make fail-mode an option (rr fail-closed default). Unblocks plugin-sandbox / ai-byok / setup actor logging.
- **command-menu** (enhance spotlight, M). Add opt-in pure-TS `lib/engine/` (`rankCommands` matcher, `ProviderRunner`, 3-gate `filterCommands`, `toGroups`) emitting `CommandGroup[]`. Strip: `@core/http` fetcher → injected fetcher; hardcoded `/admin/api/cms/*` → per-provider URLs; plugin-runtime providers → just extra injected providers; capability enum → injected `can(ctx,cap)`; zustand `getState()` reads → consumer adapter. Zero new deps, minor version bump.
- **editor-preferences** (build-new, M). Copy Instatic `catalog.ts` + `editorPreferences.ts` near-verbatim; swap TypeBox → plain/zod; make catalog + storageKey injectable via `createPreferenceStore({ catalog, storageKey })`; render via `shell-settings` primitives. Theming half = reuse `theme-presets` (skip — rr is already ahead).
- **content-model** (reuse, S — no code). Document the 1:1 PBOS-domain → rr-slice map; ship nothing. Note the seed-copy/auth-gate blockers as consumer config, not a new slice.

### Wave 1 — Pure-logic leaves (net-new, no Convex, prove the harvest pattern)
- **content-loops** (build-new, L — **START HERE**, see §5). `frontend/slices/content-loops/`. Copy the 4 clean core files (`types`/`registry`/`dataAdapter` + namespaced-id guard) verbatim into `lib/`; re-express `renderLoop` round-robin as `<ContentLoop sourceId filters variants={[A,B]} />`; replace prefetch/runtime/HTTP endpoint with `useLoopPagination` over an injected adapter; ship a mock source so it runs env-free. Strip: `/_instatic/loop/<id>` + runtime.js paths; `@core/page-tree`/`module-engine`/`publisher` coupling → injected generic types; Instatic table assumptions; pixel-art-icons → lucide; TypeBox prop schema → plain TS interface.
- **publisher-clean-html** (build-new, L). `frontend/slices/publisher-clean-html/`. Copy the two zero-dep leaves (`html-sanitize`, `css-sanitize`) verbatim; lift `cssCollector` + `cspPlan` + `escapeProps` + trimmed `renderNode`/`publishPage` with `@core/*` swapped for slice-local generic injected types (`NodeTree`/`ModuleDefinition`/`PropertySchema`). Keep `configureRichtextSanitizer` DOMPurify seam (runs in Node/browser/workerd). Drop loops/VCs/dynamicDetection/server-publish; ship one iframe-srcdoc preview component. Make `/_instatic/*` URL prefixes options props. Frontend-only, no Convex.
- **site-templates-engine** (build-new, M). `frontend/slices/site-templates-engine/lib/` — lift the 8-file pure engine from `src/core/templates/`. Parameterize 4 host couplings via `createTemplateEngine(config)`: hardcoded module ids (`base.outlet`/`base.body`/`base.container`) → config; `renderMarkdownToHtml`/`isRichtextPropKey` → injected `formatHtml`/`isRichtextKey`; `LoopItem` → local `EntryItem {fields}` (reuse `content-loops` types); `Page`/`PageNode`/`SiteDocument` + `reindexNodeParents` → slice-owned generic node contract + inlined helper. Swap TypeBox → plain guards. No Convex.

### Wave 2 — Convex-backed data features (layer on existing auth/rbac/rate-limit)
- **data-workspace** (build-new, L). `convex/features/data-workspace/` — port `dataTables`/`dataRows`/`dataPublish` native (drop nanoid + `by_app_id`, use `_id`); keep row-publish/version/redirect/scheduled engine; **drop** the site-publish/snapshot/runtime-asset half + `pageTree`/component kinds. Frontend reuses `notion-database` (+`notion-shell`) via a `DataField↔Property` adapter — no bespoke DataGrid. Strip: hand-assembled user-ref joins → injectable `resolveUserRef` (or bare `authorId`); hardcoded `table_id:'pages'` → param; `plugin_actor_id`/`content.entry.*` hooks → optional `onContentEvent`; `server/repositories/data/*` → call Convex directly.
- **media-library** (build-new, L). `convex/features/media-library/` — lift `media.ts`+`mediaFolders.ts`+`mediaStorage.ts` near-verbatim (index-driven, dual-validated). Frontend wraps `file-explorer` via a `MediaLibraryAdapter`. Strip: sharp/blurhash/Bun.Worker variant pipeline → default `ctx.storage`, variant-gen an injected host action (off by default); `/uploads/…` + `/_instatic/media/…` URL shapes → `resolvePublicPath`/`getReadUrl` seam; **add `requireUser`/`requireAdmin` to every mutation** (Instatic relied on the trusted Bun layer); capability enum → rbac props; full-table `.collect()` → `by_deleted` index + `.paginate()`.
- **ai-byok** (build-new, L). `convex/features/ai-byok/` — lift the 5 modules near-verbatim. Three seams: (1) crypto → env-keyed `'use node'` AES-256-GCM action (`AI_BYOK_ENCRYPTION_KEY`), keep `toCredentialView` never-leak; (2) identity → `requireUser` instead of trusted `userId` arg; (3) scope enum → consumer `v.string()`. Add `requireAdmin` to `saveCatalogue`/`purgeSoftDeleted`/audit; collapse the Bun-repo↔Convex split into the Convex fn; replace `.collect()`+JS sort with `.order().take()`/`paginate`. Consumed by existing `ai-admin` + `ai-chat`.
- **cms-native-forms** (build-new, L). `frontend/slices/cms-native-forms/` (React `<Form>`) + `convex/features/cms-native-forms/`. Don't port the canvas. Lift pure `validation.ts` near-verbatim; re-express defs as flat `FormField[]` JSON; translate security to Convex: stateless HMAC page token (`signPageToken`/`constantTimeEqual`) + a `cnf_challenges` table replacing the in-memory Map; keep honeypot + min-fill + per-IP/per-form rate limit (reuse `rate-limit`) + server-re-derives-never-trusts-client. Dedicated `cnf_forms`/`cnf_submissions` tables; TypeBox → `v.*`; CSRF intent re-implemented in `proxy.ts`/route handler.

### Wave 3 — The flagship composite (visual page-builder)
- **visual-components-model** (build-new, L) — **lands before canvas**. Take the laziest-correct path first: a reusable "block group" (`BlockGroup` + group-ref block with `instanceProps` + one default slot) on top of the `pages-cms`/`landing-sections` flat block model, porting `wouldCreateCycle` + `previewVCDeletion` + name validation verbatim. Keep the faithful headless-lib path (`schemas`/`instantiate`/`slotSync`/`recursionGuard`/`deletionImpact`/`vcRefs` over a host-injected `NodeTree<TNode>` + `resolveModule` + store adapters) documented as the upgrade once a tree primitive exists. Lift `base.*` module-id strings to slice-config constants; do **not** lift the canvas — expose data only.
- **visual-page-canvas** (build-new, L) — **flagship, see §4**.
- **import-engines** (build-new, M) — scoped to the portable **site-transfer** engine only: config-driven Convex snapshot export/import over an injected `TransferTable[]` with 3 atomic strategy mutations + dry-run preview (generalize PBOS `backup.ts` + Instatic `importExport.ts`). Strip: hardcoded table lists → `TransferTable[]`; FK remap → declarative `fkRefs`; capability strings → injected keys; fs media sink → optional `mediaAdapter` (default JSON-only); **paginate `.collect()` with `.withIndex().take()`**. Defer `html-import`/`site-import` — they belong bundled with the canvas editor.

### Wave 4 — Platform shell, onboarding, commerce, auth-hardening, plugin (ship last)
- **dashboard-grid** (build-new, M). Lift the framework-free widget-board engine (`registry.ts` + grid/resize/collision math + customize mode + block library); reskin CSS Modules → Tailwind tokens + shadcn `Card`; persistence + stats → injected adapters (`createMemoryLayoutAdapter` demo; consumer wires Convex `user_preferences`). Reuse `appshell` for chrome — do **not** re-lift the shell. Capability enum → injected `hasCapability` prop; plugin-runtime namespacing → optional `ownerId`.
- **site-runtime-shell** (build-new, M). Thin composition slice over `marketing-chrome` + `theme-presets`: `SiteShell` composes header/footer; lift `BrandHead` + `SiteLoader` near-verbatim but inject branding source (prop, not `api.settings.get`) + ready/progress props; add `buildSiteMetadata`. No new Convex (branding reuses `settings-page`/`shell-settings`). Leave `catch-all-renderer` out (pages-cms territory); nav path-prefix → consumer hrefs.
- **setup-onboarding** (build-new, M). Reuse `onboarding-wizard` UI; build a sibling Convex trio (settings singleton + status query + admin-gated `upsert(markOnboarded)` + only-when-empty `seedSample` with injected inserter) + props-driven `SetupHealth` checklist. Strip Instatic server-managed-auth/Bun `hashPassword`, nanoid PKs, `role_id:'owner'` literal, baked Indonesian/Vercel copy → props. Owner-claim bootstrap deferred unless asked.
- **commerce-checkout** (enhance, M). Lift `CheckoutPage`/`OrderTrackingPage` as a thin UI slice composing existing `storefront-checkout` + `doku-payment`/`midtrans-payment` + `convex/features/payment`/`subscribers`. Add net-new `convex/features/orders` (`pbOrders` + re-pricing `placeOrder` + `trackOrder` join + admin list) + `convex/features/leads`. Strip hardcoded `PUBLIC_BASE`/`ADMIN_BASE`, Bahasa copy + `formatIDR`/`'Rp'` → i18n/currency props, `createDirectPayment`/`'PB-'` prefix → provider arg; admin lists `requireAdmin`. Reuse rr's richer `subscribers` — drop PBO's weaker one.
- **auth-hardening** (enhance, M). One focused companion slice on top of `@convex-dev/auth` adding the 4 missing pieces (TOTP MFA, step-up, lockout + login-audit, device-session panel) with its own `userId`-keyed tables (the library owns `authSessions`). Do **not** build a monolithic auth slice (would duplicate `convex-auth` + `rbac-roles` + `user-management`). Crypto → WebCrypto PBKDF2/AES-GCM/HMAC-SHA1 (Convex V8 can't run Argon2id); drop Instatic `security.ts`/cookie sessions; keep rr wildcard permission strings (don't replace `rbac-roles`).
- **plugin-sandbox** (build-new, L — **last**). `frontend/slices/plugin-sandbox/` + `convex/features/plugin-sandbox/`. Lift only the reusable security core (QuickJS VM + bootstrap/SDK factory + `TARGET_PERMISSIONS` + capability catalog + manifest parser + lifecycle + worker isolation/crash recovery + gated-fetch SSRF + secrets-at-rest); make every CMS host capability (content/loops/modules/editor/publisher/media) an injectable `HostCapabilityAdapter`. Default adapter ships only host-agnostic surfaces (plugin/storage/hooks/settings+secrets/schedule/routes/fetch). The 6 Convex tables + fns lift near-verbatim. **Runtime contract:** the VM runs in a Node process (Next server route or sidecar via `worker_threads`/`esbuild`), **not** a Convex action (no long-lived workers / 5s+ loops) — Convex hosts only the 6 data tables. Re-target Bun.Worker/Bun.build/Bun.serve; decompose the 30KB `manifest.ts` to ≤200-line files; hardcoded env/paths/hook-event-names → props/env/consumer registry.

## 3. Slice metadata to author per slice — PAIR convention (trio retired 2026-06-21)

> rr folded `slice.contract.ts` **into** `slice.json.contract` on 2026-06-21. There is no standalone `slice.contract.ts` file anymore. The metadata is a **PAIR**: `slice.json` (with its `contract` block) + `slice.manifest.json`, version SSOT `slice.json.version` === `slice.manifest.json.version` (gated `audit:slices`). The `lib/content/slices.ts` scalar row is **generated** from `slice.json` (`gen-slice-catalog.mjs`, gated `gen:catalog:check`) — only the prose stays hand-authored.
>
> **Wherever the per-feature docs below say "trio", read "PAIR"** — same intent, the contract now lives inside `slice.json.contract`.

For every new slice, author the PAIR + regen the catalog (reference shape: `frontend/slices/pages-cms/`):
1. **`slice.json`** — `slug`, `version`, `category`, `kind` (`ui`/`backend`/`full`), `title`, `description`, `namespace: "@/features/<slug>"`, `frontend.slicePath` + `configExport`, `convex.{tablesExport,schemaPath,rootPaths}` (fill for backed slices), `deps.{npm,shadcn,env,peers}`, `registers`, `audit`, `license`, **and the folded `contract` block** — the typed injection contract: every adapter/prop the slice needs from the host (`LoopDataAdapter`, `MediaLibraryAdapter`, `HostCapabilityAdapter`, `resolveModule`, `persistenceAdapter`, …) under `contract.requires` / `contract.provides`. This is where portability lives — no consumer URL/env/copy/role-enum may be hardcoded; it must be a contract field. (The worked `content-loops` `slice.json` in `features/content-loops.md` already shows the folded `contract` block — copy that shape.)
2. **`slice.manifest.json`** — `tier`, `distribution` (`npx rr add <slug>`, `consumerPath`), the explicit `files` list, and `version` **kept identical to `slice.json.version`**.
3. **catalog (generated, not hand-written)** — run `npm run gen:catalog`; it writes the scalar `SliceEntry` (`slug`, `kind`, version/title/category) into `lib/content/slices.ts` from `slice.json`. Hand-author only the prose description. Consumed by tarball manifest, `/slices` page, Bundle Builder, MCP `rr_list_slices`.

## 4. The flagship — visual page-builder composite

The page-builder is **not one mega-slice**; it is a composite of leaf slices wired only through barrels:

```
visual-page-canvas               (frontend/slices/visual-page-canvas)
  ├─ @/features/visual-components-model   → block/BlockGroup/VC data model
  ├─ @/features/content-loops             → <ContentLoop> for dynamic repeaters
  ├─ @/features/site-templates-engine     → createTemplateEngine() instantiate/compose
  ├─ @/features/publisher-clean-html      → srcdoc preview + clean-HTML export
  └─ props: persistenceAdapter            → wired by consumer to
                                            convex/features/data-workspace OR pages-cms
```

- The canvas itself lifts the editor-free `src/core/page-tree` engine + `module-engine` registry **verbatim (zero UI imports)**, then wraps ONE single-breakpoint iframe canvas (`IframeFrameSurface` + `NodeRenderer` + `@dnd-kit` reorder) + selection/properties/inline-edit. It **props-injects** the module registry and a `localStorage` persistence adapter (Convex copy-source via `data-workspace`).
- **Deferred to separate slugs (v1 non-goals):** multi-breakpoint pan/zoom, plugin sandbox runtime in-canvas, runtime scripts, the server publisher, Visual Components inline-tree editing UI, dynamic-data loops binding. Each is a follow-up wave, not a v1 blocker.
- Composition discipline: the canvas may **never** deep-import a leaf's internals — only the leaf's barrel. The leaves never import each other except through declared barrels (`site-templates-engine` may consume `content-loops` types via `@/features/content-loops`). This keeps every piece independently installable via `npx rr add <slug>`.

## 5. Start here — first slice to build

**`content-loops`** (Wave 1). It is the lowest-coupling net-new pure-logic leaf: 4 core files copy verbatim, it ships a `<ContentLoop>` React component + a mock source so it runs **env-free with no Convex**, and it proves the entire harvest pattern in one slice — verbatim engine lift, host couplings replaced by an injected adapter + generic types, a runnable mock, and the full trio + catalog entry. It is also a real dependency of the flagship (consumed by `site-templates-engine` and `visual-page-canvas`), so the pattern-prover is not throwaway. (`publisher-clean-html` and `site-templates-engine` are the next two pure-logic leaves and follow the identical pattern.)

## 6. Risks / non-goals

- **Don't rebuild covered ground.** No new auth/rbac/users/payments/content-domain/theming/palette/shell slices — `content-model` ships *zero code* (pure reuse). The audit-log, command-menu, theme-presets work is *enhance-in-place*, not a fork.
- **Self-hosted-Convex vs Convex-Cloud.** Instatic is self-hosted-Convex behind a Bun server; rr's baseline is also self-hosted-Convex but **native** (no Bun server, no `server/repositories/*` pass-throughs, no `/_instatic/*` URL prefixes). All those are stripped to injected adapters/props. PBOS is Convex-Cloud but slice-shaped already.
- **Auth model difference (the big reconciliation).** Instatic uses **server-managed cookie sessions** (`instatic_admin_session`, `hashSessionToken`, Argon2id, `Path=/admin`); rr uses **library-owned `@convex-dev/auth`** (`authSessions`, native `_id`). Never port Instatic's session/crypto layer — re-target identity to `requireUser`/`requireAdmin`, and where MFA/step-up/lockout are wanted, that's the *additive* `auth-hardening` slice using WebCrypto (Convex V8 can't run Argon2id).
- **Convex hygiene on every backed slice:** validate all public args (`v.*`), **no bare `.collect()`** (Instatic is full of full-table scans — `media`, `ai`, `data-workspace`, `import-engines` all flagged; use `.withIndex().take()`/`.paginate()`), `requireUser`/`requireAdmin` in every mutation (Instatic mutations are ungated — they trusted the Bun layer), index every filter/order, drop nanoid `by_app_id` PKs for native `_id`.
- **200-line cap & barrel discipline.** Instatic ships 30KB single files (`manifest.ts`) and CSS Modules + pixel-art-icons deep-imports — every lift decomposes to ≤200-line single-responsibility files, swaps to shadcn + theme tokens + lucide/`icon-picker`, and exposes cross-slice surface through the barrel only.
- **Explicit non-goals for v1:** multi-breakpoint canvas, in-canvas plugin runtime, runtime scripts, server-side publisher caching (Layer A/B/C holes/loops prefetch), `html-import`/`site-import` (need the editor model), variant/sharp/blurhash media pipeline (injected host action, off by default), PBOS self-update (`update.ts` deploy-hook) — none belong in the harvested slices.
