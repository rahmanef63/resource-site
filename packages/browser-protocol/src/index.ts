// browser-protocol — the shared shapes the os-vps browser runtime, the browser
// extension, and any agent client all agree on. Single source of truth so the
// extension's DOM scan and the runtime's /elements response stay interchangeable.
// Pure types + tiny helpers, no runtime deps.

/** Pixel box in the page's coordinate space (matches DOMRect, rounded). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One interactive element with a stable selector candidate to act on it. */
export interface ScannedElement {
  tag: string;
  type?: string;
  role?: string;
  /** Visible label: innerText / value / placeholder / aria-label, trimmed. */
  text: string;
  href?: string;
  /** CSS selector candidate, preferring #id → [data-testid] → [name] → path. */
  selector: string;
  box: Box;
}

/** Current page identity, echoed by most runtime responses. */
export interface PageState {
  url: string;
  title: string;
}

/** GET /elements — page state + the interactive-element scan. */
export interface ElementsResponse extends PageState {
  elements: ScannedElement[];
}

/** GET /content — page state + extracted visible text (capped). */
export interface ContentResponse extends PageState {
  text: string;
}

/** GET /info — runtime status surfaced by the Settings panel. */
export interface RuntimeInfo {
  ok: boolean;
  url: string;
  profile: string;
  viewport: { width: number; height: number };
  headless: boolean;
  extension: string | null;
  idleMs: number;
}

/** The action verbs the runtime accepts (mirrors os-vps /api/v1/browser/*). */
export type BrowserAction =
  | { kind: "navigate"; url: string }
  | { kind: "click"; x: number; y: number }
  | { kind: "clickSelector"; selector: string }
  | { kind: "fill"; selector: string; value: string }
  | { kind: "type"; text: string }
  | { kind: "key"; key: string }
  | { kind: "scroll"; dy: number }
  | { kind: "back" }
  | { kind: "forward" }
  | { kind: "reload" };

/** Map an action to its runtime path + JSON body (drop coords/text for reads). */
export function actionToRequest(a: BrowserAction): { path: string; body?: Record<string, unknown> } {
  switch (a.kind) {
    case "navigate":
      return { path: "/navigate", body: { url: a.url } };
    case "click":
      return { path: "/click", body: { x: a.x, y: a.y } };
    case "clickSelector":
      return { path: "/click-selector", body: { selector: a.selector } };
    case "fill":
      return { path: "/fill", body: { selector: a.selector, value: a.value } };
    case "type":
      return { path: "/type", body: { text: a.text } };
    case "key":
      return { path: "/key", body: { key: a.key } };
    case "scroll":
      return { path: "/scroll", body: { dy: a.dy } };
    default:
      return { path: `/${a.kind}` };
  }
}

/** Bridge message envelope: extension content-script ↔ page/agent. */
export interface BridgeMessage<T = unknown> {
  /** Namespaced to avoid clashing with the host page's own postMessage traffic. */
  source: "rahman-browser-extension";
  /** "scan" request, "scan:result" response, "act" request, "ack" response. */
  type: "scan" | "scan:result" | "act" | "ack";
  id: string;
  payload?: T;
}

export const PROTOCOL_VERSION = "0.1.0";
