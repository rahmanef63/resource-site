import "server-only";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import * as consumerManifest from "../../packages/cli/lib/consumer-manifest.mjs";
import { loadSliceRegistry } from "./registry";

type SyncDirectionVerdict =
  | "in-sync"
  | "up-needed"
  | "down-needed"
  | "diverged"
  | "consumer-only"
  | "kitab-only";

type ConsumerManifestShape = {
  kitabSlug: string;
  kitabVersion: string;
  consumerVersion: string;
  lastPullAt: string | null;
};

type WalkedSlice = {
  dir: string;
  manifest?: ConsumerManifestShape;
  error?: string;
};

type SyncDiff = {
  slug: string;
  kitabVersion: string | null;
  consumerVersion: string | null;
  direction: SyncDirectionVerdict;
};

const { walkConsumerSlices, diffSlice } = consumerManifest as {
  walkConsumerSlices: (root: string) => Promise<WalkedSlice[]>;
  diffSlice: (input: {
    slug: string;
    manifest: ConsumerManifestShape | null;
    kitabVersion: string | null;
  }) => SyncDiff;
};

export type ConsumerSliceDiff = {
  slug: string;
  consumerVersion: string;
  kitabVersion: string;
  state: SyncDirectionVerdict | "parse-error";
  lastPullAt?: string;
};

export type ConsumerScan = {
  name: string;
  path: string;
  reachable: boolean;
  slices: ConsumerSliceDiff[];
};

/**
 * Operator-side consumer registry. RR_CONSUMERS env (comma-separated
 * `name:absolute-path` pairs) overrides workstation defaults for prod/CI.
 */
function resolveConsumers(): { name: string; path: string }[] {
  const env = process.env.RR_CONSUMERS;
  if (env) {
    return env
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, ...rest] = pair.split(":");
        return { name: name.trim(), path: resolve(rest.join(":").trim()) };
      });
  }
  return [
    { name: "careerpack", path: "/home/rahman/projects/CareerPack" },
    { name: "notion", path: "/home/rahman/projects/notion-page-clone" },
    { name: "rahmanef", path: "/home/rahman/projects/rahmanef.com" },
    { name: "content", path: "/home/rahman/projects/content-rahmanef-com" },
    { name: "superspace", path: "/home/rahman/projects/superspace" },
    { name: "cescadesigns", path: "/home/rahman/projects/cescadesigns" },
  ];
}

export async function loadConsumerScan(): Promise<ConsumerScan[]> {
  const consumers = resolveConsumers();
  const registry = await loadSliceRegistry();
  const versionBySlug = new Map(registry.map((s) => [s.slug, s.version]));

  return Promise.all(
    consumers.map(async ({ name, path }) => {
      if (!existsSync(path)) {
        return { name, path, reachable: false, slices: [] };
      }
      try {
        const walked = await walkConsumerSlices(path);
        const slices: ConsumerSliceDiff[] = walked.map((w) => {
          const slug = w.manifest?.kitabSlug ?? basename(w.dir);
          const kitabVersion = versionBySlug.get(slug) ?? null;
          if (w.error || !w.manifest) {
            return {
              slug,
              consumerVersion: "?",
              kitabVersion: kitabVersion ?? "?",
              state: "parse-error",
              lastPullAt: undefined,
            };
          }
          const diff = diffSlice({
            slug,
            manifest: w.manifest,
            kitabVersion,
          });
          return {
            slug,
            consumerVersion: diff.consumerVersion ?? "?",
            kitabVersion: diff.kitabVersion ?? "?",
            state: diff.direction,
            lastPullAt: w.manifest.lastPullAt ?? undefined,
          };
        });
        return { name, path, reachable: true, slices };
      } catch {
        return { name, path, reachable: true, slices: [] };
      }
    }),
  );
}
