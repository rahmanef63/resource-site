import { describe, expect, it, vi } from "vitest";
import {
  AI_ROUTER_UNCONFIGURED_NOTICE,
  assistantMessage,
  greetingMessage,
  routePrompt,
  userMessage,
} from "./core";

describe("ai-router portable core", () => {
  it("returns an explicit notice when no transport is wired", async () => {
    await expect(routePrompt(undefined, { feature: "chat", prompt: "hello", tier: "mid" })).resolves.toEqual({
      ok: false,
      notice: AI_ROUTER_UNCONFIGURED_NOTICE,
    });
  });

  it("forwards feature, tier and prompt to the injected transport", async () => {
    const route = vi.fn(async () => ({ ok: true, text: "reply" }));
    await expect(routePrompt(route, { feature: "assistant", prompt: "hello", tier: "nano" })).resolves.toEqual({
      ok: true,
      text: "reply",
    });
    expect(route).toHaveBeenCalledWith({ feature: "assistant", prompt: "hello", tier: "nano" });
  });

  it("normalizes chat messages without framework state", () => {
    expect(greetingMessage("Hi")).toEqual({ id: "greet", role: "assistant", content: "Hi" });
    expect(userMessage("u-1", "Ask")).toEqual({ id: "u-1", role: "user", content: "Ask" });
    expect(assistantMessage("a-1", { ok: false, notice: "Not configured" }).content).toBe("Not configured");
    expect(assistantMessage("a-2", { ok: true, text: "  Done  " }).content).toBe("Done");
  });
});
