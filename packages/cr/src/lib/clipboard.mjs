// Best-effort clipboard write — try platform tools, silently fall back to noop.
// No external dep; we spawn whatever the OS already has.

import { spawn } from "node:child_process";

const CANDIDATES = [
  { cmd: "pbcopy", args: [] },              // macOS
  { cmd: "wl-copy", args: [] },             // Wayland
  { cmd: "xclip", args: ["-selection", "clipboard"] }, // X11
  { cmd: "xsel", args: ["--clipboard", "--input"] },   // X11 fallback
  { cmd: "clip.exe", args: [] },            // WSL/Windows
];

export async function tryCopy(text) {
  for (const { cmd, args } of CANDIDATES) {
    const ok = await spawnAndWrite(cmd, args, text);
    if (ok) return cmd;
  }
  return null;
}

function spawnAndWrite(cmd, args, text) {
  return new Promise((resolve) => {
    let proc;
    try {
      proc = spawn(cmd, args, { stdio: ["pipe", "ignore", "ignore"] });
    } catch {
      return resolve(false);
    }
    proc.on("error", () => resolve(false));
    proc.on("exit", (code) => resolve(code === 0));
    try {
      proc.stdin.end(text);
    } catch {
      resolve(false);
    }
  });
}
