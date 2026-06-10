// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the live RunCtx the terminal component builds
// (fs model + cwd + adapter); commands run through the same dispatcher
// the interactive shell uses, so mock/live behavior is identical.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import { run, type RunCtx, type Line } from "./commands";

export type TerminalCtx = RunCtx;

const render = (lines: Line[]): string =>
  lines.map((l) => (l.t === "err" ? `! ${l.v}` : l.v)).join("\n") || "(no output)";

export const osTerminalTools = defineToolCollection<TerminalCtx>({
  namespace: "os-terminal",
  describe: (ctx) => `terminal at ${ctx.cwd} (${ctx.api.mode} mode)`,
  tools: [
    {
      name: "run",
      description:
        "Run a shell command (ls/cd/cat/mkdir/touch/rm/mv/cp/echo/ps/df…; unknown commands pass through to the live exec adapter when wired).",
      parameters: obj({ "command!": str("the command line to execute") }),
      run: async (ctx, a) => render(await run(a.command as string, ctx)),
    },
    {
      name: "cwd",
      description: "Read the current working directory and adapter mode.",
      parameters: noArgs,
      run: (ctx) => `${ctx.cwd} (${ctx.api.mode})`,
    },
    {
      name: "clear",
      description: "Clear the terminal scrollback.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.clear();
        return "cleared";
      },
    },
  ],
});
