import { Code2 } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <CodeEditor /> — mount the editor directly (standalone page/route);
//      pass payload={{ path }} to open a specific file.
//   2. `codeEditorApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as CodeEditor } from "./app";

export const codeEditorApp: AppDescriptor = {
  id: "code-editor",
  title: "Code",
  icon: Code2,
  gradient: "linear-gradient(160deg,#ff5f8f,#b5179e)",
  load: () => import("./app"),
  defaultSize: { w: 820, h: 560 },
};

// Host wiring seam (filesystem for the explorer tree + open/save).
export { configureCodeFs } from "./lib/host";
export type { CodeFsAdapter, FsEntry, FsList, AppDescriptor, AppProps } from "./lib/host";
export { createMockFs } from "./lib/mock-fs";

export { codeEditorConfig } from "./config";
export type { CodeEditorConfig } from "./config";

// Agentic tool collection — the slice is not an agent; register this
// with a host agent (one agent, many slices) via @/shared/agentic.
export { codeEditorTools } from "./lib/tools";
export type { CodeEditorCtx } from "./lib/tools";
