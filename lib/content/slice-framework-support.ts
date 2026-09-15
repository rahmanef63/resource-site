import manifest from "../../packages/cli/lib/manifest.json";
import type { PublicFrameworkId } from "./framework-matrix";

export type SliceFrameworkSupport = {
  id: PublicFrameworkId;
  path: string;
  npm: string[];
  shadcn: string[];
  sharedFiles: string[];
  isDefault: boolean;
  mode: "native" | "shared";
};

type ManifestFramework = {
  path?: string;
  deps?: { npm?: string[]; shadcn?: string[]; sharedFiles?: string[] };
};
type ManifestSlice = {
  slug: string;
  slicePath?: string;
  defaultFramework?: string;
  npm?: string[];
  shadcn?: string[];
  frameworks?: Record<string, ManifestFramework>;
};

const manifestSlices = (manifest.slices ?? []) as ManifestSlice[];

export function getSliceFrameworkSupport(slug: string): SliceFrameworkSupport[] {
  const slice = manifestSlices.find((item) => item.slug === slug);
  if (!slice?.slicePath) return [];
  const declared = slice.frameworks ?? {};
  const next = declared["react-next"] ?? { path: slice.slicePath };
  const svelte = declared["svelte-sveltekit"];
  const frameworkNeutral = Boolean(svelte?.path && svelte.path === slice.slicePath);
  const result: SliceFrameworkSupport[] = [
    {
      id: "react-next",
      path: next.path ?? slice.slicePath,
      npm: next.deps?.npm ?? slice.npm ?? [],
      shadcn: next.deps?.shadcn ?? slice.shadcn ?? [],
      sharedFiles: next.deps?.sharedFiles ?? [],
      isDefault: (slice.defaultFramework ?? "react-next") === "react-next",
      mode: frameworkNeutral ? "shared" : "native",
    },
  ];
  if (svelte?.path) {
    result.push({
      id: "svelte-sveltekit",
      path: svelte.path,
      npm: svelte.deps?.npm ?? [],
      shadcn: svelte.deps?.shadcn ?? [],
      sharedFiles: svelte.deps?.sharedFiles ?? [],
      isDefault: slice.defaultFramework === "svelte-sveltekit",
      mode: svelte.path === slice.slicePath ? "shared" : "native",
    });
  }
  return result;
}

export function getFrameworkCoverage() {
  const catalog = manifestSlices.length;
  const svelte = manifestSlices.filter((slice) => slice.frameworks?.["svelte-sveltekit"]?.path).length;
  return { catalog, svelte, reactOnly: catalog - svelte };
}
