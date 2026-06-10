"use client";
// audit-allow-hex: terminal glass chrome palette is the slice's design, not themable tokens.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOsApi } from "./lib/host";
import { hasPty } from "./lib/use-pty";
import ExecTerminal from "./components/exec-terminal";
import PtyTerminal from "./components/pty-terminal";

// Terminal entry: LIVE mode + a host-wired PTY (configurePty) gets the real
// interactive surface; mock/demo — and live hosts that only wired
// configureTerminal — keep the simulated/exec shell. If the PTY can't open
// (transport error, session cap…) we show why and fall back to the one-shot
// exec terminal so live never regresses below the basic behaviour.
export default function TerminalApp() {
  const api = useOsApi();
  const [ptyError, setPtyError] = useState<string | null>(null);
  // A mode flip (configureTerminal at runtime) re-arms the PTY attempt
  // (render-time state adjustment — the React "derive from prop change" pattern).
  const [prevMode, setPrevMode] = useState(api.mode);
  if (prevMode !== api.mode) {
    setPrevMode(api.mode);
    setPtyError(null);
  }

  if (api.mode === "live" && hasPty() && ptyError === null)
    return <PtyTerminal onFallback={setPtyError} />;

  return (
    <div className="flex h-full w-full flex-col">
      {api.mode === "live" && hasPty() && ptyError !== null && (
        <div
          className="flex select-none items-center gap-2 px-2 py-1 text-[11px] font-semibold"
          style={{ color: "#fff", background: "#a14545" }}
        >
          <span className="min-w-0 flex-1 truncate">
            PTY unavailable: {ptyError} — basic exec mode
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPtyError(null)}
            className="h-auto rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-inherit hover:bg-white/25 hover:text-inherit"
          >
            Retry PTY
          </Button>
        </div>
      )}
      <div className="min-h-0 flex-1">
        <ExecTerminal />
      </div>
    </div>
  );
}
