"use client";

// Single integration seam between this slice and the host app. In the rr
// catalog build the slice is SELF-CONTAINED: a canvas "demo renderer" fakes
// the remote viewport so the whole chrome (omnibar, bookmarks, history)
// works offline, and the shell inspector bus is a no-op. Wire a REAL
// headless browser (e.g. a Playwright service) with configureBrowser.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorProp = { label: string; value: string };
export type InspectorAction = { id: string; label: string; run: () => void };
export type InspectorInfo = {
  subject?: string;
  props?: InspectorProp[];
  actions?: InspectorAction[];
  context?: string;
  suggestions?: string[];
};

export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible; minimal fields the barrel uses) ───
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── Remote browser adapter ──────────────────────────────────────────────────
export type RemoteState = { url: string; title: string };
/** Action paths the UI sends: navigate/click/type/key/scroll/back/forward/reload. */
export type BrowserAdapter = {
  state: () => Promise<RemoteState>;
  screenshot: () => Promise<Blob | null>;
  act: (path: string, body?: unknown) => Promise<Partial<RemoteState>>;
};

let adapter: BrowserAdapter = createDemoBrowser();

/** Host wiring: drive a real headless browser (Playwright service, CDP…). */
export function configureBrowser(a: BrowserAdapter): void {
  adapter = a;
}

// Stable identity — hooks keep this in effect deps.
const api: BrowserAdapter = {
  state: () => adapter.state(),
  screenshot: () => adapter.screenshot(),
  act: (p, b) => adapter.act(p, b),
};

export function useBrowserApi(): BrowserAdapter {
  return api;
}

// ── Offline demo renderer (canvas-drawn fake viewport) ─────────────────────
function createDemoBrowser(): BrowserAdapter {
  const st: RemoteState = { url: "", title: "" };
  const hist: string[] = [];

  const draw = async (): Promise<Blob | null> => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1280;
    c.height = 800;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#f5f6f8";
    g.fillRect(0, 0, 1280, 800);
    g.fillStyle = "#111318";
    g.font = "600 34px system-ui, sans-serif";
    const host = st.url ? (st.url.replace(/^https?:\/\//, "").split("/")[0] ?? "") : "Demo renderer";
    g.fillText(host, 64, 110);
    g.fillStyle = "#6b7280";
    g.font = "20px system-ui, sans-serif";
    g.fillText(st.url || "Type a URL — this offline demo draws a placeholder page.", 64, 150);
    g.fillText("Wire a real headless browser with configureBrowser({ state, screenshot, act }).", 64, 182);
    g.fillStyle = "#e2e5ea";
    for (let i = 0; i < 9; i++) {
      const y = 240 + i * 56;
      g.fillRect(64, y, i % 3 === 0 ? 720 : 1080, 22);
    }
    return await new Promise((resolve) => c.toBlob(resolve, "image/png"));
  };

  return {
    state: async () => ({ ...st }),
    screenshot: draw,
    act: async (path, body) => {
      const b = (body ?? {}) as { url?: string };
      if (path === "navigate" && typeof b.url === "string") {
        if (st.url) hist.push(st.url);
        st.url = b.url;
        st.title = b.url.replace(/^https?:\/\//, "").split("/")[0] ?? b.url;
      } else if (path === "back" && hist.length) {
        st.url = hist.pop() ?? st.url;
        st.title = st.url.replace(/^https?:\/\//, "").split("/")[0] ?? st.url;
      }
      // click/type/key/scroll/forward/reload: no-op in the demo renderer.
      return { ...st };
    },
  };
}
