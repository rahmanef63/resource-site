# ai-core

Shared UI + helper substrate for the **ai-*** slice cluster. React/Next remains
the default adapter; Svelte 5/SvelteKit is additive. Both adapters reuse the
same framework-neutral formatter, provider-safe error presentation, and theme
semantics.

## Install

```bash
npx rr add ai-core
npx rr add ai-core --framework sveltekit
```

## Canonical behavior

| Surface | React default | Svelte adapter | Shared core |
|---|---|---|---|
| Responsive/confirm dialog | `ResponsiveDialog`, `ConfirmDialog`, `useConfirm` | `ResponsiveDialog.svelte`, `ConfirmDialog.svelte`, `createConfirmStore()` | native `<dialog>` semantics |
| Section error boundary | `SectionErrorBoundary` | `SectionErrorBoundary.svelte` | same fallback copy + section reset intent |
| Error line | `ErrorLine` | `ErrorLine.svelte` | `error-core.ts` (`errData`, `presentError`, `FRIENDLY`) |
| Theme | `useTheme` | `createThemeStore()` | `theme.ts` (dark default, parse/toggle/read/apply) |
| Formatting | `fmt`, `ago`, `dt` | same exports | `format.ts` |

Styling is class-based (`.btn`, `.card`, `.rd`, `.err`) against the consumer's
design tokens. The Svelte distribution does not introduce shadcn. No env or
Convex dependency is required by this slice.

Public preview: https://resource.rahmanef.com/preview/slices/ai-core
