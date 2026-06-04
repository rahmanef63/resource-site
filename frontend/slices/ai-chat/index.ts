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
 *   - `<AiChatFab />` — floating assistant button + chat panel. Wires
 *     to `convex/features/aiChat/action.ts` (generateText via the `ai`
 *     SDK + @ai-sdk/anthropic, claude-3-5-haiku). Key-guarded: returns
 *     `{ ok: false, notice }` when ANTHROPIC_API_KEY is unset so the
 *     build/prerender never throws.
 *
 * Backend half lives at `convex/features/aiChat/` (camelCase — Convex
 * module paths must not contain hyphens).
 */

export { AiChatFab } from "./components/AiChatFab";
export type { ChatMessage, ChatThread, ChatModel, ChatTool, ChatSkill } from "./types";
