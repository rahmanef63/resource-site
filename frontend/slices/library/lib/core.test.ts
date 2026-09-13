import { describe, expect, it } from "vitest";
import {
  collectLibraryTools,
  filterLibraryItems,
  formatLibraryFileSize,
  libraryVideoSource,
  optimisticVote,
  settleVote,
  resolveKindLabels,
  resolveLibraryCopy,
} from "./core";
import type { LibraryRow } from "./types";

const rows: LibraryRow[] = [
  { _id: "1", slug: "a", title: "A", excerpt: "A", kind: "prompt", tools: ["z", "a"] },
  { _id: "2", slug: "b", title: "B", excerpt: "B", kind: "snippet", tools: ["a"] },
];

describe("library portable core", () => {
  it("resolves defaults and deterministic filters/tools", () => {
    expect(resolveLibraryCopy({ title: "Custom" }).title).toBe("Custom");
    expect(resolveKindLabels({ prompt: "AI prompt" }).prompt).toBe("AI prompt");
    expect(collectLibraryTools(rows)).toEqual(["a", "z"]);
    expect(filterLibraryItems(rows, "prompt", "a").map((row) => row._id)).toEqual(["1"]);
    expect(filterLibraryItems(rows, "all", "a")).toHaveLength(2);
  });

  it("normalizes media/file helpers", () => {
    expect(libraryVideoSource("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      kind: "youtube",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
    expect(libraryVideoSource("https://vimeo.com/12345")).toEqual({
      kind: "vimeo",
      src: "https://player.vimeo.com/video/12345",
    });
    expect(libraryVideoSource("https://cdn.example/video.mp4")).toEqual({
      kind: "native",
      src: "https://cdn.example/video.mp4",
    });
    expect(formatLibraryFileSize(2048)).toBe("2 KB");
  });

  it("keeps optimistic vote transitions reversible", () => {
    expect(optimisticVote(2, false)).toEqual({ count: 3, voted: true });
    expect(optimisticVote(0, true)).toEqual({ count: 0, voted: false });
    expect(settleVote(2, false, true)).toEqual({ count: 3, voted: true });
    expect(settleVote(2, true, false)).toEqual({ count: 1, voted: false });
    expect(settleVote(0, false, false)).toEqual({ count: 0, voted: false });
  });
});
