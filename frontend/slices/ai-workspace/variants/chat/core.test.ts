import { describe, expect, it } from "vitest";
import { chatHistory, initialChatMessage } from "./core";

describe("ai-workspace chat core", () => {
  it("keeps the initial message brand-aware", () => {
    expect(initialChatMessage("Acme").text).toContain("Acme");
  });

  it("excludes notices from model history", () => {
    expect(chatHistory([
      { role: "assistant", text: "hello" },
      { role: "assistant", text: "wire me", notice: true },
      { role: "user", text: "price?" },
    ])).toEqual([
      { role: "assistant", content: "hello" },
      { role: "user", content: "price?" },
    ]);
  });
});
