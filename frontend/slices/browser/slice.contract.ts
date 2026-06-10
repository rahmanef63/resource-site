/**
 * Slice contract for `browser` — v1.1.0.
 *
 * Remote headless-browser chrome (multitab strip / omnibar / bookmarks /
 * history / AI agent-activity panel / frame viewport with live-stream badge).
 * Backend injected per tab via configureBrowser (offline canvas demo renderer
 * by default), optional MJPEG screencast via configureScreencast, mock/live
 * gate via configureBrowserMode; shell services are no-op seams in
 * lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "browser",
  version: "1.2.1",
  category: "ui",
  kind: "ui",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^19" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button", "input", "badge", "dropdown-menu", "tooltip", "scroll-area", "sheet"],
    peers: [],
  },
  provides: {
    tools: [
      "browser.read_state",
      "browser.open",
      "browser.new_tab",
      "browser.close_tab",
      "browser.back",
      "browser.forward",
      "browser.reload",
      "browser.scroll",
      "browser.click",
      "browser.type",
      "browser.key"
    ] as string[],
    routes: [] as string[],
    components: ["Browser"] as string[],
    hooks: [] as string[],
    utils: ["configureBrowser", "configureBrowserMode", "configureScreencast", "browserApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
