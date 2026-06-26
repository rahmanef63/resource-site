/**
 * ai-chat slice — public barrel.
 *
 * Three-column AI chatbot workbench. Mount `<ChatWorkbench />` at the
 * route of your choice; wire `bindings` to your Convex API surface.
 *
 *   import { ChatWorkbench, useChat } from "@/features/ai-chat";
 *
 * NOTE: the full three-column workbench is still roadmap (W5). What
 * ships today is the minimal real implementation used across the
 * template fleet:
 *
 *   - `<AiChatFab />` — floating assistant button + chat panel.
 *     Props-driven: inject the backend via the `chat` prop, e.g.
 *     `chat={useAction(api.features.aiChat.action.chat)}`. The action
 *     (`convex/features/aiChat/action.ts`, generateText via the `ai`
 *     SDK + @ai-sdk/anthropic) is key-guarded: returns
 *     `{ ok: false, notice }` when ANTHROPIC_API_KEY is unset so the
 *     build/prerender never throws.
 *
 * Backend half lives at `convex/features/aiChat/` (camelCase — Convex
 * module paths must not contain hyphens).
 */

export { AiChatFab } from "./components/AiChatFab";
export type { AiChatSend, AiChatSendResult } from "./components/AiChatFab";

// Bridge: real function calling for the FAB over any ToolHost
// (one agent, many slices — @/shared/agentic).
export { createAgenticChatSend } from "./agentic-send";
