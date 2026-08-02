# ai-core

Shared UI + helper substrate for the **ai-*** slice cluster (lifted from
`models-rahmanef-com`). React-only, no Convex, no shadcn — the lightweight
no-shadcn variant of the dialog/error primitives. Every other ai slice
(`byok`, `workspaces`, `memory`, `combos`, `scheduled-agents`, …) imports it
via `@/features/ai-core`.

## Ships

| Export | Kind | What |
|---|---|---|
| `ResponsiveDialog` / `ConfirmDialog` / `useConfirm` | component + hook | The one overlay primitive — centered modal on desktop, bottom-sheet on mobile, built on native `<dialog>`. |
| `SectionErrorBoundary` | component | Degrades a crashed section to an inline card instead of white-screening the app. |
| `useTheme` | hook | Light/dark via `data-theme` + localStorage. |
| `fmt` / `ago` / `dt` | util | Compact number + relative/absolute time formatters. |
| `errData` / `ErrorLine` / `FRIENDLY` | util + component | ConvexError renderer. `ErrorLine` is provider-agnostic — pass a `labels` map (byok supplies `PROVIDER_LABEL`) for display names. |

## Install

```bash
npx rr add ai-core
```

## Use

```tsx
import { ResponsiveDialog, useConfirm, ErrorLine } from "@/features/ai-core"
```

## Notes

- Styling is class-based (`.btn`, `.card`, `.rd`, `.err`) against the consumer's
  design tokens — it does **not** ship shadcn. If your app already standardises
  on `appshell`'s shadcn dialog, prefer that; `ai-core` exists for the token-CSS
  ai dashboard the cluster was extracted from.
- No env, no Convex, no peer slices.
