import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureQuicklinks,
  createMemoryStore,
  faviconUrl,
  getQuicklinksStore,
  normalizeUrl,
  openQuicklink,
  titleFromUrl,
} from "./core";

describe("quicklinks core", () => {
  afterEach(() => {
    configureQuicklinks(createMemoryStore([]));
    vi.unstubAllGlobals();
  });

  it("normalizes URLs and derives friendly titles", () => {
    expect(normalizeUrl(" example.com/docs ")).toBe("https://example.com/docs");
    expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    expect(normalizeUrl("  ")).toBe("");
    expect(titleFromUrl("https://www.example.com/docs")).toBe("example.com");
  });

  it("creates encoded favicon URLs", () => {
    expect(faviconUrl("example.com/path")).toBe(
      "https://www.google.com/s2/favicons?domain=example.com&sz=64",
    );
    expect(faviconUrl("not a valid url with spaces")).toBeNull();
  });

  it("publishes add/remove changes through the framework-neutral store", () => {
    const store = createMemoryStore([{ id: "one", title: "One", url: "https://one.test" }]);
    configureQuicklinks(store);
    let revisions = 0;
    const unsubscribe = store.subscribe(() => revisions++);

    store.add("two.test/path");
    expect(store.get()).toHaveLength(2);
    expect(store.get()[1]).toMatchObject({ title: "two.test", url: "https://two.test/path" });

    store.remove("one");
    expect(store.get()).toHaveLength(1);
    expect(revisions).toBe(2);
    expect(getQuicklinksStore()).toBe(store);
    unsubscribe();
  });

  it("opens links without exposing window.opener", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    openQuicklink({ id: "one", title: "One", url: "https://one.test" });
    expect(open).toHaveBeenCalledWith("https://one.test", "_blank", "noopener,noreferrer");
  });
});
