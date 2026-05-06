# Recipe: theme-preset-switcher

Runtime theme preset swap (colors + fonts + shadows + tracking). Source: rahmanef.com.

Already at:
- `template-base/frontend/shared/theme/{theme-presets,preset-fonts,preset-groups}.ts`
- `template-base/frontend/shared/ui/components/theme-preset-switcher.tsx`

## Pattern

OKLch CSS vars per preset. Swap by toggling `data-theme="<preset>"` on `<html>`.

```ts
import { setThemePreset } from "@/frontend/shared/theme/theme-presets";
setThemePreset("brutalist"); // localStorage + Convex sync if signed in
```

## Adding a preset

See `docs/theme-system.md` — add CSS block in `globals.css`, register in `preset-groups.ts`.
