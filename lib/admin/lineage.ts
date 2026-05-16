import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type DnaConsumer = {
  adopted_at: string;
  version: string;
  drift_score: number;
  last_synced_at?: string;
};

export type DnaLineage = {
  from: string;
  to?: string;
  at: string;
  transforms: string[];
  actor?: string;
};

export type DnaFile = {
  id: string;
  created_at: string;
  lineage: DnaLineage[];
  consumers: Record<string, DnaConsumer>;
};

export type DriftRow = {
  slice: string;
  consumer: string;
  drift: number;
  version: string;
  synced: string;
};

export type LineageRow = {
  slice: string;
  from: string;
  to: string;
  at: string;
  transforms: string[];
  actor: string;
};

export async function loadDna(): Promise<DnaFile[]> {
  const dir = join(process.cwd(), ".kitab", "lineage");
  try {
    const entries = await readdir(dir);
    const files = entries.filter(
      (f) => f.endsWith(".dna.json") && !f.endsWith(".local.json"),
    );
    const out = await Promise.all(
      files.map(async (f) => {
        const raw = await readFile(join(dir, f), "utf8");
        return JSON.parse(raw) as DnaFile;
      }),
    );
    return out.sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

export function flattenDrift(dnas: DnaFile[]): DriftRow[] {
  return dnas
    .flatMap((d) =>
      Object.entries(d.consumers ?? {}).map(([name, c]) => ({
        slice: d.id,
        consumer: name,
        drift: c.drift_score,
        version: c.version,
        synced: c.last_synced_at ?? c.adopted_at,
      })),
    )
    .sort((a, b) => b.drift - a.drift);
}

export function flattenLineage(dnas: DnaFile[], limit = 12): LineageRow[] {
  return dnas
    .flatMap((d) =>
      d.lineage.map((l) => ({
        slice: d.id,
        from: l.from,
        to: l.to ?? "—",
        at: l.at,
        transforms: l.transforms,
        actor: l.actor ?? "—",
      })),
    )
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}
