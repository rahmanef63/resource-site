import { describe, it, expect } from "vitest";
import { defineTool, defineToolCollection, obj, num } from "./index";
import { globalToolRegistry, registerGlobalTools } from "./global-host";

type Ctx = { value: number };

const tools = defineToolCollection<Ctx>({
  namespace: "gh-counter",
  tools: [
    defineTool({
      name: "add",
      description: "Add n.",
      parameters: obj({ "n!": num("amount") }),
      run: (ctx, args) => {
        ctx.value += args.n as number;
        return `value=${ctx.value}`;
      },
    }),
  ],
});

describe("global host — singleton registry with rebindable ctx", () => {
  it("registers once and dispatches through the forwarding thunk", async () => {
    const a: Ctx = { value: 0 };
    registerGlobalTools(tools, () => a);
    expect(globalToolRegistry().names()).toContain("gh-counter.add");
    expect(await globalToolRegistry().invoke("gh-counter.add", { n: 2 })).toEqual({
      ok: true,
      result: "value=2",
    });
  });

  it("re-registering a namespace rebinds ctx instead of duplicating tools", async () => {
    const b: Ctx = { value: 100 };
    const before = globalToolRegistry().size();
    registerGlobalTools(tools, () => b); // remount: same namespace, new ctx
    expect(globalToolRegistry().size()).toBe(before);
    expect(await globalToolRegistry().invoke("gh-counter.add", { n: 1 })).toEqual({
      ok: true,
      result: "value=101",
    });
  });
});
