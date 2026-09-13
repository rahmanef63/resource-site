import {
  DEFAULT_THEME,
  applyTheme,
  nextTheme,
  readTheme,
  type Theme,
} from "../../ai-core/lib/theme";

export type ThemeStore = {
  subscribe: (run: (theme: Theme) => void) => () => void;
  hydrate: () => void;
  set: (theme: Theme) => void;
  toggle: () => void;
};

/** Svelte-readable contract without importing svelte/store into the TS core. */
export function createThemeStore(): ThemeStore {
  let current: Theme = DEFAULT_THEME;
  const listeners = new Set<(theme: Theme) => void>();

  function emit() {
    for (const listener of listeners) listener(current);
  }

  function commit(theme: Theme) {
    current = theme;
    if (typeof document !== "undefined" && typeof window !== "undefined") {
      applyTheme(theme, document.documentElement, window.localStorage);
    }
    emit();
  }

  return {
    subscribe(run) {
      run(current);
      listeners.add(run);
      return () => listeners.delete(run);
    },
    hydrate() {
      if (typeof window === "undefined") return;
      commit(readTheme(window.localStorage));
    },
    set: commit,
    toggle() {
      commit(nextTheme(current));
    },
  };
}
