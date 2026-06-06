# os-terminal — shell emulator with live passthrough

React-DOM terminal: glass monospace look, colored prompt, arrow-key history,
red stderr. Built-ins run on an in-memory FsModel — zero backend:

```
Files:  ls · cd · pwd · cat · mkdir · touch · rm [-r] · mv · cp
System: clear · echo · whoami · date · uname · df · ps · neofetch · help
```

## Mount

```tsx
import { Terminal } from "@/features/os-terminal";

<div className="h-96"><Terminal /></div>   // mock mode, fully offline
```

Or hand `osTerminalApp` (lazy `load`) to an appshell-style launcher.

## Going live (`lib/host.ts`)

```ts
import { configureTerminal } from "@/features/os-terminal";

configureTerminal({
  mode: "live",
  fs: { list, read, write, mkdir, remove, move, copy },  // your fs API
  exec: { run: (cmd, cwd) => post("/api/exec", { cmd, cwd }) },
  // → { stdout, stderr, code }
});
```

In live mode `ls`/`cat` read through your fs, file mutations mirror to it,
and **any unknown command** passes through `exec.run` as a one-shot shell
call. Treat that endpoint like SSH — auth it accordingly.
