import { describe, expect, it } from "vitest";
import { DEVICE_NEXT, HTML_SANDBOX, payloadSlug, shareUrl } from "./core";

describe("html studio portable core", () => {
  it("preserves the opaque-origin sandbox boundary", () => {
    expect(HTML_SANDBOX).toBe("allow-scripts allow-forms allow-popups allow-presentation");
    expect(HTML_SANDBOX).not.toContain("allow-same-origin");
  });

  it("keeps device cycling and payload slug parsing framework-neutral", () => {
    expect(DEVICE_NEXT).toEqual({ full: "tablet", tablet: "phone", phone: "full" });
    expect(payloadSlug({ slug: "demo" })).toBe("demo");
    expect(payloadSlug({ slug: 1 })).toBeNull();
    expect(shareUrl("demo")).toContain("/p/demo");
  });
});
