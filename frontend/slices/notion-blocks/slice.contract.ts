/**
 * notion-blocks — peer bundle of editor-block primitives.
 *
 * Re-exports four small slices' public API behind one import path so
 * downstream consumers don't think about which slice owns which block.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notion-blocks",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["EquationBlock", "CodeBlock", "NotifyMePopover", "SelectableCell"],
    utils: ["CODE_LANGUAGES", "normalizeLang", "SUBSCRIPTION_SCOPE_LABELS"],
    hooks: ["useSubscription", "useDragFill"],
    types: ["EquationBlockProps", "CodeBlockProps", "PageSubscription", "SubscriptionScope", "FillSource"],
  },
  requires: {
    npm: ["katex@^0.16.45", "highlight.js@^11.11.1"],
    shadcn: ["button", "popover", "dropdown-menu"],
    env: [],
    peers: [
      { slug: "equation", range: "^0.1", reason: "Re-exports EquationBlock." },
      { slug: "code-block", range: "^0.1", reason: "Re-exports CodeBlock." },
      { slug: "notifications", range: "^0.1", reason: "Re-exports NotifyMePopover + useSubscription." },
      { slug: "database-cell-selection", range: "^0.1", reason: "Re-exports useDragFill + SelectableCell." },
    ],
    routes: [],
    tables: [],
  },
});
