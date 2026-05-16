import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type SliceManifest = {
  slug: string;
  version: string;
  category?: string;
  title?: string;
  description?: string;
  kind?: string;
  tags?: string[];
  hasContract: boolean;
  hasManifest: boolean;
};

export async function loadSliceRegistry(): Promise<SliceManifest[]> {
  const dir = join(process.cwd(), "frontend", "slices");
  let entries: { name: string; isDirectory(): boolean }[] = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: SliceManifest[] = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    const slicePath = join(dir, e.name);

    let manifest: Record<string, unknown> | null = null;
    try {
      const raw = await readFile(join(slicePath, "slice.json"), "utf8");
      manifest = JSON.parse(raw);
    } catch {
      // skip — no slice.json
    }
    if (!manifest) continue;

    let hasContract = false;
    try {
      await readFile(join(slicePath, "slice.contract.ts"), "utf8");
      hasContract = true;
    } catch {
      // skip
    }

    let hasManifest = false;
    try {
      await readFile(join(slicePath, "slice.manifest.json"), "utf8");
      hasManifest = true;
    } catch {
      // skip
    }

    out.push({
      slug: String(manifest.slug ?? e.name),
      version: String(manifest.version ?? "0.0.0"),
      category: manifest.category as string | undefined,
      title: manifest.title as string | undefined,
      description: manifest.description as string | undefined,
      kind: manifest.kind as string | undefined,
      tags: (manifest.tags as string[]) ?? [],
      hasContract,
      hasManifest,
    });
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}
