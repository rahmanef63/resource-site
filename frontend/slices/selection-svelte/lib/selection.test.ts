import { describe, expect, it } from "vitest";
import { createSelectionApi } from "./selection";

describe("selection Svelte model", () => {
  it("supports select, toggle, and contiguous range semantics", () => {
    const api = createSelectionApi();
    api.selectOnly("b");
    api.selectRange("d", ["a", "b", "c", "d", "e"]);
    expect(api.snapshot()).toEqual(["b", "c", "d"]);
    api.toggle("c");
    expect(api.snapshot()).toEqual(["b", "d"]);
  });

  it("falls back to a single item when range endpoints are missing", () => {
    const api = createSelectionApi();
    api.selectOnly("missing");
    api.selectRange("c", ["a", "b", "c"]);
    expect(api.snapshot()).toEqual(["c"]);
  });

  it("notifies subscribers for replacement and clear operations", () => {
    const api = createSelectionApi();
    const revisions: number[] = [];
    const stop = api.subscribe((revision) => revisions.push(revision));
    api.setIds(["a", "b"]);
    api.clear();
    stop();
    expect(revisions).toEqual([0, 1, 2]);
    expect(api.size).toBe(0);
  });
});
