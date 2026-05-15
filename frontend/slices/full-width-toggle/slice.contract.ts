/**
 * Slice contract for `full-width-toggle` — Phase A.
 *
 * Pure client-side UI slice. No Convex, no env, no auth. Exposes a hook +
 * two components that let the dashboard shell switch between contained /
 * wide / full page widths, persisting the preference per device via
 * localStorage with cross-tab sync.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "full-width-toggle",
  version: "0.1.0",
  requires: {
    auth: "none",
  },
  provides: {
    hooks: ["useFullWidth"],
    components: ["FullWidthToggle", "WidthContainer"],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
    },
  },
});
