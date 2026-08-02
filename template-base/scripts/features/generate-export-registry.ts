#!/usr/bin/env tsx
/**
 * Auto-generate `frontend/shared/bindings/export/feature-export-registry.generated.ts`.
 *
 * Scans every feature slice for a `data/export-config.{ts,tsx}` and emits
 * a registry of dynamic importers keyed by `features/<slug>/data/export-config`.
 *
 * Pattern mirrors generate-preview-registry.ts so consumer apps' `sync:all`
 * keeps export, preview, and feature registries aligned.
 *
 * Usage:
 *   npx tsx scripts/features/generate-export-registry.ts
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";

const ROOT_DIR = process.cwd();
const OUTPUT_PATH = path.join(
  ROOT_DIR,
  "frontend/shared/bindings/export/feature-export-registry.generated.ts",
);
const EXPORT_CONFIG_GLOBS = [
  "frontend/slices/*/data/export-config.ts",
  "frontend/slices/*/data/export-config.tsx",
];

interface ExportEntry {
  slug: string;
  importerKey: string;
  importPath: string;
}

function discoverExportConfigs(): ExportEntry[] {
  const matches = EXPORT_CONFIG_GLOBS.flatMap((pattern) =>
    globSync(pattern, { cwd: ROOT_DIR }),
  );

  return [...new Set(matches)]
    .sort()
    .map((relPath) => {
      const slug = relPath.split("/")[2];
      const noExt = relPath.replace(/\.tsx?$/, "");
      return {
        slug,
        importerKey: `features/${slug}/data/export-config`,
        importPath: `@/${noExt}`,
      };
    });
}

function emit(entries: ExportEntry[]): string {
  const header = `/**
 * AUTO-GENERATED — do not edit. Run \`npx tsx scripts/features/generate-export-registry.ts\`.
 *
 * Source of truth: \`frontend/slices/<slug>/data/export-config.ts\`.
 */
`;
  const map = entries
    .map(
      (e) =>
        `  ${JSON.stringify(e.importerKey)}: () => import(${JSON.stringify(e.importPath)}),`,
    )
    .join("\n");
  const empty = entries.length === 0
    ? "  // (empty — no slice ships data/export-config.ts yet)"
    : map;

  return `${header}
export const featureExportConfigImporters: Record<string, () => Promise<any>> = {
${empty}
};
`;
}

function main(): void {
  const entries = discoverExportConfigs();
  const output = emit(entries);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(
    `Wrote ${entries.length} export-config importer${entries.length === 1 ? "" : "s"} to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`,
  );
}

main();
