// Agentic tool collection - thin Tier-C `configure` seam. The slice stays
// presentational: the HOST (e.g. a page-builder agent surface) owns the props
// and applies the merge-patch; the tool never touches slice internals.

import { defineToolCollection, obj, str, bool } from "@/shared/agentic";

export type NotionShellConfigureCtx = {
  /** Merge-apply a props patch onto the rendered Notion page shell. */
  apply: (patch: Record<string, unknown>) => void;
};

export const notionShellTools = defineToolCollection<NotionShellConfigureCtx>({
  namespace: "notion-shell",
  instructions: "configure sets page-level display settings on the rendered Notion page (font, width, text size, lock, title). Blocks/content stay host-managed.",
  tools: [
    {
      name: "configure",
      description: "Merge-patch the Notion page shell's props. Send only the keys to change.",
      parameters: obj({
        title: str("page title"),
        font: str("page font", { enum: ["default", "serif", "mono"] }),
        fullWidth: bool("stretch content to full width"),
        smallText: bool("compact text size"),
        locked: bool("lock the page against edits"),
      }),
      run: (ctx, a) => {
        ctx.apply(a);
        const keys = Object.keys(a);
        return keys.length ? `configured: ${keys.join(", ")}` : "no changes";
      },
    },
  ],
});
