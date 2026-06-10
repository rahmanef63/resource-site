# os-terminal changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `osTerminalTools` exports 3
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(osTerminalTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Merged the os-vps split: app.tsx is now a thin mode switch over
  `components/exec-terminal.tsx` (React-DOM emulator) and
  `components/pty-terminal.tsx` (real interactive PTY surface).
- Honest live mode: `ls`/`cd`/`cat` surface real adapter errors (no silent
  mock fallback), host-truth commands (df/ps/whoami/uname/date) and unknown
  commands pass through `exec.run`, `neofetch` renders real `sys.stats`
  (new `sys` surface on `TerminalOsApi` + `fmtGiBPair`/`fmtUptime`).
- Mode banner (LIVE/MOCK) + runtime mode-flip announcement; live cwd starts
  at `~`. Fs mutations split to `lib/commands-fs.ts` (200-LOC gate).
- New PTY seam (`lib/use-pty.ts`): `configurePty({ transport, screen })`
  injects a byte transport + VT renderer (e.g. xterm.js — stays in the host,
  zero new slice deps). `createSsePtyTransport()` ships the os-vps
  `/api/v1/term` SSE wire shape. Hidden when not configured — the exec
  emulator stays the offline default.
- Touch key bar (`components/key-bar.tsx`): Esc/Tab/sticky Ctrl·Alt/arrows/
  chords/paste for soft keyboards (shadcn Button, container-query visibility).
- Self-contained default OsApi moved to `lib/host-mock.ts`: mock fs ops run
  on the slice's FsModel seed (singleton, shared with the emulator).

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `TerminalOsApi` (fs surface + one-shot exec) — mock mode runs
  entirely on the slice's in-memory FsModel; inspector bus inert.
