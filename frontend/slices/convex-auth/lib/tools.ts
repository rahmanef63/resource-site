// Agentic tool collection - thin Tier-C `configure` seam. The slice stays
// presentational: the HOST (e.g. a page-builder agent surface) owns the props
// and applies the merge-patch; the tool never touches slice internals.

import { defineToolCollection, obj, str, arr } from "@/shared/agentic";

export type ConvexAuthConfigureCtx = {
  /** Merge-apply a props patch onto the rendered auth card. */
  apply: (patch: Record<string, unknown>) => void;
};

export const convexAuthTools = defineToolCollection<ConvexAuthConfigureCtx>({
  namespace: "convex-auth",
  instructions: "configure merge-patches the rendered AuthCard's props (copy, default tab, visible methods) - send only the keys you change. Flow handlers/keys stay host-managed.",
  tools: [
    {
      name: "configure",
      description: "Merge-patch the auth card's props. Send only the keys to change.",
      parameters: obj({
        title: str("card title"),
        description: str("card description"),
        defaultPasswordMode: str("initial password tab", { enum: ["signin", "signup"] }),
        methods: arr("auth methods to show, in order", str("method", { enum: ["password", "google", "github", "magic-link", "phone", "anonymous"] })),
      }),
      run: (ctx, a) => {
        ctx.apply(a);
        const keys = Object.keys(a);
        return keys.length ? `configured: ${keys.join(", ")}` : "no changes";
      },
    },
  ],
});
