// Slice public barrel — re-exports only.
export {}

// Agentic tool collection: expose the tier router to a shared agent.
export { aiRouterTools } from "./lib/tools";
export type { AiRouterCtx, RouteTier } from "./lib/tools";
