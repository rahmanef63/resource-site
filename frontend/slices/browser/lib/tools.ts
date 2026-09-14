import type { BrowserTab } from "./session-core";
import type { RemoteState } from "./host-core";

export type BrowserToolCtx = {
  state: RemoteState;
  tabs: BrowserTab[];
  activeId: number;
  busy: boolean;
  navigate: (url: string) => Promise<void> | void;
  newTab: () => void;
  closeTab: (id: number) => void;
  back: () => Promise<void> | void;
  forward: () => Promise<void> | void;
  reload: () => Promise<void> | void;
  scroll: (dy: number) => Promise<void> | void;
  click: (x: number, y: number) => Promise<void> | void;
  type: (text: string) => Promise<void> | void;
  key: (key: string) => Promise<void> | void;
};

export type BrowserCtx = BrowserToolCtx;

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const noArgs: ToolParams = { type: "object", properties: {}, required: [], additionalProperties: false };
const textArgs = (name: string, description: string): ToolParams => ({
  type: "object",
  properties: { [name]: { type: "string", description } },
  required: [name],
  additionalProperties: false,
});
const numArgs = (defs: Record<string, string>): ToolParams => ({
  type: "object",
  properties: Object.fromEntries(Object.entries(defs).map(([name, description]) => [name, { type: "number", description }])),
  required: Object.keys(defs),
  additionalProperties: false,
});

const summary = (ctx: BrowserToolCtx): string =>
  `url: ${ctx.state.url || "(blank)"} | title: ${ctx.state.title || "—"} | tabs: ${ctx.tabs.length} (active ${ctx.activeId}) | busy: ${ctx.busy}`;

export const browserTools = {
  namespace: "browser",
  instructions: "Drive a remote browser tab. read_state first, then navigate/click/type/key and re-check state between steps.",
  describe: summary,
  tools: [
    { name: "read_state", description: "Read url/title/tab count/busy state.", parameters: noArgs, run: (ctx: BrowserToolCtx) => summary(ctx) },
    { name: "open", description: "Navigate the active tab to a URL.", parameters: textArgs("url", "absolute URL"), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { void ctx.navigate(String(a.url)); return `navigating to ${a.url}`; } },
    { name: "new_tab", description: "Open a new browser tab.", parameters: noArgs, run: (ctx: BrowserToolCtx) => { ctx.newTab(); return "new tab opened"; } },
    { name: "close_tab", description: "Close a tab by id.", parameters: numArgs({ id: "tab id" }), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { ctx.closeTab(Number(a.id)); return `tab ${a.id} closed`; } },
    { name: "back", description: "Go back in history.", parameters: noArgs, run: (ctx: BrowserToolCtx) => { void ctx.back(); return "going back"; } },
    { name: "forward", description: "Go forward in history.", parameters: noArgs, run: (ctx: BrowserToolCtx) => { void ctx.forward(); return "going forward"; } },
    { name: "reload", description: "Reload the active tab.", parameters: noArgs, run: (ctx: BrowserToolCtx) => { void ctx.reload(); return "reloading"; } },
    { name: "scroll", description: "Scroll vertically by dy pixels.", parameters: numArgs({ dy: "pixels; negative = up" }), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { void ctx.scroll(Number(a.dy)); return `scrolled ${a.dy}px`; } },
    { name: "click", description: "Click viewport coordinates.", parameters: numArgs({ x: "x px", y: "y px" }), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { void ctx.click(Number(a.x), Number(a.y)); return `clicked ${a.x},${a.y}`; } },
    { name: "type", description: "Type text into the focused element.", parameters: textArgs("text", "text to type"), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { void ctx.type(String(a.text)); return "typed"; } },
    { name: "key", description: "Press a key such as Enter, Tab, Escape.", parameters: textArgs("key", "key name"), run: (ctx: BrowserToolCtx, a: Record<string, unknown>) => { void ctx.key(String(a.key)); return `pressed ${a.key}`; } },
  ],
};
