// page-bridge — a tiny client for code running IN the page (or an injected agent
// script) to talk to the content-script over window.postMessage. Promise-based
// request/response keyed by id. No extension APIs here — pure DOM.
import type { BridgeMessage, ElementsResponse } from "../../browser-protocol/src/index";

const SOURCE = "rahman-browser-extension";
let seq = 0;

function request<T>(type: BridgeMessage["type"], payload?: unknown, timeoutMs = 5000): Promise<T> {
  const id = `${Date.now()}-${seq++}`;
  return new Promise<T>((resolve, reject) => {
    const onMsg = (ev: MessageEvent<BridgeMessage<T>>) => {
      const m = ev.data;
      if (!m || m.source !== SOURCE || m.id !== id) return;
      window.removeEventListener("message", onMsg);
      clearTimeout(timer);
      resolve(m.payload as T);
    };
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMsg);
      reject(new Error("bridge_timeout"));
    }, timeoutMs);
    window.addEventListener("message", onMsg);
    const msg: BridgeMessage = { source: SOURCE, type, id, payload };
    window.postMessage(msg, "*");
  });
}

/** Scan the current page → the shared ElementsResponse shape (+ forms). */
export function scan(): Promise<ElementsResponse & { forms: unknown[] }> {
  return request("scan");
}

/** Click an element by selector. */
export function clickSelector(selector: string): Promise<{ ok: boolean; error?: string }> {
  return request("act", { kind: "clickSelector", selector });
}

/** Fill an input/textarea by selector. */
export function fill(selector: string, value: string): Promise<{ ok: boolean; error?: string }> {
  return request("act", { kind: "fill", selector, value });
}
