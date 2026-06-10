import { describe, it, expect, beforeEach } from "vitest";
import {
  createToolRegistry,
  defineToolCollection,
  defineTool,
  obj,
  str,
  num,
  runAgentLoop,
  configureAgentStream,
  type AgentMsg,
  type ToolUse,
} from "./index";

// Two independent slice contexts — proving the registry binds each tool to its
// OWN live state, and ONE agent drives both.
type CounterCtx = { value: number };
type NotesCtx = { notes: string[] };

const counterTools = defineToolCollection<CounterCtx>({
  namespace: "counter",
  tools: [
    defineTool({
      name: "add",
      description: "Add n to the counter.",
      parameters: obj({ "n!": num("amount") }),
      run: (ctx, args) => {
        ctx.value += args.n as number;
        return `counter=${ctx.value}`;
      },
    }),
  ],
  describe: (ctx) => `counter is ${ctx.value}`,
});

const noteTools = defineToolCollection<NotesCtx>({
  namespace: "notes",
  tools: [
    defineTool({
      name: "add",
      description: "Append a note.",
      parameters: obj({ "text!": str("note text") }),
      run: (ctx, args) => {
        ctx.notes.push(args.text as string);
        return `notes=${ctx.notes.length}`;
      },
    }),
  ],
});

describe("agentic registry — one agent, many slices", () => {
  it("namespaces tool names per collection (no collision on same action name)", () => {
    const reg = createToolRegistry();
    const counter: CounterCtx = { value: 0 };
    const notes: NotesCtx = { notes: [] };
    reg.register(counterTools, () => counter);
    reg.register(noteTools, () => notes);

    // both collections export "add"; registry qualifies them apart
    expect(reg.names().sort()).toEqual(["counter.add", "notes.add"]);
    expect(reg.size()).toBe(2);
  });

  it("emits unified Anthropic tools across slices", () => {
    const reg = createToolRegistry();
    reg.register(counterTools, () => ({ value: 0 }));
    reg.register(noteTools, () => ({ notes: [] }));
    const tools = reg.anthropicTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["counter.add", "notes.add"]);
    expect(tools[0].input_schema.type).toBe("object");
  });

  it("dispatches invoke to the right context", async () => {
    const reg = createToolRegistry();
    const counter: CounterCtx = { value: 10 };
    const notes: NotesCtx = { notes: [] };
    reg.register(counterTools, () => counter);
    reg.register(noteTools, () => notes);

    expect(await reg.invoke("counter.add", { n: 5 })).toEqual({ ok: true, result: "counter=15" });
    expect(counter.value).toBe(15);
    expect(await reg.invoke("notes.add", { text: "hi" })).toEqual({ ok: true, result: "notes=1" });
    expect(notes.notes).toEqual(["hi"]);
  });

  it("returns ok:false for unknown tool + run errors instead of throwing", async () => {
    const reg = createToolRegistry();
    reg.register(counterTools, () => ({ value: 0 }));
    expect(await reg.invoke("counter.nope", {})).toEqual({
      ok: false,
      result: 'unknown tool "counter.nope"',
    });
    const bad = defineToolCollection<CounterCtx>({
      namespace: "bad",
      tools: [
        defineTool({
          name: "boom",
          description: "throws",
          parameters: obj({}),
          run: () => {
            throw new Error("kaboom");
          },
        }),
      ],
    });
    reg.register(bad, () => ({ value: 0 }));
    expect(await reg.invoke("bad.boom", {})).toEqual({ ok: false, result: "kaboom" });
  });

  it("throws on duplicate fully-qualified tool name", () => {
    const reg = createToolRegistry();
    reg.register(counterTools, () => ({ value: 0 }));
    expect(() => reg.register(counterTools, () => ({ value: 0 }))).toThrow(/duplicate tool/);
  });

  it("describeState concatenates each collection's read-back", () => {
    const reg = createToolRegistry();
    reg.register(counterTools, () => ({ value: 7 }));
    reg.register(noteTools, () => ({ notes: [] }));
    expect(reg.describeState()).toBe("counter is 7");
  });
});

describe("runAgentLoop — drives the union via the shared loop", () => {
  beforeEach(() => {
    // Scripted model: first turn calls counter.add then notes.add; second turn
    // stops (no tools) and emits final text.
    let turn = 0;
    configureAgentStream(async (_msgs, _tools, onDelta) => {
      turn += 1;
      if (turn === 1) {
        const toolUses: ToolUse[] = [
          { id: "t1", name: "counter.add", input: { n: 3 } },
          { id: "t2", name: "notes.add", input: { text: "done" } },
        ];
        return { text: "", toolUses, stopReason: "tool_use" };
      }
      onDelta("all set");
      return { text: "all set", toolUses: [], stopReason: "end_turn" };
    });
  });

  it("runs every tool_use against the right slice then finishes", async () => {
    const reg = createToolRegistry();
    const counter: CounterCtx = { value: 0 };
    const notes: NotesCtx = { notes: [] };
    reg.register(counterTools, () => counter);
    reg.register(noteTools, () => notes);

    const called: string[] = [];
    const history: AgentMsg[] = [{ role: "user", text: "do it" }];
    const { text } = await runAgentLoop(history, reg, {
      onTool: (name) => called.push(name),
    });

    expect(called).toEqual(["counter.add", "notes.add"]);
    expect(counter.value).toBe(3);
    expect(notes.notes).toEqual(["done"]);
    expect(text).toBe("all set");
  });
});
