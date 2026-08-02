"use client";
// audit-allow-hex: same terminal glass palette as the exec emulator.

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  startPty,
  createPtyScreen,
  type PtyHandle,
  type PtyScreen,
  type PtyStatus,
} from "../lib/use-pty";
import KeyBar, { type KeyInterceptor } from "./key-bar";

// Real interactive shell surface. Both the VT renderer (xterm.js or any
// PtyScreen) and the byte transport are host-injected via configurePty — the
// slice itself ships zero terminal deps. `gen` bumps re-run the whole effect
// for a fresh session (Restart). Any open failure funnels to onFallback so
// live never regresses below the exec emulator.
export default function PtyTerminal({ onFallback }: { onFallback: (msg: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PtyStatus>({ kind: "connecting" });
  const [gen, setGen] = useState(0);
  // Live PTY handle + key-bar hooks. The handle ref lets the touch key bar
  // write outside the effect; the interceptor lets its sticky Ctrl/Alt modify
  // the next soft-keyboard char (KeyBar sets it while a modifier is armed).
  const handleRef = useRef<PtyHandle | null>(null);
  const interceptRef = useRef<KeyInterceptor | null>(null);
  const onFallbackRef = useRef(onFallback);
  useEffect(() => {
    onFallbackRef.current = onFallback;
  });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let disposed = false;
    let screen: PtyScreen | null = null;
    let handle: PtyHandle | null = null;
    let ro: ResizeObserver | null = null;
    let resizeT: ReturnType<typeof setTimeout> | undefined;
    setStatus({ kind: "connecting" });

    const fail = (e: unknown) => {
      if (disposed) return;
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ kind: "error", message: msg });
      onFallbackRef.current(msg); // app.tsx swaps in the exec terminal
    };

    (async () => {
      try {
        screen = await createPtyScreen(el); // host factory (e.g. xterm.js)
      } catch (e) {
        fail(e);
        return;
      }
      if (disposed) {
        screen.dispose();
        return;
      }
      screen.fit();
      try {
        handle = await startPty({
          cols: screen.cols,
          rows: screen.rows,
          onData: (bytes) => screen?.write(bytes),
          onStatus: (s) => {
            if (!disposed) setStatus(s);
          },
        });
      } catch (e) {
        fail(e);
        return;
      }
      if (disposed) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
      screen.onData((d) => handle?.write(interceptRef.current ? interceptRef.current(d) : d));
      ro = new ResizeObserver(() => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => {
          if (!screen || !handle) return;
          screen.fit();
          handle.resize(screen.cols, screen.rows);
        }, 80);
      });
      ro.observe(el);
      screen.focus();
    })();

    return () => {
      disposed = true;
      clearTimeout(resizeT);
      ro?.disconnect();
      handleRef.current = null;
      handle?.dispose(); // kills the server-side shell too
      screen?.dispose();
    };
  }, [gen]);

  // `@container` so the key bar's @max-md variant tracks the PANE width
  // (compact window), not the viewport. Root padding already absorbs
  // --sai-bottom, so the key bar sits above the home bar without re-padding.
  return (
    <div className="@container flex h-full w-full flex-col bg-[#0d0e12] [padding-bottom:var(--sai-bottom,0px)]">
      <StatusBar
        status={status}
        onRestart={() => setGen((g) => g + 1)}
        onBasic={() => onFallbackRef.current(statusLabel(status))}
      />
      <div className="min-h-0 flex-1 p-1.5">
        <div ref={hostRef} className="h-full w-full" />
      </div>
      <KeyBar sendInput={(d) => handleRef.current?.write(d)} interceptRef={interceptRef} />
    </div>
  );
}

function statusLabel(s: PtyStatus): string {
  if (s.kind === "exited") return `shell exited${s.code !== null ? ` (code ${s.code})` : ""}`;
  if (s.kind === "error") return s.message;
  return s.kind;
}

const BAR_BTN =
  "h-auto rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-inherit hover:bg-white/25 hover:text-inherit";

// Slim banner in the same visual language as the exec terminal's mode banner.
function StatusBar({
  status,
  onRestart,
  onBasic,
}: {
  status: PtyStatus;
  onRestart: () => void;
  onBasic: () => void;
}) {
  const base = "flex select-none items-center gap-2 px-2 py-1 text-[11px] font-semibold";
  if (status.kind === "live")
    return (
      <div className={base} style={{ color: "#0d0e12", background: "#5be0c8" }}>
        ● LIVE PTY — interactive shell on this host
      </div>
    );
  if (status.kind === "connecting")
    return (
      <div className={base} style={{ color: "#0d0e12", background: "#f5c451" }}>
        ● connecting to the host shell…
      </div>
    );
  return (
    <div
      className={base}
      style={
        status.kind === "exited"
          ? { color: "#dfe3ea", background: "#3a3f4d" }
          : { color: "#fff", background: "#a14545" }
      }
    >
      <span className="min-w-0 flex-1 truncate">○ {statusLabel(status)}</span>
      <Button type="button" variant="ghost" onClick={onRestart} className={BAR_BTN}>
        Restart
      </Button>
      <Button type="button" variant="ghost" onClick={onBasic} className={BAR_BTN}>
        Basic mode
      </Button>
    </div>
  );
}
