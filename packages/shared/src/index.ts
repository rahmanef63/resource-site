// rahman-shared — entry point.
//
// Re-exports populated post-merge of primitive PRs (#18-#27). Each primitive
// lives in resources at:
//   shared/ui/<Name>/<Name>.tsx
//   shared/hooks/<name>.ts
//   shared/lib/<name>.ts
//
// Adoption pattern: this package re-exports from those paths once primitives
// land on main. Consumers `pnpm add rahman-shared` and import:
//   import { ResponsiveDialog } from "rahman-shared/ui/ResponsiveDialog"
//   import { useDebounce } from "rahman-shared/hooks/useDebounce"
//   import { formatDate } from "rahman-shared/lib/formatDate"

export const SHARED_PACKAGE_VERSION = "0.1.0"
