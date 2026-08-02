# Plugin System (QuickJS-WASM sandbox + SDK)

> Harvest source: **Instatic-convex** only (personal-brand-os has nothing here).
> Verdict: **net-new** in rr. Effort: **L**. This is harvest gold — a full
> untrusted-third-party-code sandbox + capability model + author SDK + CLI.

This is one of Instatic's largest engine features. It lets a self-hosted CMS run
**arbitrary third-party plugin code** safely: server logic runs inside a
**QuickJS-compiled-to-WASM** JS engine (a separate interpreter — no Node, no Bun,
no host FS, no env, no network unless granted), reaching the host only through one
capability-gated SDK surface (`api.plugin.*` + `api.cms.*`). A plugin ships as a
zip with a `plugin.json` manifest and pre-bundled IIFE entrypoints.

---

## What it does (flow)

End-to-end, three flows:

**1. Author → package (`instatic-plugin` CLI).**
`init` scaffolds → author writes `server/index.js` exporting lifecycle hooks
(`install/activate/deactivate/uninstall/migrate`, each receiving `api`) → `lint`
validates manifest + scans bundles for forbidden literals (`node:*`, `bun:*`,
`Bun.*`, `process.env`, `require`, `eval`, `new Function`) → `build` emits IIFE
bundles assigning to host globals (`__plugin_exports` server, `__module_pack`
canvas packs) + a `.plugin.zip` → `dev` hot-syncs built files straight into the
host's `uploads/plugins/<id>/<version>/`.

**2. Install (admin) → grant → activate.**
Operator uploads zip at `/admin/plugins`. Host extracts, `parsePluginManifest`
validates, `assertSandboxSafe` re-scans the bundle (defense in depth). The install
**review dialog is always shown** (even zero-permission plugins) so the operator
approves the declared permission set. Install enforces **grants == declared**
(all-or-nothing, both directions — `assertPluginPermissionGrants`). The
`installed_plugins` row stores manifest + `granted_permissions_json`. On
`activate` the host spins a per-plugin worker, evaluates the bootstrap + plugin
IIFE inside a fresh QuickJS context, and runs the plugin's `activate(api)` which
registers routes / hooks / storage collections / schedules / loop sources.

**3. Runtime — every host call is capability-gated at 3 layers.**
Plugin code calls e.g. `api.cms.storage.collection('x').create(...)`. Inside the
VM, `assertTargetPermission` looks up the RPC target in `TARGET_PERMISSIONS` and
throws synchronously if the permission isn't granted. The call marshals to a
string RPC across the worker boundary (`__hostCall`), where the host
`assertHostPluginPermission` re-checks the same map (authoritative backstop), then
dispatches to a host handler that does the real DB / fetch / hook work and returns
the result back into the VM (resolving a VM-side promise via `ctx.newPromise()`).
Wall-clock deadlines (5s eval), heap (64MB) and stack (1MB) limits, and a 30s
worker RPC timeout backstop a wedged or runaway plugin; crashes are isolated to
that worker, auto-respawned, and parked in `error` after 3 crashes in 5 min. Every
lifecycle transition broadcasts an SSE event to admin tabs.

---

## Where it lives

**Instatic-convex** (`/home/rahman/projects/Instatic-convex`):

Author SDK + manifest + host-side runtime (browser/shared):
- `src/core/plugin-sdk/` — SDK barrel. `capabilities.ts` (permission catalog SSOT,
  ~26 permissions), `contentSchemas.ts`, `storageSchemas.ts`, `modules.ts`,
  `guards.ts`, `index.ts`.
- `src/core/plugin-sdk/builders/` — `definePlugin.ts`, `definePack.ts`,
  `defineModule.ts`, `settings.ts` (`SECRET_SETTING_MASK`), `panel.ts`,
  `permissions.ts`, `controls.ts`, `html.ts`, `tree.ts`, `adminApp.ts`,
  `canvasOverlay.ts`, `packLayouts.ts`, `namespace.ts`, `index.ts`.
- `src/core/plugin-sdk/cli/` — `init.ts`, `lint.ts`, `build.ts`, `dev.ts`,
  `config.ts`, `packCompileEnvironment.ts`, `index.ts` (`instatic-plugin` CLI).
- `src/core/plugin-sdk/types/` — ~30 type modules (manifest, lifecycle, routes,
  hooks, loops, schedule, settings, permissions, serverApi, editorApi,
  sandboxGlobals, content, resources, …).
- `src/core/plugins/` — host-side runtime: `manifest.ts` (30KB parser/validator,
  SSOT for manifest shape), `runtime.ts` (22KB, lifecycle: boot/install/activate/
  uninstall + `assertPluginPermission`), `events.ts` (`PluginEventSchema`,
  `PLUGIN_EVENT_KINDS` — SSOT for SSE event kinds), `hookBus.ts` (`CORE_HOOK_EVENTS`),
  `moduleAdapter.ts`, `modulePackLoader.ts` (VM tracking + disposal),
  `editorPluginLoader.ts`, `adminRuntime.ts`, `sandboxScan.ts`, `cacheBuster.ts`,
  `resourceRecords.ts`, `manifestAdminPages.ts`, `mediaStorageRegistry.ts`,
  `mediaVariantDelegateRegistry.ts`.

Sandbox host (server, Bun):
- `server/plugins/quickjs/vm.ts` — QuickJS VM factory (server entrypoint sandbox).
- `server/plugins/quickjs/limits.ts` — `DEFAULT_MEMORY_LIMIT_BYTES` (64MB),
  `DEFAULT_STACK_SIZE_BYTES` (1MB), `DEFAULT_EVAL_TIMEOUT_MS` (5s),
  `MODULE_PACK_EVAL_TIMEOUT_MS` (2s).
- `server/plugins/quickjs/eval.ts` (per-runtime wall-clock deadline registry +
  interrupt handler), `marshal.ts`, `esmShim.ts`, `types.ts`.
- `server/plugins/quickjs/bootstrap/src/` — typed TS bootstrap source:
  `pluginRuntime.ts`, `modulePackRuntime.ts`, `buildApi.ts` (`__buildApi()` SDK
  factory + `assertTargetPermission`), `boundary.ts` (host⇄VM JSON marshaling),
  `globals.d.ts`. Bundled to `bootstrap/generated/{pluginBootstrap,modulePackBootstrap}.ts`
  via `scripts/sync-plugin-bootstrap.ts` (`bun run bootstrap:sync`).
- `server/plugins/quickjs/bootstrap/{polyfills,fetch,crypto,timers,base64,index}.ts`
  — Web-platform polyfills injected into the VM (URL, TextEncoder, console,
  AbortController, timers, crypto.subtle, fetch).
- `server/plugins/modulePackVm.ts` — separate QuickJS VM for canvas module packs.
- `server/plugins/pluginWorker.ts` (18KB) — per-plugin Bun.Worker host.
- `server/plugins/host/` — `apiDispatch.ts` (`assertHostPluginPermission`),
  `workerPool.ts` (`DEFAULT_RPC_TIMEOUT_MS` 30s, `requestFromWorker`),
  `crashRecovery.ts` (`handleWorkerCrash`, `CRASH_THRESHOLD`=3,
  `CRASH_WINDOW_MS`=5min), `network.ts` (`performGatedFetch` + SSRF guards),
  `routeIo.ts`, `rpc.ts`, `registry.ts`, `settingsSync.ts`, `media.ts`,
  `workerState.ts`, `workerErrors.ts`, `apiReplies.ts`, `contentFieldMapping.ts`,
  and `host/handlers/` (content, storage, hooks, loops, routes, schedule,
  settings, network, crypto, media).
- `server/plugins/protocol/` — `targets.ts` (`TARGET_PERMISSIONS` — the single
  RPC-target→permission map both VM and host drive from), `messages.ts`,
  `apiCallSchema.ts`, `bodyEncoding.ts` (utf8/base64 byte-safe wire codec),
  `parser.ts`, and `schemas/` (per-domain RPC arg schemas).
- `server/plugins/runtime.ts` (boot activation + `handleServerPluginRuntimeRequest`
  HTTP route forwarder), `scheduler.ts` (cadence dispatch + run history),
  `pluginScheduleRegistration.ts` (`pluginScheduleFullId`), `settingsCache.ts`,
  `eventBroadcaster.ts` (`broadcastPluginEvent`, `subscribePluginEvents`),
  `package.ts` (`assertSandboxSafe`).
- `server/util/pathWithin.ts` — `assertPathWithin` disk-path containment.
- `server/handlers/cms/plugins/` — REST: `index.ts` (dispatcher), `install.ts`,
  `lifecycle.ts`, `settings.ts`, `records.ts`, `schedules.ts`, `pack.ts`,
  `events.ts` (SSE endpoint), `state.ts`, `shared.ts` (`projectSecretSettings`,
  `assertPluginPermissionGrants`, `removePluginAssets`).
- `server/repositories/{plugins,pluginSecrets,pluginSchedules}.ts` — thin Convex
  pass-throughs (crypto + `'***'` sentinel live in the secrets repo, Bun-side).

Convex data layer:
- `convex/plugins.ts` — `installed_plugins` + `plugin_records` + `plugin_crash_events`.
- `convex/pluginSchedules.ts` — `plugin_schedules` + `plugin_schedule_runs`.
- `convex/pluginSecrets.ts` — `plugin_secrets` (AES-GCM ciphertext, crypto Bun-side).
- `convex/schema.ts` lines 352–462 — the 6 tables.

Admin UI:
- `src/admin/pages/plugins/` — `PluginsPage.tsx`, `PluginPage.tsx`, `components/`,
  `hooks/usePluginEventBridge.ts`, `utils/pluginEventStream.ts`.
- `src/admin/plugin-host-ui/index.ts` — `@instatic/host-ui` externalized package
  (named-export component contract plugins compile against; runtime resolved via
  the admin import map `public/runtime/host-ui.js`).
- `src/admin/plugin-host-hooks/index.ts` + `pluginContext.ts` — `@instatic/host-hooks`
  (`useEditorStore`, `usePluginSettings`, `usePluginRoutes`, `useCanvasNodeRect`,
  permission-gated via `PluginContext`).
- `examples/plugins/template/` — example plugin.
- `vendor/pixel-art-icons/` — vendored icon set (not plugin-specific).

Dependency: `quickjs-emscripten ^0.32.0` (package.json line 94). Validation:
`@sinclair/typebox ^0.34`. Sanitize: `dompurify ^3.4`. IDs: `nanoid ^5.1`.

**personal-brand-os**: nothing — no plugin system at all.

---

## Data model

6 Convex tables (`convex/schema.ts`), all using the app-nanoid `id` +
`by_app_id` index convention, `*_json` columns kept opaque `v.string()`:

- **`installed_plugins`** — `id, name, version, enabled(bool),
  granted_permissions_json, manifest_json, lifecycle_status('installed'|'active'|
  'disabled'|'error'), last_error(null|string), settings_json, installed_at,
  updated_at`. Indexes: `by_app_id`, `by_enabled_installed`.
- **`plugin_records`** — per-plugin per-resource KV store. `id, plugin_id,
  resource_id, data_json, created_at, updated_at`. Indexes: `by_app_id`,
  `by_resource [plugin_id,resource_id,created_at]`, `by_plugin`. The record
  list query reimplements an eq/ne/gt/gte/lt/lte/in/like operator-DSL + order-by
  in JS over parsed `data_json` (no SQL `json_extract`).
- **`plugin_crash_events`** — `id, plugin_id, occurred_at, reason, stack`. Rolling
  window (`recordCrash` keeps N most recent). Index `by_plugin_occurred`.
- **`plugin_schedules`** — `plugin_id, schedule_id, cadence_json, overlap('skip'|
  'queue'|'parallel'), max_duration_ms, enabled, paused, consecutive_failures,
  last_run_at, last_finished_at, last_status('ok'|'error'|'timeout'|'never_run'),
  last_error, last_duration_ms, next_run_at, running_token, lock_until, claimed_at,
  created_at, updated_at`. Indexes: `by_plugin_schedule`, `by_due
  [enabled,paused,next_run_at]` (scheduler tick query), `by_plugin`. Two
  independent flags: `enabled` (registration) vs `paused` (operator/failure).
- **`plugin_schedule_runs`** — run history: `id, plugin_id, schedule_id,
  started_at, finished_at, status, error, duration_ms, triggered_by('tick'|
  'run-now')`. No FK — swept explicitly on uninstall.
- **`plugin_secrets`** — one row per `(plugin_id, setting_id)`: `ciphertext, iv,
  key_fingerprint, created_at, updated_at`. AES-256-GCM encrypted with the process
  master key (`INSTATIC_SECRET_KEY`); **crypto runs Bun-side in the repository,
  never in the Convex V8 runtime** — Convex only stores/returns base64 strings.
  Indexes: `by_plugin_setting`, `by_plugin`.

Convex has no cascade FKs, so `deletePlugin` explicitly deletes the plugin row +
its `plugin_secrets` / `plugin_schedules` / `plugin_crash_events` children in one
atomic mutation; `plugin_schedule_runs` cleared separately.

---

## Public API

**Convex functions** (all `args` + `returns` validated, indexed reads):
- `plugins.ts`: `listInstalled`, `getInstalled` (queries); `install` (upsert),
  `setEnabled`, `setLifecycleStatus`, `setSettings`, `deletePlugin` (cascade),
  `listRecords` (operator-DSL filter/order/page), `createRecord`, `updateRecord`,
  `deleteRecord`, `recordCrash` (insert + rolling-window prune), `listCrashes`,
  `clearCrashes`.
- `pluginSecrets.ts`: `listStates` (wire-safe presence+fingerprint), `listForRuntime`
  (server-only ciphertext), `upsert`, `seedDefault` (insert-if-absent), `remove`.
- `pluginSchedules.ts`: schedule CRUD + claim/tick/run-history (queries+mutations
  driving the cadence engine; `by_due` index for the tick).

**REST endpoints** (`/admin/api/cms/plugins`, capability `plugins.install` +
step-up for mutating ops):
- `GET /` list, `POST /` install-from-manifest, `POST /inspect-package`,
  `POST /package` install/upgrade-from-zip, `PATCH /:id` enable/disable,
  `DELETE /:id[?force=true]` uninstall (+force-remove skipping hooks),
  `POST /:id/pack/install`, `GET|PUT /:id/settings` (masked/update),
  `POST /:id/restart`, schedule run-now/pause/resume, record CRUD,
  `GET /events` SSE stream (lifecycle events), `/:id/runtime/*` plugin-registered
  HTTP route forwarder.

**Author SDK surface** (inside the sandbox, capability-gated):
`api.plugin.{id,version,permissions,log,assetUrl}`; `api.cms.routes.*` (cms.routes),
`api.cms.storage.collection(...)` (cms.storage), `api.cms.hooks.{on,filter,emit}`
(cms.hooks, plugin emits namespaced `plugin.<id>.*`), `api.cms.loops.registerSource`
(loops.register, supports `requestDependent`/`perVisitor` dynamic holes),
`api.cms.settings.{get,getAll,replace}`, `api.cms.schedule.{daily,hourly,every,
register,cancel}` (cms.schedule), `api.cms.content.*` (5 split permissions +
per-table `contentAccess[]` allowlist), gated `fetch()` (network.outbound +
`networkAllowedHosts`).

---

## UI surface

Admin-only (no public-site surface for management):
- **Plugins page** (`src/admin/pages/plugins/PluginsPage.tsx`) — installed list,
  upload, per-plugin card with lifecycle status / in-error badge, enable/disable,
  uninstall (+ "Remove anyway" force path behind a warning), restart, install
  review dialog (always shown; calls out `editor.code` unsandboxed warning).
- **Plugin detail / settings** (`PluginPage.tsx`) — typed settings form
  (string/number/boolean/secret; secrets masked `'***'`, round-trip rotate/delete
  semantics), schedules table (pause/resume/run-now), records, crash history.
- **SSE event bridge** (`usePluginEventBridge.ts` + `pluginEventStream.ts`) —
  lazy `EventSource`, frame-validated, drives toasts / badges / list resync.
- **Plugin React surfaces** mount under `PluginContext` carrying granted
  permissions; editor panels / app pages / canvas overlays use `@instatic/host-ui`
  (component contract) + `@instatic/host-hooks` (permission-gated state hooks).

Two trust levels: QuickJS-sandboxed server/module-pack code vs **unsandboxed**
editor entrypoints + app-kind admin pages (gated by the single `editor.code`
dangerous permission; dynamically `import()`ed into the admin window with full
privileges).

---

## Dependencies

- **npm:** `quickjs-emscripten` (^0.32 — the WASM JS engine, the load-bearing dep),
  `@sinclair/typebox` (manifest + protocol validation; rr uses convex `v.*` for
  Convex but TypeBox is needed for the in-VM/wire boundary), `nanoid` (PKs),
  `dompurify` (publisher sanitize, only if the loop/holes surface is harvested).
  Bun APIs used by the host (`Bun.Worker`, `Bun.build`, `Bun.serve`) are **runtime
  coupling**, not packages.
- **rr-slice deps:** `convex-auth` (requireAdmin on the management mutations),
  `rbac-roles` (the `plugins.install` capability + step-up), `rate-limit`
  (public plugin routes / abuse surface), `audit-log` (install/uninstall/force
  events). Optional adjacency: `app-store` (a marketplace-style install UI),
  `code-editor` (authoring), `notifications-center` (SSE-driven toasts).

---

## rr coverage

**net-new.** Confirmed by inspection:
- rr has **no** plugin slice (`ls frontend/slices | grep plugin` → empty) and **no**
  sandbox/QuickJS anywhere (the `grep sandbox` hits — app-store, midtrans,
  ai-admin, media-studio — are incidental string matches, not a code sandbox).
- The hinted comparator **`create-your-mcp`** is the *opposite* direction: it
  exposes *your* app's tools to *external* AI clients via OAuth 2.1 + PKCE +
  bearer (`slice.json`: "Turn any rr-based app into an MCP server"). It runs no
  untrusted code, has no VM, no capability sandbox, no manifest/lifecycle, no
  worker isolation. Zero overlap beyond the word "plugin".

No existing rr slice covers untrusted-code execution, a capability/permission
grant model, or a third-party author SDK. Proposed new slug: **`plugin-sandbox`**.

---

## Slice plan

**Action: build-new. Effort: L** (largest harvest target; multi-month if lifted
whole). The ponytail move is to **NOT** lift the whole Instatic plugin system —
most of it is CMS-engine-specific (visual editor, page-tree, publisher holes,
visual components). Lift the **reusable sandbox core** and make every host
capability an injectable adapter.

**Laziest correct path (ponytail):**
1. Lift the *security primitive*, not the CMS: `frontend/slices/plugin-sandbox/`
   ships the QuickJS VM factory, the bootstrap (SDK factory + `__run*` dispatchers
   + polyfills), the `TARGET_PERMISSIONS` map, the capability catalog, the manifest
   parser, the lifecycle state machine, the worker isolation + crash recovery, the
   gated-fetch SSRF guard, byte-safe wire codec, and the secrets-at-rest model.
2. Replace **CMS-coupled SDK surfaces** (`api.cms.content.*`, `loops`, `modules`,
   `editor.*`, `visualComponents`, `frontend.assets`/publisher holes,
   `media.*`) with a **`HostCapabilityAdapter` interface** the consumer implements.
   Default adapter ships only the host-agnostic surfaces: `api.plugin.*`,
   `api.cms.storage.*` (plugin_records), `api.cms.hooks.*`, `api.cms.settings.*`
   (+ secrets), `api.cms.schedule.*`, `api.cms.routes.*`, gated `fetch`.
3. `convex/features/plugin-sandbox/` ships the 6 tables + functions verbatim
   (rename snake_case dirs per rr Convex rules; they're already validator-clean,
   indexed, no bare `.collect()` on hot paths except the deliberate small
   per-plugin reads).
4. Admin UI: a `<PluginManager/>` (install/list/enable/grant-review/settings/
   crash-history) props-driven, plus the SSE bridge hook.

**Portability blockers to strip:**
- **Bun runtime coupling** (the big one). `Bun.Worker` crash isolation, `Bun.build`
  (CLI + bootstrap sync), `Bun.serve` route forwarding. rr baseline is Next16/Node
  + self-hosted Convex. Re-target the worker to Node `worker_threads` (quickjs-
  emscripten runs fine in Node), the bundler to esbuild/Bun-optional, and route
  forwarding to a Next server route. The QuickJS VM itself is runtime-agnostic.
- **Convex actions can't host long-lived workers / 5s+ wall-clock loops cleanly** —
  the sandbox must run in a Node process (Next server route or a sidecar service),
  with Convex used only for the data tables. Document this as the runtime contract.
- **Deep host imports**: `@site/store/*` (editor store), `@core/page-tree`,
  `@core/publisher`, `@plugins/components/*`, `pixel-art-icons` deep imports — all
  CMS-specific. The host-ui/host-hooks externalized-package pattern is good but its
  *contents* are Instatic's design system → reduce to a minimal injectable UI
  contract or drop the editor surfaces entirely for v1.
- **Hardcoded env/secrets**: `INSTATIC_SECRET_KEY`, `INSTATIC_UPLOADS_DIR`,
  `/uploads/plugins/<id>/<version>/` disk layout, `/admin/api/cms/plugins` route
  prefix, `/_instatic/*` hole runtime paths → props/env.
- **CMS hook event names** (`CORE_HOOK_EVENTS`: publish.*, content.entry.*) are
  Instatic-domain → make the core event list a consumer-supplied registry.

**Proposed `frontend/slices/plugin-sandbox/slice.json` (sketch):**
```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "plugin-sandbox",
  "version": "0.1.0",
  "category": "infra",
  "kind": "slice",
  "title": "Plugin Sandbox (QuickJS-WASM + SDK)",
  "description": "Run untrusted third-party plugin code inside a QuickJS-WASM sandbox: capability-gated SDK, per-plugin worker isolation, crash recovery, signed manifest + grant model, encrypted-at-rest secrets, cadence scheduler, gated SSRF-guarded fetch. Host capabilities are injectable adapters; ships a storage/hooks/settings/schedule/routes default.",
  "namespace": "@/features/plugin-sandbox",
  "frontend": { "slicePath": "frontend/slices/plugin-sandbox", "configExport": "pluginSandboxFeature" },
  "convex": {
    "tablesExport": "pluginSandboxTables",
    "schemaPath": "convex/features/plugin-sandbox/_schema.ts",
    "rootPaths": ["convex/features/plugin-sandbox"]
  },
  "deps": {
    "npm": ["quickjs-emscripten@^0.32.0", "@sinclair/typebox@^0.34", "nanoid@^5.1", "convex@^1.16.0"],
    "shadcn": ["button", "dialog", "badge", "table", "switch", "input", "alert"],
    "env": [
      { "name": "PLUGIN_SECRET_KEY", "scope": "server", "required": true, "description": "AES-256-GCM master key for plugin_secrets at rest (mandatory in prod)." },
      { "name": "PLUGIN_UPLOADS_DIR", "scope": "server", "required": true, "description": "On-disk root for extracted plugin bundles." }
    ],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1", "reason": "requireAdmin on install/lifecycle/settings mutations." },
      { "slug": "rbac-roles", "range": "^0.1", "reason": "plugins.install capability + step-up gate." }
    ]
  },
  "tags": ["sandbox", "quickjs", "wasm", "plugins", "untrusted-code", "capabilities", "sdk", "infra"],
  "license": "MIT"
}
```
Plus the mandatory `slice.contract.ts` (declares the `HostCapabilityAdapter`
interface as the seam) + `slice.manifest.json`, and a catalog entry in
`lib/content/slices.ts`. Files must be split <=200 lines (Instatic already splits
this way — manifest.ts at 30KB would need decomposition on lift).
