import { SquareTerminal } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <Terminal /> — mount the shell emulator directly. With no wiring it
//      runs entirely on its in-memory FsModel (mock mode).
//   2. `osTerminalApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as Terminal } from "./app";

export const osTerminalApp: AppDescriptor = {
  id: "os-terminal",
  title: "Terminal",
  icon: SquareTerminal,
  gradient: "linear-gradient(160deg,#3a3a40,#111114)",
  load: () => import("./app"),
  defaultSize: { w: 640, h: 400 },
};

// Host wiring seam (real fs + one-shot exec; flips ls/cat/mutations live).
export { configureTerminal } from "./lib/host";
export type { TerminalOsApi, FsEntry, FsList, ExecResult, AppDescriptor } from "./lib/host";

export { osTerminalConfig } from "./config";
export type { OsTerminalConfig } from "./config";
