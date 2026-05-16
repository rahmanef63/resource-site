/**
 * ai-chat slice — public barrel.
 *
 * Three-column AI chatbot workbench. Mount `<ChatWorkbench />` at the
 * route of your choice; wire `bindings` to your Convex API surface.
 *
 *   import { ChatWorkbench, useChat } from "@/features/ai-chat";
 *
 * NOTE: this scaffold ships the contract + metadata only. The
 * component files are intentionally absent until the full impl lands
 * (see git history `b208621` for the preview surface and W5 in
 * roadmap for the real implementation).
 */

export type { ChatMessage, ChatThread, ChatModel, ChatTool, ChatSkill } from "./types";
