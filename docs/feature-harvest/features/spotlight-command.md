# Spotlight / command palette

Source: **Instatic** (`/home/rahman/projects/Instatic-convex`). personal-brand-os has no spotlight surface.

Verdict up front: **PARTIAL**, not "covered". rr's `command-menu` slice already owns the *dumb palette* (cmdk dialog chrome, ⌘K hotkey, MRU history, consumer-supplied `CommandGroup[]` + `onSelect`, plus a `SearchModal`). Instatic's spotlight is a *command engine* on top of that surface: a filterable command registry, an async multi-provider runner (debounce/abort/cache), stacked scopes, an in-house fuzzy scorer with match-range highlighting, a keybindings single-source-of-truth, destructive two-press confirm, and step-up re-auth wrapping. The engine layer is the harvest gold; the rendering surface is already covered.

## What it does (flow)

⌘K / Ctrl+K opens a lazy-loaded palette from anywhere in the admin. Flow per open:

1. `SpotlightRoot` (mounted once inside `AuthenticatedAdmin`) catches the global keydown, builds a `CommandContext` snapshot (workspace, pathname, user, and — on the site editor — a live editor snapshot via `subscribeWithSelector`), and lazy-imports the heavy `<Spotlight>` chunk on first open.
2. State lives in a `useReducer` (`state.ts` + `stateHandlers.ts`): query string, scope stack (`ScopeFrame[]`), async results per provider, loading flags, selected row, pending destructive confirm.
3. As the user types, two pipelines run:
   - **Static commands**: the active scope's `commands()` are gathered, `filterCommands(cmds, ctx)` drops anything failing workspace/capability/`when()` gates, then `rankCommands(cmds, query, ctx, recentIds)` (the in-house fuzzy matcher) scores + sorts + returns match ranges for `<mark>` highlighting. Empty query floats `recent` commands to the top.
   - **Async providers**: `ProviderRunner.run(scopeId, query)` fires every scope-local provider plus plugin providers in parallel, each with its own debounce + AbortController + 30s TTL cache. Results dispatch into the reducer as they land (`SET_ASYNC_RESULTS` / `SET_LOADING_PROVIDER`).
4. Results render grouped by `CommandGroup`, each group keyed to a categorical accent (`groupAccent.ts`). Enter runs the selected command's `run(ctx)`. `run` may return `{ pushScope: id }` to enter a sub-flow; destructive commands require a second Enter; sensitive commands wrap their server call in `ctx.runStepUp(...)`.
5. On run, `recordRecentCommand(id)` writes the command id to localStorage; the palette closes unless `keepOpenAfterRun`.

Recents are per-device (localStorage), never server-side. There is **no Convex/DB table** — all data is either static command definitions, localStorage recents, or live server-provider fetches against existing admin REST endpoints.

## Where it lives

Instatic — `src/admin/spotlight/`:
- `SpotlightRoot.tsx` — mount point, ⌘K listener, reducer host, editor-store subscription, lazy `<Spotlight>` loader, `ProviderRunner` held in a ref.
- `Spotlight.tsx` / `SpotlightResults.tsx` / `SpotlightRow.tsx` / `SpotlightFooter.tsx` / `SpotlightSkeleton.tsx` — dialog UI (CSS Modules: `Spotlight.module.css` etc.).
- `types.ts` — `Command`, `CommandContext`, `CommandRunContext`, `SpotlightProvider`, `Scope`, `ScopeFrame`, `CommandArg`, `CommandShortcut`, `CommandGroup`.
- `commandRegistry.ts` — `SCOPE_REGISTRY`, `getScope`, `filterCommands` (3-gate: workspace → capability → `when`), `getPluginPaletteSpotlightProviders`.
- `builtinCommands.ts` — aggregates `commands/*.ts` into the static set.
- `matcher.ts` — `rankCommands` / `scoreCommand` in-house fuzzy scorer (~240 LOC, zero deps).
- `providerRunner.ts` — `ProviderRunner` class: parallel fire, per-provider debounce (default 150ms), AbortController, 30s cache.
- `providers/` — `serverProvider.ts` (`makeServerProvider` factory + `fetchOnAbortEmpty`), `schemas.ts` (TypeBox response schemas), and per-domain providers: `pagesProvider`, `siteFilesProvider` (local, read editor store), `mediaProvider`, `contentProvider`, `dataProvider`, `pluginPagesProvider` (server, hit `/admin/api/cms/...`).
- `scopes/` — 14 scope defs (`rootScope`, `editorScope`, `pagesScope`, `breakpointsScope`, `vcScope`, `contentScope`, `dataScope`, `mediaScope`, `pluginsScope`, `usersScope`, `settingsScope`, `helpScope`, `codeEditorScope`, `pluginCommandsScope`).
- `commands/` — 21 command-domain files (`navigation`, `editor`, `pages`, `content`, `data`, `media`, `visualComponents`, `framework`, `plugins`, `users`, `account`, `settings`, `preview`, `aiAssistant`, `help`, `layers`, `panels`, `breakpoints`, `importHtml`, `siteImport`, `siteExport`).
- `keybindings.ts` — declarative keybinding registry, the single source of truth for shortcut hints (gated by `keybindings-registry-single-source.test.ts`).
- `recentStore.ts` — localStorage MRU (key `spotlight:recent-commands`, max 8, TypeBox-validated read).
- `pendingAction.ts` — destructive two-press confirm state machine.
- `telemetry.ts` — usage logging. `groupAccent.ts` — group → accent. `spotlightContext.ts` / `spotlightControls.ts` / `spotlightSearch.ts` (scope:/action: prefix parsing) / `state.ts` / `stateHandlers.ts` / `stateTypes.ts`.
- Docs: `docs/features/spotlight.md` (excellent, authoritative). Gate tests: `src/__tests__/architecture/spotlight-no-direct-store-mutation.test.ts`, `keybindings-registry-single-source.test.ts`.

personal-brand-os: none.

## Data model

No Convex tables. No schema. Two non-DB stores:
- **localStorage** `spotlight:recent-commands` → `string[]` (command ids, max 8, deduped, TypeBox `Type.Array(Type.String())`).
- **Server-provider responses** validated by TypeBox schemas in `providers/schemas.ts` (e.g. `DataTablesListResponseSchema`), shaped per existing admin endpoint — not owned by spotlight.

In rr terms this slice is **frontend-only** (no `convex/features/spotlight-command`). command-menu's `slice.json` already declares `convex: { tablesExport: "", rootPaths: [] }` — same here.

## Public API

No queries/mutations of its own. Server providers consume **consumer-owned REST endpoints** (Instatic: `/admin/api/cms/media`, `/admin/api/cms/data/tables`, `/admin/api/cms/content`, `/admin/api/cms/plugins/pages`), each appending `?query=<q>&limit=25`. In a portable slice these endpoints are injected, not hardcoded. Plugin commands/providers register through the plugin SDK (`api.editor.palette.registerCommand`) — Instatic-specific, out of scope for the slice.

## UI surface

Admin-only (post-login). No public surface. Components: dialog (`Spotlight`), grouped results list (`SpotlightResults`), result row with fuzzy `<mark>` highlight + danger state (`SpotlightRow`), keyboard-hint footer (`SpotlightFooter`), loading shimmer (`SpotlightSkeleton`), help/keybindings screen (`HelpKeybindingsList`, ⌘?). Keyboard: ⌘K open/close, Esc clear-or-close, ↑/↓ select, Enter run (×2 for destructive), Tab cycle scope, Backspace-on-empty pop scope, ⌘? help.

rr equivalent surface already exists in `command-menu`: `CommandPalette`, `CommandGroupList`, `SearchModal` — built on shadcn `command` + `dialog` + `cmdk`, with the same hotkey + MRU behaviors.

## Dependencies

Instatic: zero external for the engine (in-house matcher, TypeBox for boundaries, `@core/http` `apiRequest`, `@core/plugins/runtime`, `pixel-art-icons`, Zustand editor store). rr target keeps it leaner:
- npm: `cmdk` (already a command-menu dep). No new npm deps for the engine — the matcher/runner/registry are pure TS.
- shadcn: `command`, `dialog` (already command-menu deps).
- rr-slice deps: `command-menu` (the host surface this enhances). Optionally `event-tracking` for the telemetry hook and `icon-picker` for icon-name → node resolution.

## rr coverage

**PARTIAL** → existing slice **`command-menu`** (`frontend/slices/command-menu`, v0.3.0, pulled up from notion-page-clone).

What `command-menu` already covers (reuse as-is):
- `CommandDialog` chrome + `cmdk` wiring + global ⌘K/Ctrl+K hotkey (`disableHotkey` escape hatch).
- MRU "Recent commands" via localStorage (`loadHistory`/`saveHistory`, key `kitab.cmdk.history`, injectable `Storage`) — maps 1:1 to Instatic's `recentStore.ts` + the matcher's `recent` group.
- Renderless `CommandGroup[]` + per-item `onSelect` + `track` MRU field + group visibility flags (`hideOnQuery`, `showOnQueryOnly`).
- `SearchModal` with normalized `SearchHit[]` (pages/databases/recents) + bindings — covers Instatic's server-provider *results display* pattern.
- Translatable label bags + forbidden-terms portability gate.

What `command-menu` does **not** cover (the gap = harvest gold):
1. **Command registry + gating** — `filterCommands` 3-gate (workspace, capability/role any-of, pure `when(ctx)` predicate) with `priorityBoost`. command-menu has no notion of gating/context; the consumer pre-filters by hand.
2. **Async provider runner** — `ProviderRunner`: N providers in parallel, per-provider debounce, AbortController cancel-on-keystroke/close, 30s TTL cache, per-provider loading flags. command-menu's `SearchModal` debounces one consumer query; it has no multi-provider scheduler.
3. **Scopes** — stacked `ScopeFrame[]` sub-flows; a command `run` returns `{ pushScope }`, Backspace-on-empty pops. No equivalent in command-menu.
4. **In-house fuzzy scorer** — `rankCommands`/`scoreCommand`: prefix +1000, word-start +500, substring +200, subtitle +80, keywords +40, recent decay, `when` boost +250, match ranges for `<mark>`. command-menu delegates fuzzy matching entirely to `cmdk`'s internal scorer (no ranges, no boosts, no recent-decay).
5. **Destructive two-press confirm** (`pendingAction.ts`) and **step-up re-auth wrap** (`ctx.runStepUp`). Not present.
6. **Keybindings registry as single source of truth** for per-command shortcuts.

## Slice plan

**Action: ENHANCE `command-menu` (do not build a second palette slice).** A new `spotlight-command` slice would duplicate ~60% of command-menu (dialog, hotkey, MRU). Ponytail path: keep command-menu's rendering surface and *add an optional, pure-TS engine sub-module* that produces `CommandGroup[]` for the existing `CommandPalette`. The engine is framework-agnostic and ships with zero new npm deps.

Laziest correct path (ponytail):
- Add `frontend/slices/command-menu/lib/engine/` with four files lifted from Instatic and de-coupled:
  - `matcher.ts` — copy `rankCommands`/`scoreCommand` near-verbatim (already zero-dep, ~240 LOC). Replace the hardcoded `AdminWorkspace`/`CommandGroup` enums with a generic `string` group + a `groupOrder?: string[]` option.
  - `providerRunner.ts` — copy the `ProviderRunner` class; swap the Instatic reducer-action `dispatch` for a plain `(providerId, results | loading) => void` callback so it's reducer-agnostic.
  - `registry.ts` — `filterCommands(cmds, ctx)` 3-gate, but make the capability check a consumer-supplied `can(ctx, cap) => boolean` predicate (strip `ctx.user.capabilities.includes`), and workspace a generic `string`.
  - `types.ts` — `EngineCommand`, `EngineContext`, `Scope`, `SpotlightProvider`, `CommandArg`. Drop `runStepUp` from the base context; expose it as an **optional** injected hook so non-Instatic consumers skip step-up entirely.
- Add an optional adapter `lib/engine/toGroups.ts` that turns `{ scope, query, ctx, providers }` → `CommandGroup[]` so the existing `CommandPalette` renders engine output unchanged. The whole engine is opt-in: today's command-menu consumers are untouched.
- Bump `command-menu` minor; add `engine` to the `contract.provides` and a `requiredProps`-style note that providers/endpoints/`can`/icon-resolver are consumer-injected.

Portability blockers to strip (all live in Instatic, must NOT survive into the slice):
- `@core/http` `apiRequest` + TypeBox schemas in `serverProvider.ts` → replace with an injected `fetcher(url, signal) => Promise<unknown>` + a consumer-side validator; keep `makeServerProvider` shape but make the HTTP client a prop.
- Hardcoded `/admin/api/cms/...` endpoints → consumer supplies endpoint strings per provider.
- `@core/plugins/runtime` `pluginRuntime.getPaletteProviders()` → drop plugin coupling; `ProviderRunner` already takes a provider list, so "plugin providers" just become "extra injected providers".
- `CmsCurrentUser.capabilities` + capability string enum → consumer `can(ctx, cap)` predicate; role/capability values are NOT hardcoded.
- `AdminWorkspace` enum (`'site' | …`) → generic `workspace: string`.
- `pixel-art-icons` `iconName` strings → keep `iconName?: string` opaque; consumer maps name → `ReactNode` (command-menu items already take `icon?: ReactNode`).
- Zustand `useEditorStore.getState()` reads (siteFilesProvider/pagesProvider) → these are consumer-domain *adapters*, not slice code; ship only the generic local-provider pattern.
- `ctx.runStepUp` step-up auth → optional injected hook, default no-op.
- localStorage key already injectable in command-menu (reuse `HISTORY_KEY` override).

Effort: **M** — the engine is ~600 LOC of pure TS already written and tested in Instatic; the work is de-coupling (strip 8 blockers above) + an opt-in `toGroups` adapter + contract/version bump + a couple of vitest locks for the matcher scoring. No backend, no new npm deps.

Proposed `command-menu` `slice.json` delta (no new convex block):
```jsonc
{
  "slug": "command-menu",
  "version": "0.4.0",                 // minor bump: additive engine
  "convex": { "tablesExport": "", "schemaPath": "", "rootPaths": [] },
  "deps": { "npm": ["cmdk@^1.0.0"], "shadcn": ["command", "dialog"], "env": [], "peers": [] },
  "contract": {
    "provides": {
      "components": ["CommandPalette", "SearchModal", "CommandGroupList"],
      "modules": ["engine"]           // rankCommands, ProviderRunner, filterCommands, toGroups
    },
    "generalization": {
      "level": "portable",
      "forbiddenTerms": ["nosion", "Nosion", "instatic", "Instatic"],
      "requiredProps": ["groups", "onNavigate", "labels"]
    }
  }
}
```

If a standalone slice is ever preferred over enhancing, the proposed slug is `command-engine` (engine-only, depends on `command-menu` for rendering) — but enhance is the lazy-correct call.
