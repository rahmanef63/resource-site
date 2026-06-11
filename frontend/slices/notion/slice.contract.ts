/**
 * Slice contract for `notion` — nested cluster (slice-of-slices), v1.0.0.
 *
 * The notion-page-clone block editor, fully composed (M2c): PageEditor +
 * BlockEditor + block chrome + page actions over the pure core. The
 * cross-slice integrations (comments anchor, database picker, mentions,
 * cover, …) invert through the EditorAdapter seam
 * (slices/editor/lib/adapter.ts) instead of importing peer slices — that is
 * what keeps this a self-contained rr slice.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notion",
  version: "1.1.1",
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
    tools: ["notion.page.create", "notion.page.get", "notion.page.update", "notion.search"],
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
