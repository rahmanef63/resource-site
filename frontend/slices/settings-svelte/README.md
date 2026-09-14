# Settings — Svelte 5 / SvelteKit

Native Svelte renderer for the `settings` slice. React/Next remains the default distribution.

## Variants

- `account` — profile, preferences, notifications, danger-zone, controlled/internal section navigation, async adapter load/save, optimistic save + rollback, and optional settings tool registration.
- `appearance` — style/mode/accent/wallpaper/shell/display controls over the same synchronous `AppearanceAdapter` used by React.

```bash
npx rr add settings --framework sveltekit
npx rr add settings account --framework sveltekit
npx rr add settings appearance --framework sveltekit
```

The Svelte distribution depends only on `svelte@^5`. It does not install React, Next, Lucide React, shadcn, or an agent runtime.
