# os-terminal — Svelte 5 / SvelteKit

Native Svelte 5 distribution of the Terminal slice. React/Next remains the
default renderer; explicit SvelteKit installs a native exec shell plus the same
host-injected interactive PTY seam.

```svelte
<script lang="ts">
  import { Terminal } from "@/features/os-terminal";
</script>

<div class="h-[32rem]">
  <Terminal />
</div>
```

With no host wiring the terminal is a writable in-memory demo and supports the
same built-in commands as React. Wire a real filesystem + one-shot shell:

```ts
import { configureTerminal } from "@/features/os-terminal";

configureTerminal({
  mode: "live",
  fs: { list, read, write, mkdir, remove, move, copy },
  exec: { run },
  sys: { stats },
});
```

For a real interactive shell, inject both a byte transport and a VT renderer:

```ts
import { configurePty, createSsePtyTransport } from "@/features/os-terminal";

configurePty({
  transport: createSsePtyTransport(),
  screen: createMyTerminalScreen,
});
```

`configureTerminal()` and `configurePty()` are observable shared seams, so both
React and Svelte surfaces react when a host changes mode/configuration after
mount. PTY transport, screen rendering, filesystem access, and shell execution
remain host-owned; the slice does not bundle xterm.js or a backend.

The Svelte distribution contains no React, Next, Lucide React, or React shadcn
runtime. It intentionally does not export the React/Lucide `osTerminalApp`
appshell descriptor; Svelte hosts mount `Terminal` directly while sharing the
same command dispatcher, mock filesystem, terminal adapter, PTY transport, and
agentic tool collection.
