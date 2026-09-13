import { describe, expect, it } from "vitest";
import { externalLinkAttrs, headerShowsInlineNav, orderedCtas, SOCIAL_TEXT } from "./core";

describe("marketing-chrome portable core", () => {
  it("uses secure external-link attributes only when requested", () => {
    expect(externalLinkAttrs(false)).toEqual({});
    expect(externalLinkAttrs(true)).toEqual({ target: "_blank", rel: "noreferrer noopener" });
  });

  it("keeps layout and CTA ordering deterministic", () => {
    expect(headerShowsInlineNav("split")).toBe(true);
    expect(headerShowsInlineNav("centered")).toBe(true);
    expect(headerShowsInlineNav("minimal")).toBe(false);
    expect(orderedCtas({ label: "Sign in", href: "/login" }, { label: "Start", href: "/start" }))
      .toEqual([{ label: "Sign in", href: "/login" }, { label: "Start", href: "/start" }]);
    expect(SOCIAL_TEXT.linkedin).toBe("in");
  });
});
