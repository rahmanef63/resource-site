import { describe, expect, it } from "vitest";
import { createEditorContext, createEditorCore } from "./editor-core";
import type { CodeFsAdapter } from "./fs-core";

function memoryFs(): CodeFsAdapter & { writes: Array<[string, string]> } {
  const files = new Map<string, string>([["/live.ts", "export const live = true;\n"]]);
  const writes: Array<[string, string]> = [];
  return {
    writes,
    list: async (path) => ({ path, entries: [] }),
    read: async (path) => {
      const body = files.get(path);
      if (body == null) throw new Error("missing");
      return body;
    },
    write: async (path, content) => { files.set(path, content); writes.push([path, content]); },
    mkdir: async () => {},
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("code-editor core", () => {
  it("hydrates, edits and saves through one observable filesystem core", async () => {
    const fs = memoryFs();
    const core = createEditorCore(fs);
    const ctx = createEditorContext(core);
    let changes = 0;
    const stop = core.subscribe(() => { changes += 1; });

    ctx.openPath("/live.ts");
    await tick();
    expect(ctx.active).toBe("/live.ts");
    expect(ctx.value).toContain("live = true");
    expect(ctx.dirty).toBe(false);

    ctx.edit("export const live = false;\n");
    expect(ctx.dirty).toBe(true);
    await ctx.save();
    expect(ctx.dirty).toBe(false);
    expect(ctx.saveState).toBe("saved");
    expect(fs.writes.at(-1)).toEqual(["/live.ts", "export const live = false;\n"]);
    expect(changes).toBeGreaterThan(2);
    stop();
  });

  it("keeps create/tab operations framework-neutral", () => {
    const core = createEditorCore(memoryFs());
    const ctx = createEditorContext(core);
    ctx.create("/Projects", "new.ts");
    expect(ctx.active).toBe("/Projects/new.ts");
    expect(ctx.tabs).toEqual(["/Projects/new.ts"]);
    ctx.edit("const x = 1;\n");
    expect(ctx.dirty).toBe(true);
    ctx.close("/Projects/new.ts");
    expect(ctx.active).toBeNull();
    expect(ctx.tabs).toEqual([]);
  });
});
