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

const delay = <T,>(v: T, ms = 140): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms + Math.random() * 100));

// A fully-writable, in-memory FileExplorerAdapter (mode "mock"). CRUD really
// mutates the seeded tree so the rr preview works with no backend. `rawUrl`
// returns "" (mock has no real bytes → thumbnails fall back to icons).
export function createMockAdapter(seed?: Tree): FileExplorerAdapter {
  const tree: Tree = seed ? structuredClone(seed) : seedTree();

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
      if (e?.kind === "dir") dropSubtree(tree, norm(path));
      return delay({ ok: true });
    },
    move: (from, to) => {
      transfer(tree, from, to, "move");
      return delay({ ok: true });
    },
    copy: (from, to) => {
      transfer(tree, from, to, "copy");
      return delay({ ok: true });
    },
    upload: async (dest, files) => {
      for (const { relPath } of files) {
        const segs = relPath.split("/").filter(Boolean);
        let cur = norm(dest);
        segs.forEach((name, i) => {
          const leaf = i === segs.length - 1;
          if (!entryIn(tree, cur, name))
            tree[cur] = [
              ...(tree[cur] ?? []),
              leaf ? file(name, 1024, extOf(name)) : dir(name),
            ];
          if (!leaf) {
            cur = join(cur, name);
            if (!tree[cur]) tree[cur] = [];
          }
        });
      }
      return delay({ written: files.length });
    },
    write: (path) => {
      const d = parentOf(path);
      const name = baseOf(path);
      if (!entryIn(tree, d, name))
        tree[d] = [...(tree[d] ?? []), file(name, 32, extOf(name))];
      return delay({ ok: true });
    },
    usage: () => delay({ used: 289 * GiB, total: 460 * GiB }),
    rawUrl: () => "",
  };
}

// Re-export the tree type for consumers seeding their own mock.
export type { Tree } from "./mock-tree";
