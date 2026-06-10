/**
 * Slice contract for `quicklinks` — v1.0.0.
 *
 * Website-shortcut grid (favicon tiles, click → new tab). Self-contained:
 * data runs on an injectable QuicklinksStore (localStorage-backed default,
 * seeded with demo links) via the lib/host.ts seam.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "quicklinks",
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
    shadcn: ["button"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["QuicklinksApp"] as string[],
    hooks: ["useQuicklinks"] as string[],
    utils: [
      "configureQuicklinks",
      "createLocalStore",
      "createMemoryStore",
      "faviconUrl",
      "openQuicklink",
      "quicklinksApp",
    ] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
