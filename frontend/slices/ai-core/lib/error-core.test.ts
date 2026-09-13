import { describe, expect, it } from "vitest";
import { errData, presentError } from "./error-core";

describe("ai-core error presentation", () => {
  it("preserves plain errors", () => {
    expect(errData(new Error("boom"))).toBe("boom");
    expect(presentError(new Error("boom"))).toMatchObject({ headline: "boom", full: "boom", adminLine: null });
  });

  it("uses friendly provider copy while keeping the full admin detail", () => {
    const e = { data: { code: "rate_limited", status: 429, detail: "raw text", provider: "openai", model: "gpt-x" } };
    const view = presentError(e, { openai: "OpenAI" });
    expect(view.headline).toContain("OpenAI is rate-limiting");
    expect(view.adminLine).toBe("rate_limited · 429 · gpt-x · raw text");
    expect(view.full).toContain('"provider": "openai"');
  });
});
