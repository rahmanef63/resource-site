/**
 * example-feature slice contract.
 *
 * Reference contract — the third leg of the metadata trio (slice.json +
 * slice.contract.ts + slice.manifest.json). `scaffold-slice` rewrites the
 * `example-feature` / `ExampleFeature` / `exampleFeature` identifiers to your
 * slug on pull, so a freshly scaffolded slice passes `audit:slices` with no
 * hand-editing. Tighten `provides` / `requires` to your real surface.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "example-feature",
  version: "0.1.0",
  category: "data",
  kind: "full",
  provides: {
    components: ["ExampleButton"],
    utils: [],
    hooks: [],
    convex: {
      tables: ["exampleFeature"],
      rbac: [],
    },
  },
  requires: {
    deps: [
      { npm: "convex", range: "^1.17" },
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: ["button"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
