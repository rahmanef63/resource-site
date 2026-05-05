# theme-preset-switcher

Runtime OKLch theme swap. localStorage persist. No Convex.

## Install
1. Append `styles/presets.css` content into `app/globals.css`.
2. Mount `<ThemePresetSwitcher />` anywhere.

## Use
```tsx
<ThemePresetSwitcher />
const [preset, setPreset] = useThemePreset();
```

## Add a preset
Append a CSS block to `presets.css` (`[data-theme="<id>"] { --background: ... }`) + register in `presets.ts` array.
