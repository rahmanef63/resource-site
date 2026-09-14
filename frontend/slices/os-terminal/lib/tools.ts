// Agentic tool collection. The slice is NOT an agent — it exports a plain,
// structurally compatible function-calling collection. No agent runtime is
// required to author or install the collection; React can auto-register it
// with the shared host while Svelte/other hosts may register it themselves.

import { run, type RunCtx, type Line } from "./commands";

export type TerminalCtx = RunCtx;

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const noArgs: ToolParams = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};

const commandArgs: ToolParams = {
  type: "object",
  properties: {
    command: { type: "string", description: "the command line to execute" },
  },
  required: ["command"],
  additionalProperties: false,
};

const render = (lines: Line[]): string =>
  lines.map((l) => (l.t === "err" ? `! ${l.v}` : l.v)).join("\n") || "(no output)";

export const osTerminalTools = {
  namespace: "os-terminal",
  instructions:
    "A shell terminal. Check cwd first; run executes a real command, so avoid destructive shell commands without explicit user intent.",
  describe: (ctx: TerminalCtx) => `terminal at ${ctx.cwd} (${ctx.api.mode} mode)`,
  tools: [
    {
      name: "run",
      description:
        "Run a shell command (ls/cd/cat/mkdir/touch/rm/mv/cp/echo/ps/df…; unknown commands pass through to the live exec adapter when wired).",
      parameters: commandArgs,
      run: async (ctx: TerminalCtx, a: Record<string, unknown>) =>
        render(await run(String(a.command ?? ""), ctx)),
    },
    {
      name: "cwd",
      description: "Read the current working directory and adapter mode.",
      parameters: noArgs,
      run: (ctx: TerminalCtx) => `${ctx.cwd} (${ctx.api.mode})`,
    },
    {
      name: "clear",
      description: "Clear the terminal scrollback.",
      parameters: noArgs,
      run: (ctx: TerminalCtx) => {
        ctx.clear();
        return "cleared";
      },
    },
  ],
};
