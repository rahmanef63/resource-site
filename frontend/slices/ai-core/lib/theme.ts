// Framework-neutral theme semantics. Adapters provide browser storage/root bindings.

export type Theme = "dark" | "light";
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "models-theme";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function readTheme(storage: Pick<Storage, "getItem">): Theme {
  return parseTheme(storage.getItem(THEME_STORAGE_KEY)) ?? DEFAULT_THEME;
}

export function applyTheme(
  theme: Theme,
  root: Pick<HTMLElement, "setAttribute">,
  storage?: Pick<Storage, "setItem">,
): void {
  root.setAttribute("data-theme", theme);
  storage?.setItem(THEME_STORAGE_KEY, theme);
}
