/**
 * Theme System - Public API
 * 
 * Dynamic theming system with:
 * - Multiple theme presets from registry
 * - Light/dark mode support via next-themes
 * - Cookie-based persistence
 * - Runtime CSS variable injection
 * 
 * @module shared/theme
 */

// =============================================================================
// Providers
// =============================================================================

export { ThemeProvider } from "./components/providers/theme-provider";

export {
  ActiveThemeProvider,
  DEFAULT_ACTIVE_THEME,
  useThemeConfig
} from "./components/layout/active-theme";

// =============================================================================
// Components
// =============================================================================

export { ThemeSelector } from "./components/layout/theme-selector";
export { ThemeToggle, type ThemeToggleProps } from "./components/ThemeToggle";

// =============================================================================
// Config
// =============================================================================

export {
  COMMON_STYLES,
  DEFAULT_FONT_SANS,
  DEFAULT_FONT_SERIF,
  DEFAULT_FONT_MONO,
  defaultLightThemeStyles,
  defaultDarkThemeStyles,
  defaultThemeState,
} from "./config/theme";

// =============================================================================
// Store
// =============================================================================

export { useThemePresetStore } from "./store/theme-preset-store";

// =============================================================================
// Hooks
// =============================================================================

export { useUpdateTheme } from "./hooks/themes";
export { useAuthenticatedThemeBootstrap } from "./hooks/useAuthenticatedThemeBootstrap";
export { useWorkspaceTheme } from "./hooks/useWorkspaceTheme";

// =============================================================================
// Utils
// =============================================================================

export {
  sansSerifFonts,
  serifFonts,
  monoFonts,
  getAppliedThemeFont,
} from "./utils/theme-fonts";
