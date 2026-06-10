// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the live UseFiles state from useFiles().

import { arr, defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import type { UseFiles } from "../hooks/use-files";

export type FileExplorerCtx = UseFiles;

const names = (a: Record<string, unknown>): string[] => (a.names as string[]) ?? [];

const summary = (ctx: FileExplorerCtx): string => {
  const list = (ctx.entries ?? [])
    .map((e) => `${e.name}${e.kind === "dir" ? "/" : ""}`)
    .join(", ");
  return `cwd ${ctx.path} (${ctx.api.mode}) | entries: ${list || "empty"}${ctx.error ? ` | notice: ${ctx.error}` : ""}`;
};

export const fileExplorerTools = defineToolCollection<FileExplorerCtx>({
  namespace: "file-explorer",
  instructions: "File manager. navigate/list to locate a path before mutating; trash is recoverable, remove and empty_trash are permanent, confirm first.",
  describe: summary,
  tools: [
    {
      name: "list",
      description: "List the current directory's entries (trailing / marks folders).",
      parameters: noArgs,
      run: (ctx) => summary(ctx),
    },
    {
      name: "navigate",
      description: "Change the working directory.",
      parameters: obj({ "path!": str("directory path") }),
      run: (ctx, a) => {
        ctx.navigate(a.path as string);
        return `cwd → ${a.path}`;
      },
    },
    {
      name: "mkdir",
      description: "Create a folder in the current directory.",
      parameters: obj({ "name!": str("folder name") }),
      run: async (ctx, a) => `created folder "${await ctx.mkdir(a.name as string)}"`,
    },
    {
      name: "rename",
      description: "Rename an entry in the current directory.",
      parameters: obj({ "from!": str("current name"), "to!": str("new name") }),
      run: async (ctx, a) => {
        await ctx.rename(a.from as string, a.to as string);
        return `renamed ${a.from} → ${a.to}`;
      },
    },
    {
      name: "move",
      description: "Move entries from the current directory into a destination folder.",
      parameters: obj({ "names!": arr("entry names", str("name")), "dest!": str("destination path") }),
      run: async (ctx, a) => {
        await ctx.move(names(a), a.dest as string);
        return `moved ${names(a).length} item(s) → ${a.dest}`;
      },
    },
    {
      name: "trash",
      description: "Move entries from the current directory into the Trash.",
      parameters: obj({ "names!": arr("entry names", str("name")) }),
      run: async (ctx, a) => {
        await ctx.trash(names(a));
        return `trashed ${names(a).length} item(s)`;
      },
    },
    {
      name: "remove",
      description: "Permanently delete entries from the current directory (no Trash).",
      parameters: obj({ "names!": arr("entry names", str("name")) }),
      run: async (ctx, a) => {
        await ctx.remove(names(a));
        return `deleted ${names(a).length} item(s)`;
      },
    },
    {
      name: "empty_trash",
      description: "Permanently delete everything in the Trash.",
      parameters: noArgs,
      run: async (ctx) => {
        await ctx.emptyTrash();
        return "trash emptied";
      },
    },
  ],
});
