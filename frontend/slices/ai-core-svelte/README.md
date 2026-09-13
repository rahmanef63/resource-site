# AI Core Kit — Svelte 5 / SvelteKit

Native Svelte adapter for `ai-core`. It keeps the same lightweight, class-based
host seam as the React default while reusing the canonical framework-neutral
format, error-presentation, and theme semantics.

```bash
npx rr add ai-core --framework sveltekit
```

## Ships

- `ResponsiveDialog.svelte` — native `<dialog>` modal/sheet seam with Escape and backdrop close.
- `ConfirmDialog.svelte` + `createConfirmStore()` — controlled and store-driven confirm flows.
- `SectionErrorBoundary.svelte` — Svelte boundary keyed by section so navigation resets an error.
- `ErrorLine.svelte` — friendly provider copy + optional admin detail + copyable raw payload.
- `createThemeStore()` — dark-default, localStorage-backed `data-theme` adapter.
- Canonical `fmt`, `ago`, `dt`, error-core and theme-core helpers via verified `sharedFiles`.

No React, Next, Lucide, or shadcn dependency is introduced into the Svelte distribution.
Styling remains host-token/class based (`.rd`, `.btn`, `.card`, `.err`) exactly like the React default.
