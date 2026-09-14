// Framework-neutral function-calling collection. The slice is not an agent;
// hosts may bind this collection to any live CodeEditorContext.

import type { CodeEditorContext } from "./editor-core";

export type CodeEditorCtx = CodeEditorContext;

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const schema = (properties: Record<string, unknown>, required: string[] = []): ToolParams => ({
  type: "object", properties, required, additionalProperties: false,
});
const text = (description: string) => ({ type: "string", description });
const summary = (ctx: CodeEditorCtx) =>
  `tabs: [${ctx.tabs.join(", ") || "none"}] | active: ${ctx.active ?? "none"} | dirty: ${ctx.dirty} | save: ${ctx.saveState}`;

export const codeEditorTools = {
  namespace: "code-editor",
  instructions:
    "Edits code in the workspace. inspect or file.open before editing; edit.set/replace change the buffer, file.save persists. Read a file before replacing in it.",
  describe: summary,
  tools: [
    { name: "inspect", description: "Read back the editor state: open tabs, active file, dirty flag.", parameters: schema({}), run: (ctx: CodeEditorCtx) => summary(ctx) },
    { name: "file.open", description: "Open a file in a tab (hydrates from the live FS when wired).", parameters: schema({ path: text("absolute file path") }, ["path"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { ctx.openPath(String(a.path)); return `opened ${String(a.path)}`; } },
    { name: "file.create", description: "Create a new file in a directory and open it.", parameters: schema({ dir: text("directory path"), name: text("file name") }, ["dir", "name"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { ctx.create(String(a.dir), String(a.name)); return `created ${String(a.dir)}/${String(a.name)}`; } },
    { name: "file.read", description: "Return the working buffer of an open file (active file when path omitted).", parameters: schema({ path: text("open file path") }), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { const p = a.path ? String(a.path) : ctx.active; if (p == null) return "no active file"; const body = ctx.buffers[p] ?? ctx.disk[p]; return body == null ? `"${p}" is not open` : body; } },
    { name: "edit.set", description: "Replace the ACTIVE file's buffer with new content (unsaved until file.save).", parameters: schema({ content: text("full new file content") }, ["content"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { if (ctx.active == null) return "no active file"; const content = String(a.content); ctx.edit(content); return `buffer of ${ctx.active} replaced (${content.length} chars)`; } },
    { name: "edit.replace", description: "Find & replace the first occurrence in the ACTIVE file's buffer.", parameters: schema({ find: text("exact text to find"), replace: text("replacement text") }, ["find", "replace"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { if (ctx.active == null) return "no active file"; const find = String(a.find); if (!ctx.value.includes(find)) return `"${find}" not found in ${ctx.active}`; ctx.edit(ctx.value.replace(find, String(a.replace))); return `replaced in ${ctx.active}`; } },
    { name: "file.save", description: "Save a buffer to disk (active file when path omitted).", parameters: schema({ path: text("open file path") }), run: async (ctx: CodeEditorCtx, a: Record<string, unknown>) => { const p = a.path ? String(a.path) : undefined; await ctx.save(p); return `saved ${p ?? ctx.active ?? "nothing"}`; } },
    { name: "tab.switch", description: "Make an open tab active.", parameters: schema({ path: text("open file path") }, ["path"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { const p = String(a.path); if (!ctx.tabs.includes(p)) return `"${p}" is not open`; ctx.setActive(p); return `active: ${p}`; } },
    { name: "tab.close", description: "Close an open tab.", parameters: schema({ path: text("open file path") }, ["path"]), run: (ctx: CodeEditorCtx, a: Record<string, unknown>) => { const p = String(a.path); ctx.close(p); return `closed ${p}`; } },
  ],
};
