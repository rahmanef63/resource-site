// Slice config (rr: frontend.configExport = "codeEditorConfig").
export type CodeEditorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Spaces per tab in the editing surface + status bar. */
  tabSize: number;
  /** File the editor opens when mounted without a payload. */
  defaultFile: string;
};

export const codeEditorConfig: CodeEditorConfig = {
  slug: "code-editor",
  title: "Code — overlay syntax editor",
  category: "os",
  tabSize: 2,
  defaultFile: "/Projects/hello.ts",
};

export default codeEditorConfig;
