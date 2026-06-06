// Writable in-memory filesystem for the rr catalog build — the editor works
// with zero backend. Seeded from lib/seed.ts; `configureCodeFs` swaps it for
// a real adapter. Paths are absolute; "~" resolves to "/".

import { SEED_FILES } from "./seed";
import type { CodeFsAdapter, FsEntry, FsList } from "./host";

/** Expand "~" and normalise to an absolute path without a trailing slash. */
function norm(p: string): string {
  const x = p.replace(/^~(?=\/|$)/, "");
  const abs = x.startsWith("/") ? x : `/${x}`;
  return abs !== "/" && abs.endsWith("/") ? abs.slice(0, -1) : abs || "/";
}

function parentDirs(path: string): string[] {
  const out: string[] = [];
  let cur = path;
  while (cur !== "/") {
    cur = cur.slice(0, cur.lastIndexOf("/")) || "/";
    out.push(cur);
  }
  return out;
}

export function createMockFs(): CodeFsAdapter {
  const files = new Map<string, string>(Object.entries(SEED_FILES));
  const dirs = new Set<string>(["/"]);
  for (const key of files.keys()) for (const d of parentDirs(key)) dirs.add(d);

  const list = async (p: string): Promise<FsList> => {
    const path = norm(p);
    const prefix = path === "/" ? "/" : `${path}/`;
    const names = new Map<string, FsEntry>();
    for (const d of dirs) {
      if (d === "/" || !d.startsWith(prefix)) continue;
      const rest = d.slice(prefix.length);
      if (rest.includes("/")) continue;
      names.set(rest, { name: rest, kind: "dir" });
    }
    for (const [f, body] of files) {
      if (!f.startsWith(prefix)) continue;
      const rest = f.slice(prefix.length);
      if (rest.includes("/")) continue;
      names.set(rest, { name: rest, kind: "file", size: body.length });
    }
    const entries = [...names.values()].sort((a, b) =>
      a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "dir" ? -1 : 1,
    );
    return { path, entries };
  };

  return {
    list,
    read: async (p) => {
      const path = norm(p);
      const body = files.get(path);
      if (body == null) throw new Error(`not found: ${path}`);
      return body;
    },
    write: async (p, content) => {
      const path = norm(p);
      files.set(path, content);
      for (const d of parentDirs(path)) dirs.add(d);
    },
    mkdir: async (p) => {
      const path = norm(p);
      dirs.add(path);
      for (const d of parentDirs(path)) dirs.add(d);
    },
  };
}
