import { describe, expect, it } from "vitest";
import { makeStorageRef, parseFileRef } from "./parse";

describe("file-upload Svelte FileRef parsing", () => {
  it("round-trips storage refs and filenames containing colons", () => {
    const ref = makeStorageRef("abc", "report:final.pdf");
    expect(ref).toBe("storage:abc:report:final.pdf");
    expect(parseFileRef(ref)).toEqual({ kind: "storage", storageId: "abc", filename: "report:final.pdf", raw: ref });
  });

  it("parses URLs and legacy names", () => {
    expect(parseFileRef("https://example.com/a/My%20File.pdf")).toMatchObject({ kind: "url", filename: "My File.pdf" });
    expect(parseFileRef("legacy.txt")).toEqual({ kind: "name", filename: "legacy.txt", raw: "legacy.txt" });
  });
});
