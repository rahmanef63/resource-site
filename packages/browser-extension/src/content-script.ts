// content-script — injected into every page. Bridges scan/act requests from the
// page (or the extension background) to the live DOM, answering with the shared
// BridgeMessage protocol. Acting by selector here is deterministic and avoids the
// runtime's pixel-coordinate guessing.
import type { BridgeMessage } from "../../browser-protocol/src/index";
import { scanElements, scanForms } from "./scanner";

const SOURCE = "rahman-browser-extension";

function reply(type: BridgeMessage["type"], id: string, payload: unknown): void {
  const msg: BridgeMessage = { source: SOURCE, type, id, payload };
  window.postMessage(msg, "*");
}

function actOnSelector(act: { kind: string; selector?: string; value?: string }): { ok: boolean; error?: string } {
  const el = act.selector ? document.querySelector<HTMLElement>(act.selector) : null;
  if (!el) return { ok: false, error: "selector_not_found" };
  try {
    if (act.kind === "clickSelector") el.click();
    else if (act.kind === "fill" && "value" in el) {
      (el as HTMLInputElement).value = String(act.value ?? "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else return { ok: false, error: "unsupported_action" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Listen for in-page requests (same protocol the agent/page can post).
window.addEventListener("message", (ev: MessageEvent<BridgeMessage>) => {
  const m = ev.data;
  if (!m || m.source !== SOURCE) return;
  if (m.type === "scan")
    reply("scan:result", m.id, {
      url: location.href,
      title: document.title,
      elements: scanElements(),
      forms: scanForms(),
    });
  else if (m.type === "act")
    reply("ack", m.id, actOnSelector(m.payload as { kind: string; selector?: string; value?: string }));
});

// Also answer the extension background (so a popup/devtools can drive scans).
const runtime = (globalThis as { chrome?: { runtime?: { onMessage?: { addListener: (f: (msg: unknown, s: unknown, send: (r: unknown) => void) => boolean) => void } } } }).chrome;
runtime?.runtime?.onMessage?.addListener((msg, _s, send) => {
  const m = msg as BridgeMessage;
  if (m?.type === "scan") {
    send({ url: location.href, title: document.title, elements: scanElements(), forms: scanForms() });
    return true;
  }
  if (m?.type === "act") {
    send(actOnSelector(m.payload as { kind: string; selector?: string; value?: string }));
    return true;
  }
  return false;
});
