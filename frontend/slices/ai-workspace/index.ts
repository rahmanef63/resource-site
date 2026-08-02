/**
 * ai-workspace slice — public barrel (shadcn-style variants).
 *
 * Three AI surfaces behind one slug:
 *   - chat   → `<AiChatFab />` + `createAgenticChatSend` (real function-calling
 *              over any ToolHost; convex/features/aiChat backend).
 *   - studio → `<AiStudioPage />` generation canvas + `aiStudioTools`.
 *   - agents → `<AiAgentsPage />` run dashboard + `createAgentRunner`.
 *
 * Install one variant with `npx rr add ai-workspace chat|studio|agents`
 * (its files flatten to @/features/ai-workspace), or all with
 * `npx rr add ai-workspace`. Only the chat variant pulls a convex backend
 * (per-variant convex gating).
 */
export * from "./variants/chat";
export * from "./variants/studio";
export * from "./variants/agents";
