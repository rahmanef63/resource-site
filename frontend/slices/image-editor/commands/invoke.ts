import { findCommand } from "./registry";
import type { EditorCtx } from "./types";

export type ToolInvocation = { name: string; input: Record<string, unknown> };
export type ToolOutcome = { ok: boolean; result: string };

export async function invokeEditorCommand(ctx: EditorCtx, call: ToolInvocation): Promise<ToolOutcome> {
  const command = findCommand(call.name);
  if (!command) return { ok: false, result: `unknown command "${call.name}"` };
  try {
    return { ok: true, result: await command.run(ctx, call.input ?? {}) };
  } catch (error) {
    return { ok: false, result: error instanceof Error ? error.message : "command failed" };
  }
}
