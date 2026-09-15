export type FsEntry = { name: string; kind: "dir" | "file"; size: number; ext?: string; mime?: string };
export type FsRoot = { label: string; path: string };
export type FsList = { path: string; entries: FsEntry[]; roots?: FsRoot[]; parent?: string | null };

export type ReelFsAdapter = {
  list: (path: string) => Promise<FsList>;
  mkdir: (path: string) => Promise<unknown>;
  rawUrl: (path: string) => string;
};

export type Pane = "xs" | "sm" | "md" | "lg";

export function normalizeReelPath(path: string): string {
  const expanded = path.replace(/^~(?=\/|$)/, "");
  const absolute = expanded.startsWith("/") ? expanded : `/${expanded}`;
  return absolute !== "/" && absolute.endsWith("/") ? absolute.slice(0, -1) : absolute || "/";
}

export function paneBucket(width: number): Pane {
  if (width < 360) return "xs";
  if (width < 600) return "sm";
  if (width < 900) return "md";
  return "lg";
}

export function createMockReelFs(): ReelFsAdapter {
  const dirs = new Set<string>(["/", "/reel-projects", "/reel-projects/session"]);
  return {
    async list(input) {
      const path = normalizeReelPath(input);
      if (!dirs.has(path)) throw new Error(`not found: ${path}`);
      const prefix = path === "/" ? "/" : `${path}/`;
      const entries: FsEntry[] = [...dirs]
        .filter((dir) => dir !== "/" && dir.startsWith(prefix) && !dir.slice(prefix.length).includes("/"))
        .map((dir) => ({ name: dir.slice(prefix.length), kind: "dir", size: 0 }));
      return {
        path,
        entries,
        roots: [{ label: "Projects", path: "/reel-projects" }],
        parent: path === "/" ? null : path.slice(0, path.lastIndexOf("/")) || "/",
      };
    },
    async mkdir(input) {
      const path = normalizeReelPath(input);
      const parts = path.split("/").filter(Boolean);
      let current = "";
      for (const part of parts) dirs.add((current = `${current}/${part}`));
    },
    rawUrl: (path) => path,
  };
}

let fsAdapter: ReelFsAdapter = createMockReelFs();

export function configureReelFs(adapter: ReelFsAdapter): void {
  fsAdapter = adapter;
}

export function getReelFsAdapter(): ReelFsAdapter {
  return fsAdapter;
}

export function rawUrl(path: string): string {
  return fsAdapter.rawUrl(path);
}

const reelFsApi = {
  fs: {
    list: (path: string) => fsAdapter.list(path),
    mkdir: (path: string) => fsAdapter.mkdir(path),
  },
};

export function getReelFsApi(): typeof reelFsApi {
  return reelFsApi;
}
