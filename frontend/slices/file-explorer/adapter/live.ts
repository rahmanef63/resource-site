import type {
  FileExplorerAdapter,
  FsList,
  FsUsage,
  UploadResult,
} from "./types";

export type LiveAdapterOptions = {
  /** REST base, e.g. "/api/v1/fs" or "https://host/api/v1/fs". */
  baseUrl: string;
  /** Optional per-request headers (auth token, etc.); awaited each call. */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  /** "readonly" surfaces an inline notice on mutations instead of writing. */
  mode?: "live" | "readonly";
};

// REST FileExplorerAdapter — talks to a host filesystem gateway shaped like the
// os-vps `/api/v1/fs` contract (list/mkdir/remove/move/copy/upload/usage/raw).
// Swap in via lib/backend.ts (FILE_EXPLORER_BACKEND = "live"). Paths are sent
// as-is; the server resolves "~". Endpoints:
//   GET  /list?path=…            -> FsList
//   POST /mkdir   { path }
//   POST /remove  { path }
//   POST /move    { from, to }
//   POST /copy    { from, to }
//   POST /write   { path, content }
//   POST /upload  (multipart: dest + files[])  -> UploadResult
//   GET  /usage                  -> FsUsage
//   GET  /raw?path=…             (bytes for thumbnails)
export function createLiveAdapter(opts: LiveAdapterOptions): FileExplorerAdapter {
  const base = opts.baseUrl.replace(/\/$/, "");
  const q = (p: string) => `?path=${encodeURIComponent(p)}`;

  async function req<T>(path: string, init?: RequestInit): Promise<T> {
    const extra = opts.headers ? await opts.headers() : {};
    const res = await fetch(base + path, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...extra,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new Error(`fs ${res.status}: ${detail}`);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const post = (path: string, body: unknown) =>
    req(path, { method: "POST", body: JSON.stringify(body) });

  return {
    mode: opts.mode ?? "live",
    list: (path) => req<FsList>(`/list${q(path)}`),
    mkdir: (path) => post("/mkdir", { path }),
    remove: (path) => post("/remove", { path }),
    move: (from, to) => post("/move", { from, to }),
    copy: (from, to) => post("/copy", { from, to }),
    write: (path, content) => post("/write", { path, content }),
    usage: () => req<FsUsage>("/usage"),
    rawUrl: (path) => `${base}/raw${q(path)}`,
    upload: async (dest, files) => {
      const fd = new FormData();
      fd.set("dest", dest);
      for (const f of files) fd.append("files", f.file, f.relPath);
      const extra = opts.headers ? await opts.headers() : {};
      const res = await fetch(`${base}/upload`, {
        method: "POST",
        headers: extra,
        body: fd,
      });
      if (!res.ok) throw new Error(`fs upload ${res.status}`);
      return (await res.json()) as UploadResult;
    },
  };
}
