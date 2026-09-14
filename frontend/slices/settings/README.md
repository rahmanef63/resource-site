# Settings

Two adapter-driven settings shells behind one slug. The slice owns no persistence; consumers inject adapters. React/Next is the default renderer and Svelte 5/SvelteKit is available explicitly.

```bash
# React/Next default
npx rr add settings
npx rr add settings account
npx rr add settings appearance

# Native Svelte 5/SvelteKit
npx rr add settings --framework sveltekit
npx rr add settings account --framework sveltekit
npx rr add settings appearance --framework sveltekit
```

## Account

`SettingsAdapter` is `{ load(): Promise<SettingsValues>; save(patch): Promise<void> }`. The account shell loads once per adapter, keeps local state, applies optimistic section merges, and rolls back on save failure. It includes profile, preferences, notifications, and danger-zone surfaces plus controlled/internal section navigation.

```tsx
import { SettingsShell, createMemoryAdapter } from "@/features/settings";

<SettingsShell adapter={createMemoryAdapter()} />
```

`settingsPageTools` is framework-neutral. React hosts may register it with their agent runtime; Svelte exposes the same collection and accepts an optional `registerTools` callback on `SettingsShell`.

## Appearance

`AppearanceAdapter` is synchronous and per-setting. Only groups supplied by the consumer render: style, theme, accent, wallpaper, desktop/mobile shell, device, and reduce-transparency.

```tsx
import { AppearancePanel } from "@/features/settings";

<AppearancePanel appearance={myAppearanceAdapter} />
```

Both frameworks also expose the generic section/row/segmented/accent primitives for custom panels.
