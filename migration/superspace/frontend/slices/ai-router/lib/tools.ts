// ai-router tool descriptor.
//
// STUBBED for superspace: rr shipped this as a shared-agentic
// `defineToolCollection`, but superspace has no agentic-tool seam. The
// non-functional scaffold keeps the tier types + a plain, framework-agnostic
// descriptor so the slice barrel stays valid without importing agentic glue.
// Re-wire to a real agent registry in a supervised follow-up.

export type RouteTier = "nano" | "mid" | "flagship";

export type AiRouterCtx = {
  /** Send a prompt to the routed model tier; resolves to the reply text. */
  route: (req: { tier: RouteTier; prompt: string }) => Promise<string>;
};

/**
 * Plain metadata descriptor for the single `route` tool (was a shared-agentic
 * tool collection upstream). Inert — no runtime binding.
 */
export const aiRouterTools = {
  namespace: "ai-router",
  instructions:
    "Routes a prompt to a tiered model. Pick the cheapest tier that fits; each route is a model call, so avoid redundant ones.",
  tools: [
    {
      name: "route",
      description:
        "Send a prompt to a cost-routed model tier (nano = cheap/fast, mid = balanced, flagship = strongest) and return its reply.",
      parameters: {
        tier: { type: "string", enum: ["nano", "mid", "flagship"], required: true },
        prompt: { type: "string", required: true },
      },
    },
  ],
} as const;
