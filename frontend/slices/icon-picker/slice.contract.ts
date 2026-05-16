/**
 * icon-picker slice contract.
 *
 * Vertical slice contract DSL. Declares what this slice provides, requires,
 * and which version it's at. Used by tooling (audit-bp, manifest generator)
 * to validate + distribute. Pure-UI slice — no Convex tables.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "icon-picker",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: [
      "IconPicker",
      "IconPickerInline",
      "DynamicIcon",
      "PickerSkeleton",
    ],
    utils: [
      "parseIconValue",
      "lucideValue",
      "withColor",
      "isLucideValue",
      "LUCIDE_PREFIX",
    ],
    hooks: [
      "useRecentIcons",
      "useIconStyle",
    ],
    convex: {
      tables: [],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["popover", "button", "input", "scroll-area", "tabs"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
