// Slice config (rr: frontend.configExport = "codeEditorConfig").
export type CodeEditorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const codeEditorConfig: CodeEditorConfig = {
  slug: "code-editor",
  title: "Code — overlay syntax editor",
  category: "os",
};

export default codeEditorConfig;
