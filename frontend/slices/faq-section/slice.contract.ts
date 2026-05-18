/**
 * faq-section slice contract.
 *
 * Pure-UI marketing section. Prop-driven FAQ accordion composable by any
 * template. No Convex tables, no env, no peers. Server component that
 * renders shadcn Accordion (client primitive) as a leaf island.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "faq-section",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["FAQSection", "FAQItemRow"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
    ],
    shadcn: ["accordion", "button"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
