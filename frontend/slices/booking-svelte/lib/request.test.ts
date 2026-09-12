// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isBookingDraftValid, normalizeBookingRequest } from "./request";

describe("booking request helpers", () => {
  it("matches the canonical required-field validation", () => {
    expect(isBookingDraftValid({ name: " Rahman ", email: "r@example.com ", topic: " Review " })).toBe(true);
    expect(isBookingDraftValid({ name: "", email: "r@example.com", topic: "Review" })).toBe(false);
    expect(isBookingDraftValid({ name: "Rahman", email: "invalid", topic: "Review" })).toBe(false);
    expect(isBookingDraftValid({ name: "Rahman", email: "r@example.com", topic: "  " })).toBe(false);
  });

  it("trims submitted values and omits blank optional fields", () => {
    expect(
      normalizeBookingRequest({
        name: " Rahman ",
        email: " rahman@example.com ",
        topic: " Product review ",
        preferredTime: " ",
        note: " Bring context ",
      }),
    ).toEqual({
      name: "Rahman",
      email: "rahman@example.com",
      topic: "Product review",
      preferredTime: undefined,
      note: "Bring context",
    });
  });
});
