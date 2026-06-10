/**
 * Slice contract for `shell-settings` — v1.0.0.
 *
 * Brand-free settings-app UI primitives (Section/Row/Segmented/AccentSwatches
 * + the composed AppearancePanel). Pure presentation: the consumer injects an
 * AppearanceAdapter built from its own appearance store, so the slice holds
 * no project-specific values and no host dependency.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "shell-settings",
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
    shadcn: ["separator", "switch", "toggle-group", "button"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: [
      "AppearancePanel",
      "SettingsSection",
      "SettingsRow",
      "Segmented",
      "AccentSwatches",
    ] as string[],
    hooks: [] as string[],
    utils: ["shellSettingsConfig"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
