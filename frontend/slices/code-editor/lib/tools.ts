// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Ctx = the live editor state from useEditor().

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import type { useEditor } from "./use-editor";

export type CodeEditorCtx = ReturnType<typeof useEditor>;

const summary = (ctx: CodeEditorCtx): string =>
  `tabs: [${ctx.tabs.join(", ") || "none"}] | active: ${ctx.active ?? "none"} | dirty: ${ctx.dirty} | save: ${ctx.saveState}`;

export const codeEditorTools = defineToolCollection<CodeEditorCtx>({
  namespace: "code-editor",
  describe: summary,
  tools: [
    {
      name: "inspect",
      description: "Read back the editor state: open tabs, active file, dirty flag.",
      parameters: noArgs,
      run: (ctx) => summary(ctx),
    },
    {
      name: "file.open",
      description: "Open a file in a tab (hydrates from the live FS when wired).",
      parameters: obj({ "path!": str("absolute file path") }),
      run: (ctx, a) => {
        ctx.openPath(a.path as string);
        return `opened ${a.path}`;
      },
    },
    {
      name: "file.create",
      description: "Create a new file in a directory and open it.",
      parameters: obj({ "dir!": str("directory path"), "name!": str("file name") }),
      run: (ctx, a) => {
        ctx.create(a.dir as string, a.name as string);
        return `created ${a.dir}/${a.name}`;
      },
    },
    {
      name: "file.read",
      description: "Return the working buffer of an open file (active file when path omitted).",
      parameters: obj({ path: str("open file path") }),
      run: (ctx, a) => {
        const path = (a.path as string) ?? ctx.active;
        if (path == null) return "no active file";
        const text = ctx.buffers[path] ?? ctx.disk[path];
        return text == null ? `"${path}" is not open` : text;
      },
    },
    {
      name: "edit.set",
      description: "Replace the ACTIVE file's buffer with new content (unsaved until file.save).",
      parameters: obj({ "content!": str("full new file content") }),
      run: (ctx, a) => {
        if (ctx.active == null) return "no active file";
        ctx.edit(a.content as string);
        return `buffer of ${ctx.active} replaced (${(a.content as string).length} chars)`;
      },
    },
    {
      name: "edit.replace",
      description: "Find & replace the first occurrence in the ACTIVE file's buffer.",
      parameters: obj({ "find!": str("exact text to find"), "replace!": str("replacement text") }),
      run: (ctx, a) => {
        if (ctx.active == null) return "no active file";
        const cur = ctx.value;
        const find = a.find as string;
        if (!cur.includes(find)) return `"${find}" not found in ${ctx.active}`;
        ctx.edit(cur.replace(find, a.replace as string));
        return `replaced in ${ctx.active}`;
      },
    },
    {
      name: "file.save",
      description: "Save a buffer to disk (active file when path omitted).",
      parameters: obj({ path: str("open file path") }),
      run: async (ctx, a) => {
        await ctx.save((a.path as string) ?? undefined);
        return `saved ${(a.path as string) ?? ctx.active ?? "nothing"}`;
      },
    },
    {
      name: "tab.switch",
      description: "Make an open tab active.",
      parameters: obj({ "path!": str("open file path") }),
      run: (ctx, a) => {
        if (!ctx.tabs.includes(a.path as string)) return `"${a.path}" is not open`;
        ctx.setActive(a.path as string);
        return `active: ${a.path}`;
      },
    },
    {
      name: "tab.close",
      description: "Close an open tab.",
      parameters: obj({ "path!": str("open file path") }),
      run: (ctx, a) => {
        ctx.close(a.path as string);
        return `closed ${a.path}`;
      },
    },
  ],
});
