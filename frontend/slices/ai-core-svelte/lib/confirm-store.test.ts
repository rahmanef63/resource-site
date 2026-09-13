import { describe, expect, it, vi } from "vitest";
import { createConfirmStore } from "./confirm-store";

describe("ai-core Svelte confirm store", () => {
  it("asks, confirms exactly once, and clears state", () => {
    const run = vi.fn();
    const store = createConfirmStore();
    const seen: Array<string | null> = [];
    store.subscribe((request) => seen.push(request?.title ?? null));
    store.ask({ title: "Delete?", run });
    store.confirm();
    store.confirm();
    expect(run).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([null, "Delete?", null]);
  });

  it("cancels without running", () => {
    const run = vi.fn();
    const store = createConfirmStore();
    store.ask({ title: "Delete?", run });
    store.cancel();
    expect(run).not.toHaveBeenCalled();
  });
});
