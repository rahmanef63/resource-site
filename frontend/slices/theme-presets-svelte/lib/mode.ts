export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
export type ThemeModeSnapshot = { mode: ThemeMode; resolved: ResolvedThemeMode; ready: boolean };

export type ThemeModeStore = {
  subscribe: (run: (snapshot: ThemeModeSnapshot) => void) => () => void;
  getSnapshot: () => ThemeModeSnapshot;
  init: () => () => void;
  setMode: (mode: ThemeMode) => void;
};

function isMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function createBrowserThemeModeStore(
  defaultMode: ThemeMode = "system",
  storageKey = "theme",
): ThemeModeStore {
  let snapshot: ThemeModeSnapshot = { mode: defaultMode, resolved: "light", ready: false };
  const listeners = new Set<(snapshot: ThemeModeSnapshot) => void>();
  let media: MediaQueryList | null = null;

  const emit = (next: ThemeModeSnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener(snapshot);
  };

  const resolve = (mode: ThemeMode): ResolvedThemeMode =>
    mode === "system" ? (media?.matches ? "dark" : "light") : mode;

  const apply = (mode: ThemeMode, persist: boolean) => {
    const resolved = resolve(mode);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.dataset.theme = mode;
    }
    if (persist && typeof window !== "undefined") {
      try { window.localStorage.setItem(storageKey, mode); } catch { /* ignore */ }
    }
    emit({ mode, resolved, ready: true });
  };

  return {
    subscribe(run) {
      listeners.add(run);
      run(snapshot);
      return () => listeners.delete(run);
    },
    getSnapshot: () => snapshot,
    init() {
      if (typeof window === "undefined") return () => {};
      media = window.matchMedia("(prefers-color-scheme: dark)");
      let mode = defaultMode;
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (isMode(saved)) mode = saved;
      } catch { /* ignore */ }
      apply(mode, false);
      const onChange = () => {
        if (snapshot.mode === "system") apply("system", false);
      };
      media.addEventListener?.("change", onChange);
      return () => media?.removeEventListener?.("change", onChange);
    },
    setMode(mode) {
      apply(mode, true);
    },
  };
}

export const THEME_MODE_CONTEXT_KEY = "rahman-resources:theme-mode";
