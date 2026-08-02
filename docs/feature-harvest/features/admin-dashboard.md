# Admin dashboard & shell

Two very different implementations sit under this one feature name, and they split cleanly:

- **The admin SHELL** (auth gate -> workspace nav -> command palette -> per-workspace page) — already covered by existing rr slices. Keep that half short.
- **Instatic's Dashboard workspace** — a configurable, draggable/resizable, registry-driven, per-user-persisted KPI **widget tile-grid**. This is the harvest gold: nothing in rr covers it. Most of this doc is about that.

---

## What it does (flow)

### Instatic (the widget grid — net-new)

1. Admin lands on `/admin/dashboard`. `DashboardPage.tsx` owns ONE `DndContext` (dnd-kit) wrapping a header toolbar, a `DashboardGrid`, and (in customize mode) a bottom-docked `BlockLibrary`.
2. **Widget registry** (`src/core/dashboard/registry.ts`) is a process-wide singleton `Map<id, DashboardWidgetDefinition>` with a `useSyncExternalStore` listener bus. First-party widgets self-register on dashboard mount (`registerFirstPartyDashboardWidgets()`); plugins register namespaced widgets at activation (`<pluginId>.<key>`, enforced) and `unregisterByOwner` drops them on disable — no reload.
3. **`useDashboardWidgets`** joins the registry snapshot with the persisted per-user layout into a render list, filtering by the user's capabilities (a widget with `requires: 'audit.read'` never appears for a user lacking it).
4. **`useDashboardLayout`** is the source of truth for `{ widgetId, col, row, size, rows }[]`. It renders the default layout immediately (no white-flash), fires a GET for the saved layout in parallel, then swaps it in. Mutations (move/resize/add/remove/dismiss-onboarding) are optimistic + debounced PUT (a drag-resize burst coalesces to one network call). Explicit grid positioning (no auto-flow); a collision-resolution pass pushes overlapping widgets down, pinning the user-moved widget in place.
5. **Stats are decoupled per widget.** Each widget owns one hook (`usePagesStats`, `useMediaStats`, `useStorageStats`, ...) hitting exactly one per-domain endpoint `/admin/api/cms/dashboard/<domain>?tz=<IANA>`, so widgets unblock independently and the slowest reader (Activity) never holds up the rest. Server handler `server/handlers/cms/dashboard/index.ts` fans out to readers in `posts.ts`/`media.ts`/`storage.ts`/etc; `?tz=` threads a viewer timezone into per-day bucketing (`server/time.ts` `localDayKeyFactory`).
6. **Customize mode** widens the grid gap 1px->16px (CSS `gap` transition), draws a dashed outline, and docks `BlockLibrary` (unused widgets as drag sources `library:<id>`). Page-level `onDragEnd` distinguishes move (existing cell) from add (library tile). A translucent drop ghost tracks the proposed cell and hides when the target overlaps (the ghost disappearing = drop will be rejected). Resize: 4 edge + 1 corner handles snap to integer col/row deltas.
7. **Layout persists per-user** (NOT per-site) in `user_preferences` under key `dashboard-layout` via `PUT /admin/api/cms/me/preferences/dashboard-layout` -> convex `userPreferences.upsert`. Reset = DELETE -> next render falls back to default.
8. `OnboardingPanel` (first-run checklist + `LiquidProgressRing`) sits above the grid, dismissible per-user.

### Instatic (the shell — covered)

`AdminEntry` runs a boot probe; unauthenticated -> `AdminPreAuthForm` (login/MFA), authenticated -> lazy `AuthenticatedAdmin`, which mounts `AdminSessionProvider` + `StepUpProvider` + `SpotlightRoot` (Cmd+K) and a 9-workspace switch (dashboard/site/content/data/media/plugins/users/ai/account). Each workspace page is `prewarmedLazy` (active page first, siblings on `requestIdleCallback`). `access.ts` gates every workspace by a `CoreCapability` (`canAccessWorkspace`, `firstAccessibleWorkspace`, `workspacePath`).

### personal-brand-os (the shell — covered; this project is already rr-slice-structured)

`app/admin/page.tsx` redirects to `/dashboard/admin`. `app/dashboard/layout.tsx` = `StoreProvider` -> `AdminGate` -> `DashboardShellClient`, which renders `DashboardShell` (`frontend/slices/_shared/ui/dashboard-shell.tsx`): shadcn `SidebarProvider` + `AdminSidebar` + `AdminTopbar` + `CommandPalette`. Nav comes from `nav-config.ts` `buildAdminNav(state)` -> grouped [Overview, Pages, Features, Admin Panel] with live counts from the client store. `/dashboard/admin` renders `DashboardView` (KPI grid + traffic/top-posts + drafts/activity + AI suggestions — static store-driven cards, not a draggable grid). The "Admin Panel" group is a uniform set of operational blocks (`feature-blocks.ts`: AI Config / Analytics / Users / Audit Log / Webhooks / Settings) each backed by a `convex/adminPanel_*.ts` module.

---

## Where it lives

### Instatic (`/home/rahman/projects/Instatic-convex`)
- Shell: `src/admin/AdminEntry.tsx`, `src/admin/AuthenticatedAdmin.tsx`, `src/admin/access.ts`, `src/admin/router.tsx`, `src/admin/spotlight/`, `src/admin/state/adminUi.ts`, `src/admin/workspace.ts`
- Dashboard page: `src/admin/pages/dashboard/DashboardPage.tsx` (+ `.module.css`, `widgetIcons.ts`)
- Grid + parts: `src/admin/pages/dashboard/components/{DashboardGrid,BlockLibrary,OnboardingPanel,LiquidProgressRing}.tsx` (+ `.module.css`)
- Hooks: `src/admin/pages/dashboard/hooks/{useDashboardLayout,useDashboardStats,useDashboardWidgets,useOnboardingState}.ts`
- Widgets: `src/admin/pages/dashboard/widgets/*.tsx` + `index.ts` (`registerFirstPartyDashboardWidgets`)
- Registry/types: `src/core/dashboard/{registry.ts,types.ts,iconLookup.ts,index.ts}`
- Widget primitive: `src/ui/components/Widget/Widget.module.css` (canonical borderless tile-card)
- Server stats: `server/handlers/cms/dashboard/{index,types,posts,media,storage,plugins,pages,activity,publishLineup,shared}.ts`, `server/time.ts`
- Layout persistence: `convex/userPreferences.ts` (`get`/`upsert`/`del` on `user_preferences`, index `by_user_key`)
- Docs already exist: `docs/features/dashboard.md`, `docs/features/site-shell.md`

### personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)
- `app/admin/page.tsx`, `app/dashboard/{layout,page,dashboard-shell-client}.tsx`, `app/dashboard/admin/**/page.tsx`
- Shell UI: `frontend/slices/_shared/ui/{dashboard-shell,dashboard-shell-advanced}.tsx`, `admin-sidebar.tsx`, `admin-topbar.tsx`, `command-palette.tsx`
- Admin home: `frontend/slices/admin/dashboard/{DashboardView,DashboardSections,dashboard-helpers}.tsx`
- Admin Panel overview + blocks: `frontend/slices/_shared/admin-panel/{AdminPanelOverview.tsx,feature-blocks.ts}`
- Nav: `frontend/slices/_app/nav-config.ts`
- Convex panels: `convex/adminPanel_{settings,analytics,webhooks,users,auditLog,aiConfig}.ts`
- Cards: `components/admin/{backup,theme,update}-card.tsx`

---

## Data model

### Instatic — layout persistence (the only real backend the grid needs)
`user_preferences` (convex/schema), one row per `(user_id, key)`, index `by_user_key`:
- `user_id: string`, `key: string` (the grid uses `"dashboard-layout"`), `value_json: string` (opaque, JSON-(de)serialized in the convex fn), `updated_at: string` (ISO).
- Stored value shape (TypeBox-validated both sides): `DashboardItem[] = { widgetId, col, row, size, rows }[]` + onboarding-dismissed flag.

Stats are NOT a table — they are derived on the fly server-side from existing CMS tables (`media_assets`, `data_rows`, audit log, plus an `fs.stat` walk for plugin bytes + a dialect-aware DB-size probe). No dashboard-specific tables.

### personal-brand-os — admin-panel tables (the "covered" sub-surfaces, for reference)
`adminWorkspaceSettings` (singleton identity), `adminIntegrations` (`by_*`), `adminApiKeys` (`by_keyId`), `adminWebhooks` (`by_whId`), `adminWebhookDeliveries` (`by_*`), plus audit/users/aiConfig tables. All seed-fallback: empty table -> SEED_* constants render so a fresh deploy looks like the demo.

---

## Public API

### Instatic
- Per-widget stats (REST): `GET /admin/api/cms/dashboard/{pages,posts,media,plugins,storage,publish-lineup,activity}?tz=<IANA>` — each returns a typed summary (e.g. storage: `{ imageBytes, videoBytes, documentBytes, pluginBytes, databaseBytes, totalBytes, dialect }`).
- Layout (REST): `GET/PUT/DELETE /admin/api/cms/me/preferences/dashboard-layout` -> convex `userPreferences.get|upsert|del({ userId, key, value })` (all args `v.*`-validated, index lookup, read-then-patch upsert).
- Registry (in-process, not network): `dashboardWidgetRegistry.register/unregister/unregisterByOwner/list/subscribe`.

### personal-brand-os (covered panels)
`api.adminPanel_settings.{get,setIdentity,revokeKey}`, `adminPanel_analytics.get` (read-only KPIs+series+sources+topPages+funnel from real tables), `adminPanel_webhooks.{get,addEndpoint,togglePause,remove,fire}`, plus users/auditLog/aiConfig. Every public fn is `getAuthUserId`-guarded (throws `ConvexError` if not signed in).

---

## UI surface

- **Admin**: draggable/resizable widget grid; `BlockLibrary` dock; resize handles (edge+corner); customize-mode toolbar toggle; `OnboardingPanel` + `LiquidProgressRing`; first-party widgets (visitors/storage/top-pages/posts/activity/pages/media/status/domain/publish-queue/plugins) each as a `<Widget tint>` borderless tile. Shell: sidebar/topbar workspace nav + Cmd+K spotlight.
- **Public**: none — the dashboard is admin-only.

---

## Dependencies

- **npm (Instatic grid):** `@dnd-kit/core` (DnD), React 19 + React Compiler, `pixel-art-icons` (icons), Zustand+Mutative (adminUi). CSS Modules + `--editor-*`/`--accent-*` tokens. No charting lib (sparklines are hand-rolled).
- **npm (pbos shell):** `lucide-react`, shadcn `sidebar`/`command`, `@convex-dev/auth`.
- **rr-slice deps (for a portable build):** `appshell` (shell chrome + ⌘K via `useCommands`), shadcn `card`/`button`/`scroll-area`, optional `convex-auth` (actor for per-user layout) + a `user_preferences`-style convex fn.

---

## rr coverage

**partial.** The feature is two halves with opposite verdicts:

| Sub-surface | rr coverage | Slice |
|---|---|---|
| Shell chrome (sidebar/topbar, ⌘K palette, responsive) | **covered** | `appshell` (provides `DashboardShell` component + `useCommands`/registry; pbos's own `_shared/ui/dashboard-shell` is the lite shadcn-sidebar variant) |
| Access gate / workspace gating by capability | **covered** | `rbac-roles` + `convex-auth` (+ `platform-admin` for the multi-tenant flavor) |
| Admin-home KPI cards / analytics / webhooks / settings / users / audit panels | **covered** | `platform-admin` (KPI grid), `settings-page`, `shell-settings`, `system-monitor`, `user-management`, `audit-log`, `event-tracking`, `ai-admin` |
| **Configurable draggable/resizable, registry-driven, per-user-persisted KPI widget board** | **net-new** | nothing — propose `dashboard-grid` |

Reasoning: `system-monitor` is a *fixed-layout* telemetry dashboard (no DnD, no registry, no persistence). `platform-admin` exposes a "KPI dashboard grid" but it is a static multi-tenant control-plane grid, not a per-user customizable widget board. No rr slice provides: a widget registry + dnd-kit move/resize + a block library + collision-resolved explicit grid placement + per-user server-persisted layout + decoupled per-widget self-fetching. That bundle is the harvest gold.

---

## Slice plan

**Action: build-new** a `dashboard-grid` slice for the net-new widget board; **reuse** `appshell`/`rbac-roles`/`settings-page`/etc for everything else (do NOT re-lift the shell).

### Laziest correct path (ponytail)
Lift ONLY the widget-board engine; throw away Instatic's shell, server endpoints, and bun coupling. The board is ~6 files of real logic:
1. `registry.ts` (drop almost verbatim — it's already framework-free: `Map` + listener bus + `useSyncExternalStore`-friendly snapshot; just delete the plugin-namespace branch or make it optional).
2. `types.ts` -> swap `PixelArtIconComponent` for a generic `ComponentType` / `LucideIcon`, and `requires?: CoreCapability` for `requires?: string` (a free-form capability key the consumer checks).
3. `DashboardGrid` + resize/drop math from `useDashboardLayout` (the collision-resolution + integer snap is the valuable part) — rewrite CSS Modules to Tailwind + theme tokens, keep the 12-col explicit-placement model.
4. `useDashboardWidgets` (registry x layout join + capability filter).
5. `BlockLibrary` + customize-mode toggle.
6. A `<WidgetTile>` shadcn `Card`-based replacement for `@ui/components/Widget`.

Persistence + stats become **injected adapters** (props), never REST/convex hardcoded:
- `layoutAdapter: { load(): Promise<DashboardItem[] | null>; save(items): Promise<void>; reset(): Promise<void> }` — ship `createMemoryAdapter` (localStorage) for the demo; the consumer wires it to convex `userPreferences`-style `upsert` keyed `dashboard-layout`. (Optionally include a copy-source `convex/features/dashboard-grid/` mirroring `userPreferences.ts` get/upsert/del with `by_user_key`, args `v.*`-validated, read-then-patch — but default is adapter-only so the slice has no required backend.)
- Each widget is responsible for its own data — the slice ships the *grid + registry + a few demo widgets*, and the consumer registers real widgets whose `render` fetches from their own sources. No bundled stats endpoints.

### Portability blockers to strip
- `pixel-art-icons` deep imports -> `lucide-react` / generic icon prop.
- CSS Modules + `--editor-*`/`--accent-*`/`--bg-surface-*` tokens + the 1px-gap `Widget.module.css` -> Tailwind classes + theme tokens (`bg-card`, `bg-muted`, `border-border`), shadcn `Card`.
- `@core/capabilities` `CoreCapability` enum in `requires` and `access.ts` -> string capability keys + an injected `hasCapability(key)` prop (don't hardcode role enums).
- `/admin/api/cms/dashboard/<domain>` REST + `useDashboardStats` -> per-widget consumer fetch; no hardcoded URLs.
- `user_preferences` REST/`PUT /me/preferences/...` + bun server -> `layoutAdapter` prop (+ optional convex copy-source).
- React-Compiler assumption (no `useMemo`/`useCallback`) — rr default Next16 has the compiler too, so keep memo-free; verify no hand memo leaks in.
- Plugin-runtime / QuickJS namespacing in `registry.ts` -> optional `ownerId` namespacing, default single-owner.
- Instatic's `dnd-kit` is fine (already an rr-acceptable dep).

### Effort: **M**
Registry + types are near-free; the grid DnD/resize/collision math + customize-mode + adapter seam + Tailwind reskin + slice trio + a couple of demo widgets is a solid medium. Not L (no engine to invent, dnd-kit does the heavy lifting); not S (it's a real interactive surface with persistence + a registry, several files).

### Proposed slice.json shape
```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "dashboard-grid",
  "version": "0.1.0",
  "category": "ui",
  "kind": "ui",
  "title": "Dashboard Grid — customizable KPI widget board",
  "description": "A per-user customizable admin home: a 12-column draggable/resizable widget tile-grid driven by a widget registry, with a block library to add widgets in customize mode and collision-resolved explicit placement. Widgets self-fetch via their own render; layout persistence + capability checks are injected (createMemoryAdapter shipped for demos, consumer wires convex user_preferences). Brand-free, theme-token only, mounts inside appshell chrome.",
  "namespace": "@/features/dashboard-grid",
  "frontend": { "slicePath": "frontend/slices/dashboard-grid", "configExport": "dashboardGridConfig" },
  "convex": { "tablesExport": "", "schemaPath": "", "rootPaths": [] },
  "deps": {
    "npm": ["@dnd-kit/core", "lucide-react"],
    "shadcn": ["card", "button", "scroll-area", "dropdown-menu"],
    "env": [],
    "peers": [
      { "slug": "appshell", "range": "^1.5", "reason": "Mounts inside dashboard-shell chrome; ⌘K customize toggle via useCommands." }
    ]
  },
  "registers": ["registry"],
  "audit": ["bp:ui-consistency"],
  "license": "MIT",
  "tags": ["dashboard", "widgets", "grid", "drag-and-drop", "resizable", "kpi", "ui"],
  "contract": {
    "requires": { "auth": "none", "deps": [{ "npm": "@dnd-kit/core", "range": "^6" }] },
    "provides": {
      "components": ["DashboardGrid", "BlockLibrary", "WidgetTile", "OnboardingPanel"],
      "hooks": ["useDashboardLayout", "useDashboardWidgets"],
      "utils": ["dashboardWidgetRegistry", "createMemoryLayoutAdapter", "registerWidget"],
      "tables": [],
      "rbac": []
    },
    "generalization": {
      "level": "needs-adapter",
      "requiredProps": ["layoutAdapter", "widgets", "hasCapability"]
    }
  }
}
```
Optional backend copy-source `convex/features/dashboard-grid/` (get/upsert/del on a `user_preferences`-shaped table, index `by_user_key`) shipped as non-required, mirroring `convex/userPreferences.ts`.
