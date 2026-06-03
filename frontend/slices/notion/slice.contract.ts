/**
 * Slice contract for `notion` — nested cluster (slice-of-slices), v0.1.0.
 *
 * WIP port of the notion-page-clone block editor. Milestone 1 = decoupled
 * pure core only (block specs + tree/turn-into/markdown/inline-decorator/
 * synced/layout utils). The cross-slice integrations (comments anchor,
 * database picker, mentions, cover, …) invert through the EditorAdapter seam
 * (slices/editor/lib/adapter.ts) instead of importing peer slices — that is
 * what keeps this a self-contained rr slice.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notion",
  version: "0.1.0",
  requires: {
    deps: [
      "sonner",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "katex",
    ],
    shadcn: ["button", "dropdown-menu", "popover", "separator", "checkbox"],
    env: [],
  },
  provides: {
    utils: [
      "blockTree",
      "turnInto",
      "markdownTriggers",
      "inlineDecorator",
      "syncedBlocks",
      "layoutAdapter",
      "listOrdinals",
      "blockSpecs",
    ],
    hooks: [],
    components: [],
  },
  conflicts: [],
});
