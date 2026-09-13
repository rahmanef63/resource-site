import { describe, expect, it, vi } from "vitest";
import type { FilesAdapter } from "../adapter/types";
import { uploadFiles } from "./upload";

describe("file-upload Svelte upload helpers", () => {
  it("uploads sequentially and emits canonical FileRefs", async () => {
    const upload = vi.fn(async (file: File) => `id-${file.name}`);
    const adapter: FilesAdapter = { upload, remove: async () => {}, resolveUrl: () => null };
    const files = [new File(["a"], "a.txt"), new File(["b"], "b.txt")];
    const seen: string[] = [];
    const refs = await uploadFiles(adapter, files, (ref) => seen.push(ref));
    expect(refs).toEqual(["storage:id-a.txt:a.txt", "storage:id-b.txt:b.txt"]);
    expect(seen).toEqual(refs);
    expect(upload).toHaveBeenCalledTimes(2);
  });
});
