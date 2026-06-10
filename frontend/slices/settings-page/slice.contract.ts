/**
 * settings-page slice contract.
 *
 * Adapter-driven account settings shell. The consumer owns persistence via a
 * SettingsAdapter (load + save); the slice ships only UI + a memory adapter for
 * demos. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "settings-page",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    tools: ["settings-page.get", "settings-page.set"],
    components: [
      "SettingsShell",
      "ProfileSection",
      "PreferencesSection",
      "NotificationsSection",
      "DangerZone",
    ],
    utils: ["createMemoryAdapter"],
    hooks: ["useSettings"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [{ npm: "lucide-react", range: "^0.400.0" }],
    shadcn: [
      "alert-dialog",
      "avatar",
      "button",
      "card",
      "input",
      "label",
      "select",
      "separator",
      "skeleton",
      "switch",
      "textarea",
    ],
    env: [],
    peers: [],
  },
  conflicts: [],
});
