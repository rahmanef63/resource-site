export const AI_ROUTER_TIERS = ["nano", "mid", "flagship"] as const;
export type RouteTier = (typeof AI_ROUTER_TIERS)[number];

export type AiRouterRequest = {
  feature: string;
  prompt: string;
  tier: RouteTier;
};

export type AiRouterResult = {
  ok: boolean;
  text?: string;
  notice?: string;
};

export type AiRouterRoute = (request: AiRouterRequest) => Promise<AiRouterResult>;

export type AiRouterMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const AI_ROUTER_UNCONFIGURED_NOTICE =
  "AI Router is not wired in this host. Bind route to api.features.ai.action.callModel.";

export function greetingMessage(content: string): AiRouterMessage {
  return { id: "greet", role: "assistant", content };
}

export function userMessage(id: string, content: string): AiRouterMessage {
  return { id, role: "user", content };
}

export function assistantMessage(id: string, result: AiRouterResult): AiRouterMessage {
  const content = result.ok
    ? result.text?.trim() || "(no response)"
    : result.notice?.trim() || AI_ROUTER_UNCONFIGURED_NOTICE;
  return { id, role: "assistant", content };
}

export async function routePrompt(
  route: AiRouterRoute | undefined,
  request: AiRouterRequest,
): Promise<AiRouterResult> {
  if (!route) return { ok: false, notice: AI_ROUTER_UNCONFIGURED_NOTICE };
  return route(request);
}
