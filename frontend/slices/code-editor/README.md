# code-editor — Code (overlay syntax editor)

Lightweight code editor:

- **Surface** — transparent `<textarea>` over a highlighted `<pre>` (regex
  tokenizer for JS/TS/JSON/CSS), line-number gutter, Ln/Col tracking.
- **Tabs** — dirty dots, middle-area switching, Cmd/Ctrl+S save.
- **Explorer** — lazy per-directory tree (fetch on expand) with inline
  new-file / new-folder; rail on desktop, Sheet on mobile.
- **New file** — responsive form: centered dialog ⇄ bottom drawer.
- **Status bar** — path, Ln/Col, tab size, language, save state.

## Two ways to mount

```tsx
import { CodeEditor } from "@/features/code-editor";

// 1) Seeded sample tree (writable in-memory mock — zero wiring)
<CodeEditor />

// 2) Open a specific file
<CodeEditor payload={{ path: "/Projects/hello.ts" }} />
```

Or hand `codeEditorApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureCodeFs } from "@/features/code-editor";

// Swap the mock for a real backend. Same four calls the tree + editor use:
configureCodeFs({
  list:  (path) => fetch(`/api/fs/list?path=${encodeURIComponent(path)}`).then((r) => r.json()),
  read:  (path) => fetch(`/api/fs/read?path=${encodeURIComponent(path)}`).then((r) => r.text()),
  write: (path, content) => fetch(`/api/fs/write`, { method: "POST", body: JSON.stringify({ path, content }) }),
  mkdir: (path) => fetch(`/api/fs/mkdir`, { method: "POST", body: JSON.stringify({ path }) }),
});
```

Writes are best-effort: a read-only host flags the save in the status bar but
keeps the local buffer. Everything else in the slice imports ONLY this seam.
