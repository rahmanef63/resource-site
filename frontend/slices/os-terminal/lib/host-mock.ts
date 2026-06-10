// Self-contained mock OsApi — the rr default adapter behind useOsApi().
// fs ops run against the slice's FsModel seed: the SAME singleton tree the
// exec emulator mutates (see seedFs), so `mkdir`/`touch` in the terminal show
// up in api.fs.list and vice versa. exec/sys return canned demo data.
// Replace wholesale with configureTerminal({ mode: "live", … }).
import { seedFs, rekey, type FsModel } from "./fs-model";
import type { FsEntry, TerminalOsApi } from "./host";

const GiB = 1024 ** 3;

// "~" and "" map to the mock root "/" (portable home token, like os-vps).
const norm = (p: string): string => {
  if (!p || p === "/" || p === "~") return "/";
  const abs = p.startsWith("~/") ? `/${p.slice(2)}` : p;
  return abs.replace(/\/+$/, "") || "/";
};
const parentOf = (p: string): string => {
  const n = norm(p);
  const i = n.lastIndexOf("/");
  return i <= 0 ? "/" : n.slice(0, i);
};
const baseOf = (p: string): string => norm(p).slice(norm(p).lastIndexOf("/") + 1);
const extOf = (n: string): string | undefined => {
  const i = n.lastIndexOf(".");
  return i > 0 ? n.slice(i + 1).toLowerCase() : undefined;
};

export function createMockOsApi(): TerminalOsApi {
  const tree: FsModel = seedFs(); // singleton — shared with the emulator's ctx.fs
  const entryIn = (dir: string, name: string): FsEntry | undefined =>
    (tree[dir] ?? []).find((e) => e.name === name);
  const detach = (dir: string, name: string) => {
    tree[dir] = (tree[dir] ?? []).filter((e) => e.name !== name);
  };

  return {
    mode: "mock",
    fs: {
      list: async (path) => {
        const p = norm(path);
        const entries = tree[p];
        if (!entries) throw new Error(`No such directory: ${p}`);
        return { path: p, entries };
      },
      read: async (path) => {
        const p = norm(path);
        const e = entryIn(parentOf(p), baseOf(p));
        if (!e || e.kind === "dir") throw new Error(`No such file: ${p}`);
        return `# ${e.name}\n\nMock content — wire configureTerminal for real bytes.`;
      },
      write: async (path) => {
        const p = norm(path);
        const [dir, name] = [parentOf(p), baseOf(p)];
        if (!entryIn(dir, name))
          tree[dir] = [...(tree[dir] ?? []), { name, kind: "file", size: 0, ext: extOf(name) }];
        return { ok: true };
      },
      mkdir: async (path) => {
        const p = norm(path);
        const [dir, name] = [parentOf(p), baseOf(p)];
        if (!entryIn(dir, name)) {
          tree[dir] = [...(tree[dir] ?? []), { name, kind: "dir", size: 0 }];
          tree[p] = [];
        }
        return { ok: true };
      },
      remove: async (path) => {
        const p = norm(path);
        const e = entryIn(parentOf(p), baseOf(p));
        detach(parentOf(p), baseOf(p));
        if (e?.kind === "dir")
          for (const k of Object.keys(tree)) if (k === p || k.startsWith(`${p}/`)) delete tree[k];
        return { ok: true };
      },
      move: async (from, to) => {
        const [f0, t0] = [norm(from), norm(to)];
        const src = entryIn(parentOf(f0), baseOf(f0));
        if (!src) throw new Error(`not found: ${f0}`);
        detach(parentOf(f0), baseOf(f0));
        detach(parentOf(t0), baseOf(t0));
        tree[parentOf(t0)] = [...(tree[parentOf(t0)] ?? []), { ...src, name: baseOf(t0) }];
        if (src.kind === "dir") rekey(tree, f0, t0);
        return { ok: true };
      },
      copy: async (from, to) => {
        const [f0, t0] = [norm(from), norm(to)];
        const src = entryIn(parentOf(f0), baseOf(f0));
        if (!src) throw new Error(`not found: ${f0}`);
        detach(parentOf(t0), baseOf(t0));
        tree[parentOf(t0)] = [...(tree[parentOf(t0)] ?? []), { ...src, name: baseOf(t0) }];
        if (src.kind === "dir") tree[t0] = (tree[f0] ?? []).map((e) => ({ ...e }));
        return { ok: true };
      },
    },
    exec: {
      run: async (cmd) => ({
        stdout: `$ ${cmd}\n(mock shell — configureTerminal({ mode: "live", … }) to run real commands)`,
        stderr: "",
        code: 0,
      }),
    },
    sys: {
      stats: async () => ({
        cpu: { pct: 20 + Math.random() * 60, cores: 8 },
        mem: { used: 6.4 * GiB, total: 16 * GiB },
        disk: { used: 289 * GiB, total: 460 * GiB },
        uptime: 14 * 864e5 + 6 * 36e5, // "14d 6h"
      }),
    },
  };
}
