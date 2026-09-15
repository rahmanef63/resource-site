// Framework-neutral function-calling collection. The slice is not an agent;
// React may auto-register it with the shared host while Svelte/other hosts can
// bind the same collection to any structurally compatible explorer context.

import type { FsEntry } from "../adapter/types";

type Params = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};
const schema = (properties: Record<string, unknown> = {}, required: string[] = []): Params => ({
  type: "object", properties, required, additionalProperties: false,
});
const text = (description: string) => ({ type: "string", description });
const namesParam = { type: "array", description: "entry names", items: text("name") };

export type FileExplorerCtx = {
  path: string;
  entries: FsEntry[] | null;
  mode?: "mock" | "live" | "readonly";
  error?: string | null;
  navigate: (path: string) => void;
  mkdir: (name?: string) => Promise<string | null | undefined>;
  rename: (from: string, to: string) => Promise<unknown>;
  move: (names: string[], dest: string) => Promise<unknown>;
  trash: (names: string[]) => Promise<unknown>;
  remove: (names: string[]) => Promise<unknown>;
  emptyTrash: () => Promise<unknown>;
};

const names = (a: Record<string, unknown>): string[] => Array.isArray(a.names) ? a.names.map(String) : [];
const summary = (ctx: FileExplorerCtx): string => {
  const list = (ctx.entries ?? []).map((e) => `${e.name}${e.kind === "dir" ? "/" : ""}`).join(", ");
  return `cwd ${ctx.path} (${ctx.mode ?? "adapter"}) | entries: ${list || "empty"}${ctx.error ? ` | notice: ${ctx.error}` : ""}`;
};

export const fileExplorerTools = {
  namespace: "file-explorer",
  instructions:
    "File manager. navigate/list to locate a path before mutating; trash is recoverable, remove and empty_trash are permanent, confirm first.",
  describe: summary,
  tools: [
    { name: "list", description: "List the current directory entries.", parameters: schema(), run: (ctx: FileExplorerCtx) => summary(ctx) },
    { name: "navigate", description: "Change the working directory.", parameters: schema({ path: text("directory path") }, ["path"]), run: (ctx: FileExplorerCtx, a: Record<string, unknown>) => { ctx.navigate(String(a.path)); return `cwd → ${String(a.path)}`; } },
    { name: "mkdir", description: "Create a folder in the current directory.", parameters: schema({ name: text("folder name") }, ["name"]), run: async (ctx: FileExplorerCtx, a: Record<string, unknown>) => `created folder "${await ctx.mkdir(String(a.name))}"` },
    { name: "rename", description: "Rename an entry in the current directory.", parameters: schema({ from: text("current name"), to: text("new name") }, ["from", "to"]), run: async (ctx: FileExplorerCtx, a: Record<string, unknown>) => { await ctx.rename(String(a.from), String(a.to)); return `renamed ${String(a.from)} → ${String(a.to)}`; } },
    { name: "move", description: "Move entries into a destination folder.", parameters: schema({ names: namesParam, dest: text("destination path") }, ["names", "dest"]), run: async (ctx: FileExplorerCtx, a: Record<string, unknown>) => { const list = names(a); await ctx.move(list, String(a.dest)); return `moved ${list.length} item(s) → ${String(a.dest)}`; } },
    { name: "trash", description: "Move entries into the Trash.", parameters: schema({ names: namesParam }, ["names"]), run: async (ctx: FileExplorerCtx, a: Record<string, unknown>) => { const list = names(a); await ctx.trash(list); return `trashed ${list.length} item(s)`; } },
    { name: "remove", description: "Permanently delete entries from the current directory.", parameters: schema({ names: namesParam }, ["names"]), run: async (ctx: FileExplorerCtx, a: Record<string, unknown>) => { const list = names(a); await ctx.remove(list); return `deleted ${list.length} item(s)`; } },
    { name: "empty_trash", description: "Permanently delete everything in the Trash.", parameters: schema(), run: async (ctx: FileExplorerCtx) => { await ctx.emptyTrash(); return "trash emptied"; } },
  ],
};
