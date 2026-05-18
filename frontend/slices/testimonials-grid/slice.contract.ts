/**
 * testimonials-grid slice contract.
 *
 * Pure-UI marketing section. Prop-driven testimonials grid composable by any
 * template. No Convex tables, no env, no peers.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "testimonials-grid",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["TestimonialsGridSection", "TestimonialCard"],
    utils: [],
    hooks: [],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: ["avatar", "button", "card"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
