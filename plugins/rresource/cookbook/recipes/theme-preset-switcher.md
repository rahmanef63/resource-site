# Recipe — Theme Preset Switcher (v2 / tweakcn)

> **Portability tier:** M
> **Origin source:** CareerPack (`frontend/src/shared/{lib,components/theme,providers}/`) — itself a verbatim copy of the [tweakcn](https://tweakcn.com) registry.
> **Live demo:** kitab site itself uses this — open https://resource.rahmanef.com and click the palette icon in the top-right.

## Tujuan

Runtime theme swap. 36 OKLCH presets dari tweakcn, dimuat dari `/r/registry.json` di runtime (single 4867-line file). Light/dark/system mode tabs + grouped preset palette dalam satu Popover. Persists to localStorage. 260 ms transition pulse pada setiap swap.

## Files (v2 — recommended)

| Path | Purpose |
|---|---|
| `public/r/registry.json` | tweakcn preset registry (verbatim copy, 36 items) |
| `lib/theme/theme-presets.ts` | Loader + applyPreset/previewPreset/restoreSavedPreset/bootPreset |
| `lib/theme/preset-groups.ts` | Curated grouping: Brutalism, Refined, Bold, Warm, Artistic, Dark & Moody |
| `lib/theme/registry-fonts.ts` | Family-name → next/font CSS variable lookup |
| `components/site/theme-preset-provider.tsx` | React provider — boots preset on mount, exposes `useThemePreset()` |
| `components/site/theme-preset-switcher.tsx` | Popover UI: mode tabs + grouped preset list w/ swatches |
| `components/ui/popover.tsx` | shadcn Popover primitive (radix wrapper) |

## Files (v1 — legacy zustand version, still in template-base)

`frontend/shared/theme/theme-presets.ts` + `frontend/shared/ui/components/theme-preset-switcher.tsx` — superspace-style, 13 hardcoded presets, zustand store, optional Convex sync. Use only if you need Convex persistence or already have v1 wired.

## Integration example

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";
import { ThemePresetProvider } from "@/components/site/theme-preset-provider";

<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  <ThemePresetProvider>{children}</ThemePresetProvider>
</ThemeProvider>
```

```tsx
// somewhere in your navbar
import { ThemePresetSwitcher } from "@/components/site/theme-preset-switcher";

<ThemePresetSwitcher />
```

## Agent recipe (v2)

1. **Copy registry** — `cp <kitab>/public/r/registry.json <consumer>/public/r/registry.json` (4867 lines, ~150 KB). Cache via `force-cache` so first paint cost is amortised.
2. **Copy lib files** — three files into `lib/theme/`. Adjust `STORAGE_KEY` constant in `theme-presets.ts` to your project namespace (e.g. `myapp:theme-preset`).
3. **Copy components** — `theme-preset-provider.tsx` + `theme-preset-switcher.tsx` into `components/site/` (or wherever your client-only UI lives). Ensure `components/ui/popover.tsx` exists; if missing run `npx shadcn@latest add popover`.
4. **Add CSS rule** — append `html.theme-transition` block to `app/globals.css` (transitions background/color/border/shadow/letter-spacing on swap). Snippet at bottom of this recipe.
5. **Wire provider + switcher** — see Integration example above.
6. **Add a custom preset** — create entry in `public/r/registry.json` (light + dark `cssVars`), then add its `name` to a group in `lib/theme/preset-groups.ts`. No code change needed beyond that.

## Schema / npm / env

- **npm:** `next-themes`, `@radix-ui/react-popover`, `lucide-react`. No backend dep.
- **No env vars.**
- **No Convex schema needed** for v2 (localStorage only). To sync across devices, follow v1 pattern.

## CSS transition rule (append to globals.css)

```css
html.theme-transition,
html.theme-transition body,
html.theme-transition * {
  transition:
    background-color 260ms ease,
    color 260ms ease,
    border-color 260ms ease,
    fill 260ms ease,
    stroke 260ms ease,
    box-shadow 260ms ease,
    border-radius 260ms ease,
    letter-spacing 260ms ease !important;
}
```

## Common breakage

- **Popover crops on mobile** — the bundled component already passes `collisionPadding={8}` + `avoidCollisions`. If you re-template, keep these props.
- **`<button>` ring-color mismatch after preset swap** — caused by `--ring` not present in your preset's `cssVars`. Pick a preset that ships `ring`, or add a fallback in `:root`.
- **Geist font doesn't apply when preset specifies `font-sans: "Geist"`** — happens when next/font isn't loaded. Make sure `app/layout.tsx` includes `GeistSans.variable` on `<html>`.
- **Hydration mismatch warning on `<html>`** — add `suppressHydrationWarning` to `<html>` (next-themes requirement).
- **No transition on first paint after reload** — expected; `bootPreset()` runs in `useEffect` post-hydration.
