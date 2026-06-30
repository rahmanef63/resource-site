# Theming & editor preferences

This feature name bundles **two unrelated concerns** that both happen to be "user-tunable UI knobs". Treat them separately — they have different owners, storage, and rr coverage:

1. **Theming / color presets** — runtime tweakcn color-preset swap on top of `next-themes` (personal-brand-os). **Already covered** by the rr `theme-presets` slice (byte-identical lift + AI tools added).
2. **Editor preferences** — catalog-driven, type-safe, device-scoped `localStorage` preference registry with cross-tab sync + auto-rendered settings UI (Instatic). **Net-new** — no rr slice generalizes this.

---

## What it does (flow)

### A. Theming (personal-brand-os) — COVERED
Resolution order in `ThemePresetProvider`: (1) visitor's explicit localStorage choice → (2) `siteDefault` the owner saved in settings → (3) `hostDefault` build-time template preset. On first client mount `bootTweakcnPreset` applies the saved/default preset by writing tweakcn CSS variables onto `:root` (light/dark blocks). The `ThemePresetSwitcher` Popover lets a visitor pick light/dark/system mode (delegates to `next-themes`) plus a grouped color preset; hover gives a live preview, leave/restore reverts. Registry (~30 curated presets) ships INSIDE the slice as `registry-data.json`, loaded lazily via dynamic import so the ~240KB JSON code-splits. `SaveSiteDefaultButton` lets an admin promote the current preset to the site-wide default via a **host-injected** `onSave(preset)` callback. `ThemeColorSync` mirrors the resolved theme color into a `<meta name="theme-color">`. Defaults apply WITHOUT persisting, so changing the site default propagates to visitors who never picked their own.

### B. Editor preferences (Instatic) — NET-NEW
One declarative array (`PREFERENCE_CATALOG`) is the single source of truth that drives THREE derived things at module load: the TypeBox validation schema, the runtime defaults object, and the Settings → Preferences UI. A preference is read in React via `useEditorPreference('autoSave')` (boolean) / `useEditorSelectPreference('density')` (string); non-React consumers (e.g. an auto-save scheduler) read imperatively via `readEditorPreferenceBool` / `readEditorSelectPreference` + `subscribeToEditorPrefsChanged`. All values live in a single `localStorage["instatic-editor-prefs"]` blob, device-scoped, never written to the document. Writes go through `setEditorPreference`, which updates an in-memory parsed cache, persists, and fans a change event to every subscriber. A native `storage` event keeps two browser tabs in sync (invalidate-cache-then-notify). `PreferencesSection` renders the catalog grouped by category, dispatching on `pref.type` to a Switch / Select row — adding a preference is ONE catalog entry, zero UI wiring. `select-dynamic` preferences resolve their option list at render time from live app state (e.g. the site's breakpoints).

---

## Where it lives

**personal-brand-os (theming):**
- `frontend/slices/theme-presets/` — already a vertical slice (`index.ts` barrel)
  - `components/ThemePresetProvider.tsx` (context + resolution order), `ThemePresetSwitcher.tsx` (Popover UI), `SaveSiteDefaultButton.tsx`, `ThemeColorSync.tsx`, `ThemeProviders.tsx`, `mode-tabs.tsx`
  - `lib/tweakcn/` — `apply.ts`, `tokens.ts`, `types.ts`, `groups.ts`, `registry.ts`, `cssBuilder.ts`, `registry-data.json`
- `components/theme-provider.tsx` — host wiring: wraps `next-themes` `ThemeProvider` then `ThemePresetProvider hostDefault="cosmic-night"`

**Instatic (editor preferences):**
- `src/admin/pages/site/preferences/catalog.ts` — `PREFERENCE_CATALOG`, `PREFERENCE_CATEGORIES`, derived id unions, `defaultBooleanFor`/`defaultSelectFor`/`preferencesByCategory` helpers
- `src/admin/pages/site/preferences/editorPreferences.ts` — schema/defaults derivation, cached IO, getters/setters, event bus, `useEditorPreference`/`useEditorSelectPreference` hooks, named convenience readers (`readAutoSavePreference`, `readAutoSaveDelayMs`)
- `src/admin/modals/Settings/sections/PreferencesSection.tsx` — auto-rendered UI (BooleanPreferenceRow / SelectPreferenceRow / DynamicSelectPreferenceRow + `useDynamicSelectOptions`)
- Consumers: `usePersistence.ts` (auto-save), `ClassPicker.tsx`/`SpacingBoxControl.tsx` (hover-preview gate), `AdminCanvasLayout` (`data-editor-density` attr), `TreeNode.tsx`/`DomPanel.tsx` (layers), `CanvasRoot.tsx` (dim-inactive-breakpoints)
- Docs: `docs/features/editor-preferences.md` (excellent, exhaustive)
- Tests: `src/__tests__/settings/settingsSections.test.tsx`, `settingsModal.test.tsx`

**Not theming (noise to ignore for this slice):** `src/core/css-substitution/index.ts` — this is a *publisher/import* engine that rewrites `var()`/`env()` declarations to marker custom properties so they survive any CSS engine's lossy CSSOM parse during HTML import, then decodes them back. It belongs in an import/publisher harvest, not here.

---

## Data model

No Convex tables. Both halves are client-side:

- **Theming:** visitor choice in `localStorage` (tweakcn helper key). Site-wide default is a single `themePreset: string` field on the host's EXISTING settings doc (e.g. personal-brand-os `siteSettings.themePreset`) — written through the injected `onSave`/`settingsUpsert`, never owned by the slice.
- **Editor preferences:** one `localStorage["instatic-editor-prefs"]` JSON blob, e.g.
  ```jsonc
  { "autoSave": true, "hoverPreview": false, "density": "compact", "autoSaveDelay": "30" }
  ```
  TypeBox `Type.Object(fields, { additionalProperties: true })` — missing fields fall back to catalog default, unknown fields preserved on round-trip (forward/backward compat). Catalog entry shape is a discriminated union: `boolean` | `select` (static options) | `select-dynamic` (`optionsSource: 'site.breakpoints'`).

---

## Public API

None server-side. Both halves are pure client slices.
- Theming exposes hooks/utils (`useThemePreset`, `applyTweakcnPreset`, `loadTweakcnRegistry`, …) and 4 agentic tools (`theme-presets.list_presets|current|set_preset|clear`). `SaveSiteDefaultButton` calls a **host-injected** mutation `onSave(preset) → settingsUpsert({ themePreset })`.
- Editor preferences exposes hooks (`useEditorPreference`, `useEditorSelectPreference`), imperative IO (`readEditorPreferenceBool`, `setEditorPreference`, `readEditorSelectPreference`, `setEditorSelectPreference`, named readers), and the event bus (`subscribeToEditorPrefsChanged`).

---

## UI surface

- **Theming:** `ThemePresetSwitcher` (Palette trigger → Popover with mode tabs + grouped preset list + hover preview + reset), `SaveSiteDefaultButton` (admin Appearance section). shadcn `button` + `popover`.
- **Editor preferences:** `PreferencesSection` inside a Settings modal — catalog auto-rendered into category groups; each row is a labeled Switch (boolean) or Select (select / select-dynamic). The `density` pref also drives a `data-editor-density` attribute that CSS modules respond to via `:global([data-editor-density='comfortable'])`.

---

## Dependencies

- **npm:** `next-themes@^0.4.6` (theming only). Instatic engine uses `@sinclair/typebox` + `parseJsonWithFallback` — **strip on port** (rr is Next/shadcn; use a 10-line plain-validate or `zod` per host).
- **rr-slice deps:** theming → reuse `theme-presets` (+ `@/shared/agentic` for tools). Editor-prefs → compose `shell-settings` primitives (`SettingsSection`/`SettingsRow`/`Segmented`) for rendering; generalizes the one-off pattern in `full-width-toggle`.

---

## rr coverage — PARTIAL

- **Theming = covered.** rr `frontend/slices/theme-presets/` is a byte-identical lift of personal-brand-os's slice (same `index.ts` barrel, same `lib/tweakcn/*`, same `registry-data.json`), v0.4.0, plus rr added `lib/tools.ts` (4 agentic tools) and `SaveSiteDefaultButton` site-default layer. Nothing to harvest here — the rr slice is the *more advanced* copy.
- **Editor preferences = net-new.** No rr slice provides the catalog-driven engine:
  - `shell-settings` = settings-app **UI primitives** + injected `AppearanceAdapter` (the chrome, not a preference registry/state layer).
  - `full-width-toggle` = exactly ONE device-scoped localStorage preference with cross-tab sync (`useFullWidth`) — i.e. a single hand-rolled instance of what the Instatic catalog generalizes.
  - `theme-presets` = color presets, not a generic typed pref store.
  Proposed net-new slug: **`editor-preferences`** (a.k.a. `device-preferences`).

---

## Slice plan

**Theming half → reuse `theme-presets` (skip).** Already lifted and ahead of the source. No action.

**Editor-preferences half → build-new `editor-preferences` (the harvest gold).**

Laziest correct path (ponytail): copy Instatic's two pure files (`catalog.ts` + `editorPreferences.ts`) almost verbatim — they're framework-agnostic and ~300 lines total — then:
1. Replace the TypeBox schema/`parseJsonWithFallback` with a tiny inline validate (or `zod` if the host already has it). The `additionalProperties:true` forward-compat behavior is just "spread unknown keys through on write, default on missing read".
2. Make the catalog **injectable**, not hardcoded: the slice ships an empty/example catalog + the engine; the consumer passes ITS OWN `PREFERENCE_CATALOG` + storage key into a `createPreferenceStore(catalog, { storageKey })` factory that returns the typed hooks/getters/setters. This is the single change that turns an Instatic-internal module into a portable slice.
3. Port `PreferencesSection` as `<PreferencesPanel catalog={...} />` rendering shadcn Switch/Select rows — or just emit catalog rows through `shell-settings`'s `SettingsSection`/`SettingsRow` to avoid duplicating chrome.
4. Keep the `select-dynamic` seam: `optionsSource` resolves through a consumer-supplied `resolveDynamicOptions(source)` prop (Instatic hardcodes `site.breakpoints`).

Portability blockers to strip:
- `EDITOR_PREFS_KEY = 'instatic-editor-prefs'` hardcoded → constructor arg.
- TypeBox / `@core/utils/jsonValidate` import → host-agnostic validate.
- `useEditorStore`/`site.breakpoints` coupling in `useDynamicSelectOptions` → injected resolver.
- `@ui/components/*`, `@admin/spotlight/*`, CSS-module class names → shadcn primitives / props.
- The catalog itself (autoSave/density/layers… are Instatic-specific) → ship as example, inject real one.

Effort: **M** (pure logic is trivial; the work is the injectable-catalog factory + shadcn-ifying the auto-rendered panel + dynamic-options seam).

Proposed `frontend/slices/editor-preferences/` trio:
```jsonc
// slice.json
{
  "slug": "editor-preferences",
  "version": "0.1.0",
  "category": "ui",
  "kind": "ui",
  "title": "Editor Preferences — catalog-driven device-scoped preference store",
  "description": "One declarative catalog drives a typed localStorage preference store: derived schema + defaults + auto-rendered settings panel + cross-tab sync. Boolean / select / dynamic-select prefs. Consumer injects its own catalog + storage key; renders via shell-settings primitives.",
  "namespace": "@/features/editor-preferences",
  "frontend": { "slicePath": "frontend/slices/editor-preferences", "configExport": "editorPreferencesConfig" },
  "deps": { "npm": [], "shadcn": ["switch", "select", "separator"], "env": [], "peers": ["shell-settings"] },
  "contract": {
    "requires": { "auth": "none" },
    "provides": {
      "hooks": ["useEditorPreference", "useEditorSelectPreference"],
      "utils": ["createPreferenceStore", "subscribeToPrefsChanged"],
      "components": ["PreferencesPanel"],
      "types": ["PreferenceDef", "PreferenceCatalog"]
    },
    "generalization": { "level": "portable" }
  }
}
```
No `convex/features/editor-preferences` — it's localStorage-only. (If a host wants server-synced prefs later, that's a separate per-user settings mutation, out of scope.)
