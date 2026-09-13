// Core slice public barrel. React/Next remains the default adapter; portable
// theme/error/format semantics are exported so alternate framework adapters can
// reuse the exact same behavior.
export { ResponsiveDialog, ConfirmDialog, useConfirm } from "./components/responsive-dialog";
export { SectionErrorBoundary } from "./components/error-boundary";
export { useTheme, type Theme } from "./hooks/use-theme";
export { fmt, ago, dt } from "./lib/format";
export { errData, presentError, ErrorLine, FRIENDLY, type ChatErrData } from "./lib/errors";
export { DEFAULT_THEME, THEME_STORAGE_KEY, parseTheme, nextTheme, readTheme, applyTheme } from "./lib/theme";
