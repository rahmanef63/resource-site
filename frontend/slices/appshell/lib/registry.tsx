"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppDescriptor } from "./types";

// Apps are injected by the app layer, not imported by os-shell (open/closed).
const RegistryContext = createContext<Map<string, AppDescriptor>>(new Map());

export function AppRegistryProvider({
  apps,
  children,
}: {
  apps: AppDescriptor[];
  children: ReactNode;
}) {
  // Stable identity unless the app list changes — otherwise the context value
  // churns every render and re-renders every useApps()/useApp() consumer (Dock,
  // AppSwitcher, Launcher).
  const map = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);
  return (
    <RegistryContext.Provider value={map}>{children}</RegistryContext.Provider>
  );
}

export function useApps(): AppDescriptor[] {
  // Stable array identity while the Map is stable (it only changes when the app
  // list changes) — so useWidgetRegistry/useFeaturedWidgets + Dock/Launcher memos
  // actually hold across unrelated re-renders instead of churning every time.
  const map = useContext(RegistryContext);
  return useMemo(() => Array.from(map.values()), [map]);
}

export function useApp(id: string): AppDescriptor | undefined {
  return useContext(RegistryContext).get(id);
}
