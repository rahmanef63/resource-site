/**
 * landing-sections slice contract.
 *
 * Admin CRUD over the per-template landing-page composition. Ships
 * generic UI + a store adapter pattern; per-section public renderers
 * stay in the consumer (each template maps `kind` → its own component).
 *
 * Soft external peer: `@/components/templates/_shared/crud/*` — the
 * generic CRUD list/form primitives that LandingView + LandingEditorView
 * consume. Install that surface alongside this slice (it ships in every
 * rr website template by default).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "landing-sections",
  version: "0.1.0",
  category: "infra",
  kind: "ui",
  provides: {
    components: ["LandingView", "LandingEditorView", "LandingSectionShell"],
    utils: ["blankSection", "defaultLandingSections", "landingReducer"],
    hooks: ["useLandingStore"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: ["badge", "button", "dialog", "input", "label", "select", "switch", "table", "textarea"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
