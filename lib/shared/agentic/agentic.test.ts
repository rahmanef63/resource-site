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
  requirePerm,
  BASE_AGENT_SYSTEM,
  buildAgentSystem,
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

// A collection with one destructive tool — proves the dangerous flag + the
// loop's confirm gate.
const wipeTools = defineToolCollection<CounterCtx>({
  namespace: "wipe",
  tools: [
    defineTool({
      name: "reset",
      description: "Zero the counter (irreversible).",
      parameters: obj({}),
      dangerous: true,
      run: (ctx) => {
        ctx.value = 0;
        return "reset";
      },
    }),
  ],
});

describe("dangerous tools — confirm gate", () => {
  it("registry.isDangerous reflects the flag", () => {
    const reg = createToolRegistry();
    reg.register(wipeTools, () => ({ value: 5 }));
    reg.register(counterTools, () => ({ value: 0 }));
    expect(reg.isDangerous("wipe.reset")).toBe(true);
    expect(reg.isDangerous("counter.add")).toBe(false);
    expect(reg.isDangerous("nope.gone")).toBe(false);
  });

  it("declined confirm blocks the dangerous tool but feeds back an error; others still run", async () => {
    let turn = 0;
    configureAgentStream(async () => {
      turn += 1;
      if (turn === 1) {
        return {
          text: "",
          toolUses: [
            { id: "t1", name: "wipe.reset", input: {} },
            { id: "t2", name: "counter.add", input: { n: 2 } },
          ] as ToolUse[],
          stopReason: "tool_use",
        };
      }
      return { text: "ok", toolUses: [], stopReason: "end_turn" };
    });

    const reg = createToolRegistry();
    const wipe: CounterCtx = { value: 5 };
    const counter: CounterCtx = { value: 0 };
    reg.register(wipeTools, () => wipe);
    reg.register(counterTools, () => counter);

    const outcomes: Record<string, boolean> = {};
    await runAgentLoop([{ role: "user", text: "go" }], reg, {
      confirm: (name) => name !== "wipe.reset", // decline only the wipe
      onTool: (name, _i, o) => {
        outcomes[name] = o.ok;
      },
    });

    expect(wipe.value).toBe(5); // NOT reset — gate declined
    expect(counter.value).toBe(2); // non-dangerous ran
    expect(outcomes["wipe.reset"]).toBe(false);
    expect(outcomes["counter.add"]).toBe(true);
  });

  it("no confirm provided runs dangerous tools unguarded (back-compat)", async () => {
    let turn = 0;
    configureAgentStream(async () => {
      turn += 1;
      if (turn === 1) {
        return { text: "", toolUses: [{ id: "t1", name: "wipe.reset", input: {} }] as ToolUse[], stopReason: "tool_use" };
      }
      return { text: "done", toolUses: [], stopReason: "end_turn" };
    });
    const reg = createToolRegistry();
    const wipe: CounterCtx = { value: 9 };
    reg.register(wipeTools, () => wipe);
    await runAgentLoop([{ role: "user", text: "go" }], reg, {});
    expect(wipe.value).toBe(0);
  });
});

describe("requirePerm — defense-in-depth RBAC wrapper", () => {
  type AdminCtx = { can: (p: string) => boolean; hits: string[] };
  const base = defineTool<AdminCtx>({
    name: "remove",
    description: "Delete a member.",
    parameters: obj({ "id!": str("member id") }),
    dangerous: true,
    run: (ctx, a) => {
      ctx.hits.push(a.id as string);
      return `removed ${a.id}`;
    },
  });

  it("preserves name, parameters and the dangerous flag", () => {
    const wrapped = requirePerm("members.manage", base);
    expect(wrapped.name).toBe("remove");
    expect(wrapped.dangerous).toBe(true);
    expect(wrapped.parameters).toBe(base.parameters);
  });

  it("throws permission denied when can() is false (registry → ok:false)", async () => {
    const reg = createToolRegistry();
    const ctx: AdminCtx = { can: () => false, hits: [] };
    reg.register(
      defineToolCollection<AdminCtx>({ namespace: "um", tools: [requirePerm("members.manage", base)] }),
      () => ctx,
    );
    expect(await reg.invoke("um.remove", { id: "u1" })).toEqual({
      ok: false,
      result: "permission denied: members.manage",
    });
    expect(ctx.hits).toEqual([]); // never ran
  });

  it("runs the underlying tool when can() is true", async () => {
    const reg = createToolRegistry();
    const ctx: AdminCtx = { can: (p) => p === "members.manage", hits: [] };
    reg.register(
      defineToolCollection<AdminCtx>({ namespace: "um", tools: [requirePerm("members.manage", base)] }),
      () => ctx,
    );
    expect(await reg.invoke("um.remove", { id: "u2" })).toEqual({ ok: true, result: "removed u2" });
    expect(ctx.hits).toEqual(["u2"]);
  });
});

describe("BYOK contract — custom instruction (prompt) + function list", () => {
  const withInstr = defineToolCollection<CounterCtx>({
    namespace: "counter",
    instructions: "Increment-only. Never reset below zero.",
    tools: counterTools.tools,
  });

  it("buildAgentSystem returns the base alone when no collection has instructions", () => {
    expect(buildAgentSystem([{ namespace: "notes" }])).toBe(BASE_AGENT_SYSTEM);
  });

  it("buildAgentSystem appends per-collection instruction blocks + extra", () => {
    const out = buildAgentSystem(
      [
        { namespace: "counter", instructions: "Increment-only." },
        { namespace: "notes" }, // no instructions → skipped
      ],
      { extra: "Be terse." },
    );
    expect(out.startsWith(BASE_AGENT_SYSTEM)).toBe(true);
    expect(out).toContain("## counter\nIncrement-only.");
    expect(out).not.toContain("## notes");
    expect(out.endsWith("Be terse.")).toBe(true);
  });

  it("registry.systemPrompt composes from registered collections; anthropicTools is the function list", () => {
    const reg = createToolRegistry();
    reg.register(withInstr, () => ({ value: 0 }));
    reg.register(noteTools, () => ({ notes: [] }));
    const system = reg.systemPrompt();
    expect(system).toContain(BASE_AGENT_SYSTEM);
    expect(system).toContain("## counter\nIncrement-only. Never reset below zero.");
    // the other half a BYOK consumer feeds their own model call:
    expect(reg.anthropicTools().map((t) => t.name).sort()).toEqual(["counter.add", "notes.add"]);
  });

  it("custom base overrides the shipped instruction", () => {
    const reg = createToolRegistry();
    reg.register(noteTools, () => ({ notes: [] }));
    expect(reg.systemPrompt({ base: "Custom." })).toBe("Custom.");
  });
});
