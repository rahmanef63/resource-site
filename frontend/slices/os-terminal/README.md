# os-terminal

Framework-parity terminal shell with a zero-backend mock mode, injectable live
filesystem/one-shot exec adapter, and an optional injected interactive PTY.
React/Next remains the default renderer; explicit SvelteKit installs native
Svelte 5 UI over the same command, filesystem, adapter, PTY, and agent-tool
semantics.

## React / Next

```tsx
import { Terminal } from "@/features/os-terminal";

export default function Page() {
  return <div className="h-dvh"><Terminal /></div>;
}
```

The React renderer uses the slice's shadcn `Button` controls and `lucide-react`
only for its appshell descriptor. `osTerminalApp` remains a React/Lucide
appshell convenience export.

## SvelteKit

```bash
npx rr add os-terminal --framework sveltekit
```

```svelte
<script lang="ts">
  import { Terminal } from "@/features/os-terminal";
</script>

<div class="h-[32rem]"><Terminal /></div>
```

The Svelte distribution contains no React, Next, Lucide React, or React shadcn
runtime. Svelte hosts mount `Terminal` directly rather than consuming the
React-specific `osTerminalApp` descriptor.

## Mock and live exec

Unwired, both renderers use the same writable in-memory filesystem and built-in
commands. Wire a real host with `configureTerminal({ mode: "live", fs, exec,
sys })`; `ls/cat` read through the adapter, mutations mirror to it, host-truth
commands use `exec.run`, and `neofetch` uses `sys.stats`.

`configureTerminal()` is observable. A mode change after mount now re-renders
both React and Svelte surfaces and resets the working directory to the correct
root (`~` live, `/` mock).

## Interactive PTY

`configurePty({ transport, screen })` injects both sides of an interactive
terminal. The slice still bundles no terminal renderer or server backend.
`createSsePtyTransport()` implements the os-vps POST + SSE wire shape and the
host supplies a `PtyScreen` (for example an xterm.js wrapper).

PTY configuration is observable after mount. If a live PTY fails to open, both
framework renderers surface the error and fall back to basic exec mode rather
than pretending the shell is interactive.

## Agent tools

`osTerminalTools` shares the exact command dispatcher used by the UI. Register
it with your authorized shared agent host; the Svelte distribution ships the
same tool collection but does not invent a framework-specific agent runtime.
