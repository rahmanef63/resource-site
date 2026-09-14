import { describe, expect, it } from "vitest";
import { configureBrowserMode, getBrowserConfigRevision, getBrowserMode } from "./host-core";
import { readStored, writeStored } from "./storage-core";
import { isUrlLike, toTarget } from "./url";

describe("browser portable cores", () => {
  it("updates configured mode revision without React", () => {
    const before = getBrowserConfigRevision();
    configureBrowserMode(() => ({ live: false, demo: false }));
    expect(getBrowserConfigRevision()).toBe(before + 1);
    expect(getBrowserMode()).toEqual({ live: false, demo: false });
    configureBrowserMode(() => ({ live: true, demo: true }));
  });

  it("keeps URL/search classification deterministic", () => {
    expect(isUrlLike("example.com/docs")).toBe(true);
    expect(toTarget("example.com/docs")).toBe("https://example.com/docs");
    expect(toTarget("hello world")).toContain("google.com/search?q=hello%20world");
  });

  it("storage helpers stay safe without a browser window", () => {
    expect(readStored("browser:test", [1, 2])).toEqual([1, 2]);
    expect(() => writeStored("browser:test", [3])).not.toThrow();
  });
});
