# code-editor — Code (overlay syntax editor)

Framework-parity lightweight editor over one observable editor/filesystem core.
React/Next remains the default renderer; Svelte 5/SvelteKit is additive.

## Install

```bash
npx rr add code-editor
npx rr add code-editor --framework sveltekit
```

Both distributions share:

- `CodeFsAdapter` (`list/read/write/mkdir`) + `configureCodeFs()` host wiring.
- Writable seeded mock filesystem for zero-backend demos.
- Observable editor core: tabs, active file, buffers, disk snapshot, dirty/save state, create/open/close/save.
- Dependency-free syntax highlighter + path/language helpers.
- Framework-neutral `codeEditorTools` collection.

React additionally keeps the appshell inspector seam, Lucide/shadcn chrome, and automatic `useAgentTools` registration. The Svelte renderer carries no React/Lucide/shadcn/agent runtime and exposes an optional `registerTools(collection, ctx)` host hook instead.

## React / Next

```tsx
import { CodeEditor } from "@/features/code-editor";

<CodeEditor />
<CodeEditor payload={{ path: "/Projects/hello.ts" }} />
```

Or register `codeEditorApp` in an appshell-style launcher.

## SvelteKit

```svelte
<script lang="ts">
  import { CodeEditor } from "@/features/code-editor";
</script>

<div class="h-[640px]">
  <CodeEditor payload={{ path: "/Documents/roadmap.md" }} />
</div>
```

The native Svelte surface includes lazy explorer, tabs/dirty state, overlay highlighting, line numbers/caret position, Tab insertion, Cmd/Ctrl+S, create-file dialog, and save status.

## Host filesystem

```ts
import { configureCodeFs } from "@/features/code-editor";

configureCodeFs({
  list: (path) => fetch(`/api/fs/list?path=${encodeURIComponent(path)}`).then((r) => r.json()),
  read: (path) => fetch(`/api/fs/read?path=${encodeURIComponent(path)}`).then((r) => r.text()),
  write: (path, content) => fetch(`/api/fs/write`, {
    method: "POST",
    body: JSON.stringify({ path, content }),
  }),
  mkdir: (path) => fetch(`/api/fs/mkdir`, {
    method: "POST",
    body: JSON.stringify({ path }),
  }),
});
```

Writes are best-effort. If the remote host rejects a write, the editor keeps the local buffer/disk state and surfaces the remote save failure.
