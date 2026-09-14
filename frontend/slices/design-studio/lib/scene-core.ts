import { ASPECTS, type ToolId } from "./model-core";
import { suggestPlatform, type SafePlatform } from "./masks";
export type PanelTab = "layers" | "adjust";
type Listener = () => void;
type Setter<T> = T | ((value: T) => T);
const resolve = <T,>(current: T, next: Setter<T>): T => typeof next === "function" ? (next as (value: T) => T)(current) : next;
export type SceneSnapshot = {
  tool: ToolId; zoom: number; aspect: string; safe: boolean; platform: SafePlatform;
  emojiOpen: boolean; panelOpen: boolean; tab: PanelTab; status: string | null;
};

export function createSceneStore() {
  let state: SceneSnapshot = {
    tool: "move", zoom: 100, aspect: ASPECTS[0].value, safe: false, platform: "IG Feed",
    emojiOpen: false, panelOpen: true, tab: "layers", status: null,
  };
  let timer: ReturnType<typeof setTimeout> | null = null;
  let snapshot = state;
  const listeners = new Set<Listener>();
  const patch = (next: Partial<SceneSnapshot>) => {
    state = { ...state, ...next }; snapshot = state; listeners.forEach((listener) => listener());
  };
  const setAspect = (aspect: string) => patch({ aspect, platform: suggestPlatform(aspect) });
  const notify = (status: string | null) => {
    if (timer) clearTimeout(timer); patch({ status });
    if (status) timer = setTimeout(() => patch({ status: null }), 2600);
  };
  return {
    subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    setTool: (tool: Setter<ToolId>) => patch({ tool: resolve(state.tool, tool) }), setZoom: (zoom: Setter<number>) => patch({ zoom: resolve(state.zoom, zoom) }), setAspect,
    setSafe: (safe: Setter<boolean>) => patch({ safe: resolve(state.safe, safe) }), setPlatform: (platform: Setter<SafePlatform>) => patch({ platform: resolve(state.platform, platform) }),
    setEmojiOpen: (emojiOpen: Setter<boolean>) => patch({ emojiOpen: resolve(state.emojiOpen, emojiOpen) }), setPanelOpen: (panelOpen: Setter<boolean>) => patch({ panelOpen: resolve(state.panelOpen, panelOpen) }),
    setTab: (tab: Setter<PanelTab>) => patch({ tab: resolve(state.tab, tab) }), notify,
    destroy() { if (timer) clearTimeout(timer); listeners.clear(); },
  };
}
export type SceneStore = ReturnType<typeof createSceneStore>;
