export type AiMessage = { role: "user" | "ai"; text: string };
export const AI_HELLO: AiMessage = {
  role: "ai",
  text: "Tell me what to change. Try “make it vertical”, “fade in”, “split here”, “punch in”, or “add title Sale”.",
};
