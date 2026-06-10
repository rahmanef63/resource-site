// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the live state from useRemoteBrowser().

import { defineToolCollection, noArgs, num, obj, str } from "@/shared/agentic";
import type { useRemoteBrowser } from "./use-remote-browser";

export type BrowserCtx = ReturnType<typeof useRemoteBrowser>;

const summary = (ctx: BrowserCtx): string =>
  `url: ${ctx.state?.url || "(blank)"} | title: ${ctx.state?.title || "—"} | tabs: ${ctx.tabs.length} (active ${ctx.activeId}) | busy: ${ctx.busy}`;

export const browserTools = defineToolCollection<BrowserCtx>({
  namespace: "browser",
  describe: summary,
  tools: [
    {
      name: "read_state",
      description: "Read back the current page url/title, tab count and busy flag.",
      parameters: noArgs,
      run: (ctx) => summary(ctx),
    },
    {
      name: "open",
      description: "Navigate the active tab to a URL.",
      parameters: obj({ "url!": str("absolute URL") }),
      run: (ctx, a) => {
        void ctx.navigate(a.url as string);
        return `navigating to ${a.url}`;
      },
    },
    {
      name: "new_tab",
      description: "Open a new browser tab.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.newTab();
        return "new tab opened";
      },
    },
    {
      name: "close_tab",
      description: "Close a tab by its id.",
      parameters: obj({ "id!": num("tab id") }),
      run: (ctx, a) => {
        ctx.closeTab(a.id as number);
        return `tab ${a.id} closed`;
      },
    },
    {
      name: "back",
      description: "Go back in the active tab's history.",
      parameters: noArgs,
      run: (ctx) => {
        void ctx.back();
        return "going back";
      },
    },
    {
      name: "forward",
      description: "Go forward in the active tab's history.",
      parameters: noArgs,
      run: (ctx) => {
        void ctx.forward();
        return "going forward";
      },
    },
    {
      name: "reload",
      description: "Reload the active tab.",
      parameters: noArgs,
      run: (ctx) => {
        void ctx.reload();
        return "reloading";
      },
    },
    {
      name: "scroll",
      description: "Scroll the page vertically by dy pixels (negative = up).",
      parameters: obj({ "dy!": num("pixels") }),
      run: (ctx, a) => {
        void ctx.scroll(a.dy as number);
        return `scrolled ${a.dy}px`;
      },
    },
    {
      name: "click",
      description: "Click at viewport coordinates.",
      parameters: obj({ "x!": num("x px"), "y!": num("y px") }),
      run: (ctx, a) => {
        void ctx.click(a.x as number, a.y as number);
        return `clicked ${a.x},${a.y}`;
      },
    },
    {
      name: "type",
      description: "Type text into the focused element.",
      parameters: obj({ "text!": str("text to type") }),
      run: (ctx, a) => {
        void ctx.type(a.text as string);
        return "typed";
      },
    },
    {
      name: "key",
      description: "Press a key (e.g. Enter, Tab, Escape).",
      parameters: obj({ "key!": str("key name") }),
      run: (ctx, a) => {
        void ctx.key(a.key as string);
        return `pressed ${a.key}`;
      },
    },
  ],
});
