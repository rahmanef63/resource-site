/**
 * Slice contract for `app-store` — v1.0.0.
 *
 * Storefront + Create-App for a dynamic localStorage app registry;
 * useInstalledApps() exposes the registry as appshell-style descriptors.
 * The command-app console's shell is injected via configureAppStoreExec.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "app-store",
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
    shadcn: ["button", "input", "badge", "separator", "scroll-area", "switch", "tooltip"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["AppStore", "CreateApp"] as string[],
    hooks: ["useInstalledApps", "useApps", "useDisabledIds"] as string[],
    utils: ["createApp", "setInstalled", "configureAppStoreExec", "appStoreApp", "createAppApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
