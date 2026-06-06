"use client";

import { CodeEditor } from "@/features/code-editor";

// Live preview: the overlay syntax editor on its writable in-memory mock fs.
//  • Explorer (left rail / mobile Sheet) lazy-lists each dir on expand;
//    inline + buttons create files/folders in the mock tree.
//  • Tabs show dirty dots; Cmd/Ctrl+S saves (status bar flags the state).
//  • Highlighting: regex tokenizer for ts/js/json/css.
//  • Real backend: configureCodeFs({ list, read, write, mkdir }).

export default function CodeEditorPreview() {
  return (
    <div className="h-dvh w-full">
      <CodeEditor />
    </div>
  );
}
