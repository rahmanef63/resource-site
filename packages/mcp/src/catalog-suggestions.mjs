import { getManifest, getSkills } from "./data-loader.mjs";

export function nearestSlugs(slug, candidates, cap = 3) {
  const query = String(slug ?? "").toLowerCase();
  if (query.length < 3) return [];
  return candidates
    .filter((candidate) =>
      candidate.includes(query) ||
      query.includes(candidate) ||
      candidate.slice(0, 4) === query.slice(0, 4),
    )
    .slice(0, cap);
}

export function allSlugs() {
  const manifest = getManifest();
  return [
    ...(manifest.layouts ?? []),
    ...(manifest.features ?? []),
    ...(manifest.recipes ?? []),
    ...(manifest.slices ?? []),
    ...(getSkills().skills ?? []),
  ].map((entry) => entry.slug);
}
