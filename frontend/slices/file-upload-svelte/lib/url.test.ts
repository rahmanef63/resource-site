import { describe, expect, it, vi } from "vitest";
import type { FilesAdapter, FileUrlSubscriber } from "../adapter/types";
import { watchFileUrl } from "./url";

describe("file-upload Svelte URL resolution", () => {
  it("resolves once and forwards live invalidations when supplied", async () => {
    let live: FileUrlSubscriber | undefined;
    const unsubscribe = vi.fn();
    const adapter: FilesAdapter = {
      upload: async () => "id",
      remove: async () => {},
      resolveUrl: async () => "https://files.test/first",
      subscribeUrl: (_id, run) => { live = run; return unsubscribe; },
    };
    const values: Array<string | null> = [];
    const stop = watchFileUrl(adapter, "id", (url) => values.push(url));
    await Promise.resolve();
    await Promise.resolve();
    live?.("https://files.test/second");
    expect(values).toEqual(["https://files.test/first", "https://files.test/second"]);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("returns null immediately for an empty storage id", () => {
    const adapter: FilesAdapter = { upload: async () => "id", remove: async () => {}, resolveUrl: () => "unused" };
    const values: Array<string | null> = [];
    watchFileUrl(adapter, null, (url) => values.push(url));
    expect(values).toEqual([null]);
  });
});
