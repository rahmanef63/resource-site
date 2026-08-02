// Agentic tool collection - thin Tier-C `configure` seam. The slice stays
// presentational: the HOST (e.g. a page-builder agent surface) owns the props
// and applies the merge-patch; the tool never touches slice internals.

import { defineToolCollection, obj, str, bool } from "@/shared/agentic";

export type MarketingChromeConfigureCtx = {
  /** Merge-apply a props patch onto the rendered marketing header. */
  apply: (patch: Record<string, unknown>) => void;
};

export const marketingChromeTools = defineToolCollection<MarketingChromeConfigureCtx>({
  namespace: "marketing-chrome",
  instructions: "configure merge-patches the rendered MarketingHeader's props - send only the keys you change. Brand, nav links and CTAs stay host-managed.",
  tools: [
    {
      name: "configure",
      description: "Merge-patch the marketing header's props. Send only the keys to change.",
      parameters: obj({
        layout: str("header layout", { enum: ["split", "centered", "minimal"] }),
        sticky: bool("stick the header to the top on scroll"),
      }),
      run: (ctx, a) => {
        ctx.apply(a);
        const keys = Object.keys(a);
        return keys.length ? `configured: ${keys.join(", ")}` : "no changes";
      },
    },
  ],
});
