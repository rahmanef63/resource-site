// background — MV3 service worker. Minimal: relays scan/act requests from an
// external caller (e.g. a popup or a devtools panel) to the active tab's
// content-script. The runtime drives the page directly; this exists so the same
// extension is usable interactively, not just headless.
import type { BridgeMessage } from "../../browser-protocol/src/index";

type Chrome = {
  runtime: { onMessage: { addListener: (f: (m: unknown, s: unknown, send: (r: unknown) => void) => boolean) => void } };
  tabs: {
    query: (q: { active: boolean; currentWindow: boolean }) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, msg: unknown) => Promise<unknown>;
  };
};
const chrome = (globalThis as { chrome?: Chrome }).chrome;

chrome?.runtime.onMessage.addListener((msg, _sender, send) => {
  const m = msg as BridgeMessage;
  if (m?.source !== "rahman-browser-extension") return false;
  void (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return send({ ok: false, error: "no_active_tab" });
    send(await chrome.tabs.sendMessage(tab.id, m));
  })();
  return true; // async response
});
