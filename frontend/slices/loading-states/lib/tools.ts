// Agentic tool collection - thin Tier-C `configure` seam. The slice stays
// presentational: the HOST (e.g. a page-builder agent surface) owns the props
// and applies the merge-patch; the tool never touches slice internals.

import { defineToolCollection, obj, str, num } from "@/shared/agentic";

export type LoadingStatesConfigureCtx = {
  /** Merge-apply a props patch onto the rendered loading skeleton. */
  apply: (patch: Record<string, unknown>) => void;
};

export const loadingStatesTools = defineToolCollection<LoadingStatesConfigureCtx>({
  namespace: "loading-states",
  instructions: "configure merge-patches the rendered LoadingSkeleton's props - send only the keys you change.",
  tools: [
    {
      name: "configure",
      description: "Merge-patch the loading skeleton's props. Send only the keys to change.",
      parameters: obj({
        kind: str("skeleton preset", { enum: ["text", "card", "list", "table", "form", "page", "block"] }),
        count: num("repeat count for row/line kinds", { min: 1 }),
        columns: num("columns for grid-ish kinds", { min: 1 }),
      }),
      run: (ctx, a) => {
        ctx.apply(a);
        const keys = Object.keys(a);
        return keys.length ? `configured: ${keys.join(", ")}` : "no changes";
      },
    },
  ],
});
