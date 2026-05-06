# Theme System

OKLch color triplets + swappable presets at runtime. Lifted from rahmanef.com.

## Files

- `app/globals.css` — root CSS with OKLch vars + 8+ shadow scales + tracking system
- `frontend/shared/theme/theme-presets.ts` — preset loader (localStorage + Convex sync)
- `frontend/shared/theme/preset-fonts.ts` — font preset map (sans/serif/mono swaps)
- `frontend/shared/theme/preset-groups.ts` — preset categorization (brutalist, organic, mono, etc)
- `frontend/shared/ui/components/theme-toggle.tsx` — light/dark switcher
- `frontend/shared/ui/components/theme-preset-switcher.tsx` — preset picker UI

## OKLch triplets

Color vars stored as raw oklch components: `"L C H"` (e.g. `0.97 0.005 250`). Wrap with `oklch()` at use site:

```css
:root {
  --background: 0.99 0.005 250;
  --foreground: 0.18 0.01 250;
}
.body {
  background: oklch(var(--background));
  color: oklch(var(--foreground));
}
```

Benefits: perceptually uniform, swap entire palette by changing the triplets, presets compose cleanly.

## Switching presets

Mount `<ThemePresetSwitcher />` anywhere. On select:
1. Updates `localStorage["theme-preset"]`
2. Toggles `data-theme="<preset>"` on `<html>`
3. Saves to Convex workspace settings if signed in
4. Triggers font swap via `preset-fonts.ts` map

## Adding a new preset

1. Add CSS block in `globals.css`:
```css
[data-theme="my-preset"] {
  --background: 0.95 0.02 30;
  --foreground: 0.20 0.05 30;
  /* ... rest of vars */
}
```
2. Add entry in `preset-groups.ts` for grouping in switcher UI
3. Optional: add font override in `preset-fonts.ts`

## Component rule

All UI consumes vars via Tailwind tokens (`bg-background`, `text-foreground`, etc) configured in `tailwind.config.*`. Never hardcode hex colors in components.
