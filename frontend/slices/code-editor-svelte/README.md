# Code Editor — Svelte 5 / SvelteKit

Native Svelte renderer for the `code-editor` slice. React/Next remains the default distribution.

```bash
npx rr add code-editor --framework sveltekit
```

## Parity

- Explorer tree over the same injectable `CodeFsAdapter` and writable mock filesystem.
- Open tabs, active file, working buffers, dirty state, create/close/switch/save behavior from one shared observable editor core.
- Overlay syntax highlighting, line numbers, caret position, Tab insertion, and Cmd/Ctrl+S.
- `{ path }` payload opening for cross-app handoff.
- Optional `registerTools(collection, ctx)` hook for a host agent; the Svelte install carries no agent runtime itself.

The Svelte distribution depends only on `svelte@^5`. It does not install React, Next, Lucide React, or shadcn runtime dependencies.
