// Agentic tool collection. The palette is renderless (consumer owns groups +
// navigation), so the ctx is the same contract: the command list + a runner.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type CommandMenuCtx = {
  /** Flat command list: id, label, group. */
  commands: () => Array<{ id: string; label: string; group: string }>;
  /** Execute a command by id (host runs its onSelect/navigation). */
  run: (id: string) => string | Promise<string>;
};

const render = (rows: Array<{ id: string; label: string; group: string }>): string =>
  rows.map((c) => `${c.id} "${c.label}" [${c.group}]`).join("\n") || "no commands";

export const commandMenuTools = defineToolCollection<CommandMenuCtx>({
  namespace: "command-menu",
  tools: [
    {
      name: "list_commands",
      description: "List every available command (id, label, group).",
      parameters: noArgs,
      run: (ctx) => render(ctx.commands()),
    },
    {
      name: "search",
      description: "Search commands by text.",
      parameters: obj({ "query!": str("search text") }),
      run: (ctx, a) => {
        const q = (a.query as string).toLowerCase();
        return render(ctx.commands().filter((c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)));
      },
    },
    {
      name: "run_command",
      description: "Execute a command by id.",
      parameters: obj({ "id!": str("command id (see list_commands)") }),
      run: (ctx, a) => ctx.run(a.id as string),
    },
  ],
});
