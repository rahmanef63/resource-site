# Settings

Two adapter-driven settings shells behind one slug — the slice owns no data;
you inject an adapter. Install one surface or both:

```bash
npx rr add settings account      # profile/preferences/notifications shell
npx rr add settings appearance    # style/mode/accent/display shell + primitives
npx rr add settings               # both
```

## account (async adapter)

```tsx
import { SettingsShell, createMemoryAdapter } from "@/features/settings";

<SettingsShell adapter={createMemoryAdapter()} />   // swap for your load+save adapter
```

`SettingsAdapter` = `{ load(): Promise<SettingsValues>; save(patch): Promise<void> }`.
Collapses to a Select on mobile.

## appearance (sync adapter)

```tsx
import { AppearancePanel, SettingsSection, SettingsRow, Segmented } from "@/features/settings";

<AppearancePanel adapter={myAppearanceAdapter} />   // sync per-setting adapter
```

`AppearanceAdapter` exposes per-setting `SegSetting` values the panel reads/writes
synchronously. Compose your own panels from `SettingsSection` / `SettingsRow` /
`Segmented` / `AccentSwatches`.
