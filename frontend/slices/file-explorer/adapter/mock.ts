import type { FileExplorerAdapter } from "./types";
import {
  GiB,
  MOCK_ROOTS,
  baseOf,
  dir,
  dropSubtree,
  entryIn,
  extOf,
  file,
  join,
  norm,
  parentOf,
  seedTree,
  transfer,
  type Tree,
} from "./mock-tree";
import { seedBlobs, type MockBlob, type MockBlobs } from "./mock-blobs";

const delay = <T,>(v: T, ms = 140): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms + Math.random() * 100));

// Don't retain bytes for very large mock uploads — the mock is in-memory, so a
// 500 MB video would pin the tab's heap. Above the cap the file lists/edits but
// has no preview/download (real backend has no such limit).
const MAX_BLOB = 64 * 1024 * 1024;

const TEXT_EXT = new Set(["txt", "md", "markdown", "json", "csv", "log", "ts", "tsx", "js", "jsx", "css", "html", "sh", "yml", "yaml", "xml", "svg"]);
const isTextLike = (mime: string, ext: string) =>
  mime.startsWith("text/") || mime === "application/json" || TEXT_EXT.has(ext);

const revoke = (b?: MockBlob) => { if (b?.url?.startsWith("blob:")) URL.revokeObjectURL(b.url); };

// Move/copy/delete the blob bytes alongside the tree so preview + download stay
// correct after rename/move (blobs keyed by absolute path). Copy mints a fresh
// object URL from the shared Blob so each key revokes independently.
function remapBlobs(b: MockBlobs, from: string, to: string, mode: "move" | "copy") {
  from = norm(from);
  to = norm(to);
  for (const k of Object.keys(b)) {
    if (k !== from && !k.startsWith(from + "/")) continue;
    const nk = to + k.slice(from.length);
    if (nk !== k) revoke(b[nk]); // free a blob being overwritten at the destination (rename-onto-existing)
    if (mode === "copy") b[nk] = b[k].blob ? { ...b[k], url: URL.createObjectURL(b[k].blob!) } : { ...b[k] };
    else { b[nk] = b[k]; delete b[k]; }
  }
}

// A fully-writable, in-memory FileExplorerAdapter (mode "mock"). CRUD really
// mutates the seeded tree AND its bytes, so upload, preview, download, inline
// editing, and file metadata all work with zero backend.
export function createMockAdapter(seed?: Tree): FileExplorerAdapter {
  const tree: Tree = seed ? structuredClone(seed) : seedTree();
  const blobs: MockBlobs = seedBlobs();

  return {
    mode: "mock",
    list: (path) => {
      const p = norm(path);
      return delay({
        path: p,
        entries: tree[p] ?? [],
        parent: p === "/" ? null : parentOf(path),
        roots: MOCK_ROOTS,
      });
    },
    mkdir: (path) => {
      const d = parentOf(path);
      const name = baseOf(path);
      if (!entryIn(tree, d, name)) {
        tree[d] = [...(tree[d] ?? []), dir(name)];
        tree[norm(path)] = [];
      }
      return delay({ kind: "dir" as const });
    },
    remove: (path) => {
      const d = parentOf(path);
      const name = baseOf(path);
      const e = entryIn(tree, d, name);
      tree[d] = (tree[d] ?? []).filter((x) => x.name !== name);
      const p = norm(path);
      revoke(blobs[p]);
      delete blobs[p];
      if (e?.kind === "dir") {
        dropSubtree(tree, p);
        for (const k of Object.keys(blobs)) if (k.startsWith(p + "/")) { revoke(blobs[k]); delete blobs[k]; }
      }
      return delay({ ok: true });
    },
    move: (from, to) => {
      transfer(tree, from, to, "move");
      remapBlobs(blobs, from, to, "move");
      return delay({ ok: true });
    },
    copy: (from, to) => {
      transfer(tree, from, to, "copy");
      remapBlobs(blobs, from, to, "copy");
      return delay({ ok: true });
    },
    upload: async (dest, files) => {
      for (const { relPath, file: f } of files) {
        const segs = relPath.split("/").filter(Boolean);
        let cur = norm(dest);
        for (let i = 0; i < segs.length; i++) {
          const name = segs[i];
          const leaf = i === segs.length - 1;
          const ext = extOf(name);
          const existing = entryIn(tree, cur, name);
          if (!existing) tree[cur] = [...(tree[cur] ?? []), leaf ? file(name, f.size, ext) : dir(name)];
          else if (leaf) tree[cur] = (tree[cur] ?? []).map((e) => (e.name === name ? { ...e, size: f.size, ext } : e));
          if (leaf) {
            const p = join(cur, name);
            const mime = f.type || "application/octet-stream";
            revoke(blobs[p]); // overwrite: free the old blob first
            blobs[p] = isTextLike(mime, ext)
              ? { text: await f.text(), mime }
              : f.size <= MAX_BLOB
                ? { blob: f, url: URL.createObjectURL(f), mime }
                : { mime };
          } else {
            cur = join(cur, name);
            if (!tree[cur]) tree[cur] = [];
          }
        }
      }
      return delay({ written: files.length });
    },
    write: (path, content) => {
      const d = parentOf(path);
      const name = baseOf(path);
      const ext = extOf(name);
      if (!entryIn(tree, d, name))
        tree[d] = [...(tree[d] ?? []), file(name, content.length, ext)];
      else
        tree[d] = (tree[d] ?? []).map((e) =>
          e.name === name ? { ...e, size: content.length } : e,
        );
      const p = norm(path);
      revoke(blobs[p]);
      blobs[p] = { text: content, mime: blobs[p]?.mime ?? "text/plain" };
      return delay({ ok: true });
    },
    setMeta: (path, meta) => {
      const d = parentOf(path);
      const name = baseOf(path);
      tree[d] = (tree[d] ?? []).map((e) =>
        e.name === name ? { ...e, meta: Object.keys(meta).length ? meta : undefined } : e,
      );
      return delay({ ok: true });
    },
    read: async (path) => {
      const p = norm(path);
      const b = blobs[p];
      if (b?.text != null) return delay({ content: b.text, mime: b.mime, size: b.text.length });
      // The tree advertises text files with no seeded bytes — synthesize a body
      // so read/preview/download/Properties agree (the mock has no real bytes;
      // upload a real file for genuine content).
      const e = entryIn(tree, parentOf(p), baseOf(p));
      if (e?.kind === "file" && !b && TEXT_EXT.has(extOf(e.name))) {
        const content = `${e.name}\n\nSample ${extOf(e.name).toUpperCase()} file — the in-memory mock has no real bytes for this entry.\nUpload a real file, or edit and save to give it content.\n`;
        return delay({ content, mime: "text/plain", size: content.length });
      }
      return delay(null);
    },
    usage: () => delay({ used: 289 * GiB, total: 460 * GiB }),
    rawUrl: (path) => blobs[norm(path)]?.url ?? "",
  };
}

// Re-export the tree type for consumers seeding their own mock.
export type { Tree } from "./mock-tree";
