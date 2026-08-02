"use client";

// Offline demo adapter: one fake page PER TAB drawn on a canvas, an in-memory
// action log (seeded with a canned agent session, then recording what YOU do)
// and a fake save-shot path — so tabs, the AI activity panel and the save-shot
// button all work with zero backend.
// audit-allow-hex: canvas 2D fills cannot read CSS theme tokens at draw time.

import type { AgentLogEntry, BrowserAdapter, RemoteState } from "./host";

type TabState = { st: RemoteState; hist: string[] };

const LOG_CAP = 60;

function seedLog(): AgentLogEntry[] {
  const t = Date.now();
  const iso = (ago: number) => new Date(t - ago).toISOString();
  return [
    { ts: iso(42_000), action: "browser.click", actor: "agent", target: '{"x":640,"y":318}' },
    { ts: iso(48_000), action: "browser.navigate", actor: "agent", target: '{"url":"https://example.com/docs"}' },
  ];
}

function titleOf(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
}

async function draw(st: RemoteState): Promise<Blob | null> {
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
  g.fillText(st.url ? titleOf(st.url) : "Demo renderer", 64, 110);
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
}

export function createDemoBrowser(): BrowserAdapter {
  const tabs = new Map<string, TabState>();
  const log: AgentLogEntry[] = seedLog();

  const tab = (id: string): TabState => {
    let t = tabs.get(id);
    if (!t) {
      t = { st: { url: "", title: "" }, hist: [] };
      tabs.set(id, t);
    }
    return t;
  };

  const record = (path: string, body: unknown) => {
    log.unshift({
      ts: new Date().toISOString(),
      action: `browser.${path}`,
      actor: "you",
      target: body === undefined ? undefined : JSON.stringify(body),
    });
    if (log.length > LOG_CAP) log.length = LOG_CAP;
  };

  return {
    state: async (id) => ({ ...tab(id).st }),
    screenshot: (id) => draw(tab(id).st),
    act: async (path, body, id) => {
      const t = tab(id);
      const b = (body ?? {}) as { url?: string };
      record(path, body);
      if (path === "navigate" && typeof b.url === "string") {
        if (t.st.url) t.hist.push(t.st.url);
        t.st.url = b.url;
        t.st.title = titleOf(b.url);
      } else if (path === "back" && t.hist.length) {
        t.st.url = t.hist.pop() ?? t.st.url;
        t.st.title = titleOf(t.st.url);
      }
      // click/type/key/scroll/forward/reload: no-op in the demo renderer.
      return { ...t.st };
    },
    close: async (id) => {
      tabs.delete(id);
    },
    agentLog: async () => [...log],
    saveShot: async (id) => {
      record("save-shot", {});
      return { path: `~/Pictures/Screenshots/demo-${tab(id).st.title || "blank"}-${Date.now()}.png` };
    },
  };
}
