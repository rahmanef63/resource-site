"use client";

/* Applies the active shell's ChromeKit skin to <html> so each OS shell visibly
   skins differently: the TokenPack + MotionProfile CSS vars (radius/glass/font/
   accent/motion — read by window.tsx, appshell.css and globals.css) plus a
   `data-shell` attribute so stylesheets can scope per-OS rules
   ([data-shell="macos"] …). The effect cleanup removes exactly what it set
   (React runs it before the next apply), so switching shells never leaks the
   previous skin — no stale Segoe lingering after going back to macOS. */
import { useEffect } from "react";
import type { ShellId } from "../registry/shells";
import { getChromeKit, tokenPackToVars } from "../registry/chrome-kit";

export function useShellTokens(shellId: ShellId): void {
  useEffect(() => {
    const root = document.documentElement;
    const kit = getChromeKit(shellId);
    const vars = tokenPackToVars(kit?.tokens ?? {}, kit?.motion);

    root.dataset.shell = shellId;
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);

    return () => {
      delete root.dataset.shell;
      for (const key of Object.keys(vars)) root.style.removeProperty(key);
    };
  }, [shellId]);
}
