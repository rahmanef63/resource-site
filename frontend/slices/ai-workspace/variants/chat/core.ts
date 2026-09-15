export type AiChatMessage = {
  role: "user" | "assistant";
  text: string;
  notice?: boolean;
};

export type AiChatSendResult = { ok: boolean; text?: string; notice?: string };

export type AiChatSend = (args: {
  prompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) => Promise<AiChatSendResult>;

export const AI_CHAT_SUGGESTIONS = [
  "Apa saja layanan yang ditawarkan?",
  "Bagaimana cara mulai kerja sama?",
  "Berapa estimasi harga & waktunya?",
] as const;

export function initialChatMessage(brand: string): AiChatMessage {
  return {
    role: "assistant",
    text: `Hai 👋 aku asisten ${brand}. Tanya apa saja soal layanan, harga, atau cara mulai.`,
  };
}

export function chatHistory(messages: AiChatMessage[]) {
  return messages
    .filter((message) => !message.notice)
    .map((message) => ({ role: message.role, content: message.text }));
}
