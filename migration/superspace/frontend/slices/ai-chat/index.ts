/**
 * ai-chat slice — public barrel.
 *
 * Three-column AI chatbot workbench. Mount `<ChatWorkbench />` at the
 * route of your choice; wire `bindings` to your Convex API surface.
 *
 *   import { AiChatPage, AiChatFab } from "@/frontend/slices/ai-chat";
 *
 * ADOPTED-ALONGSIDE SCAFFOLD (superspace): the rr `aiChat` convex backend was
 * NOT installed — only `aiRouter` (`convex/features/aiRouter`) +
 * `create_your_mcp` exist, and the existing `ai` engine is left untouched. So
 * this slice ships non-functional. What ships today:
 *
 *   - `AiChatPage` (`./views/AiChatPage`) — the `/dashboard/ai-chat`
 *     page. Renders a real chat surface that degrades to a "wire-me-up" notice.
 *   - `<AiChatFab />` — floating assistant button + chat panel.
 *     Props-driven: inject the backend via the `chat` prop, e.g.
 *     `chat={useAction(api.features.aiRouter.action.callModel)}`. That action
 *     is key-guarded: returns `{ ok: false, notice }` when the provider key is
 *     unset so the build/prerender never throws. Without a `chat` prop the
 *     widget still renders and answers with a wire-me-up notice.
 */

export { default as AiChatPage } from "./views/AiChatPage";
export { AiChatFab } from "./components/AiChatFab";
export type { AiChatSend, AiChatSendResult } from "./components/AiChatFab";

// Bridge: STUBBED in superspace. The rr version wrapped the shared agentic kit
// (`@/shared/agentic`, absent here); this returns a non-functional passthrough.
export { createAgenticChatSend } from "./agentic-send";
