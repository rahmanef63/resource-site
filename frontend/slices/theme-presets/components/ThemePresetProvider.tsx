"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createThemePresetStore } from "../lib/core";
import type { TweakcnRegistry } from "../lib/tweakcn";

export const DEFAULT_PRESET_NAME = "default";

export interface ThemePresetContextValue {
  presetName: string | null;
  registry: TweakcnRegistry | null;
  setPreset: (name: string | null) => void;
  preview: (name: string | null) => void;
  restore: () => void;
  setSiteDefault: (name: string | null) => void;
  isReady: boolean;
}

const ThemePresetContext = createContext<ThemePresetContextValue>({
  presetName: null,
  registry: null,
  setPreset: () => {},
  preview: () => {},
  restore: () => {},
  setSiteDefault: () => {},
  isReady: false,
});

/** React/Next adapter over the framework-neutral preset store. */
export function ThemePresetProvider({
  children,
  hostDefault = null,
}: {
  children: ReactNode;
  hostDefault?: string | null;
}) {
  const [store] = useState(() => createThemePresetStore({ hostDefault }));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.setHostDefault(hostDefault);
  }, [hostDefault, store]);

  useEffect(() => {
    void store.init();
  }, [store]);

  const setPreset = useCallback((name: string | null) => store.setPreset(name), [store]);
  const preview = useCallback((name: string | null) => store.preview(name), [store]);
  const restore = useCallback(() => store.restore(), [store]);
  const setSiteDefault = useCallback((name: string | null) => store.setSiteDefault(name), [store]);

  const value = useMemo<ThemePresetContextValue>(
    () => ({
      presetName: snapshot.presetName,
      registry: snapshot.registry,
      setPreset,
      preview,
      restore,
      setSiteDefault,
      isReady: snapshot.isReady,
    }),
    [snapshot.presetName, snapshot.registry, snapshot.isReady, setPreset, preview, restore, setSiteDefault],
  );

  return <ThemePresetContext.Provider value={value}>{children}</ThemePresetContext.Provider>;
}

export function useThemePreset(): ThemePresetContextValue {
  return useContext(ThemePresetContext);
}
