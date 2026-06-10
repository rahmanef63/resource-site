// Agentic tool collection - thin Tier-C `configure` seam. The slice stays
// presentational: the HOST (e.g. a page-builder agent surface) owns the props
// and applies the merge-patch; the tool never touches slice internals.

import { defineToolCollection, obj, str, bool } from "@/shared/agentic";

export type EmptyStatesConfigureCtx = {
  /** Merge-apply a props patch onto the rendered empty state panel. */
  apply: (patch: Record<string, unknown>) => void;
};

export const emptyStatesTools = defineToolCollection<EmptyStatesConfigureCtx>({
  namespace: "empty-states",
  instructions: "configure merge-patches the rendered EmptyState's props - send only the keys you change. Actions/icons stay host-managed.",
  tools: [
    {
      name: "configure",
      description: "Merge-patch the empty state panel's props. Send only the keys to change.",
      parameters: obj({
        kind: str("empty-state preset", { enum: ["404", "500", "403", "no-results", "empty-list", "first-use"] }),
        title: str("headline text"),
        description: str("supporting text"),
        compact: bool("tight spacing variant"),
      }),
      run: (ctx, a) => {
        ctx.apply(a);
        const keys = Object.keys(a);
        return keys.length ? `configured: ${keys.join(", ")}` : "no changes";
      },
    },
  ],
});
