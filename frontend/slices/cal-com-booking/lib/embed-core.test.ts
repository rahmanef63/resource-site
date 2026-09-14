import { describe, expect, it } from "vitest";
import {
  calEmbedScriptUrl,
  normalizeCalLink,
  normalizeCalOrigin,
} from "./embed-core";

describe("cal-com-booking embed core", () => {
  it("normalizes explicit event links without inventing an account", () => {
    expect(normalizeCalLink(" /team/event-type/ ")).toBe("team/event-type");
    expect(normalizeCalLink("   ")).toBeNull();
    expect(normalizeCalLink()).toBeNull();
  });

  it("normalizes hosted or self-hosted origins and derives the embed script", () => {
    expect(normalizeCalOrigin()).toBe("https://app.cal.com");
    expect(normalizeCalOrigin("https://calendar.example.com/path")).toBe("https://calendar.example.com");
    expect(calEmbedScriptUrl("https://calendar.example.com")).toBe(
      "https://calendar.example.com/embed/embed.js",
    );
  });

  it("rejects non-http embed origins", () => {
    expect(() => normalizeCalOrigin("javascript:alert(1)")).toThrow(
      "Cal.com origin must use http or https.",
    );
  });
});
