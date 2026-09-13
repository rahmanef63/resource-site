import {
  applyTweakcnPreset,
  bootTweakcnPreset,
  clearTweakcnPreset,
  getSavedTweakcnPreset,
  loadTweakcnRegistry,
  previewTweakcnPreset,
  type TweakcnRegistry,
} from "./tweakcn";

export type ThemePresetSnapshot = {
  /** Effective preset currently represented by the provider/store. */
  presetName: string | null;
  /** Visitor-owned persisted choice. Null means fall back to site/host default. */
  explicitPreset: string | null;
  siteDefault: string | null;
  hostDefault: string | null;
  registry: TweakcnRegistry | null;
  isReady: boolean;
};

export type ThemePresetStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ThemePresetSnapshot;
  init: () => Promise<void>;
  setPreset: (name: string | null) => void;
  setSiteDefault: (name: string | null) => void;
  setHostDefault: (name: string | null) => void;
  preview: (name: string | null) => void;
  restore: () => void;
};

export type ThemePresetEngine = {
  getSaved: () => string | null;
  boot: () => Promise<void>;
  loadRegistry: () => Promise<TweakcnRegistry>;
  apply: (name: string) => Promise<void>;
  preview: (name: string | null) => Promise<void>;
  clear: () => void;
};

const defaultEngine: ThemePresetEngine = {
  getSaved: getSavedTweakcnPreset,
  boot: bootTweakcnPreset,
  loadRegistry: loadTweakcnRegistry,
  apply: async (name) => applyTweakcnPreset(name),
  preview: async (name) => previewTweakcnPreset(name),
  clear: clearTweakcnPreset,
};

export function createThemePresetStore({
  hostDefault = null,
  engine = defaultEngine,
}: {
  hostDefault?: string | null;
  engine?: ThemePresetEngine;
} = {}): ThemePresetStore {
  let snapshot: ThemePresetSnapshot = {
    presetName: null,
    explicitPreset: null,
    siteDefault: null,
    hostDefault,
    registry: null,
    isReady: false,
  };
  const listeners = new Set<() => void>();
  let initPromise: Promise<void> | null = null;

  const emit = (patch: Partial<ThemePresetSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    for (const listener of listeners) listener();
  };

  const fallback = () => snapshot.siteDefault ?? snapshot.hostDefault;

  const applyFallback = () => {
    if (!snapshot.isReady || snapshot.explicitPreset) return;
    const target = fallback();
    emit({ presetName: target });
    void engine.preview(target).catch(() => {});
  };

  const init = () => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const saved = engine.getSaved();
      emit({ explicitPreset: saved, presetName: saved });

      const registryPromise = engine
        .loadRegistry()
        .then((registry) => emit({ registry }))
        .catch(() => {});

      try {
        await engine.boot();
      } catch {
        // Theme boot failure is non-fatal; defaults can still render.
      }
      emit({ isReady: true });
      if (!saved) applyFallback();
      await registryPromise;
    })();
    return initPromise;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    init,
    setPreset(name) {
      if (!name) {
        engine.clear();
        emit({ explicitPreset: null, presetName: fallback() });
        applyFallback();
        return;
      }
      emit({ explicitPreset: name, presetName: name });
      void engine.apply(name).catch(() => {});
    },
    setSiteDefault(name) {
      emit({ siteDefault: name });
      applyFallback();
    },
    setHostDefault(name) {
      emit({ hostDefault: name });
      applyFallback();
    },
    preview(name) {
      void engine.preview(name).catch(() => {});
    },
    restore() {
      const target = snapshot.explicitPreset ?? fallback();
      void engine.preview(target).catch(() => {});
    },
  };
}
