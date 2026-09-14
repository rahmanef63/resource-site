import { streamUrl } from "./host-core";

function headerEnd(bytes: Uint8Array, from: number): number {
  for (let i = from; i + 3 < bytes.length; i += 1) {
    if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) return i;
  }
  return -1;
}

export function startScreencast(opts: {
  consumer: string;
  isCurrent: () => boolean;
  setLive: (live: boolean) => void;
  setFrame: (blob: Blob) => void;
}): () => void {
  const url = streamUrl(opts.consumer);
  if (!url) {
    opts.setLive(false);
    return () => {};
  }

  let stopped = false;
  let ctrl: AbortController | null = null;

  async function consume(): Promise<void> {
    ctrl = new AbortController();
    const res = await fetch(url!, { signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
    opts.setLive(true);
    const reader = res.body.getReader();
    let buf = new Uint8Array(0);
    while (!stopped) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const merged = new Uint8Array(buf.length + value.length);
      merged.set(buf);
      merged.set(value, buf.length);
      buf = merged;
      for (;;) {
        const end = headerEnd(buf, 0);
        if (end < 0) break;
        const head = new TextDecoder().decode(buf.subarray(0, end));
        const match = head.match(/content-length:\s*(\d+)/i);
        if (!match) {
          buf = buf.subarray(end + 4);
          continue;
        }
        const len = Number(match[1]);
        const start = end + 4;
        if (buf.length < start + len) break;
        if (opts.isCurrent()) opts.setFrame(new Blob([buf.subarray(start, start + len)], { type: "image/jpeg" }));
        buf = buf.subarray(start + len + 2);
      }
    }
  }

  void (async () => {
    while (!stopped) {
      try {
        await consume();
      } catch {
        // polling fallback remains active
      }
      opts.setLive(false);
      if (!stopped) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  })();

  return () => {
    stopped = true;
    ctrl?.abort();
    opts.setLive(false);
  };
}
