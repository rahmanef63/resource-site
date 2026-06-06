/**
 * Slice contract for `browser` — v1.0.0.
 *
 * Remote headless-browser chrome (omnibar/bookmarks/history/screenshot
 * viewport). Backend injected via configureBrowser (offline canvas demo
 * renderer by default); shell services are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "browser",
  version: "1.0.0",
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
    shadcn: ["button", "input", "badge", "dropdown-menu", "tooltip", "scroll-area"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["Browser"] as string[],
    hooks: [] as string[],
    utils: ["configureBrowser", "browserApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
