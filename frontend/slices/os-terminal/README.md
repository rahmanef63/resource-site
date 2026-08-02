# os-terminal — shell emulator with live passthrough + PTY seam

React-DOM terminal: glass monospace look, colored prompt, arrow-key history,
red stderr, LIVE/MOCK mode banner. Built-ins run on an in-memory FsModel —
zero backend:

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

## Going live (`configureTerminal`)

```ts
import { configureTerminal } from "@/features/os-terminal";

configureTerminal({
  mode: "live",
  fs: { list, read, write, mkdir, remove, move, copy },  // your fs API
  exec: { run: (cmd, cwd) => post("/api/exec", { cmd, cwd }) },
  // → { stdout, stderr, code }
  sys: { stats },  // bytes + ms — feeds `neofetch`
});
```

In live mode `ls`/`cat` read through your fs (errors surface honestly), file
mutations mirror to it, host-truth commands (`df`/`ps`/`whoami`/`uname`/
`date`) and **any unknown command** pass through `exec.run` as a one-shot
shell call. Treat that endpoint like SSH — auth it accordingly.

## Real interactive PTY (`configurePty`, optional)

One-shot exec can't run vim/top/ssh. Inject a byte transport + VT renderer
and live mode swaps in a real PTY surface (with a touch key bar — Esc/Tab/
sticky Ctrl·Alt/arrows/^C…/paste — for soft keyboards). The renderer stays in
YOUR app, so the slice adds no xterm dependency:

```ts
import { configurePty, createSsePtyTransport } from "@/features/os-terminal";

configurePty({
  // os-vps wire shape: POST {base}/open|input|resize|close + SSE {base}/stream
  transport: createSsePtyTransport("/api/v1/term"),
  screen: async (el) => {
    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
    ]);
    const term = new Terminal({ cursorBlink: true, scrollback: 5000 });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(el);
    return {
      get cols() { return term.cols; },
      get rows() { return term.rows; },
      write: (b) => term.write(b),
      onData: (cb) => { term.onData(cb); term.onBinary(cb); },
      fit: () => fit.fit(),
      focus: () => term.focus(),
      dispose: () => term.dispose(),
    };
  },
});
```

Not configured → the PTY surface stays hidden and live mode keeps the exec
terminal; if the PTY fails to open, the app shows why and falls back.

## Agentic tools (`osTerminalTools`)

The slice is not an agent — `lib/tools.ts` exports a tool collection
(`os-terminal.run` / `.cwd` / `.clear`) for the shared agent kit
(`@/shared/agentic`); register it with your host agent so one agent drives
many slices.
