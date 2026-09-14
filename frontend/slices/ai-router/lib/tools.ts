import { defineToolCollection } from "@/shared/agentic/define";
import { obj, str } from "@/shared/agentic/schema";
import type { RouteTier } from "./core";

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
      description: "Send a prompt to a cost-routed model tier and return its reply.",
      parameters: obj({
        "tier!": str("model tier", { enum: ["nano", "mid", "flagship"] }),
        "prompt!": str("the prompt to send"),
      }),
      run: (ctx, args) =>
        ctx.route({ tier: args.tier as RouteTier, prompt: args.prompt as string }),
    },
  ],
});
