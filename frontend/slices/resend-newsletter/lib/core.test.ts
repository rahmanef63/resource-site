import { describe, expect, it } from "vitest";
import { newsletterSuccessMessage, normalizeNewsletterEmail } from "./core";

describe("resend-newsletter core", () => {
  it("normalizes email addresses", () => {
    expect(normalizeNewsletterEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("rejects invalid email addresses", () => {
    expect(() => normalizeNewsletterEmail("not-an-email")).toThrow("Enter a valid email address.");
  });

  it("returns truthful subscribe messages", () => {
    expect(newsletterSuccessMessage({ ok: true, already: false })).toBe("You're subscribed.");
    expect(newsletterSuccessMessage({ ok: true, already: true })).toBe("You're already subscribed.");
  });
});
