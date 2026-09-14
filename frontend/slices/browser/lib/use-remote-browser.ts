"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createBrowserSession, VIEW_H, VIEW_W, type BrowserTab } from "./session-core";
import type { RemoteState } from "./host-core";

export { VIEW_H, VIEW_W } from "./session-core";
export type Tab = BrowserTab;
export type { RemoteState } from "./host-core";

export function useRemoteBrowser() {
  const ref = useRef<ReturnType<typeof createBrowserSession> | null>(null);
  if (!ref.current) ref.current = createBrowserSession();
  const session = ref.current;
  const snap = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getServerSnapshot);

  useEffect(() => session.start(), [session]);

  return {
    ...snap,
    navigate: session.navigate,
    click: session.click,
    type: session.type,
    key: session.key,
    scroll: session.scroll,
    back: session.back,
    forward: session.forward,
    reload: session.reload,
    refresh: session.refresh,
    saveShot: session.saveShot,
    newTab: session.newTab,
    switchTab: session.switchTab,
    closeTab: session.closeTab,
    agentLog: session.agentLog,
  } satisfies {
    shot: string | null;
    state: RemoteState;
    busy: boolean;
    live: boolean;
    tabs: BrowserTab[];
    activeId: number;
    navigate: (url: string) => Promise<void>;
    click: (x: number, y: number) => Promise<void>;
    type: (text: string) => Promise<void>;
    key: (key: string) => Promise<void>;
    scroll: (dy: number) => Promise<void>;
    back: () => Promise<void>;
    forward: () => Promise<void>;
    reload: () => Promise<void>;
    refresh: () => Promise<void>;
    saveShot: () => Promise<{ path?: string; error?: string }>;
    newTab: () => void;
    switchTab: (id: number) => void;
    closeTab: (id: number) => void;
    agentLog: () => Promise<unknown[]>;
  };
}
