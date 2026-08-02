# ULTRAPLAN — UI Assembler

End-state: every template page = configurable. User picks variants +
addons → live preview reacts → "Copy prompt" → exact agent
instructions → "View source" deep-links to GitHub.

## Phase 1 — Foundation (DONE)

1. **Dedupe scroll** — strip ScrollArea from DocsSidebar (parent handles).
2. **`FeatureManifest.config: ConfigSchema`** — radio / select / check / multi.
3. **State** — selections live in `FeatureContext` + URL query string.
4. **`<AssemblerInspector>`** — auto-renders config fields, selection summary, "Copy prompt", "View source".
5. **`<PreviewPane>`** — reads selections → composes iframe `src` (manifest's `composePreviewSrc`).
6. **`composePrompt(selections)`** — manifest function emits dynamic agent prompt.
7. **`repoUrl()`** — `https://github.com/rahmanef63/resource-site/tree/main/<path>`.
8. **Exemplar: `dashboard-mobile-dock`** — 3 variants × 4 addons, fully wired.

## Phase 2 — Apply config to remaining templates

Per-template config files under `lib/templates/configs/`. Each emits:
- `config: ConfigSchema`
- `composePrompt`
- `composePreviewSrc`
- `sourceRepoForSelection?` (variant-specific repo path)

Priority order (high impact first):

| Template | Variants | Add-ons |
|---|---|---|
| `header-navbar` (NEW recipe) | sticky, floating, transparent | sidebar-toggle · tabs-strip · right-nav (avatar/settings/none) · search · cmdk |
| `dashboard-three-column` | 2col / 3col-fixed / 3col-resizable | persist-collapse · mobile-drawer · ai-fab · right-tabs (inspector/ai/notifications) |
| `landing-hero-carousel` | fade / slide / kenburns | autoplay · indicators · arrows · overlay-text |
| `landing-hero` (NEW recipe) | center / split / stacked | tagline · demo-button · video-bg · marquee-trust |
| `landing-bento` | 2x2 / 3x3 / 4-asym | gradient-cards · hover-magnify · cta-row |
| `command-palette` | basic / grouped / fuzzy | recents · theme-switch · workspace-switch |
| `theme-preset-switcher` | dropdown / grid / inline | system-preset · live-preview-cards · save-favorites |

For each: build `app/preview/<slug>/page.tsx` that reads URL params and
renders the chosen variant + addons.

## Phase 3 — Multi-template assembler page

Standalone `/build` route. User picks:
- Shell (responsive-shell w/ desktop+mobile config)
- Layout (one)
- Recipes (many)
- Primitives (many)

Each pick contributes its own assembler. Final state composes ONE
bundled prompt + a download zip of all selected source folders.

## Phase 4 — Plugin marketplace integration

Each `/rresource:<slug>` skill in the plugin reads the same config schema
so the agent can ask the user the same questions and apply the same
selections programmatically when scaffolding.

## Open knobs (decide later)

- Persist selections to URL via `usePathname` + `useRouter.replace()`
  (currently in-memory only — refresh resets to defaults).
- "Save preset" — store named selection bundles in localStorage,
  surface in inspector.
- Auto-open right inspector when first config-enabled page loads
  (currently user must toggle).
- Per-variant primaryFile + repoPath (some variants live in different
  source repos).

## Hard rules (non-negotiable)

- shadcn primitives only — no raw `<button>`, `<input type=date|file>`, `<dialog>`.
- Auth = `@convex-dev/auth` only — no Clerk, NextAuth.
- Convex queries: `withIndex(...).take(N)` — no bare `.collect()`.
- `next/link` for internal nav, `next/image` for images.
- No `NEXT_PUBLIC_*` for sensitive values.
- `proxy.ts` not `middleware.ts` on Next 16.

## API reference

```ts
type FeatureManifest = {
  // … existing tabs / inspector / responsive
  sourceRepo?: { owner; repo; branch?; path };       // GitHub deep-link
  config?: ConfigSchema;                              // assembler fields
  composePrompt?: (sel: Selections) => string;        // dynamic prompt
  composePreviewSrc?: (sel: Selections, base: string) => string;
};

type ConfigField =
  | { type: "radio";  id; label; options; default }
  | { type: "select"; id; label; options; default }
  | { type: "check";  id; label; default?; desc? }
  | { type: "multi";  id; label; options; default? };
```

## Adding a new configurable template

1. Build the variant logic in `app/preview/<slug>/page.tsx`. Read URL
   params via `useSearchParams()`. Branch render per variant + addon.
2. Define the schema in `lib/templates/configs.ts` (or split per-slug
   files later).
3. Implement `composePrompt(slug, title, selections)` — output exact
   agent instructions including file paths, props to set, wiring steps.
4. Implement `composePreviewSrc(selections, basePath)` — append params
   to iframe src.
5. Ensure `repoPath` in `lib/content/<kind>.ts` points at the right
   github source folder.
6. (No code change to `<TemplateDetail>` — auto-detected via slug.)
