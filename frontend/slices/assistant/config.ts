// Slice config (rr: frontend.configExport = "assistantConfig").
export type AssistantConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "ai";
  /** Display name of the built-in assistant persona. */
  assistantName: string;
};

export const assistantConfig: AssistantConfig = {
  slug: "assistant",
  title: "Assistant — agent workspace with streaming chat",
  category: "ai",
  assistantName: "Alfa",
};

export default assistantConfig;
