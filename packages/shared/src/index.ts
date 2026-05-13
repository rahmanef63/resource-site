// rahman-shared — entry point.
//
// Distribution model (per kitab CLAUDE.md):
//   - NPM install (this package): pure utils, hooks, tiny libs.
//   - CLI copy (rahman-resources add <slug>): components that consumer
//     customizes (ResponsiveDialog, DateField, SharedDatePicker, FileUpload).
//
// Why split? UI components need consumer-side Tailwind config, theme tokens,
// and custom logic tweaks. Pure functions don't.
//
// Usage:
//   import { cn } from "rahman-shared/lib/utils"
//   import { formatDate } from "rahman-shared/lib/formatDate"
//   import { useDebounce } from "rahman-shared/hooks/useDebounce"

export { cn, uid, clamp } from "./lib/utils"
export { formatDate, formatRelative } from "./lib/formatDate"
export { sanitizeHtml, sanitizeHtmlDefaults } from "./lib/sanitizeHtml"
export { useDebounce } from "./hooks/useDebounce"
export { useClickOutside } from "./hooks/useClickOutside"
export { useResponsive, useMediaQuery } from "./hooks/useResponsive"

export const SHARED_PACKAGE_VERSION = "0.2.0"
