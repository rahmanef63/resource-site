import { SquareTerminal } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Three ways in:
//   1. <Terminal /> — mount the shell emulator directly. With no wiring it
//      runs entirely on its in-memory FsModel (mock mode).
//   2. `osTerminalApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
//   3. configureTerminal(...) [+ configurePty(...)] — live fs/exec backend,
//      and optionally a real interactive PTY (renderer + transport injected).
export { default as Terminal } from "./app";

export const osTerminalApp: AppDescriptor = {
  id: "os-terminal",
  title: "Terminal",
  icon: SquareTerminal,
  gradient: "linear-gradient(160deg,#3a3a40,#111114)",
  load: () => import("./app"),
  defaultSize: { w: 640, h: 400 },
};

// Host wiring seam (real fs + one-shot exec + sys stats; flips the slice live).
export { configureTerminal } from "./lib/host";
export type {
  TerminalOsApi,
  SysStats,
  FsEntry,
  FsList,
  ExecResult,
  AppDescriptor,
} from "./lib/host";

// PTY seam: inject a transport + VT renderer to unlock the interactive shell
// (live mode only). createSsePtyTransport speaks the os-vps /api/v1/term shape.
export { configurePty, createSsePtyTransport } from "./lib/use-pty";
export type {
  PtyConfig,
  PtyTransport,
  PtyHandle,
  PtyStatus,
  PtyScreen,
  PtyScreenFactory,
  PtyOpenOpts,
} from "./lib/use-pty";

export { osTerminalConfig } from "./config";
export type { OsTerminalConfig } from "./config";

// Agentic tool collection — the slice is not an agent; register this
// with a host agent (one agent, many slices) via @/shared/agentic.
export { osTerminalTools } from "./lib/tools";
export type { TerminalCtx } from "./lib/tools";
