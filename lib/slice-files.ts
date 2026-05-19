import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

export type SliceFile = {
  /** Path relative to slice root, e.g. "views/PricingSection.tsx". */
  path: string;
  /** UTF-8 file contents. */
  content: string;
  /** Bytes (post-UTF-8 encode). Used for size badge. */
  size: number;
};

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "__tests__",
  "__snapshots__",
]);

const SKIP_FILES = new Set([
  ".DS_Store",
  ".env",
  ".env.local",
  "tsconfig.tsbuildinfo",
]);

const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".txt", ".css", ".scss",
  ".yml", ".yaml", ".toml", ".html", ".svg",
]);

const MAX_FILE_BYTES = 256 * 1024;

function isTextFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  if (TEXT_EXT.has(ext)) return true;
  if (!ext && /^(README|LICENSE|CHANGELOG)/i.test(name)) return true;
  return false;
}

/**
 * Recursively read every text file under `slicePath` (relative to repo
 * root). Returns a flat array suitable for serializing to a client
 * component or zipping. Binary files and oversized files are skipped.
 *
 * Server-only — uses `node:fs`. Call from a Server Component or RSC.
 */
/**
 * Memoized via React.cache (intra-render) AND tagged with Next 16
 * `"use cache"` directive so the result is cached across navigations
 * too. Without "use cache" the page would re-read the filesystem on
 * every nav because cacheComponents: true treats async server
 * components as dynamic by default. */
export const readSliceFiles = cache(
  async function readSliceFiles(slicePath: string): Promise<SliceFile[]> {
    "use cache";
    return readPathsFiles([slicePath]);
  },
);

/**
 * Same as `readSliceFiles` but accepts multiple roots and merges. When
 * more than one root is given, file paths get the root folder's last
 * segment prefixed so they don't collide in the tree.
 *
 * Not React.cache-wrapped — array args compare by reference, so the
 * cache wouldn't dedupe across call sites. Caller can wrap if needed. */
export async function readPathsFiles(rootPaths: string[]): Promise<SliceFile[]> {
  "use cache";
  const repoRoot = process.cwd();
  const out: SliceFile[] = [];
  const multi = rootPaths.length > 1;

  async function walk(absDir: string, relDir: string, prefix: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(
          path.join(absDir, entry.name),
          path.join(relDir, entry.name),
          prefix,
        );
        continue;
      }
      if (!entry.isFile()) continue;
      if (SKIP_FILES.has(entry.name)) continue;
      if (!isTextFile(entry.name)) continue;

      const absFile = path.join(absDir, entry.name);
      const stat = await fs.stat(absFile);
      if (stat.size > MAX_FILE_BYTES) continue;

      const content = await fs.readFile(absFile, "utf8");
      const rel = path.posix
        .join(relDir.split(path.sep).join("/"), entry.name)
        .replace(/^\/+/, "");
      out.push({
        path: prefix ? `${prefix}/${rel}` : rel,
        content,
        size: Buffer.byteLength(content, "utf8"),
      });
    }
  }

  for (const rp of rootPaths) {
    const absRoot = path.join(repoRoot, rp);
    const prefix = multi ? path.basename(rp) : "";
    await walk(absRoot, "", prefix);
  }

  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}
