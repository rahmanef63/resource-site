"use client";

// PTY seam for the rr catalog copy. The slice ships NO byte transport and NO
// terminal renderer — both are injected by the host via configurePty(); until
// then app.tsx hides the PTY surface entirely and the exec emulator stays the
// default (mock preview works fully offline). createSsePtyTransport() is a
// ready-made transport for an os-vps-style backend: POST open/input/resize/
// close + SSE stream (EventSource auto-reconnect + Last-Event-ID resume),
// keystrokes batched into serialized POSTs so ordering survives.

export type PtyStatus =
  | { kind: "connecting" }
  | { kind: "live" }
  | { kind: "exited"; code: number | null }
  | { kind: "error"; message: string };

export type PtyHandle = {
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  /** Detach the stream AND kill the server-side shell. */
  dispose: () => void;
};

export type PtyOpenOpts = {
  cols: number;
  rows: number;
  onData: (bytes: Uint8Array) => void;
  onStatus: (s: PtyStatus) => void;
};

export type PtyTransport = (opts: PtyOpenOpts) => Promise<PtyHandle>;

/** Host-injected VT renderer (e.g. xterm.js) mounted into `el`. */
export type PtyScreen = {
  cols: number;
  rows: number;
  write: (bytes: Uint8Array) => void;
  /** Keystrokes from the screen (merge xterm's onData + onBinary here). */
  onData: (cb: (data: string) => void) => void;
  /** Refit to the container; cols/rows must reflect the new geometry. */
  fit: () => void;
  focus: () => void;
  dispose: () => void;
};
export type PtyScreenFactory = (el: HTMLElement) => Promise<PtyScreen>;

export type PtyConfig = { transport: PtyTransport; screen: PtyScreenFactory };

let config: PtyConfig | null = null;

/** Host wiring: inject a transport + renderer; pass null to revert to exec-only. */
export function configurePty(cfg: PtyConfig | null): void {
  config = cfg;
}

/** app.tsx only offers the PTY surface when a host wired one. */
export function hasPty(): boolean {
  return config !== null;
}

// Throws (with a curated message) when the session can't open — the caller
// falls back to the legacy exec terminal on that path.
export function startPty(opts: PtyOpenOpts): Promise<PtyHandle> {
  if (!config) throw new Error("no PTY transport configured (configurePty)");
  return config.transport(opts);
}

export function createPtyScreen(el: HTMLElement): Promise<PtyScreen> {
  if (!config) throw new Error("no PTY screen configured (configurePty)");
  return config.screen(el);
}

// ── SSE transport (os-vps /api/v1/term wire shape) ─────────────────────────

// base64 → bytes. The screen takes Uint8Array, so raw VT bytes pass through
// without the split-codepoint hazards a streaming TextDecoder would invite.
function b64Bytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function createSsePtyTransport(base = "/api/v1/term"): PtyTransport {
  const post = (path: string, body: unknown, keepalive = false): Promise<Response> =>
    fetch(`${base}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive,
    });

  return async ({ cols, rows, onData, onStatus }) => {
    onStatus({ kind: "connecting" });

    let res: Response;
    try {
      res = await post("open", { cols, rows });
    } catch {
      throw new Error("network error opening the terminal");
    }
    if (!res.ok) {
      let msg = `terminal open failed (${res.status})`;
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        /* non-JSON error body */
      }
      throw new Error(msg);
    }
    const { id } = (await res.json()) as { id: string };

    let disposed = false;
    const es = new EventSource(`${base}/stream?id=${encodeURIComponent(id)}`);
    es.onopen = () => {
      if (!disposed) onStatus({ kind: "live" });
    };
    es.addEventListener("data", (e) => {
      if (!disposed) onData(b64Bytes((e as MessageEvent<string>).data));
    });
    es.addEventListener("exit", (e) => {
      es.close();
      if (disposed) return;
      const code = parseInt((e as MessageEvent<string>).data, 10);
      onStatus({ kind: "exited", code: Number.isNaN(code) ? null : code });
    });
    es.onerror = () => {
      if (disposed) return;
      // CONNECTING = the browser is auto-retrying (resume makes it seamless);
      // CLOSED = fatal (session gone after a server restart, or auth lost).
      if (es.readyState === EventSource.CLOSED)
        onStatus({ kind: "error", message: "stream disconnected" });
      else onStatus({ kind: "connecting" });
    };

    // Keystroke batching: coalesce whatever arrives while a POST is in flight,
    // and never overlap requests (overlap could reorder keystrokes).
    let queue = "";
    let flushing = false;
    const flush = async () => {
      flushing = true;
      while (queue && !disposed) {
        const data = queue;
        queue = "";
        try {
          await post("input", { id, data });
        } catch {
          /* transient network error — drop the batch, the shell stays coherent */
        }
      }
      flushing = false;
    };

    return {
      write(data) {
        queue += data;
        if (!flushing) void flush();
      },
      resize(cols2, rows2) {
        if (!disposed) void post("resize", { id, cols: cols2, rows: rows2 });
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        es.close();
        void post("close", { id }, true); // keepalive: survives unmount/nav
      },
    };
  };
}
