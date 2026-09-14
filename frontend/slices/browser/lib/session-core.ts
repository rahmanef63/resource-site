import { browserApi, subscribeBrowserConfig, type RemoteState } from "./host-core";
import { startScreencast } from "./screencast-core";

export const VIEW_W = 1280;
export const VIEW_H = 800;
export type BrowserTab = { id: number; url: string; title: string };

export type BrowserSnapshot = {
  shot: string | null;
  state: RemoteState;
  busy: boolean;
  live: boolean;
  tabs: BrowserTab[];
  activeId: number;
};

export type BrowserSession = ReturnType<typeof createBrowserSession>;

export function createBrowserSession() {
  let snap: BrowserSnapshot = {
    shot: null,
    state: { url: "", title: "" },
    busy: false,
    live: false,
    tabs: [{ id: 1, url: "", title: "New Tab" }],
    activeId: 1,
  };
  let nextId = 1;
  let objectUrl: string | null = null;
  let poll: ReturnType<typeof setInterval> | null = null;
  let stopStream: (() => void) | null = null;
  let stopConfig: (() => void) | null = null;
  let activityAt = 0;
  let lastPollAt = 0;
  const subs = new Set<() => void>();

  const emit = (patch: Partial<BrowserSnapshot>) => {
    snap = { ...snap, ...patch };
    subs.forEach((fn) => fn());
  };
  const consumer = () => `ui-${snap.activeId}`;
  const setFrame = (blob: Blob) => {
    const next = URL.createObjectURL(blob);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = next;
    emit({ shot: next });
  };
  const mergeState = (state: RemoteState) => {
    emit({
      state,
      tabs: snap.tabs.map((tab) => (tab.id === snap.activeId ? { ...tab, url: state.url, title: state.title || tab.title } : tab)),
    });
  };
  const refresh = async () => {
    try {
      const blob = await browserApi.screenshot(consumer());
      if (blob) setFrame(blob);
    } catch {
      // keep last frame
    }
  };
  const syncActive = async () => {
    const id = snap.activeId;
    const current = `ui-${id}`;
    try {
      const state = await browserApi.state(current);
      if (snap.activeId === id) mergeState(state);
    } catch {
      // blank state is valid
    }
    stopStream?.();
    stopStream = startScreencast({
      consumer: current,
      isCurrent: () => consumer() === current,
      setLive: (live) => emit({ live }),
      setFrame,
    });
    if (!snap.live) void refresh();
  };
  const act = async (path: string, body?: unknown) => {
    emit({ busy: true });
    activityAt = Date.now();
    try {
      const data = await browserApi.act(path, body, consumer());
      if (typeof data.url === "string") mergeState({ url: data.url, title: data.title ?? data.url });
      if (!snap.live) await refresh();
    } finally {
      emit({ busy: false });
    }
  };
  const resetFrame = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    emit({ shot: null });
  };
  const changeActive = (activeId: number) => {
    resetFrame();
    emit({ activeId, state: { url: "", title: "" }, live: false });
    void syncActive();
  };

  return {
    getSnapshot: () => snap,
    getServerSnapshot: () => snap,
    subscribe: (fn: () => void) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    start: () => {
      void syncActive();
      stopConfig ??= subscribeBrowserConfig(() => void syncActive());
      poll ??= setInterval(() => {
        if (snap.live || (typeof document !== "undefined" && document.hidden)) return;
        const now = Date.now();
        const minGap = now - activityAt > 8000 ? 1000 : 320;
        if (now - lastPollAt < minGap) return;
        lastPollAt = now;
        void refresh();
      }, 320);
      return () => {
        if (poll) clearInterval(poll);
        poll = null;
        stopStream?.();
        stopStream = null;
        stopConfig?.();
        stopConfig = null;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      };
    },
    navigate: (url: string) => act("navigate", { url }),
    click: (x: number, y: number) => act("click", { x, y }),
    type: (text: string) => act("type", { text }),
    key: (key: string) => act("key", { key }),
    scroll: (dy: number) => act("scroll", { dy }),
    back: () => act("back"),
    forward: () => act("forward"),
    reload: () => act("reload"),
    refresh,
    saveShot: () => browserApi.saveShot(consumer()),
    agentLog: () => browserApi.agentLog(),
    newTab: () => {
      nextId += 1;
      emit({ tabs: [...snap.tabs, { id: nextId, url: "", title: "New Tab" }] });
      changeActive(nextId);
    },
    switchTab: (id: number) => {
      if (snap.tabs.some((tab) => tab.id === id) && id !== snap.activeId) changeActive(id);
    },
    closeTab: (id: number) => {
      void browserApi.close(`ui-${id}`);
      const rest = snap.tabs.filter((tab) => tab.id !== id);
      if (rest.length === 0) {
        nextId += 1;
        emit({ tabs: [{ id: nextId, url: "", title: "New Tab" }] });
        changeActive(nextId);
        return;
      }
      emit({ tabs: rest });
      if (snap.activeId === id) changeActive(rest[rest.length - 1].id);
    },
  };
}
