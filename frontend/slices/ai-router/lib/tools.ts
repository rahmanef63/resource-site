// Agentic tool collection. ai-router's backend is a Convex action (OpenRouter
// tier proxy) — this collection exposes it TO an agent as one `route` tool.
// The ctx is an injectable thunk so the consumer binds their own transport
// (Convex client, fetch to /api, …) without this slice importing it.

import { defineToolCollection, obj, str } from "@/shared/agentic";

export type RouteTier = "nano" | "mid" | "flagship";

export type AiRouterCtx = {
  /** Send a prompt to the routed model tier; resolves to the reply text. */
  route: (req: { tier: RouteTier; prompt: string }) => Promise<string>;
};

export const aiRouterTools = defineToolCollection<AiRouterCtx>({
  namespace: "ai-router",
  instructions: "Routes a prompt to a tiered model. Pick the cheapest tier that fits; each route is a model call, so avoid redundant ones.",
  tools: [
    {
      name: "route",
      description:
        "Send a prompt to a cost-routed model tier (nano = cheap/fast, mid = balanced, flagship = strongest) and return its reply.",
      parameters: obj({
        "tier!": str("model tier", { enum: ["nano", "mid", "flagship"] }),
        "prompt!": str("the prompt to send"),
      }),
      run: (ctx, a) =>
        ctx.route({ tier: a.tier as RouteTier, prompt: a.prompt as string }),
    },
  ],
});
